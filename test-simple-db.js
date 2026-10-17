// Простой тест подключения к PostgreSQL без Prisma
const https = require('https');
const url = require('url');

const DATABASE_URL = process.env.DATABASE_URL || "postgresql://neondb_owner:npg_KektI86CXMsl@ep-late-sunset-b4jo9sgj-pooler.c-6.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require";

console.log('🔍 Проверка подключения к базе данных Neon...\n');

// Парсим URL
const parsed = new URL(DATABASE_URL);
console.log('📊 Параметры подключения:');
console.log('   Host:', parsed.hostname);
console.log('   Port:', parsed.port || '5432');
console.log('   Database:', parsed.pathname.substring(1).split('?')[0]);
console.log('   User:', parsed.username);
console.log('   SSL:', parsed.searchParams.get('sslmode'));
console.log();

// Проверка через HTTP (Neon имеет HTTP API)
const testUrl = `https://${parsed.hostname}`;

console.log('🔌 Попытка подключения к', testUrl);

https.get(testUrl, (res) => {
  console.log('✅ Сервер базы данных доступен!');
  console.log('   Статус:', res.statusCode);
  
  if (res.statusCode === 200 || res.statusCode === 404) {
    console.log('\n✅ Хост базы данных отвечает на запросы');
    console.log('   Это хороший знак - сервер работает');
    console.log();
    console.log('🔍 Теперь проверяем Prisma подключение...');
    
    // Теперь пробуем Prisma
    testPrisma();
  }
}).on('error', (err) => {
  console.error('❌ Ошибка подключения:', err.message);
  console.log();
  console.log('💡 Возможные причины:');
  console.log('   1. Нет интернет-соединения');
  console.log('   2. Неверный DATABASE_URL');
  console.log('   3. База данных недоступна');
  console.log();
  console.log('📝 Проверьте DATABASE_URL в файле .env');
  process.exit(1);
});

async function testPrisma() {
  try {
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient({
      log: ['error'],
    });
    
    console.log('   Подключение через Prisma...');
    
    // Устанавливаем таймаут
    const timeout = setTimeout(() => {
      console.log('⏰ Подключение занимает слишком много времени...');
      console.log('   Возможно, база данных медленно отвечает');
    }, 5000);
    
    await prisma.$connect();
    clearTimeout(timeout);
    
    console.log('   ✅ Prisma подключен!');
    
    // Проверяем роли
    const roles = await prisma.role.findMany();
    console.log('   ✅ Найдено ролей:', roles.length);
    
    if (roles.length === 0) {
      console.log();
      console.log('⚠️  В базе нет ролей!');
      console.log('   Создаю роль "Пользователь"...');
      
      const newRole = await prisma.role.create({
        data: {
          name: 'Пользователь',
          description: 'Обычный пользователь'
        }
      });
      
      console.log('   ✅ Роль создана:', newRole.name);
    } else {
      console.log('   Роли:');
      roles.forEach(role => {
        console.log('      -', role.name);
      });
    }
    
    // Проверяем пользователей
    const userCount = await prisma.user.count();
    console.log('   ✅ Пользователей в базе:', userCount);
    
    await prisma.$disconnect();
    
    console.log();
    console.log('═══════════════════════════════════════');
    console.log('✅ ВСЁ РАБОТАЕТ! База данных готова!');
    console.log('═══════════════════════════════════════');
    
  } catch (error) {
    console.error();
    console.error('❌ ОШИБКА PRISMA:', error.message);
    console.error();
    
    if (error.message.includes('Table') && error.message.includes('does not exist')) {
      console.error('💡 Решение:');
      console.error('   Таблицы не созданы в базе данных.');
      console.error('   Выполните миграцию:');
      console.error();
      console.error('   Создайте файл migrate.bat с содержимым:');
      console.error('   @echo off');
      console.error('   npx prisma db push');
      console.error('   pause');
      console.error();
      console.error('   Затем запустите migrate.bat');
    } else if (error.message.includes('timeout') || error.message.includes('reach')) {
      console.error('💡 Решение:');
      console.error('   База данных не отвечает.');
      console.error('   1. Проверьте интернет-соединение');
      console.error('   2. Проверьте DATABASE_URL в .env');
      console.error('   3. Убедитесь что база активна в панели Neon');
    } else {
      console.error('💡 Полная ошибка:');
      console.error(error);
    }
    
    process.exit(1);
  }
}
