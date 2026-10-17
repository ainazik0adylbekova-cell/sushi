// Тест подключения к базе данных
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  log: ['query', 'error', 'warn'],
});

async function testConnection() {
  console.log('🔍 Проверка подключения к базе данных...\n');
  
  try {
    // Тест подключения
    console.log('1️⃣ Проверка подключения...');
    await prisma.$connect();
    console.log('✅ Подключение к базе данных успешно!\n');
    
    // Проверка таблицы roles
    console.log('2️⃣ Проверка таблицы roles...');
    const roles = await prisma.role.findMany();
    console.log(`✅ Найдено ролей: ${roles.length}`);
    roles.forEach(role => {
      console.log(`   - ${role.name} (ID: ${role.id})`);
    });
    
    if (roles.length === 0) {
      console.log('\n⚠️  Нет ролей в базе! Создаю роль "Пользователь"...');
      const newRole = await prisma.role.create({
        data: {
          name: 'Пользователь',
          description: 'Обычный пользователь'
        }
      });
      console.log(`✅ Роль создана: ${newRole.name} (ID: ${newRole.id})`);
    }
    
    // Проверка таблицы users
    console.log('\n3️⃣ Проверка таблицы users...');
    const userCount = await prisma.user.count();
    console.log(`✅ Количество пользователей: ${userCount}`);
    
    if (userCount > 0) {
      const users = await prisma.user.findMany({
        take: 5,
        include: { role: true }
      });
      console.log('   Последние пользователи:');
      users.forEach(user => {
        console.log(`   - ${user.name} (${user.email}) - роль: ${user.role.name}`);
      });
    }
    
    console.log('\n✅ Все проверки пройдены! База данных работает корректно.');
    
  } catch (error) {
    console.error('\n❌ ОШИБКА:', error.message);
    console.error('\n📝 Детали ошибки:');
    console.error(error);
    
    if (error.message.includes('Can\'t reach database')) {
      console.error('\n💡 Решение:');
      console.error('   1. Проверьте DATABASE_URL в файле .env');
      console.error('   2. Убедитесь что база данных доступна');
      console.error('   3. Проверьте правильность логина/пароля');
    }
    
    if (error.message.includes('Table') && error.message.includes('does not exist')) {
      console.error('\n💡 Решение:');
      console.error('   Выполните миграцию базы данных:');
      console.error('   npx prisma db push');
    }
    
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();
