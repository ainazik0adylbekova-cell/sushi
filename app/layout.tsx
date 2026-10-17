import type { Metadata } from "next";
import { Inter } from "next/font/google";
import type { ReactNode } from "react";
import "./globals.css";
import { ThemeProvider }    from "./providers/ThemeProvider";
import { LanguageProvider } from "./providers/LanguageProvider";
import { CartProvider }     from "./providers/CartProvider";
import { AuthProvider }     from "./providers/AuthProvider";
import CartDrawer           from "./components/landing/CartDrawer";
import AiChat               from "./components/AiChat";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "cyrillic"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default:  "Суши Жейм — доставка паназиатской кухни в Бишкеке",
    template: "%s | Суши Жейм",
  },
  description:
    "Свежие суши, роллы, сеты и паназиатские блюда с доставкой по Бишкеку. Быстро, вкусно, удобно.",
  keywords: "суши, роллы, доставка, паназиатская кухня, суши жейм, Бишкек, Кыргызстан",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ru" className={inter.variable} suppressHydrationWarning data-scroll-behavior="smooth">
      <body className="min-h-full flex flex-col">
        <ThemeProvider>
          <LanguageProvider>
            <AuthProvider>
              <CartProvider>
                {children}
                <CartDrawer />
                <AiChat />
              </CartProvider>
            </AuthProvider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
