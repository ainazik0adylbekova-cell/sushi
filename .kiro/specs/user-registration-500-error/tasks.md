# Implementation Plan

## Overview
This task list implements the fix for the user registration 500 error caused by a schema mismatch. The Prisma schema contains an `avatarUrl` field that doesn't exist in the PostgreSQL database, causing all registration attempts to fail.

## Tasks

- [x] 1. Write bug condition exploration test
  - **Property 1: Bug Condition** - Registration Fails with Schema Mismatch Error
  - **CRITICAL**: This test MUST FAIL on unfixed code - failure confirms the bug exists
  - **DO NOT attempt to fix the test or the code when it fails**
  - **NOTE**: This test encodes the expected behavior - it will validate the fix when it passes after implementation
  - **GOAL**: Surface counterexamples that demonstrate the bug exists
  - **Scoped PBT Approach**: Test registration with various valid user data combinations (different names, emails, passwords) to confirm the bug occurs for all registration attempts
  - Test that POST to `/api/auth/register` with valid data `{name: "Test User", email: "test@example.com", password: "password123"}` returns status 201 (this matches expected behavior from design)
  - Test that the response includes `{success: true, user: {id, name, email, role}}`
  - Test that the user's email is normalized (lowercased and trimmed)
  - Test that the user is assigned the "Пользователь" role
  - Run test on UNFIXED code (with `avatarUrl` in schema)
  - **EXPECTED OUTCOME**: Test FAILS with error "The column `users.avatarUrl` does not exist in the current database" (this is correct - it proves the bug exists)
  - Document counterexamples found to understand root cause
  - Mark task complete when test is written, run, and failure is documented
  - _Requirements: 1.1, 1.2, 2.1, 2.2, 2.3_

- [x] 2. Write preservation property tests (BEFORE implementing fix)
  - **Property 2: Preservation** - Registration Validation and Logic Preservation
  - **IMPORTANT**: Follow observation-first methodology
  - Observe behavior on UNFIXED code for validation scenarios (these don't trigger the schema bug since they fail before database operations)
  - Test 1: Duplicate email returns 409 Conflict with "Этот email уже зарегистрирован" (observe on unfixed code if possible by testing with pre-existing user)
  - Test 2: Missing name returns 400 Bad Request with validation error
  - Test 3: Invalid email format returns 400 Bad Request
  - Test 4: Password shorter than 6 characters returns 400 Bad Request
  - Test 5: Email normalization - verify "TEST@Example.COM" is stored as "test@example.com"
  - Test 6: Password is bcrypt-hashed (starts with $2a$ or $2b$ and has 60 characters)
  - Write property-based tests capturing observed behavior patterns from Preservation Requirements
  - Property-based testing generates many test cases for stronger guarantees
  - Run tests on code paths that don't trigger the schema bug (validation failures)
  - **EXPECTED OUTCOME**: Validation tests PASS (this confirms baseline behavior to preserve)
  - Mark task complete when tests are written, run, and passing for validation scenarios
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6_

- [ ] 3. Fix for user registration 500 error

  - [x] 3.1 Remove avatarUrl field from Prisma schema
    - Open `prisma/schema.prisma` file
    - Locate the `User` model (around line 20-45)
    - Remove line containing `avatarUrl String?` (should be line 28)
    - Save the file
    - Run `npx prisma generate` to regenerate Prisma client with updated schema
    - Verify regeneration completes without errors
    - _Bug_Condition: isBugCondition(input) where prismaSchema.User.hasField("avatarUrl") = true AND database.users.hasColumn("avatarUrl") = false_
    - _Expected_Behavior: Registration succeeds with status 201, returns user object with {id, name, email, role}_
    - _Preservation: All validation logic (name required, email format, password length), role assignment ("Пользователь"), password hashing (bcrypt 10 rounds), email normalization (toLowerCase + trim), session creation, and error responses (400, 409) remain unchanged_
    - _Requirements: 1.1, 1.2, 2.1, 2.2, 2.3, 3.1, 3.2, 3.3, 3.4, 3.5, 3.6_

  - [ ] 3.2 Verify no code references to avatarUrl
    - Search codebase for any references to `avatarUrl` or `avatar_url`
    - Check registration endpoint `/app/api/auth/register/route.ts`
    - Check login endpoint `/app/api/auth/login/route.ts`
    - Check user profile pages and components
    - Confirm no breaking changes (based on grep search, only schema files should contain this field)
    - Document findings
    - _Requirements: 3.6_

  - [ ] 3.3 Verify bug condition exploration test now passes
    - **Property 1: Expected Behavior** - Registration Succeeds After Schema Fix
    - **IMPORTANT**: Re-run the SAME test from task 1 - do NOT write a new test
    - The test from task 1 encodes the expected behavior (status 201, user object returned)
    - Run bug condition exploration test from step 1
    - **EXPECTED OUTCOME**: Test PASSES (confirms bug is fixed and registration works)
    - Verify all assertions pass:
      - Status is 201
      - Response includes `{success: true, user: {id, name, email, role}}`
      - User email is normalized
      - User has "Пользователь" role
    - _Requirements: 2.1, 2.2, 2.3_

  - [ ] 3.4 Verify preservation tests still pass
    - **Property 2: Preservation** - Validation and Logic Still Works After Fix
    - **IMPORTANT**: Re-run the SAME tests from task 2 - do NOT write new tests
    - Run preservation property tests from step 2
    - **EXPECTED OUTCOME**: Tests PASS (confirms no regressions)
    - Verify all preservation behaviors:
      - Duplicate email returns 409
      - Invalid inputs return 400 with appropriate messages
      - Email normalization works correctly
      - Password hashing uses bcrypt with proper format
      - Role assignment still assigns "Пользователь"
      - Session creation works identically
    - Confirm all tests still pass after fix (no regressions)
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6_

- [ ] 4. Checkpoint - Ensure all tests pass
  - Run all registration tests (bug condition + preservation)
  - Verify all tests pass successfully
  - Test manual registration flow through UI at `/login` (registration tab)
  - Confirm registration completes successfully and user is logged in
  - Verify user appears in database with correct fields
  - Check that no console errors or warnings appear
  - If any issues arise, investigate and ask user for guidance

## Notes

- **Testing Framework**: Tests should be written using the project's existing test framework (likely Jest or Vitest based on Next.js setup)
- **Database State**: Ensure test database is clean or use unique emails for each test run
- **Manual Testing**: After all automated tests pass, perform manual registration through the UI to confirm end-to-end functionality
- **No Migration Needed**: Since the database already lacks the `avatarUrl` column, no database migration is required - we're simply aligning the schema to match reality
