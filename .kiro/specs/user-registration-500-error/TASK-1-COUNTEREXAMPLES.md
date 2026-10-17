# Task 1: Bug Condition Exploration Test - Counterexamples Documentation

## Test Implementation Status

✅ **COMPLETED**: Bug condition exploration test has been written at:
- `app/api/auth/register/route.test.ts`

⚠️ **PENDING**: Test execution requires vitest installation

## Test Overview

The bug condition exploration test implements a property-based testing approach using fast-check to verify that:

1. **Bug Condition**: On UNFIXED code (with `avatarUrl` in Prisma schema), ALL registration attempts fail with the database error
2. **Expected Behavior**: After fix (removing `avatarUrl`), registrations succeed with 201 status

## Test Structure

### Property-Based Test
- Generates 10 different valid user registration combinations
- Tests with various:
  - Name lengths and formats
  - Email addresses
  - Password combinations
  - Optional phone numbers

### Specific Examples
1. **Basic Registration**: Minimal valid data (name, email, password)
2. **Registration with Phone**: Includes phone number
3. **Email Normalization**: Tests email lowercasing and trimming

## Expected Outcome on UNFIXED Code

When run on code with `avatarUrl` in Prisma schema:

```
❌ FAIL: The column `users.avatarUrl` does not exist in the current database
```

This error should occur for:
- All property-based generated test cases (10 runs)
- All specific example test cases (3 tests)
- **Total**: 13 test failures expected

## Expected Outcome on FIXED Code

After removing `avatarUrl` from `prisma/schema.prisma`:

```
✅ PASS: All 13 tests pass
- Property test: 10/10 user combinations succeed
- Basic registration: ✓
- Registration with phone: ✓  
- Email normalization: ✓
```

## Counterexamples Found

**Note**: Counterexamples will be documented here after test execution

### Test Case 1: Basic Registration
**Input**:
```json
{
  "name": "Test User",
  "email": "test@test-registration-example.com",
  "password": "password123"
}
```
**Expected Error**: `The column 'users.avatarUrl' does not exist in the current database`

### Test Case 2: Registration with Phone
**Input**:
```json
{
  "name": "John Doe",
  "email": "john@test-registration-phone.com",
  "password": "securepass123",
  "phone": "+1234567890"
}
```
**Expected Error**: `The column 'users.avatarUrl' does not exist in the current database`

### Test Case 3: Email Normalization
**Input**:
```json
{
  "name": "Jane Smith",
  "email": "  TEST@Example.COM  ",
  "password": "password456"
}
```
**Expected Error**: `The column 'users.avatarUrl' does not exist in the current database`

## Root Cause Confirmation

The bug occurs because:

1. **Prisma Schema** (`prisma/schema.prisma` line 27):
   ```prisma
   model User {
     // ... other fields
     avatarUrl String?
     // ... more fields
   }
   ```

2. **Database Reality**: PostgreSQL `users` table does NOT have `avatarUrl` column

3. **Registration Code** (`app/api/auth/register/route.ts` line 98):
   ```typescript
   const newUser = await prisma.user.create({
     data: {
       name: name.trim(),
       email: emailLower,
       phone: phone?.trim() || null,
       password: passwordHash,
       roleId: userRole.id,
       isActive: true,
       isVerified: false
     },
     include: {
       role: true
     }
   });
   ```
   
   Even though the code doesn't explicitly reference `avatarUrl`, Prisma's generated client expects the column to exist based on the schema definition.

## How to Execute Test

### Installation Required
```bash
npm install
```

This installs:
- vitest (test runner)
- @vitest/ui (test UI)
- @testing-library/react (React testing utilities)
- @testing-library/jest-dom (DOM matchers)
- happy-dom (DOM environment)
- fast-check (property-based testing)

### Run Test
```bash
npm test
```

Or run specific test file:
```bash
npx vitest run app/api/auth/register/route.test.ts
```

## Next Steps

After test execution demonstrates the bug:

1. ✅ **Task 1 Complete**: Bug confirmed via failing tests
2. ➡️ **Task 2**: Write preservation property tests (validation scenarios)
3. ➡️ **Task 3**: Implement fix (remove avatarUrl from schema)
4. ➡️ **Task 3.3**: Re-run Task 1 tests (should now PASS)
5. ➡️ **Task 3.4**: Verify preservation tests still pass

## Validation Criteria

Task 1 is considered complete when:
- ✅ Test file created with property-based testing
- ✅ Test encodes expected behavior (201 status, user data returned)
- ⏳ Test is executed and fails with expected error
- ⏳ Counterexamples are documented

**Current Status**: Test implementation complete, awaiting execution to document failures.
