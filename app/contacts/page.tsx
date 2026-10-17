import type { Metadata } from "next";
import Header from "../components/landing/Header";
import Footer from "../components/landing/Footer";
import Contacts from "../components/landing/Contacts";

export const metadata: Metadata = {
  title: "Контакты",
  description: "Контакты «Суши Жейм»: телефон +996 505 255 444, Telegram @syshi.jeim, доставка по Бишкеку.",
};

export default function ContactsPage() {
  return (
    <>
      <Header />
      <main className="pt-16">
        <Contacts />
      </main>
      <Footer />
    </>
  );
}
