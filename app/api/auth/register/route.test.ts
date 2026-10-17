/**
 * Bug Condition Exploration Test - User Registration 500 Error
 * 
 * **Validates: Requirements 1.1, 1.2, 2.1, 2.2, 2.3**
 * 
 * CRITICAL: This test MUST FAIL on unfixed code with error:
 * "The column `users.avatarUrl` does not exist in the current database"
 * 
 * This test encodes the EXPECTED behavior after the fix:
 * - Registration with valid data should return 201 status
 * - Response should include success flag and user data
 * - Email should be normalized (lowercased and trimmed)
 * - User should be assigned "Пользователь" role
 * 
 * GOAL: Surface counterexamples demonstrating the bug exists
 */

import { describe, it, expect, beforeAll, afterEach } from 'vitest'
import * as fc from 'fast-check'
import { POST } from './route'
import { prisma } from '@/lib/db'
import { NextRequest } from 'next/server'

// Clean up test users after each test
afterEach(async () => {
  await prisma.user.deleteMany({
    where: {
      email: {
        contains: '@test-registration-'
      }
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

/**
 * Property 1: Bug Condition - Registration Fails with Schema Mismatch Error
 * 
 * This property test verifies the BUG CONDITION: when Prisma schema contains
 * avatarUrl field but the database doesn't, registration attempts fail.
 * 
 * After the fix (removing avatarUrl from schema), this test should PASS,
 * confirming that registration now succeeds with the expected behavior.
 */
describe('Bug Condition Exploration: Registration Schema Mismatch', () => {
  it('Property: Registration succeeds with valid user data (EXPECTED TO FAIL on unfixed code)', async () => {
    /**
     * Property-Based Test: Generate various valid user registration combinations
     * to confirm the bug affects ALL registration attempts, regardless of input variation
     */
    await fc.assert(
      fc.asyncProperty(
        // Generate valid registration data
        fc.record({
          name: fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
          email: fc.emailAddress().map(email => `${email.split('@')[0]}@test-registration-${Date.now()}-${Math.random().toString(36).substring(7)}.com`),
          password: fc.string({ minLength: 6, maxLength: 100 }),
          phone: fc.option(fc.string({ minLength: 10, maxLength: 20 }), { nil: null })
        }),
        async (userData) => {
          // Create request
          const request = new NextRequest('http://localhost:3000/api/auth/register', {
            method: 'POST',
            body: JSON.stringify(userData),
            headers: {
              'Content-Type': 'application/json'
            }
          })

          // Call registration endpoint
          const response = await POST(request)
          const data = await response.json()

          // Expected behavior after fix (will fail on unfixed code)
          expect(response.status).toBe(201)
          expect(data.success).toBe(true)
          expect(data.user).toBeDefined()
          expect(data.user.id).toBeDefined()
          expect(data.user.name).toBe(userData.name.trim())
          
          // Email should be normalized (lowercased and trimmed)
          expect(data.user.email).toBe(userData.email.toLowerCase().trim())
          
          // User should be assigned "Пользователь" role
          expect(data.user.role).toBe("Пользователь")
          
          // Verify user was created in database
          const dbUser = await prisma.user.findUnique({
            where: { email: userData.email.toLowerCase().trim() },
            include: { role: true }
          })
          
          expect(dbUser).toBeDefined()
          expect(dbUser!.name).toBe(userData.name.trim())
          expect(dbUser!.email).toBe(userData.email.toLowerCase().trim())
          expect(dbUser!.isActive).toBe(true)
          expect(dbUser!.isVerified).toBe(false)
          expect(dbUser!.role.name).toBe("Пользователь")
          
          // Password should be hashed (bcrypt)
          expect(dbUser!.password).not.toBe(userData.password)
          expect(dbUser!.password).toMatch(/^\$2[aby]\$/)
          expect(dbUser!.password.length).toBe(60)
        }
      ),
      {
        numRuns: 10, // Test with 10 different valid user combinations
        verbose: true
      }
    )
  })

  /**
   * Specific test case: Basic registration with minimal valid data
   * This confirms the bug exists even with the simplest valid input
   */
  it('Example: Basic registration with minimal valid data should succeed', async () => {
    const userData = {
      name: "Test User",
      email: `test-${Date.now()}@test-registration-example.com`,
      password: "password123"
    }

    const request = new NextRequest('http://localhost:3000/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
      headers: {
        'Content-Type': 'application/json'
      }
    })

    const response = await POST(request)
    const data = await response.json()

    // On UNFIXED code: Will get 500 error with "The column `users.avatarUrl` does not exist"
    // On FIXED code: Should get 201 with user data
    expect(response.status).toBe(201)
    expect(data.success).toBe(true)
    expect(data.user).toBeDefined()
    expect(data.user.id).toBeDefined()
    expect(data.user.name).toBe("Test User")
    expect(data.user.email).toBe(userData.email.toLowerCase())
    expect(data.user.role).toBe("Пользователь")
  })

  /**
   * Example with phone number included
   */
  it('Example: Registration with phone number should succeed', async () => {
    const userData = {
      name: "John Doe",
      email: `john-${Date.now()}@test-registration-phone.com`,
      password: "securepass123",
      phone: "+1234567890"
    }

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
    expect(data.success).toBe(true)
    expect(data.user.name).toBe("John Doe")
    
    // Verify phone was stored
    const dbUser = await prisma.user.findUnique({
      where: { email: userData.email.toLowerCase() }
    })
    expect(dbUser!.phone).toBe("+1234567890")
  })

  /**
   * Edge case: Email normalization test
   */
  it('Example: Email should be normalized (lowercased and trimmed)', async () => {
    const userData = {
      name: "Jane Smith",
      email: `  TEST-${Date.now()}@Example.COM  `,
      password: "password456"
    }

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
    expect(data.user.email).toBe(userData.email.toLowerCase().trim())
    
    const dbUser = await prisma.user.findUnique({
      where: { email: userData.email.toLowerCase().trim() }
    })
    expect(dbUser).toBeDefined()
  })
})
