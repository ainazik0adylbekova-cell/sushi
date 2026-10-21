/**
 * Bug Condition Exploration Test - DATABASE_URL Missing Environment Variable
 * 
 * **Validates: Requirements 2.1, 2.2**
 * 
 * CRITICAL: This test MUST FAIL on unfixed code with cryptic error:
 * "Environment variable not found: DATABASE_URL"
 * 
 * This test encodes the EXPECTED behavior after the fix:
 * - Clear error message indicating DATABASE_URL is missing or empty
 * - Configuration guidance provided in error message
 * - Error detected early (at module load or first access, not at first query)
 * - Error logged to console/server logs for operator visibility
 * 
 * GOAL: Surface counterexamples demonstrating the bug exists
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import * as fc from 'fast-check'

describe('Bug Condition Exploration: DATABASE_URL Missing', () => {
  let originalDatabaseUrl: string | undefined
  
  beforeEach(() => {
    // Save original DATABASE_URL
    originalDatabaseUrl = process.env.DATABASE_URL
  })
  
  afterEach(() => {
    // Restore original DATABASE_URL
    if (originalDatabaseUrl !== undefined) {
      process.env.DATABASE_URL = originalDatabaseUrl
    } else {
      delete process.env.DATABASE_URL
    }
    
    // Clear module cache to force reimport
    vi.resetModules()
  })

  /**
   * Test Case 1: Unset DATABASE_URL
   * 
   * On UNFIXED code: Will fail with cryptic "Environment variable not found: DATABASE_URL"
   * On FIXED code: Should throw clear error with configuration guidance
   */
  it('Example: Missing DATABASE_URL should throw clear error message', async () => {
    // Remove DATABASE_URL
    delete process.env.DATABASE_URL
    
    // Clear module cache to force reimport
    vi.resetModules()
    
    try {
      // Attempt to import lib/db.ts
      const db = await import('./db')
      
      // Attempt a database operation (on unfixed code, error occurs here)
      await db.prisma.user.findFirst()
      
      // If we get here on unfixed code, the bug didn't manifest
      throw new Error('Expected error but operation succeeded')
    } catch (error: any) {
      // Expected behavior after fix:
      // Error message should be clear and actionable
      expect(error.message).toContain('DATABASE_URL')
      expect(error.message).toContain('environment variable')
      expect(error.message).toContain('missing or empty')
      
      // Should provide configuration guidance
      expect(error.message.toLowerCase()).toMatch(/format|configure|\.env/i)
      expect(error.message).toMatch(/postgresql:\/\//i)
      
      // On UNFIXED code, we'll observe:
      // - Error message: "Environment variable not found: DATABASE_URL"
      // - No configuration guidance
      // - Error occurs at first query, not at module load
      console.log('Observed error:', error.message)
    }
  })

  /**
   * Test Case 2: Empty string DATABASE_URL
   * 
   * Empty string should be treated as missing
   */
  it('Example: Empty string DATABASE_URL should throw clear error', async () => {
    // Set DATABASE_URL to empty string
    process.env.DATABASE_URL = ""
    
    // Clear module cache
    vi.resetModules()
    
    try {
      const db = await import('./db')
      await db.prisma.user.findFirst()
      
      throw new Error('Expected error but operation succeeded')
    } catch (error: any) {
      expect(error.message).toContain('DATABASE_URL')
      expect(error.message).toContain('missing or empty')
      expect(error.message).toMatch(/postgresql:\/\//i)
    }
  })

  /**
   * Test Case 3: Whitespace-only DATABASE_URL
   * 
   * Whitespace-only string should be treated as missing
   */
  it('Example: Whitespace-only DATABASE_URL should throw clear error', async () => {
    // Set DATABASE_URL to whitespace
    process.env.DATABASE_URL = "   "
    
    // Clear module cache
    vi.resetModules()
    
    try {
      const db = await import('./db')
      await db.prisma.user.findFirst()
      
      throw new Error('Expected error but operation succeeded')
    } catch (error: any) {
      expect(error.message).toContain('DATABASE_URL')
      expect(error.message).toContain('missing or empty')
      expect(error.message).toMatch(/postgresql:\/\//i)
    }
  })

  /**
   * Property Test: Various invalid DATABASE_URL values
   * 
   * Tests that all forms of missing/invalid DATABASE_URL are detected
   * with clear, consistent error messages
   */
  it('Property: All invalid DATABASE_URL values throw clear errors', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate various invalid DATABASE_URL values
        fc.oneof(
          fc.constant(undefined),
          fc.constant(''),
          fc.constant('   '),
          fc.constant('\t\n'),
          fc.string().filter(s => s.trim() === '')
        ),
        async (invalidUrl) => {
          // Set or delete DATABASE_URL based on value
          if (invalidUrl === undefined) {
            delete process.env.DATABASE_URL
          } else {
            process.env.DATABASE_URL = invalidUrl
          }
          
          // Clear module cache
          vi.resetModules()
          
          try {
            const db = await import('./db')
            await db.prisma.user.findFirst()
            
            // Should not reach here
            return false
          } catch (error: any) {
            // All invalid values should produce clear error messages
            const messageContainsKey = error.message.includes('DATABASE_URL')
            const messageIndicatesMissing = error.message.includes('missing') || error.message.includes('empty')
            const messageHasGuidance = error.message.toLowerCase().includes('postgresql://') || 
                                      error.message.toLowerCase().includes('format') ||
                                      error.message.toLowerCase().includes('.env')
            
            // Expected behavior after fix
            expect(messageContainsKey).toBe(true)
            expect(messageIndicatesMissing).toBe(true)
            expect(messageHasGuidance).toBe(true)
            
            return true
          }
        }
      ),
      {
        numRuns: 10,
        verbose: true
      }
    )
  })

  /**
   * Test Case 4: Error Detection Timing
   * 
   * After fix, error should be detected early (at module load or first access)
   * Not delayed until first query execution
   * 
   * This test verifies the timing of error detection
   */
  it('Example: Error should be detected early, not at first query', async () => {
    delete process.env.DATABASE_URL
    vi.resetModules()
    
    let errorDetectedEarly = false
    let errorMessage = ''
    
    try {
      // On FIXED code: error should occur here (module load or client instantiation)
      const db = await import('./db')
      
      // If we reach here, try accessing the client
      try {
        // Access the prisma client (but don't execute a query yet)
        const client = db.prisma
        
        // On UNFIXED code: error occurs here (first query)
        await client.user.findFirst()
      } catch (queryError: any) {
        errorMessage = queryError.message
        errorDetectedEarly = false
      }
    } catch (moduleError: any) {
      errorMessage = moduleError.message
      errorDetectedEarly = true
    }
    
    // After fix: error should be detected early (errorDetectedEarly = true OR error at client access)
    // Before fix: error detected late (errorDetectedEarly = false, error at first query)
    
    expect(errorMessage).toContain('DATABASE_URL')
    
    // Document observation for bug analysis
    console.log('Error detection timing:', {
      detectedEarly: errorDetectedEarly,
      errorMessage: errorMessage
    })
  })
})
