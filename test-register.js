// Тест регистрации
const testEmail = `test${Date.now()}@example.com`;

async function testRegister() {
  console.log("\n🧪 Тестирование регистрации...");
  console.log("Email:", testEmail);
  
  try {
    const response = await fetch("http://localhost:3000/api/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        name: "Test User",
        email: testEmail,
        phone: "+996500123456",
        password: "test123456"
      })
    });

    const data = await response.json();
    
    console.log("\n📊 Ответ от сервера:");
    console.log("Статус:", response.status);
    console.log("Данные:", JSON.stringify(data, null, 2));
    
    if (response.ok) {
      console.log("\n✅ Регистрация успешна!");
    } else {
      console.log("\n❌ Ошибка регистрации:", data.error);
    }
  } catch (error) {
    console.error("\n💥 Ошибка:", error.message);
  }
}

async function testLogin() {
  console.log("\n🧪 Тестирование входа...");
  
  try {
    const response = await fetch("http://localhost:3000/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        email: testEmail,
        password: "test123456"
      })
    });

    const data = await response.json();
    
    console.log("\n📊 Ответ от сервера:");
    console.log("Статус:", response.status);
    console.log("Данные:", JSON.stringify(data, null, 2));
    
    if (response.ok) {
      console.log("\n✅ Вход успешен!");
    } else {
      console.log("\n❌ Ошибка входа:", data.error);
    }
  } catch (error) {
    console.error("\n💥 Ошибка:", error.message);
  }
}

async function run() {
  await testRegister();
  await new Promise(resolve => setTimeout(resolve, 1000));
  await testLogin();
}

run();
