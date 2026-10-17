// Полный тест системы регистрации
const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3000';
const testEmail = `test${Date.now()}@example.com`;

console.log('🧪 ПОЛНЫЙ ТЕСТ СИСТЕМЫ РЕГИСТРАЦИИ\n');
console.log('═══════════════════════════════════════\n');

// Цвета для консоли
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

function log(emoji, color, message) {
  console.log(`${emoji} ${color}${message}${colors.reset}`);
}

async function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Тест 1: Проверка доступности сервера
async function testServerAvailability() {
  log('🔍', colors.blue, 'Тест 1: Проверка доступности сервера...');
  try {
    const response = await fetch(BASE_URL);
    if (response.ok) {
      log('✅', colors.green, 'Сервер доступен!');
      return true;
    } else {
      log('❌', colors.red, `Сервер вернул статус: ${response.status}`);
      return false;
    }
  } catch (error) {
    log('❌', colors.red, `Не удалось подключиться к серверу: ${error.message}`);
    log('💡', colors.yellow, 'Убедитесь что сервер запущен: npm run dev');
    return false;
  }
}

// Тест 2: Валидация - пустые поля
async function testValidation() {
  log('\n🔍', colors.blue, 'Тест 2: Проверка валидации (пустые поля)...');
  try {
    const response = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: '', email: '', password: '' })
    });
    const data = await response.json();
    
    if (response.status === 400 && data.error) {
      log('✅', colors.green, `Валидация работает: ${data.error}`);
      return true;
    } else {
      log('❌', colors.red, 'Валидация не работает!');
      return false;
    }
  } catch (error) {
    log('❌', colors.red, `Ошибка теста: ${error.message}`);
    return false;
  }
}

// Тест 3: Валидация - некорректный email
async function testEmailValidation() {
  log('\n🔍', colors.blue, 'Тест 3: Проверка валидации email...');
  try {
    const response = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        name: 'Test', 
        email: 'invalid-email', 
        password: 'test123' 
      })
    });
    const data = await response.json();
    
    if (response.status === 400 && data.error.includes('email')) {
      log('✅', colors.green, `Валидация email работает: ${data.error}`);
      return true;
    } else {
      log('❌', colors.red, 'Валидация email не работает!');
      return false;
    }
  } catch (error) {
    log('❌', colors.red, `Ошибка теста: ${error.message}`);
    return false;
  }
}

// Тест 4: Валидация - короткий пароль
async function testPasswordValidation() {
  log('\n🔍', colors.blue, 'Тест 4: Проверка валидации пароля...');
  try {
    const response = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        name: 'Test', 
        email: testEmail, 
        password: '123' 
      })
    });
    const data = await response.json();
    
    if (response.status === 400 && data.error.includes('пароль')) {
      log('✅', colors.green, `Валидация пароля работает: ${data.error}`);
      return true;
    } else {
      log('❌', colors.red, 'Валидация пароля не работает!');
      return false;
    }
  } catch (error) {
    log('❌', colors.red, `Ошибка теста: ${error.message}`);
    return false;
  }
}

// Тест 5: Успешная регистрация
async function testSuccessfulRegistration() {
  log('\n🔍', colors.blue, 'Тест 5: Регистрация нового пользователя...');
  log('📧', colors.blue, `Email для теста: ${testEmail}`);
  
  try {
    const response = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        name: 'Test User',
        email: testEmail,
        phone: '+996500123456',
        password: 'test123456'
      })
    });
    
    const data = await response.json();
    
    console.log('📊 Ответ сервера:');
    console.log(JSON.stringify(data, null, 2));
    
    if (response.status === 201 && data.success && data.user) {
      log('✅', colors.green, 'Регистрация успешна!');
      log('👤', colors.green, `Создан пользователь: ${data.user.name} (${data.user.email})`);
      log('🎭', colors.green, `Роль: ${data.user.role}`);
      return { success: true, user: data.user };
    } else {
      log('❌', colors.red, `Регистрация не удалась: ${data.error || 'Неизвестная ошибка'}`);
      if (data.details) {
        log('📝', colors.yellow, `Детали: ${data.details}`);
      }
      return { success: false };
    }
  } catch (error) {
    log('❌', colors.red, `Ошибка регистрации: ${error.message}`);
    return { success: false };
  }
}

// Тест 6: Дубликат email
async function testDuplicateEmail() {
  log('\n🔍', colors.blue, 'Тест 6: Попытка регистрации с существующим email...');
  try {
    const response = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        name: 'Test User 2',
        email: testEmail,
        password: 'test123456'
      })
    });
    const data = await response.json();
    
    if (response.status === 409 && data.error.includes('зарегистрирован')) {
      log('✅', colors.green, `Защита от дубликатов работает: ${data.error}`);
      return true;
    } else {
      log('❌', colors.red, 'Защита от дубликатов не работает!');
      return false;
    }
  } catch (error) {
    log('❌', colors.red, `Ошибка теста: ${error.message}`);
    return false;
  }
}

// Тест 7: Вход с созданным пользователем
async function testLogin() {
  log('\n🔍', colors.blue, 'Тест 7: Вход с созданным пользователем...');
  try {
    const response = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        email: testEmail,
        password: 'test123456'
      })
    });
    const data = await response.json();
    
    if (response.status === 200 && data.success && data.user) {
      log('✅', colors.green, 'Вход успешен!');
      log('👤', colors.green, `Пользователь: ${data.user.name}`);
      return true;
    } else {
      log('❌', colors.red, `Вход не удался: ${data.error || 'Неизвестная ошибка'}`);
      return false;
    }
  } catch (error) {
    log('❌', colors.red, `Ошибка входа: ${error.message}`);
    return false;
  }
}

// Тест 8: Вход с неверным паролем
async function testWrongPassword() {
  log('\n🔍', colors.blue, 'Тест 8: Попытка входа с неверным паролем...');
  try {
    const response = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        email: testEmail,
        password: 'wrongpassword'
      })
    });
    const data = await response.json();
    
    if (response.status === 401 && data.error) {
      log('✅', colors.green, `Защита паролей работает: ${data.error}`);
      return true;
    } else {
      log('❌', colors.red, 'Защита паролей не работает!');
      return false;
    }
  } catch (error) {
    log('❌', colors.red, `Ошибка теста: ${error.message}`);
    return false;
  }
}

// Запуск всех тестов
async function runAllTests() {
  const results = [];
  
  // Тест 1
  const serverOk = await testServerAvailability();
  results.push({ name: 'Доступность сервера', passed: serverOk });
  if (!serverOk) {
    console.log('\n❌ Тесты прерваны: сервер недоступен');
    printSummary(results);
    return;
  }
  
  await wait(500);
  
  // Тест 2
  results.push({ 
    name: 'Валидация пустых полей', 
    passed: await testValidation() 
  });
  await wait(500);
  
  // Тест 3
  results.push({ 
    name: 'Валидация email', 
    passed: await testEmailValidation() 
  });
  await wait(500);
  
  // Тест 4
  results.push({ 
    name: 'Валидация пароля', 
    passed: await testPasswordValidation() 
  });
  await wait(500);
  
  // Тест 5
  const regResult = await testSuccessfulRegistration();
  results.push({ 
    name: 'Регистрация пользователя', 
    passed: regResult.success 
  });
  await wait(500);
  
  if (!regResult.success) {
    console.log('\n❌ Тесты прерваны: регистрация не удалась');
    printSummary(results);
    return;
  }
  
  // Тест 6
  results.push({ 
    name: 'Защита от дубликатов', 
    passed: await testDuplicateEmail() 
  });
  await wait(500);
  
  // Тест 7
  results.push({ 
    name: 'Вход пользователя', 
    passed: await testLogin() 
  });
  await wait(500);
  
  // Тест 8
  results.push({ 
    name: 'Защита паролей', 
    passed: await testWrongPassword() 
  });
  
  printSummary(results);
}

function printSummary(results) {
  console.log('\n═══════════════════════════════════════');
  console.log('📊 ИТОГИ ТЕСТИРОВАНИЯ\n');
  
  const passed = results.filter(r => r.passed).length;
  const total = results.length;
  
  results.forEach((result, index) => {
    const icon = result.passed ? '✅' : '❌';
    const color = result.passed ? colors.green : colors.red;
    console.log(`${icon} ${color}${index + 1}. ${result.name}${colors.reset}`);
  });
  
  console.log('\n═══════════════════════════════════════');
  const percentage = Math.round((passed / total) * 100);
  const summaryColor = percentage === 100 ? colors.green : percentage >= 70 ? colors.yellow : colors.red;
  console.log(`${summaryColor}Пройдено: ${passed}/${total} (${percentage}%)${colors.reset}`);
  console.log('═══════════════════════════════════════\n');
  
  if (percentage === 100) {
    log('🎉', colors.green, 'ВСЕ ТЕСТЫ ПРОЙДЕНЫ! Система работает отлично!');
  } else if (percentage >= 70) {
    log('⚠️', colors.yellow, 'Большинство тестов пройдено, но есть проблемы');
  } else {
    log('❌', colors.red, 'Система требует исправлений');
  }
}

// Запуск
runAllTests().catch(error => {
  console.error('\n💥 Критическая ошибка:', error);
  process.exit(1);
});
