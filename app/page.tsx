import Header from "./components/landing/Header";
import Hero from "./components/landing/Hero";
import Categories from "./components/landing/Categories";
import PopularDishes from "./components/landing/PopularDishes";
import HowItWorks from "./components/landing/HowItWorks";
import Features from "./components/landing/Features";
import Reviews from "./components/landing/Reviews";
import DeliveryBanner from "./components/landing/DeliveryBanner";
import Contacts from "./components/landing/Contacts";
import Footer from "./components/landing/Footer";

export default function HomePage() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <Categories />
        <PopularDishes />
        <HowItWorks />
        <Features />
        <Reviews />
        <DeliveryBanner />
        <Contacts />
      </main>
      <Footer />
    </>
  );
}
