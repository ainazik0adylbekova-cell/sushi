# Environment Variable Validation and Graceful Degradation Bugfix Design

## Overview

The application currently throws 500 errors when environment variables are missing or contain placeholder values (e.g., "your-api-key-here"). This bugfix implements early validation for Finik payment gateway credentials, returns user-friendly HTTP 503 responses when optional services are unavailable, and ensures the site works gracefully even with unconfigured optional services (Finik, Telegram). The fix preserves the existing Telegram bypass logic for admin authentication and maintains all validation and success flows.

## Glossary

- **Bug_Condition (C)**: The condition that triggers the bug - when API endpoints are called with missing or placeholder environment variables, causing unhandled errors and 500 responses
- **Property (P)**: The desired behavior when optional services are unavailable - return HTTP 503 with user-friendly messages and allow the application to continue functioning
- **Preservation**: Existing authentication flows, validation logic, and success paths that must remain unchanged
- **Placeholder Credentials**: Environment variable values that are clearly placeholders (e.g., "your-api-key-here", "your_google_client_id_here", empty strings)
- **Graceful Degradation**: The ability of the application to continue functioning with reduced functionality when optional services are unavailable
- **createFinikPayment**: The function in `lib/finik.ts` that creates payment requests to Finik Acquiring API
- **sendTelegramMessage**: The function in `lib/telegram.ts` that sends messages via Telegram Bot API
- **Telegram Bypass**: The authentication flow in `app/api/admin/send-code/route.ts` that allows admin login without 2FA when Telegram is not configured

## Bug Details

### Bug Condition

The bug manifests when users attempt to use features that depend on external services (Finik payment gateway, Telegram notifications) but the required environment variables are either missing, empty, or contain placeholder values. The functions `createFinikPayment` and `sendTelegramMessage` throw unhandled errors that bubble up as 500 responses, providing poor user experience and no actionable error information.

**Formal Specification:**
```
FUNCTION isBugCondition(input)
  INPUT: input of type { endpoint: string, envVars: Record<string, string | undefined> }
  OUTPUT: boolean
  
  RETURN (input.endpoint == '/api/finik/create-payment' 
          AND (NOT envVars['FINIK_API_KEY'] 
               OR envVars['FINIK_API_KEY'] IN PLACEHOLDER_VALUES
               OR NOT envVars['FINIK_ACCOUNT_ID'] 
               OR envVars['FINIK_ACCOUNT_ID'] IN PLACEHOLDER_VALUES))
         OR (input.endpoint == '/api/admin/send-code' 
             AND NOT envVars['TELEGRAM_BOT_TOKEN']
             AND NOT bypassLogicActivated)
         OR (otherEndpointsDependingOnExternalServices 
             AND requiredEnvVarsMissingOrPlaceholder)
             
  WHERE PLACEHOLDER_VALUES = [
    'your-api-key-here',
    'your_api_key_here', 
    'your-account-id-here',
    'your_account_id_here',
    'your_google_client_id_here',
    'your_google_client_secret_here',
    'your_chat_id_here',
    '' // empty string
  ]
END FUNCTION
```

### Examples

- **Finik Payment with Placeholder Credentials**: User tries to create payment with `FINIK_API_KEY="your-api-key-here"` → Currently: 500 error thrown by `createFinikPayment` → Expected: HTTP 503 with message "Payment service is currently unavailable"

- **Finik Payment with Missing Account ID**: User tries to create payment with `FINIK_ACCOUNT_ID` undefined → Currently: 500 error "Finik credentials are not configured" → Expected: HTTP 503 with "Payment service is currently unavailable. Please contact support."

- **Telegram Without Bot Token**: Admin tries to login but `TELEGRAM_BOT_TOKEN` is missing → Currently: Works correctly (bypass logic already exists) → Expected: Should continue working (preservation requirement)

- **Edge Case - Empty String Credentials**: User has `FINIK_API_KEY=""` (empty string) → Currently: May pass initial checks but fail on API call with cryptic error → Expected: Detected as placeholder during validation, returns HTTP 503

## Expected Behavior

### Preservation Requirements

**Unchanged Behaviors:**
- Admin authentication with valid Telegram credentials must continue to work exactly as before
- Admin authentication Telegram bypass logic (when chat_id is not available) must remain unchanged
- All existing validation for required fields (orderId, email, password, etc.) must remain unchanged
- Successful payment creation flow with valid Finik credentials must remain unchanged
- Successful Telegram message sending with valid bot token must remain unchanged
- Error logging patterns and console output for debugging must be enhanced, not removed

**Scope:**
All inputs that do NOT involve missing or placeholder environment variables should be completely unaffected by this fix. This includes:
- Valid authentication requests with properly configured services
- Payment creation with valid Finik credentials
- Admin login with valid Telegram bot token
- All error responses for invalid user input (bad email, missing orderId, etc.)

## Hypothesized Root Cause

Based on the bug description and code analysis, the root causes are:

1. **Missing Early Validation for Placeholder Values**: The code checks for `!FINIK_API_KEY` but doesn't detect placeholder strings like "your-api-key-here", allowing the code to proceed until it fails at the API call level with a 500 error

2. **Inadequate Error Handling at API Route Level**: The `/api/finik/create-payment/route.ts` catches errors from `createFinikPayment` but returns a generic 500 status instead of detecting service unavailability and returning 503

3. **No Centralized Validation Utility**: Each service checks environment variables independently without a consistent pattern for detecting placeholders or returning appropriate HTTP status codes

4. **Insufficient Error Logging Context**: When errors occur, the logging doesn't distinguish between configuration errors (missing env vars) and runtime errors (API failures), making debugging difficult

## Correctness Properties

Property 1: Bug Condition - Service Unavailability Detection

_For any_ API request where external service credentials are missing or contain placeholder values (isBugCondition returns true), the fixed API routes SHALL detect this condition early, return HTTP 503 status with a user-friendly error message indicating service unavailability, and log detailed configuration errors for debugging without exposing credentials.

**Validates: Requirements 2.1, 2.2, 2.3**

Property 2: Preservation - Existing Flows and Bypass Logic

_For any_ API request where external service credentials are properly configured (isBugCondition returns false), the fixed code SHALL produce exactly the same behavior as the original code, preserving all authentication flows, validation logic, success paths, and especially the Telegram bypass logic for admin authentication when chat_id is unavailable.

**Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5**

## Fix Implementation

### Changes Required

Assuming our root cause analysis is correct:

**File 1**: `lib/finik.ts`

**Function**: `createFinikPayment`

**Specific Changes**:
1. **Add Placeholder Detection Helper**: Create a utility function `isPlaceholderValue()` that checks if a string is a known placeholder pattern
   - Check against list: "your-api-key-here", "your-account-id-here", empty strings, etc.
   - Return boolean indicating if value is a placeholder

2. **Enhanced Credential Validation**: Replace the simple `!FINIK_API_KEY` check with comprehensive validation
   - Check if `FINIK_API_KEY` exists AND is not a placeholder
   - Check if `FINIK_ACCOUNT_ID` exists AND is not a placeholder
   - Throw custom error type `ServiceUnavailableError` with appropriate message

3. **Improve Error Messages**: Update error messages to distinguish between missing and misconfigured credentials
   - "Payment service is not configured. Please check FINIK_API_KEY and FINIK_ACCOUNT_ID environment variables."
   - Include which specific credential is problematic in console logs (without exposing values)

4. **Enhanced Logging**: Add structured logging for configuration validation
   - Log when placeholder values are detected
   - Log which specific environment variables need attention
   - Ensure no actual credential values are logged

**File 2**: `app/api/finik/create-payment/route.ts`

**Function**: `POST` handler

**Specific Changes**:
1. **Add Service Unavailability Detection**: In the catch block, detect if the error is a `ServiceUnavailableError`
   - Check error message or error type
   - Return HTTP 503 instead of 500 for configuration issues

2. **User-Friendly Error Response**: Return appropriate error messages based on error type
   - For ServiceUnavailableError: "Payment service is currently unavailable. Please try again later or contact support."
   - For other errors: Keep existing behavior

3. **Preserve Error Logging**: Keep the existing `console.error` call but enhance it
   - Add context about whether it's a configuration issue or runtime error
   - Include orderId and userId for traceability

**File 3**: `lib/telegram.ts`

**Function**: `sendTelegramMessage`

**Specific Changes**:
1. **Add Placeholder Detection**: Check if `TELEGRAM_BOT_TOKEN` is a placeholder value
   - Use the same `isPlaceholderValue()` helper
   - Return `{ ok: false, error: "Bot token not configured" }` if placeholder detected

2. **Enhanced Error Message**: Distinguish between missing and placeholder tokens
   - "TELEGRAM_BOT_TOKEN is not configured (contains placeholder value)"
   - "TELEGRAM_BOT_TOKEN is missing"

3. **Preserve Existing Error Handling**: The function already returns `{ ok: false }` gracefully
   - No changes to the return structure
   - Just enhance the error detection logic

**File 4**: `app/api/admin/send-code/route.ts`

**Function**: `POST` handler

**Specific Changes**:
1. **Preserve Bypass Logic**: The existing bypass logic when `chatId` is null must remain exactly as is
   - This already handles the case when Telegram is not configured
   - NO CHANGES to the bypass logic (lines 56-66)

2. **Add Placeholder Detection for TELEGRAM_BOT_TOKEN**: Before attempting to get chatId, check if token is a placeholder
   - If token is placeholder, treat it the same as missing token
   - Activate bypass logic immediately

3. **Enhanced Error Logging**: Add logging when bypass is activated
   - Log: "Telegram not configured, activating bypass authentication"
   - Helps with debugging without breaking functionality

**File 5**: `lib/env-validation.ts` (NEW FILE)

**Purpose**: Centralized environment variable validation utilities

**Specific Changes**:
1. **Create isPlaceholderValue() function**: Detects placeholder environment variable values
   ```typescript
   const PLACEHOLDER_PATTERNS = [
     'your-api-key-here',
     'your_api_key_here',
     'your-account-id-here',
     'your_account_id_here',
     'your_google_client_id_here',
     'your_google_client_secret_here',
     'your_chat_id_here',
     'your_bot_token_here',
   ];
   
   export function isPlaceholderValue(value: string | undefined): boolean {
     if (!value || value.trim() === '') return true;
     return PLACEHOLDER_PATTERNS.some(pattern => 
       value.toLowerCase().includes(pattern.toLowerCase())
     );
   }
   ```

2. **Create ServiceUnavailableError class**: Custom error for service configuration issues
   ```typescript
   export class ServiceUnavailableError extends Error {
     constructor(message: string) {
       super(message);
       this.name = 'ServiceUnavailableError';
     }
   }
   ```

3. **Create validateServiceCredentials() function**: Validates a set of credentials
   - Takes service name and credential object
   - Returns validation result with specific missing/placeholder fields
   - Used by finik.ts and telegram.ts

## Testing Strategy

### Validation Approach

The testing strategy follows a two-phase approach: first, surface counterexamples that demonstrate the bug on unfixed code (500 errors with missing/placeholder env vars), then verify the fix works correctly (503 responses with user-friendly messages) and preserves existing behavior (valid credentials still work).

### Exploratory Bug Condition Checking

**Goal**: Surface counterexamples that demonstrate the bug BEFORE implementing the fix. Confirm or refute the root cause analysis. If we refute, we will need to re-hypothesize.

**Test Plan**: Write tests that simulate API calls with missing or placeholder environment variables. Mock the environment variables to test different scenarios. Run these tests on the UNFIXED code to observe 500 errors and understand the root cause.

**Test Cases**:
1. **Finik Payment with Placeholder API Key**: Set `FINIK_API_KEY="your-api-key-here"`, call `/api/finik/create-payment` (will fail with 500 on unfixed code)
2. **Finik Payment with Empty Credentials**: Set `FINIK_API_KEY=""`, call `/api/finik/create-payment` (will fail with 500 on unfixed code)
3. **Finik Payment with Missing Account ID**: Unset `FINIK_ACCOUNT_ID`, call `/api/finik/create-payment` (will fail with 500 on unfixed code)
4. **Admin Login with Missing Telegram Token**: Unset `TELEGRAM_BOT_TOKEN`, call `/api/admin/send-code` (should NOT fail - bypass should activate)

**Expected Counterexamples**:
- HTTP 500 errors returned instead of HTTP 503
- Generic error messages like "Failed to create payment" instead of service-specific messages
- Possible causes: lack of placeholder detection, inadequate error type distinction, missing early validation

### Fix Checking

**Goal**: Verify that for all inputs where the bug condition holds, the fixed function produces the expected behavior (HTTP 503 with user-friendly messages).

**Pseudocode:**
```
FOR ALL input WHERE isBugCondition(input) DO
  result := fixedAPIRoute(input)
  ASSERT result.status == 503
  ASSERT result.body.error CONTAINS "service" OR "unavailable"
  ASSERT result.body.error NOT CONTAINS actual_credential_values
  ASSERT consoleLogs CONTAINS detailed_error_for_debugging
END FOR
```

### Preservation Checking

**Goal**: Verify that for all inputs where the bug condition does NOT hold, the fixed function produces the same result as the original function.

**Pseudocode:**
```
FOR ALL input WHERE NOT isBugCondition(input) DO
  ASSERT originalAPIRoute(input) = fixedAPIRoute(input)
  ASSERT successFlowsUnchanged(input)
  ASSERT bypassLogicUnchanged(input)
END FOR
```

**Testing Approach**: Property-based testing is recommended for preservation checking because:
- It generates many test cases automatically across the input domain
- It catches edge cases that manual unit tests might miss
- It provides strong guarantees that behavior is unchanged for all non-buggy inputs

**Test Plan**: Observe behavior on UNFIXED code first for valid credentials and bypass scenarios, then write property-based tests capturing that behavior.

**Test Cases**:
1. **Valid Finik Credentials Preservation**: Observe that payment creation works correctly with valid `FINIK_API_KEY` and `FINIK_ACCOUNT_ID` on unfixed code, then write test to verify this continues after fix
2. **Telegram Bypass Preservation**: Observe that admin login bypasses Telegram when `chatId` is null on unfixed code, then write test to verify this continues after fix
3. **Valid Telegram Flow Preservation**: Observe that admin login sends code via Telegram when properly configured on unfixed code, then write test to verify this continues after fix
4. **Validation Error Preservation**: Observe that validation errors (missing orderId, invalid email) return 400/401 on unfixed code, then write test to verify this continues after fix

### Unit Tests

- Test `isPlaceholderValue()` helper with various placeholder patterns and valid values
- Test `createFinikPayment()` with missing, placeholder, empty, and valid credentials
- Test `sendTelegramMessage()` with missing, placeholder, and valid bot tokens
- Test `/api/finik/create-payment` route error handling for 503 vs 500 scenarios
- Test `/api/admin/send-code` bypass logic activation conditions
- Test that error responses don't expose actual credential values

### Property-Based Tests

- Generate random placeholder patterns and verify they are detected correctly
- Generate random valid-looking credentials and verify they pass validation
- Generate random API request scenarios with various env var configurations
- Test that all non-configuration errors still return appropriate status codes (400, 401, 500)
- Test that bypass logic activates for any falsy chatId value

### Integration Tests

- Test full payment creation flow with valid Finik credentials
- Test full admin authentication flow with valid Telegram configuration
- Test full admin authentication bypass flow without Telegram
- Test that the application starts successfully with placeholder environment variables
- Test that user-facing error messages are displayed correctly in the UI
- Test error logging contains sufficient debugging information
