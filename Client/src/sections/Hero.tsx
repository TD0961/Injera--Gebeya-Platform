import heroImg from '../assets/hero.jpg';
import Button from '../components/Button';
import { useNavigate } from 'react-router-dom';

export default function Hero() {
  const navigate = useNavigate();

  return (
    <section id="home" className="flex flex-col md:flex-row items-center justify-between max-w-6xl mx-auto px-4 pt-28 pb-16">
      <div className="flex-1 text-center md:text-left">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight mb-4">
          Enjoy Authentic Ethiopian <span className="text-yellow-500">Daily Meals</span> Anytime.
        </h1>
        <p className="text-gray-600 mb-6 max-w-md">
          Order traditional foods like injera, tibs, and kitfo from your favorite local vendors — all in one click.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
          <Button text="Order Now" onClick={() => navigate('/buyer-signup')} />
          <Button
            text="Become Seller"
            onClick={() => navigate('/seller-signup')}
            className="bg-green-800 hover:bg-green-900 text-black border-none"
          />
        </div>
      </div>

      <div className="flex-1 mt-8 md:mt-0">
        <img src={heroImg} alt="Ethiopian Food" className="rounded-2xl shadow-lg w-full" />
      </div>
    </section>
  );
}