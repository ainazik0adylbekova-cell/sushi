# 🔧 Необходимые исправления

## Проблема 1: Блюда из админки не отображаются на сайте

### Причина:
Страница меню (`app/menu/page.tsx`) использует **статический массив `DISHES`**, а не загружает данные из API/базы данных.

### Решение:
Нужно изменить страницу меню, чтобы она загружала блюда через API `/api/products`.

### Что нужно сделать:

1. **Заменить статический массив на загрузку из API**
   
   В файле `app/menu/page.tsx` заменить:
   ```typescript
   const DISHES: Dish[] = [ /* статический массив */ ];
   ```
   
   На:
   ```typescript
   const [dishes, setDishes] = useState<Dish[]>([]);
   const [loading, setLoading] = useState(true);
   
   useEffect(() => {
     async function loadDishes() {
       try {
         const res = await fetch('/api/products');
         const data = await res.json();
         setDishes(data.products || []);
       } catch (error) {
         console.error('Error loading dishes:', error);
       } finally {
         setLoading(false);
       }
     }
     loadDishes();
   }, []);
   ```

2. **Обновить интерфейс Dish**
   
   Структура данных из API немного отличается:
   ```typescript
   interface Dish {
     id: string;  // в API это string UUID
     name: string;
     description: string;  // в API это description, не desc
     price: number;
     imageUrl: string | null;
     category: {
       name: string;
       slug: string;
     };
     isAvailable: boolean;
   }
   ```

3. **Обновить маппинг категорий**
   
   Категории нужно загружать из `/api/categories`

---

## Проблема 2: AI помощник не работает

### Причина:
Отсутствует переменная окружения `GEMINI_API_KEY` в файле `.env`.

### Решение:

1. **Получить API ключ Google Gemini**
   
   Перейдите на: https://makersuite.google.com/app/apikey
   
   Или: https://aistudio.google.com/app/apikey
   
   Создайте новый API ключ.

2. **Добавить ключ в `.env`**
   
   ```bash
   GEMINI_API_KEY="ваш_реальный_ключ_здесь"
   ```

3. **Перезапустить сервер**
   
   ```bash
   npm run dev
   ```

### Проверка работы AI:

1. Откройте сайт
2. Нажмите на кнопку 💬 в правом нижнем углу
3. Напишите "Что посоветуешь?"
4. AI должен ответить рекомендациями из меню

---

## Быстрое исправление для тестирования

### Временное решение для AI (пока нет ключа):

В файле `app/api/chat/route.ts` можно временно использовать fallback ответы без AI.

Замените проверку:
```typescript
if (!apiKey || apiKey === "your_gemini_api_key_here") {
  // Вместо ошибки, возвращаем fallback
  return NextResponse.json({ 
    reply: "AI временно недоступен. Вот наши популярные блюда:\n\n🍣 Ролл Филадельфия — 490 сом\n🍱 Ролл Калифорния — 440 сом\n🎁 Сет «Жейм» — 1290 сом"
  });
}
```

---

## Проверочный список:

### AI помощник:
- [ ] Получен API ключ Gemini
- [ ] Добавлен в `.env` как `GEMINI_API_KEY`
- [ ] Сервер перезапущен
- [ ] Кнопка 💬 открывает чат
- [ ] AI отвечает на сообщения

### Меню из базы данных:
- [ ] Страница `app/menu/page.tsx` загружает данные из API
- [ ] Блюда из админки появляются на сайте
- [ ] Категории работают корректно
- [ ] Поиск работает
- [ ] Изображения отображаются

---

## Дополнительно: Синхронизация данных

Если вы хотите, чтобы статические блюда были в базе данных:

1. **Создайте seed скрипт**
   
   Файл: `prisma/seed-menu.ts`
   
   ```typescript
   import { prisma } from '../lib/db';
   
   const DISHES = [
     { name: "Ролл Филадельфия", price: 490, ... },
     // все блюда из статического массива
   ];
   
   async function seed() {
     for (const dish of DISHES) {
       await prisma.product.create({ data: dish });
     }
   }
   
   seed();
   ```

2. **Запустите seed**
   
   ```bash
   npx tsx prisma/seed-menu.ts
   ```

---

## В продакшене (Vercel):

Не забудьте добавить `GEMINI_API_KEY` в переменные окружения Vercel:

1. Vercel Dashboard → Settings → Environment Variables
2. Добавить: `GEMINI_API_KEY` = `ваш_ключ`
3. Redeploy проект

---

## Статус исправлений:

✅ Добавлена переменная `GEMINI_API_KEY` в `.env` (нужен реальный ключ)
✅ Обновлен `.env.example` с инструкцией
⚠️ Страница меню еще использует статический массив (требует рефакторинга)

---

## Следующие шаги:

1. **Получите API ключ Gemini** (5 минут)
2. **Добавьте в `.env`** (1 минута)
3. **Перезапустите сервер** (1 минута)
4. **Рефакторинг страницы меню** (30 минут)

---

Полная инструкция по получению Gemini API ключа:

1. Откройте: https://aistudio.google.com/
2. Войдите через Google аккаунт
3. Нажмите "Get API key"
4. Создайте новый проект (если нужно)
5. Скопируйте ключ
6. Вставьте в `.env`:
   ```
   GEMINI_API_KEY="AIzaSy..."
   ```
