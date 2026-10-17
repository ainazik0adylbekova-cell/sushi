"use client";

/**
 * AdminSettingsProvider
 * Provides RU/KG language switching and dark/light theme for the admin panel.
 * Settings persist in localStorage under "admin_lang" and "admin_theme".
 * Does NOT affect the public-facing site — uses a separate context from the
 * global LanguageProvider / ThemeProvider.
 */

import {
  createContext, useContext, useState, useEffect, type ReactNode,
} from "react";

// ── Translations ─────────────────────────────────────────────────────────
export type AdminLang = "ru" | "kg";

const RU = {
  // Nav
  navDashboard:    "Дашборд",
  navOrders:       "Заказы",
  navMenu:         "Меню",
  navCategories:   "Категории",
  navUsers:        "Пользователи",
  navReviews:      "Отзывы",
  navPromos:       "Промокоды",
  navDelivery:     "Доставка",
  navTelegram:     "Telegram",
  navSettings:     "Настройки",
  navLogout:       "Выйти",
  // Header
  headerAdmin:     "Админ",
  // Lang / theme switcher
  switchLang:      "KG",
  switchTheme:     "Светлая",
  switchThemeDark: "Тёмная",
  // Common
  save:     "Сохранить",
  cancel:   "Отмена",
  add:      "Добавить",
  edit:     "Изменить",
  delete:   "Удалить",
  search:   "Поиск",
  loading:  "Загрузка...",
  saved:    "Сохранено",
  yes:      "Да",
  no:       "Нет",
  // Dashboard
  dashRevenue:  "Выручка",
  dashOrders:   "Заказы",
  dashClients:  "Клиенты",
  dashAvgCheck: "Средний чек",
  dashTitle:    "Дашборд",
  dashUpdated:  "Последнее обновление",
  // Orders
  ordersTitle:   "Заказы",
  ordersNew:     "Новые",
  ordersCooking: "Готовятся",
  ordersWay:     "В пути",
  ordersDone:    "Доставлены",
  ordersCancel:  "Отменены",
  ordersAll:     "Все",
  // Menu
  menuTitle:      "Меню",
  menuAdd:        "Добавить блюдо",
  menuAvail:      "В наличии",
  menuUnavail:    "Нет",
  // Categories
  catsTitle: "Категории",
  catsAdd:   "Добавить категорию",
  catsVis:   "Видима",
  catsHide:  "Скрыта",
  // Users
  usersTitle: "Пользователи",
  // Reviews
  reviewsTitle:    "Отзывы",
  reviewsPending:  "На проверке",
  reviewsApproved: "Одобрены",
  reviewsRejected: "Отклонены",
  // Promos
  promosTitle: "Акции",
  promosAdd:   "Создать акцию",
  promosActive:"Активна",
  promosOff:   "Выключена",
  // Delivery
  delivTitle:  "Доставка",
  delivZones:  "Зоны доставки",
  delivSched:  "Расписание",
  delivSave:   "Сохранить настройки",
  // Telegram
  tgTitle:    "Telegram Bot",
  tgToken:    "Bot Token",
  tgWebhook:  "Webhook URL",
  tgNotifs:   "Уведомления",
  tgGuide:    "Как подключить",
  tgConnect:  "Подключить бота",
  tgDisconn:  "Отключить",
  // Settings
  settTitle:  "Настройки",
  settGen:    "Основные",
  settNotif:  "Уведомления",
  settSec:    "Безопасность",
  settAppear: "Внешний вид",
};

const KG: typeof RU = {
  navDashboard:    "Башкы бет",
  navOrders:       "Буйрутмалар",
  navMenu:         "Меню",
  navCategories:   "Категориялар",
  navUsers:        "Колдонуучулар",
  navReviews:      "Пикирлер",
  navPromos:       "Промокодлор",
  navDelivery:     "Жеткирүү",
  navTelegram:     "Telegram",
  navSettings:     "Жөндөөлөр",
  navLogout:       "Чыгуу",
  headerAdmin:     "Админ",
  switchLang:      "RU",
  switchTheme:     "Жарык",
  switchThemeDark: "Күңүрт",
  save:     "Сактоо",
  cancel:   "Жокко чыгаруу",
  add:      "Кошуу",
  edit:     "Өзгөртүү",
  delete:   "Жок кылуу",
  search:   "Издөө",
  loading:  "Жүктөлүүдө...",
  saved:    "Сакталды",
  yes:      "Ооба",
  no:       "Жок",
  dashRevenue:  "Киреше",
  dashOrders:   "Буйрутмалар",
  dashClients:  "Кардарлар",
  dashAvgCheck: "Орточо чек",
  dashTitle:    "Башкы бет",
  dashUpdated:  "Акыркы жаңыртуу",
  ordersTitle:   "Буйрутмалар",
  ordersNew:     "Жаңы",
  ordersCooking: "Даярдалууда",
  ordersWay:     "Жолдо",
  ordersDone:    "Жеткирилди",
  ordersCancel:  "Жокко чыгарылды",
  ordersAll:     "Баары",
  menuTitle:      "Меню",
  menuAdd:        "Тамак кошуу",
  menuAvail:      "Бар",
  menuUnavail:    "Жок",
  catsTitle: "Категориялар",
  catsAdd:   "Категория кошуу",
  catsVis:   "Көрүнөт",
  catsHide:  "Жашырылган",
  usersTitle: "Колдонуучулар",
  reviewsTitle:    "Пикирлер",
  reviewsPending:  "Текшерүүдө",
  reviewsApproved: "Бекитилди",
  reviewsRejected: "Четке кагылды",
  promosTitle: "Акциялар",
  promosAdd:   "Акция түзүү",
  promosActive:"Активдүү",
  promosOff:   "Өчүрүлгөн",
  delivTitle:  "Жеткирүү",
  delivZones:  "Аймактар",
  delivSched:  "Иш графиги",
  delivSave:   "Жөндөөлөрдү сактоо",
  tgTitle:    "Telegram Bot",
  tgToken:    "Bot Token",
  tgWebhook:  "Webhook URL",
  tgNotifs:   "Эскертмелер",
  tgGuide:    "Кантип туташуу",
  tgConnect:  "Ботту туташтыруу",
  tgDisconn:  "Ажыратуу",
  settTitle:  "Жөндөөлөр",
  settGen:    "Негизги",
  settNotif:  "Эскертмелер",
  settSec:    "Коопсуздук",
  settAppear: "Көрүнүш",
};

export const ADMIN_TRANSLATIONS: Record<AdminLang, typeof RU> = { ru: RU, kg: KG };

// ── Theme ─────────────────────────────────────────────────────────────────
export type AdminTheme = "dark" | "light";

// ── Context ───────────────────────────────────────────────────────────────
interface AdminSettingsContextValue {
  lang:      AdminLang;
  setLang:   (l: AdminLang) => void;
  theme:     AdminTheme;
  setTheme:  (t: AdminTheme) => void;
  at:        typeof RU; // admin translations shorthand
}

const AdminSettingsContext = createContext<AdminSettingsContextValue | null>(null);

export function AdminSettingsProvider({ children }: { children: ReactNode }) {
  const [lang,  setLangState]  = useState<AdminLang>("ru");
  const [theme, setThemeState] = useState<AdminTheme>("dark");
  const [mounted, setMounted]  = useState(false);

  // Hydrate from localStorage after mount (avoids SSR mismatch)
  useEffect(() => {
    const savedLang  = (localStorage.getItem("admin_lang")  as AdminLang)  || "ru";
    const savedTheme = (localStorage.getItem("admin_theme") as AdminTheme) || "dark";
    setLangState(savedLang);
    setThemeState(savedTheme);
    setMounted(true);
  }, []);

  // Apply theme class to <html> for the admin — we piggyback on the existing
  // global CSS vars by toggling the .dark class, same as next-themes does.
  useEffect(() => {
    if (!mounted) return;
    const html = document.documentElement;
    if (theme === "dark") {
      html.classList.add("dark");
    } else {
      html.classList.remove("dark");
    }
  }, [theme, mounted]);

  function setLang(l: AdminLang) {
    setLangState(l);
    localStorage.setItem("admin_lang", l);
  }

  function setTheme(t: AdminTheme) {
    setThemeState(t);
    localStorage.setItem("admin_theme", t);
  }

  const at = ADMIN_TRANSLATIONS[lang];

  return (
    <AdminSettingsContext.Provider value={{ lang, setLang, theme, setTheme, at }}>
      {children}
    </AdminSettingsContext.Provider>
  );
}

export function useAdminSettings() {
  const ctx = useContext(AdminSettingsContext);
  if (!ctx) throw new Error("useAdminSettings must be used inside AdminSettingsProvider");
  return ctx;
}
