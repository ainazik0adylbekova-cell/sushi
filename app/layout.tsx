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
import PWAInstaller         from "./components/PWAInstaller";

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
  manifest: "/manifest.json",
  themeColor: "#ff4d00",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Суши Жейм",
  },
  icons: {
    icon: [
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 5,
    userScalable: true,
  },
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
                <PWAInstaller />
              </CartProvider>
            </AuthProvider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
