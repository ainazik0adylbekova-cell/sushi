import type { Metadata } from "next";
import Header from "../components/landing/Header";
import Footer from "../components/landing/Footer";
import About from "../components/landing/About";
import Reviews from "../components/landing/Reviews";

export const metadata: Metadata = {
  title: "О нас",
  description: "Узнайте больше о ресторане «Суши Жейм» — паназиатская кухня с доставкой по Бишкеку.",
};

export default function AboutPage() {
  return (
    <>
      <Header />
      <main className="pt-16">
        <About />
        <Reviews />
      </main>
      <Footer />
    </>
  );
}
