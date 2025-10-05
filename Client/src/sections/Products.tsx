import injera from '../assets/enjera.jpg';
import tibs from '../assets/tibs.jpeg';
import kitfo from '../assets/kitfo.jpeg';
import Button from '../components/Button';
import { useNavigate } from 'react-router-dom';
import { useRef, useEffect } from 'react';

const foods = [
  { name: 'Injera Combo', img: injera, price: '120 ETB' },
  { name: 'Tibs Special', img: tibs, price: '200 ETB' },
  { name: 'Kitfo Plate', img: kitfo, price: '250 ETB' },
];

export default function Products() {
  const navigate = useNavigate();
  const sliderRef = useRef<HTMLDivElement>(null);

  // Duplicate foods to create a seamless loop
  const items = [...foods, ...foods];

  useEffect(() => {
    const slider = sliderRef.current;
    if (!slider) return;

    let animationFrame: number;
    let scrollAmount = 0;

    const animate = () => {
      scrollAmount += 1;
      if (scrollAmount >= slider.scrollWidth / 2) {
        scrollAmount = 0;
      }
      slider.scrollLeft = scrollAmount;
      animationFrame = requestAnimationFrame(animate);
    };

    animate();

    return () => cancelAnimationFrame(animationFrame);
  }, []);

  return (
    <section id="products" className="bg-gray-50 py-16 px-4">
      <div className="max-w-6xl mx-auto text-center">
        <h2 className="text-3xl font-bold mb-8 text-gray-800">Popular Dishes</h2>
        <div
          ref={sliderRef}
          className="flex overflow-x-auto no-scrollbar whitespace-nowrap relative"
          style={{ scrollBehavior: 'auto' }}
        >
          {items.map((item, idx) => (
            <div
              key={item.name + idx}
              className="inline-block bg-white shadow-md rounded-xl overflow-hidden mx-4 w-72 hover:scale-105 transition-transform"
              style={{ flex: '0 0 auto' }}
            >
              <img src={item.img} alt={item.name} className="w-full h-48 object-cover" />
              <div className="p-4">
                <h3 className="text-lg font-semibold mb-2">{item.name}</h3>
                <p className="text-gray-700 mb-3">{item.price}</p>
                <Button text="Add to Cart" onClick={() => navigate('/buyer-signup')} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}