import Navbar from '../components/Navbar';
import Hero from '../sections/Hero';
import Products from '../sections/Products';
import Features from '../sections/Features';
import Footer from '../sections/Footer';

export default function Home() {
  return (
    <div className="font-poppins bg-white min-h-screen overflow-x-hidden">
      <Navbar />
      <Hero />
      <Products />
      <Features />
      <Footer />
    </div>
  );
}