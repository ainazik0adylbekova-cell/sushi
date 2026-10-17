/**
 * Manual Bug Verification Script
 * 
 * This script attempts to register a test user to demonstrate the bug.
 * Expected: Script fails with "The column `users.avatarUrl` does not exist"
 */

import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function testRegistration() {
  console.log('🔍 Testing user registration with current schema...\n')
  
  const testEmail = `test-bug-verification-${Date.now()}@example.com`
  
  try {
    // Find or create "Пользователь" role
    let userRole = await prisma.role.findFirst({
      where: {
        OR: [
          { name: "Пользователь" },
          { name: "USER" },
          { name: "User" }
        ]
      }
    })
    
    if (!userRole) {
      console.log('📝 Creating "Пользователь" role...')
      userRole = await prisma.role.create({
        data: {
          name: "Пользователь",
          description: "Обычный пользователь"
        }
      })
    }
    
    console.log(`✓ Role found/created: ${userRole.name} (ID: ${userRole.id})\n`)
    
    // Hash password
    const passwordHash = await bcrypt.hash('testpass123', 10)
    console.log('✓ Password hashed\n')
    
    // Attempt to create user (THIS SHOULD FAIL on unfixed code)
    console.log('📝 Attempting to create user...')
    console.log(`   Email: ${testEmail}`)
    console.log(`   Name: Test User\n`)
    
    const newUser = await prisma.user.create({
      data: {
        name: 'Test User',
        email: testEmail,
        password: passwordHash,
        roleId: userRole.id,
        isActive: true,
        isVerified: false
      },
      include: {
        role: true
      }
    })
    
    // If we get here, the bug is FIXED
    console.log('✅ SUCCESS: User created successfully!')
    console.log('   This means the avatarUrl issue is RESOLVED\n')
    console.log('User data:', {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role.name,
      isActive: newUser.isActive,
      isVerified: newUser.isVerified
    })
    
    // Clean up test user
    await prisma.user.delete({ where: { id: newUser.id } })
    console.log('\n🧹 Test user cleaned up')
    
  } catch (error) {
    console.log('❌ EXPECTED FAILURE: Registration failed\n')
    console.log('Error details:')
    console.log('  Message:', error.message)
    
    if (error.message.includes('avatarUrl')) {
      console.log('\n✓ BUG CONFIRMED: The error is related to avatarUrl column')
      console.log('  This confirms the Prisma schema has avatarUrl but database does not')
      console.log('\n📋 Next steps:')
      console.log('  1. Remove avatarUrl field from prisma/schema.prisma')
      console.log('  2. Run: npx prisma generate')
      console.log('  3. Re-run this script to verify fix')
    } else {
      console.log('\n⚠️  Unexpected error type. Full error:')
      console.error(error)
    }
  } finally {
    await prisma.$disconnect()
  }
}

testRegistration().catch(console.error)
