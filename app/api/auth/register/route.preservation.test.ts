/**
 * Preservation Property Tests - User Registration Validation
 * 
 * **Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5, 3.6**
 * 
 * IMPORTANT: These tests verify validation logic and behavior that should be
 * PRESERVED after the schema fix. They test code paths that fail BEFORE
 * database operations, so they don't trigger the avatarUrl schema bug.
 * 
 * EXPECTED OUTCOME: All tests should PASS on both unfixed and fixed code,
 * confirming no regressions in validation logic.
 * 
 * Property 2: Preservation - Registration Validation and Logic Preservation
 * 
 * For any registration request processed after the schema fix, the registration
 * endpoint SHALL execute exactly the same validation logic, role assignment,
 * password hashing, email normalization, and session creation as the original
 * implementation.
 */

import { describe, it, expect, beforeAll, afterEach } from 'vitest'
import * as fc from 'fast-check'
import { POST } from './route'
import { prisma } from '@/lib/db'
import { NextRequest } from 'next/server'
import bcrypt from 'bcryptjs'

// Clean up test users after each test
afterEach(async () => {
  await prisma.user.deleteMany({
    where: {
      OR: [
        { email: { contains: '@test-preservation-' } },
        { email: { contains: '@test-duplicate-' } },
        { email: { contains: '@test-validation-' } }
      ]
    }
  })
})

// Ensure test role exists
beforeAll(async () => {
  const existingRole = await prisma.role.findFirst({
    where: {
      OR: [
        { name: "Пользователь" },
        { name: "USER" },
        { name: "User" }
      ]
    }
  })

  if (!existingRole) {
    await prisma.role.create({
      data: {
        name: "Пользователь",
        description: "Обычный пользователь"
      }
    })
  }
})

describe('Preservation: Validation Logic', () => {
  /**
   * Test 1: Duplicate email returns 409 Conflict
   * Validates: Requirement 3.1
   */
  it('should return 409 Conflict when email already exists', async () => {
    // First, create a user
    const testEmail = `existing-${Date.now()}@test-duplicate-email.com`
    const role = await prisma.role.findFirst({
      where: { name: "Пользователь" }
    })

    await prisma.user.create({
      data: {
        name: "Existing User",
        email: testEmail,
        password: await bcrypt.hash("password123", 10),
        roleId: role!.id,
        isActive: true,
        isVerified: false
      }
    })

    // Try to register with the same email
    const request = new NextRequest('http://localhost:3000/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        name: "Duplicate User",
        email: testEmail,
        password: "password456"
      }),
      headers: {
        'Content-Type': 'application/json'
      }
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(409)
    expect(data.error).toBe("Этот email уже зарегистрирован")
  })

  /**
   * Test 2: Missing name returns 400 Bad Request
   * Validates: Requirement 3.2
   */
  it('should return 400 Bad Request when name is missing', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          name: fc.constantFrom("", "   ", null, undefined),
          email: fc.emailAddress(),
          password: fc.string({ minLength: 6 })
        }),
        async (userData) => {
          const request = new NextRequest('http://localhost:3000/api/auth/register', {
            method: 'POST',
            body: JSON.stringify(userData),
            headers: {
              'Content-Type': 'application/json'
            }
          })

          const response = await POST(request)
          const data = await response.json()

          expect(response.status).toBe(400)
          expect(data.error).toBe("Введите имя")
        }
      ),
      { numRuns: 5 }
    )
  })

  /**
   * Test 3: Invalid email format returns 400 Bad Request
   * Validates: Requirement 3.2
   */
  it('should return 400 Bad Request when email format is invalid', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          name: fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
          // Generate invalid emails
          email: fc.constantFrom(
            "notanemail",
            "missing@domain",
            "@nodomain.com",
            "spaces in@email.com",
            "double@@domain.com",
            "nodot@domaincom",
            ""
          ),
          password: fc.string({ minLength: 6 })
        }),
        async (userData) => {
          const request = new NextRequest('http://localhost:3000/api/auth/register', {
            method: 'POST',
            body: JSON.stringify(userData),
            headers: {
              'Content-Type': 'application/json'
            }
          })

          const response = await POST(request)
          const data = await response.json()

          expect(response.status).toBe(400)
          expect(data.error).toMatch(/email|Введите email|Некорректный email/i)
        }
      ),
      { numRuns: 7 }
    )
  })

  /**
   * Test 4: Password shorter than 6 characters returns 400 Bad Request
   * Validates: Requirement 3.2
   */
  it('should return 400 Bad Request when password is too short', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          name: fc.string({ minLength: 1 }),
          email: fc.emailAddress(),
          password: fc.string({ maxLength: 5 })
        }),
        async (userData) => {
          const request = new NextRequest('http://localhost:3000/api/auth/register', {
            method: 'POST',
            body: JSON.stringify(userData),
            headers: {
              'Content-Type': 'application/json'
            }
          })

          const response = await POST(request)
          const data = await response.json()

          expect(response.status).toBe(400)
          expect(data.error).toBe("Пароль должен содержать минимум 6 символов")
        }
      ),
      { numRuns: 10 }
    )
  })

  /**
   * Specific test for empty password
   */
  it('should return 400 Bad Request when password is empty or null', async () => {
    const testCases = [
      { password: "" },
      { password: null },
      { password: undefined }
    ]

    for (const testCase of testCases) {
      const request = new NextRequest('http://localhost:3000/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          name: "Test User",
          email: "test@example.com",
          ...testCase
        }),
        headers: {
          'Content-Type': 'application/json'
        }
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe("Пароль должен содержать минимум 6 символов")
    }
  })
})

describe('Preservation: Email Normalization', () => {
  /**
   * Test 5: Email normalization - verify "TEST@Example.COM" is stored as "test@example.com"
   * Validates: Requirement 3.5
   */
  it('Property: Email should be normalized (lowercased and trimmed)', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          name: fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
          // Generate emails with various casing and whitespace
          emailBase: fc.emailAddress(),
          caseTransform: fc.constantFrom('upper', 'lower', 'mixed'),
          addWhitespace: fc.boolean()
        }),
        async ({ name, emailBase, caseTransform, addWhitespace }) => {
          // Apply case transformation
          let email = emailBase
          if (caseTransform === 'upper') {
            email = email.toUpperCase()
          } else if (caseTransform === 'mixed') {
            email = email.split('').map((c, i) => 
              i % 2 === 0 ? c.toUpperCase() : c.toLowerCase()
            ).join('')
          }

          // Add whitespace if requested
          if (addWhitespace) {
            email = `  ${email}  `
          }

          // Make email unique for this test run
          const uniqueEmail = email.replace('@', `+${Date.now()}@`)

          const request = new NextRequest('http://localhost:3000/api/auth/register', {
            method: 'POST',
            body: JSON.stringify({
              name,
              email: uniqueEmail,
              password: "password123"
            }),
            headers: {
              'Content-Type': 'application/json'
            }
          })

          const response = await POST(request)
          const data = await response.json()

          // Should succeed
          expect(response.status).toBe(201)
          
          // Email in response should be normalized
          const expectedEmail = uniqueEmail.toLowerCase().trim()
          expect(data.user.email).toBe(expectedEmail)

          // Verify in database
          const dbUser = await prisma.user.findUnique({
            where: { email: expectedEmail }
          })
          expect(dbUser).toBeDefined()
          expect(dbUser!.email).toBe(expectedEmail)
        }
      ),
      { numRuns: 10 }
    )
  })

  /**
   * Specific test case for email normalization
   */
  it('Example: "TEST@Example.COM" should be stored as "test@example.com"', async () => {
    const timestamp = Date.now()
    const testEmail = `  TEST-${timestamp}@Example.COM  `

    const request = new NextRequest('http://localhost:3000/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        name: "Test User",
        email: testEmail,
        password: "password123"
      }),
      headers: {
        'Content-Type': 'application/json'
      }
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(201)
    expect(data.user.email).toBe(`test-${timestamp}@example.com`)

    const dbUser = await prisma.user.findUnique({
      where: { email: `test-${timestamp}@example.com` }
    })
    expect(dbUser!.email).toBe(`test-${timestamp}@example.com`)
  })
})

describe('Preservation: Password Hashing', () => {
  /**
   * Test 6: Password is bcrypt-hashed (starts with $2a$ or $2b$ and has 60 characters)
   * Validates: Requirement 3.4
   */
  it('Property: Password should be bcrypt-hashed with correct format', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          name: fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
          email: fc.emailAddress().map(e => `${e.split('@')[0]}+${Date.now()}@test-preservation-hash.com`),
          password: fc.string({ minLength: 6, maxLength: 100 })
        }),
        async (userData) => {
          const request = new NextRequest('http://localhost:3000/api/auth/register', {
            method: 'POST',
            body: JSON.stringify(userData),
            headers: {
              'Content-Type': 'application/json'
            }
          })

          const response = await POST(request)
          const data = await response.json()

          expect(response.status).toBe(201)

          // Verify password is hashed in database
          const dbUser = await prisma.user.findUnique({
            where: { email: userData.email.toLowerCase().trim() }
          })

          expect(dbUser).toBeDefined()
          
          // Password should not be stored in plain text
          expect(dbUser!.password).not.toBe(userData.password)
          
          // Password should be bcrypt hash (starts with $2a$ or $2b$)
          expect(dbUser!.password).toMatch(/^\$2[aby]\$/)
          
          // Bcrypt hashes are 60 characters long
          expect(dbUser!.password.length).toBe(60)
          
          // Should be able to verify the password
          const isValid = await bcrypt.compare(userData.password, dbUser!.password)
          expect(isValid).toBe(true)
        }
      ),
      { numRuns: 10 }
    )
  })

  /**
   * Specific test: Verify bcrypt with 10 rounds
   */
  it('Example: Password should be hashed with bcrypt', async () => {
    const timestamp = Date.now()
    const plainPassword = "mySecurePassword123!"

    const request = new NextRequest('http://localhost:3000/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        name: "Test User",
        email: `test-${timestamp}@test-preservation-bcrypt.com`,
        password: plainPassword
      }),
      headers: {
        'Content-Type': 'application/json'
      }
    })

    const response = await POST(request)
    expect(response.status).toBe(201)

    const dbUser = await prisma.user.findUnique({
      where: { email: `test-${timestamp}@test-preservation-bcrypt.com` }
    })

    // Password should be hashed
    expect(dbUser!.password).not.toBe(plainPassword)
    expect(dbUser!.password).toMatch(/^\$2[aby]\$10\$/) // bcrypt with 10 rounds
    expect(dbUser!.password.length).toBe(60)

    // Should be able to verify
    const isValid = await bcrypt.compare(plainPassword, dbUser!.password)
    expect(isValid).toBe(true)

    // Wrong password should fail
    const isInvalid = await bcrypt.compare("wrongPassword", dbUser!.password)
    expect(isInvalid).toBe(false)
  })
})

describe('Preservation: Role Assignment and User Properties', () => {
  /**
   * Validates: Requirement 3.3
   */
  it('Property: User should be created with correct default properties', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          name: fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
          email: fc.emailAddress().map(e => `${e.split('@')[0]}+${Date.now()}@test-preservation-props.com`),
          password: fc.string({ minLength: 6, maxLength: 100 })
        }),
        async (userData) => {
          const request = new NextRequest('http://localhost:3000/api/auth/register', {
            method: 'POST',
            body: JSON.stringify(userData),
            headers: {
              'Content-Type': 'application/json'
            }
          })

          const response = await POST(request)
          const data = await response.json()

          expect(response.status).toBe(201)
          
          // User should be assigned "Пользователь" role
          expect(data.user.role).toBe("Пользователь")

          // Verify in database
          const dbUser = await prisma.user.findUnique({
            where: { email: userData.email.toLowerCase().trim() },
            include: { role: true }
          })

          expect(dbUser).toBeDefined()
          expect(dbUser!.role.name).toBe("Пользователь")
          expect(dbUser!.isActive).toBe(true)
          expect(dbUser!.isVerified).toBe(false)
        }
      ),
      { numRuns: 10 }
    )
  })

  /**
   * Example test for role assignment
   */
  it('Example: User should be assigned "Пользователь" role with isActive=true and isVerified=false', async () => {
    const timestamp = Date.now()

    const request = new NextRequest('http://localhost:3000/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        name: "Role Test User",
        email: `roletest-${timestamp}@test-preservation-role.com`,
        password: "password123"
      }),
      headers: {
        'Content-Type': 'application/json'
      }
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(201)
    expect(data.user.role).toBe("Пользователь")

    const dbUser = await prisma.user.findUnique({
      where: { email: `roletest-${timestamp}@test-preservation-role.com` },
      include: { role: true }
    })

    expect(dbUser!.role.name).toBe("Пользователь")
    expect(dbUser!.isActive).toBe(true)
    expect(dbUser!.isVerified).toBe(false)
  })
})

describe('Preservation: Response Format', () => {
  /**
   * Validates: Requirement 3.6 - Response structure should remain unchanged
   */
  it('Property: Successful registration should return correct response format', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          name: fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
          email: fc.emailAddress().map(e => `${e.split('@')[0]}+${Date.now()}@test-preservation-format.com`),
          password: fc.string({ minLength: 6, maxLength: 100 })
        }),
        async (userData) => {
          const request = new NextRequest('http://localhost:3000/api/auth/register', {
            method: 'POST',
            body: JSON.stringify(userData),
            headers: {
              'Content-Type': 'application/json'
            }
          })

          const response = await POST(request)
          const data = await response.json()

          expect(response.status).toBe(201)
          
          // Response should have correct structure
          expect(data).toHaveProperty('success')
          expect(data).toHaveProperty('user')
          expect(data.success).toBe(true)
          
          // User object should have required fields
          expect(data.user).toHaveProperty('id')
          expect(data.user).toHaveProperty('name')
          expect(data.user).toHaveProperty('email')
          expect(data.user).toHaveProperty('role')
          
          // Fields should have correct types
          expect(typeof data.user.id).toBe('string')
          expect(typeof data.user.name).toBe('string')
          expect(typeof data.user.email).toBe('string')
          expect(typeof data.user.role).toBe('string')
        }
      ),
      { numRuns: 10 }
    )
  })
})
