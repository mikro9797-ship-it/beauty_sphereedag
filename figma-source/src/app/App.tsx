import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { Features } from './components/Features';
import { Categories } from './components/Categories';
import { Brands } from './components/Brands';
import { Products } from './components/Products';
import { WhyUs } from './components/WhyUs';
import { Education } from './components/Education';
import { Expert } from './components/Expert';
import { CTA } from './components/CTA';
import { Footer } from './components/Footer';

export default function App() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Hero />
      <Features />
      <Categories />
      <Brands />
      <Products />
      <WhyUs />
      <Education />
      <Expert />
      <CTA />
      <Footer />
    </div>
  );
}