/**
 * Скрипт для обновления изображений продуктов
 * Добавляет изображения для Филадельфии, Калифорнии и Классического сета
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Маппинг продуктов и их изображений
const productImages = {
  'filadelfiya': {
    name: 'Филадельфия',
    image: '/filadel.jpg',
    altText: 'Ролл Филадельфия с лососем и сливочным сыром'
  },
  'kaliforniya': {
    name: 'Калифорния',
    image: '/colif.jpg',
    altText: 'Ролл Калифорния с крабом и авокадо'
  },
  'klassicheskiy-set': {
    name: 'Классический сет',
    image: '/set.classik.jpg',
    altText: 'Классический сет суши и роллов'
  }
};

async function updateProductImages() {
  console.log('🎨 Обновление изображений продуктов...\n');

  try {
    for (const [slug, data] of Object.entries(productImages)) {
      // Ищем продукт по slug
      const product = await prisma.product.findUnique({
        where: { slug },
        include: { images: true }
      });

      if (!product) {
        console.log(`⚠️  Продукт "${data.name}" (${slug}) не найден`);
        continue;
      }

      // Проверяем, есть ли уже изображение
      const existingImage = product.images.find(img => img.url === data.image);
      
      if (existingImage) {
        console.log(`✓ Изображение для "${data.name}" уже существует`);
        continue;
      }

      // Удаляем старые изображения (если есть)
      if (product.images.length > 0) {
        await prisma.productImage.deleteMany({
          where: { productId: product.id }
        });
        console.log(`  Удалены старые изображения для "${data.name}"`);
      }

      // Добавляем новое изображение
      await prisma.productImage.create({
        data: {
          productId: product.id,
          url: data.image,
          altText: data.altText,
          isMain: true,
          sortOrder: 0
        }
      });

      console.log(`✓ Добавлено изображение для "${data.name}"`);
    }

    console.log('\n✅ Обновление завершено!');

  } catch (error) {
    console.error('❌ Ошибка:', error.message);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Запускаем скрипт
updateProductImages()
  .catch((error) => {
    console.error('Критическая ошибка:', error);
    process.exit(1);
  });
