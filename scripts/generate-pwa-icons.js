/**
 * Скрипт для генерации PWA иконок из sushigl.png
 * Использует sharp для изменения размера изображений
 * 
 * Установка: npm install sharp --save-dev
 * Запуск: node scripts/generate-pwa-icons.js
 */

const fs = require('fs');
const path = require('path');

// Проверяем наличие sharp
let sharp;
try {
  sharp = require('sharp');
} catch (error) {
  console.log('📦 Модуль sharp не установлен.');
  console.log('Установите его командой: npm install sharp --save-dev');
  console.log('\nИли создайте иконки вручную в папке public/icons/');
  process.exit(0);
}

const SOURCE_IMAGE = path.join(__dirname, '../public/sushigl.png');
const ICONS_DIR = path.join(__dirname, '../public/icons');

// Размеры иконок для PWA
const ICON_SIZES = [72, 96, 128, 144, 152, 192, 384, 512];

// Создаем папку для иконок, если её нет
if (!fs.existsSync(ICONS_DIR)) {
  fs.mkdirSync(ICONS_DIR, { recursive: true });
  console.log('✓ Создана папка icons/');
}

// Проверяем наличие исходного изображения
if (!fs.existsSync(SOURCE_IMAGE)) {
  console.error('❌ Файл sushigl.png не найден в public/');
  console.log('Поместите изображение логотипа в public/sushigl.png');
  process.exit(1);
}

console.log('🎨 Генерация PWA иконок...\n');

// Генерируем иконки всех размеров
async function generateIcons() {
  for (const size of ICON_SIZES) {
    const outputPath = path.join(ICONS_DIR, `icon-${size}x${size}.png`);
    
    try {
      await sharp(SOURCE_IMAGE)
        .resize(size, size, {
          fit: 'contain',
          background: { r: 255, g: 255, b: 255, alpha: 0 }
        })
        .png()
        .toFile(outputPath);
      
      console.log(`✓ Создана иконка ${size}x${size}`);
    } catch (error) {
      console.error(`❌ Ошибка при создании иконки ${size}x${size}:`, error.message);
    }
  }
  
  // Создаем favicon.ico (16x16)
  try {
    await sharp(SOURCE_IMAGE)
      .resize(32, 32, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 0 }
      })
      .png()
      .toFile(path.join(__dirname, '../public/favicon.png'));
    
    console.log('✓ Создан favicon.png');
  } catch (error) {
    console.error('❌ Ошибка при создании favicon:', error.message);
  }
  
  // Создаем apple-touch-icon.png (180x180)
  try {
    await sharp(SOURCE_IMAGE)
      .resize(180, 180, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 0 }
      })
      .png()
      .toFile(path.join(__dirname, '../public/apple-touch-icon.png'));
    
    console.log('✓ Создан apple-touch-icon.png');
  } catch (error) {
    console.error('❌ Ошибка при создании apple-touch-icon:', error.message);
  }
  
  console.log('\n✅ Все иконки успешно созданы!');
  console.log('📁 Иконки сохранены в public/icons/');
}

generateIcons().catch(error => {
  console.error('❌ Произошла ошибка:', error);
  process.exit(1);
});
