/**
 * POST /api/chat
 *
 * Серверный endpoint для AI-помощника (Google Gemini).
 * GEMINI_API_KEY никогда не попадает в клиентский код.
 *
 * Body: { messages: { role: "user"|"model"; text: string }[] }
 * Response: { reply: string }
 */

import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { prisma } from "@/lib/db";

// ── Меню из статических данных (если БД пуста) ───────────────────────────
const STATIC_MENU = [
  { name: "Ролл Филадельфия",   category: "Роллы",       price: 490,  weight: "8 шт · 260 г",  desc: "Лосось, сливочный сыр, огурец, авокадо, рис, нори",           available: true  },
  { name: "Ролл Калифорния",    category: "Роллы",       price: 440,  weight: "8 шт · 240 г",  desc: "Краб, авокадо, огурец, тобико, нори снаружи",                 available: true  },
  { name: "Ролл Дракон",        category: "Роллы",       price: 540,  weight: "8 шт · 280 г",  desc: "Угорь, авокадо, огурец, тобико, соус унаги",                  available: true  },
  { name: "Ролл Темпура",       category: "Роллы",       price: 460,  weight: "8 шт · 250 г",  desc: "Креветка темпура, огурец, сливочный сыр, икра",               available: true  },
  { name: "Ролл Радуга",        category: "Роллы",       price: 580,  weight: "8 шт · 300 г",  desc: "Смесь лосося, тунца, авокадо и огурца поверх Калифорнии",    available: true  },
  { name: "Суши с лососем",     category: "Суши",        price: 165,  weight: "2 шт · 70 г",   desc: "Свежий лосось, рис, васаби, имбирь",                          available: true  },
  { name: "Суши с тунцом",      category: "Суши",        price: 175,  weight: "2 шт · 70 г",   desc: "Свежий тунец, рис, соевый соус",                              available: true  },
  { name: "Суши с угрём",       category: "Суши",        price: 190,  weight: "2 шт · 75 г",   desc: "Копчёный угорь, рис, соус унаги",                             available: true  },
  { name: "Сет «Жейм»",        category: "Сеты",        price: 1290, weight: "32 шт · 960 г", desc: "Филадельфия, Калифорния, Дракон, Темпура",                    available: true  },
  { name: "Сет «Классика»",    category: "Сеты",        price: 990,  weight: "24 шт · 720 г", desc: "24 штуки: лучшие роллы для компании",                         available: true  },
  { name: "Том Ям",             category: "Горячее",     price: 520,  weight: "400 мл",         desc: "Острый суп с морепродуктами, грибами шиитаке и лемонграссом", available: true  },
  { name: "Рамен с курицей",    category: "Горячее",     price: 480,  weight: "450 мл",         desc: "Насыщенный бульон, рисовая лапша, яйцо, водоросли нори",      available: true  },
  { name: "Wok с курицей",      category: "Лапша / Вок", price: 410,  weight: "350 г",          desc: "Рисовая лапша, куриное филе, овощи, соус терияки",            available: true  },
  { name: "Wok с говядиной",    category: "Лапша / Вок", price: 490,  weight: "360 г",          desc: "Говяжья вырезка, лапша удон, перец, грибы, соус XO",          available: true  },
  { name: "Гёдза",              category: "Закуски",     price: 290,  weight: "6 шт · 180 г",  desc: "Жареные пельмени с курицей и овощами",                        available: true  },
  { name: "Эдамаме",            category: "Закуски",     price: 190,  weight: "200 г",          desc: "Молодые соевые бобы, морская соль",                           available: true  },
  { name: "Зелёный чай Matcha", category: "Напитки",     price: 220,  weight: "300 мл",         desc: "Японский матча, молоко на выбор",                             available: true  },
  { name: "Лимонад Юзу",        category: "Напитки",     price: 180,  weight: "400 мл",         desc: "Японский цитрус юзу, газированная вода, мёд",                 available: true  },
];

// ── Попытка загрузить реальные блюда из БД ───────────────────────────────
async function getMenuContext(): Promise<string> {
  try {
    const products = await prisma.product.findMany({
      where:   { isAvailable: true },
      include: { category: { select: { name: true } } },
      orderBy: [{ sortOrder: "asc" }],
    });

    if (products.length > 0) {
      const lines = products.map((p) =>
        `- ${p.name} (${p.category.name}) — ${parseFloat(String(p.price))} сом` +
        `${p.weight ? `, вес: ${parseFloat(String(p.weight))} г` : ""}` +
        `${p.piecesCount ? `, ${p.piecesCount} шт` : ""}` +
        `${p.description ? `. ${p.description}` : ""}` +
        `${p.ingredients ? `. Состав: ${p.ingredients}` : ""}`
      );
      return lines.join("\n");
    }
  } catch {
    // БД недоступна — используем статику
  }

  // Статическое меню как fallback
  const lines = STATIC_MENU.map((p) =>
    `- ${p.name} (${p.category}) — ${p.price} сом, ${p.weight}. ${p.desc}`
  );
  return lines.join("\n");
}

// ── Системный промпт ─────────────────────────────────────────────────────
function buildSystemPrompt(menu: string): string {
  return `Ты — AI-помощник ресторана «Суши Жейм» в Бишкеке. Твоя задача — помочь гостю выбрать блюдо из нашего меню.

ПРАВИЛА:
1. Отвечай только по меню ниже. Не придумывай блюда, цены, состав или акции.
2. Если блюда нет в меню — честно скажи: "Такого блюда сейчас нет в нашем меню."
3. Будь дружелюбным и лаконичным. Отвечай на русском языке.
4. Не используй смайлики или эмодзи в ответах.
5. Если спрашивают про доставку, режим работы или цены — отвечай только по известным тебе данным.
6. Доставка по Бишкеку, от 40–60 минут. Бесплатная доставка от 1 200 сом. Минимальный заказ 600 сом.
7. Если пользователь просит что-то острое — предложи Том Ям.
8. При вопросе "что взять на двоих" — предложи набор или несколько роллов.

АКТУАЛЬНОЕ МЕНЮ:
${menu}

Отвечай кратко — 2–4 предложения, если не просят подробнее. Предлагай конкретные блюда с ценами.`;
}

// ── Mock AI Responses (работает без API ключа!) ─────────────────────────
function getMockResponse(userMessage: string): string {
  const msg = userMessage.toLowerCase();
  
  // Приветствия
  if (msg.includes("привет") || msg.includes("здравствуй") || msg === "hi" || msg === "hello") {
    return "Привет! 👋 Я AI-помощник ресторана «Суши Жейм». Помогу выбрать блюдо из нашего меню. Что вас интересует?";
  }
  
  // Лосось
  if (msg.includes("лосос") || msg.includes("лососем") || msg.includes("salmon")) {
    return "С лососем у нас есть:\n\n🍣 Ролл Филадельфия — 490 сом (8 шт)\nЛосось, сливочный сыр, огурец, авокадо\n\n🍱 Суши с лососем — 165 сом (2 шт)\nСвежий лосось, рис, васаби\n\n🎁 Сет «Жейм» — 1290 сом (32 шт)\nВключает Филадельфию и другие топовые роллы\n\nЧто выбираете?";
  }
  
  // Острое
  if (msg.includes("остр") || msg.includes("spicy")) {
    return "Для любителей острого рекомендую:\n\n🌶️ Том Ям — 520 сом\nОстрый тайский суп с морепродуктами и лемонграссом\n\nЕщё можем добавить острый соус к любому роллу. Хотите попробовать?";
  }
  
  // Доставка
  if (msg.includes("доставк") || msg.includes("привез") || msg.includes("delivery")) {
    return "📦 Доставка по Бишкеку:\n\n⏱️ Время: 40-60 минут\n💰 Стоимость: от 199 сом\n🎁 Бесплатно: при заказе от 1 200 сом\n📍 Минимальный заказ: 600 сом\n\nУкажите ваш адрес в корзине при оформлении заказа!";
  }
  
  // Цены
  if (msg.includes("цен") || msg.includes("сколько") || msg.includes("стоимость") || msg.includes("price")) {
    return "Наши цены:\n\n🍣 Роллы: 440-580 сом\n🍱 Суши: 165-190 сом за 2 шт\n🎁 Сеты: 990-1290 сом\n🍜 Горячее: 480-520 сом\n🍹 Напитки: 180-220 сом\n\nЧто вас интересует конкретно?";
  }
  
  // Меню / что есть
  if (msg.includes("меню") || msg.includes("что есть") || msg.includes("что у вас") || msg.includes("блюд")) {
    return "В нашем меню:\n\n🍣 Роллы — Филадельфия, Калифорния, Дракон, Темпура\n🍱 Суши — с лососем, тунцом, угрём\n🎁 Сеты — Жейм, Классика (выгодно!)\n🍜 Горячее — Том Ям, Рамен\n🥢 Лапша Wok — с курицей, говядиной\n🍹 Напитки — Matcha, Лимонад Юзу\n\nЧто вас интересует?";
  }
  
  // Рекомендации на двоих
  if (msg.includes("на двоих") || msg.includes("на 2") || msg.includes("вдвоем") || msg.includes("двоим")) {
    return "Для двоих отлично подойдёт:\n\n🎁 Сет «Жейм» — 1290 сом (32 шт)\nФиладельфия, Калифорния, Дракон, Темпура — всё самое вкусное!\n\n🎁 Сет «Классика» — 990 сом (24 шт)\nБолее бюджетный вариант\n\n+ Можете добавить напитки или горячее. Заказываем?";
  }
  
  // Вегетарианское
  if (msg.includes("вегетар") || msg.includes("без мяса") || msg.includes("vegetarian")) {
    return "Вегетарианские позиции:\n\n🥒 Ролл с огурцом и авокадо\n🥗 Эдамаме — 190 сом\n🍜 Лапша Wok с овощами\n🍹 Все наши напитки\n\nМогу ещё что-то подсказать?";
  }
  
  // Контакты
  if (msg.includes("контакт") || msg.includes("телефон") || msg.includes("позвонить") || msg.includes("связ")) {
    return "📞 Наши контакты:\n\nТелефон: +996 505 255 444\nTelegram: @syshi_jeim\n\nРежим работы: 10:00 - 23:00 ежедневно\n\nЗвоните, если нужна помощь!";
  }
  
  // Спасибо
  if (msg.includes("спасибо") || msg.includes("благодар") || msg === "спс" || msg.includes("thank")) {
    return "Всегда пожалуйста! 😊 Если ещё что-то нужно — обращайтесь. Приятного аппетита! 🍣";
  }
  
  // Дефолтный ответ
  return "Я могу помочь с:\n\n🍣 Выбором блюд из меню\n💰 Информацией о ценах\n📦 Условиями доставки\n🎁 Рекомендациями сетов\n\nО чём хотите узнать?";
}

// ── Route handler ────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;

    // Проверяем на placeholder ключи (включая кириллицу)
    const isPlaceholder = !apiKey || 
                          apiKey.trim() === "" || 
                          apiKey.includes("вставьте") ||
                          apiKey.includes("ваш_") ||
                          apiKey.includes("your_") ||
                          apiKey === "your_gemini_api_key_here" || 
                          apiKey === "your_gemini_key";

    // ИСПОЛЬЗУЕМ MOCK AI если нет настоящего ключа
    if (isPlaceholder) {
      const { messages } = await req.json() as {
        messages: { role: "user" | "model"; text: string }[];
      };
      
      const lastMessage = messages[messages.length - 1]?.text || "";
      const reply = getMockResponse(lastMessage);
      
      return NextResponse.json({ reply });
    }

    const { messages } = await req.json() as {
      messages: { role: "user" | "model"; text: string }[];
    };

    if (!messages || messages.length === 0) {
      return NextResponse.json({ error: "Нет сообщений" }, { status: 400 });
    }

    const menuContext = await getMenuContext();
    const systemPrompt = buildSystemPrompt(menuContext);

    const genAI = new GoogleGenerativeAI(apiKey);

    // Пробуем gemini-1.5-flash, при ошибке — gemini-pro
    let model;
    try {
      model = genAI.getGenerativeModel({
        model: "gemini-1.5-flash",
        systemInstruction: systemPrompt,
      });
    } catch {
      model = genAI.getGenerativeModel({
        model: "gemini-pro",
        systemInstruction: systemPrompt,
      });
    }

    // Конвертируем историю в формат Gemini
    const history = messages.slice(0, -1).map((m) => ({
      role:  m.role as "user" | "model",
      parts: [{ text: m.text }],
    }));

    const chat = model.startChat({ history });

    const lastMessage = messages[messages.length - 1].text;
    const result = await chat.sendMessage(lastMessage);
    const reply  = result.response.text();

    return NextResponse.json({ reply });
  } catch (err) {
    console.error("[/api/chat]", err);
    return NextResponse.json(
      { reply: "Произошла ошибка. Попробуйте ещё раз или позвоните нам: +996 505 255 444" },
      { status: 200 }
    );
  }
}
