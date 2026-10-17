# User Registration 500 Error Bugfix Design

## Overview

This bugfix addresses a critical schema mismatch issue that prevents all user registrations from completing. The Prisma schema defines an `avatarUrl` field in the `User` model, but the PostgreSQL database does not have a corresponding `avatarUrl` column in the `users` table. This mismatch causes Prisma operations to fail with a 500 error during user registration.

The fix is straightforward: remove the `avatarUrl` field from the Prisma schema to match the actual database structure. This is a safe operation since:
1. Avatar functionality is not currently used in the application
2. The registration endpoint does not attempt to set avatar values
3. There are no existing users with avatar data to preserve

## Glossary

- **Bug_Condition (C)**: The condition that triggers the bug - when Prisma schema contains `avatarUrl` field but the database `users` table lacks the `avatarUrl` column
- **Property (P)**: The desired behavior - user registration should succeed with HTTP 201 status and return created user data
- **Preservation**: All existing registration validation, role assignment, password hashing, and session creation logic must remain unchanged
- **prisma.user.create()**: The Prisma ORM operation in `/app/api/auth/register/route.ts` that creates a new user record
- **Schema Mismatch**: The discrepancy between the Prisma schema definition (`schema.prisma`) and the actual PostgreSQL database structure

## Bug Details

### Bug Condition

The bug manifests when any user attempts to register through the `/api/auth/register` endpoint. The registration handler attempts to create a user via `prisma.user.create()`, but Prisma fails because it expects the `avatarUrl` column to exist in the database (based on the schema definition), but the column is absent in the actual PostgreSQL table.

**Formal Specification:**
```
FUNCTION isBugCondition(input)
  INPUT: input of type RegistrationAttempt
  OUTPUT: boolean
  
  RETURN prismaSchema.models.User.fields.includes("avatarUrl") = true
         AND database.tables.users.columns.includes("avatarUrl") = false
         AND input.endpoint = "/api/auth/register"
END FUNCTION
```

### Examples

- **Example 1**: User submits valid registration form with name="John Doe", email="john@example.com", password="secret123" → Server returns 500 error with message "The column `users.avatarUrl` does not exist in the current database"

- **Example 2**: User submits registration with name="Jane Smith", email="jane@example.com", phone="+1234567890", password="pass456" → Same 500 error, registration fails before reaching validation logic

- **Example 3**: Automated test attempts to create user via API → Test fails with database schema error, blocking all registration testing

- **Edge Case**: Even if the registration endpoint were to explicitly set `avatarUrl: null`, the operation would still fail because the database column doesn't exist

## Expected Behavior

### Preservation Requirements

**Unchanged Behaviors:**
- All validation logic (name required, valid email format, password length >= 6) must continue to work exactly as before
- Email uniqueness check must continue to return 409 Conflict when email already exists
- Role assignment logic (finding or creating "Пользователь" role) must remain unchanged
- Password hashing with bcrypt (10 rounds) must continue to function identically
- Email normalization (toLowerCase + trim) must be preserved
- Session cookie creation via `setSessionCookie()` must work the same way
- Response format (201 status with user object containing id, name, email, role) must be identical

**Scope:**
All registration logic that does NOT involve the `avatarUrl` field should be completely unaffected by this fix. This includes:
- All validation and error responses (400, 409, 500)
- Role lookup and creation logic
- Password hashing and security
- Session management
- Response formatting
- Logging and error handling

**Note:** The expected correct behavior (successful registration returning 201 status) is defined in the Correctness Properties section (Property 1). This section focuses on what must NOT change.

## Hypothesized Root Cause

Based on the bug description and code analysis, the root cause is clear:

1. **Schema Migration Issue**: The database was likely created or migrated without including the `avatarUrl` column, but the Prisma schema file retained this field definition. This could have happened due to:
   - Manual database creation using SQL scripts that omitted the field
   - A migration that removed the column from the database but wasn't reflected in the schema
   - Different schema versions between development and production environments

2. **Prisma ORM Behavior**: Prisma generates SQL queries based on the schema definition. When `prisma.user.create()` is called, Prisma attempts to INSERT into all non-optional fields defined in the schema, including `avatarUrl`. Since the column doesn't exist, PostgreSQL rejects the query.

3. **Optional Field Declaration**: The `avatarUrl` field in the schema is marked as optional (`String?`), but Prisma still includes it in the query structure. The issue isn't about required vs optional—it's about the field existing in the schema at all.

4. **No Runtime Check**: Prisma doesn't perform runtime validation of schema against database structure on each operation. It assumes the schema is synchronized with the database, which is the developer's responsibility through migrations.

## Correctness Properties

Property 1: Bug Condition - Successful User Registration

_For any_ registration request with valid user data (name, email, password) where the Prisma schema previously contained the `avatarUrl` field causing a mismatch with the database, the fixed registration endpoint SHALL successfully create the user record, return HTTP 201 status, and include the created user's id, name, email, and role in the response body.

**Validates: Requirements 2.1, 2.2, 2.3**

Property 2: Preservation - Registration Logic and Validation

_For any_ registration request processed after the schema fix, the registration endpoint SHALL execute exactly the same validation logic (name/email/password checks), role assignment, password hashing (bcrypt with 10 rounds), email normalization, and session creation as the original implementation, producing identical responses for all validation failures and edge cases.

**Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5, 3.6**

## Fix Implementation

### Changes Required

Assuming our root cause analysis is correct (schema mismatch), the fix requires a single change:

**File**: `prisma/schema.prisma`

**Model**: `User`

**Specific Changes**:
1. **Remove avatarUrl Field**: Delete line 28 which contains `avatarUrl String?`
   - Current: The User model includes `avatarUrl String?` field
   - After Fix: The User model will not include any avatarUrl field
   - Justification: The database does not have this column, and avatar functionality is not currently implemented

2. **Regenerate Prisma Client**: After modifying the schema, run `npx prisma generate` to regenerate the Prisma client code with the updated schema
   - This ensures the TypeScript types and query builder reflect the corrected schema
   - The generated client will no longer attempt to include `avatarUrl` in queries

3. **Verify No Breaking Changes**: Confirm that no other code in the application references `user.avatarUrl`
   - Based on the grep search, only the schema files contain this field
   - The registration endpoint in `/app/api/auth/register/route.ts` does not reference avatarUrl
   - No breaking changes expected

4. **Optional: Database Alignment Documentation**: Document in comments or README that the database was intentionally created without avatarUrl column
   - This prevents future confusion about why the field is absent

5. **No Migration Required**: Since the database already lacks the column and no data exists to migrate, no database migration is needed. We're simply aligning the schema to match existing reality.

## Testing Strategy

### Validation Approach

The testing strategy follows a two-phase approach: first, surface counterexamples that demonstrate the bug on unfixed code (confirming the schema mismatch causes registration failures), then verify the fix works correctly and preserves all existing registration behavior.

### Exploratory Bug Condition Checking

**Goal**: Surface counterexamples that demonstrate the bug BEFORE implementing the fix. Confirm that the schema mismatch is indeed the root cause of the 500 error. If the error persists after the fix or has a different cause, we'll need to re-hypothesize.

**Test Plan**: Attempt user registration with valid data on the UNFIXED code (with `avatarUrl` in schema). Document the exact error message and stack trace. This confirms the bug condition before we make changes.

**Test Cases**:
1. **Basic Registration Test**: POST to `/api/auth/register` with `{name: "Test User", email: "test@example.com", password: "password123"}` (will fail on unfixed code with "column users.avatarUrl does not exist")

2. **Registration with Phone Test**: POST with `{name: "John Doe", email: "john@test.com", phone: "+1234567890", password: "securepass"}` (will fail with same error on unfixed code)

3. **Minimal Valid Registration**: POST with `{name: "A", email: "a@b.c", password: "123456"}` (will fail on unfixed code, even with minimal data)

4. **Database Direct Query**: Execute `SELECT column_name FROM information_schema.columns WHERE table_name = 'users';` to confirm `avatarUrl` column is absent (confirms database state)

**Expected Counterexamples**:
- Registration attempts fail with error: "The column `users.avatarUrl` does not exist in the current database"
- Stack trace points to Prisma query generation or execution
- Database query confirms `avatarUrl` column is missing from `users` table
- Possible alternative cause: Database connection issue (ruled out if other queries work)

### Fix Checking

**Goal**: Verify that for all inputs where the bug condition holds (attempting registration while schema has avatarUrl), the fixed function produces the expected behavior (successful registration with 201 response).

**Pseudocode:**
```
FOR ALL registrationRequest WHERE isBugCondition(registrationRequest) DO
  result := registerUser_fixed(registrationRequest)
  ASSERT result.status = 201
  ASSERT result.body.success = true
  ASSERT result.body.user.id IS NOT NULL
  ASSERT result.body.user.name = registrationRequest.name
  ASSERT result.body.user.email = registrationRequest.email.toLowerCase().trim()
  ASSERT result.body.user.role = "Пользователь"
END FOR
```

### Preservation Checking

**Goal**: Verify that for all registration scenarios where the bug condition does NOT hold (validation failures, duplicate emails, etc.), the fixed function produces the same result as the original function would have (if the bug didn't exist).

**Pseudocode:**
```
FOR ALL registrationRequest WHERE NOT isBugCondition(registrationRequest) DO
  ASSERT registerUser_original(registrationRequest) = registerUser_fixed(registrationRequest)
END FOR
```

**Testing Approach**: Property-based testing is recommended for preservation checking because:
- It generates many test cases automatically across the input domain (valid/invalid emails, password lengths, special characters, etc.)
- It catches edge cases that manual unit tests might miss (empty strings, Unicode characters, extremely long inputs)
- It provides strong guarantees that behavior is unchanged for all non-buggy inputs (validation, error responses, edge cases)

**Test Plan**: First observe behavior on UNFIXED code for validation failures and edge cases (since those don't trigger the schema bug), then write property-based tests capturing that behavior. After applying the fix, verify all these tests still pass with identical outputs.

**Test Cases**:
1. **Duplicate Email Preservation**: Register user with email "existing@test.com", then attempt to register again with same email → Should continue to return 409 Conflict with message "Этот email уже зарегистрирован"

2. **Validation Error Preservation**: Observe that requests with missing name, invalid email format, or short password return 400 Bad Request on unfixed code (these bypass the schema bug), then verify same validation after fix

3. **Password Hashing Preservation**: Create test user, then verify the password field in database is bcrypt-hashed (starts with $2a$ or $2b$) and has proper structure (60 chars) - behavior should be identical after fix

4. **Session Cookie Preservation**: Verify that after successful registration, the response includes proper session cookies with correct expiration and security flags - should work identically after fix

5. **Email Normalization Preservation**: Register with email "TEST@Example.COM" and verify it's stored as "test@example.com" in database - should work identically after fix

### Unit Tests

- Test successful registration with valid data returns 201 and user object
- Test registration with missing name returns 400 with error message
- Test registration with invalid email format returns 400
- Test registration with password < 6 chars returns 400
- Test registration with duplicate email returns 409
- Test that created user has correct role ("Пользователь")
- Test that password is bcrypt-hashed (not stored in plain text)
- Test that email is normalized (lowercased and trimmed)
- Test that session cookie is set after successful registration

### Property-Based Tests

- Generate random valid user data (various name lengths, email formats, password strengths) and verify all registrations succeed after fix
- Generate random invalid inputs (empty strings, malformed emails, short passwords) and verify consistent validation errors
- Generate edge case inputs (Unicode characters, very long strings, special characters in names) and verify appropriate handling
- Test concurrent registration attempts with different emails to verify database transaction handling

### Integration Tests

- Test full registration flow: form submission → API call → database record creation → session establishment → redirect to home page
- Test registration followed immediately by login with same credentials
- Test registration with phone number and verify it's stored correctly
- Test that newly registered user appears in admin user list
- Test that registered user can immediately place orders (role permissions work correctly)
- Test registration error handling: network failures, database connection issues, timeout scenarios

