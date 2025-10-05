import { useState } from 'react';
import Button from './Button';
import Logo from '../assets/Logo'; // Update import to use the Logo component

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="bg-green-800 text-white w-full shadow-md fixed top-0 left-0 z-50">
      <div className="max-w-6xl mx-auto flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <Logo /> {/* Render the Logo component */}
          <h1 className="font-bold text-xl">eGebeya</h1>
        </div>

        <div className="hidden md:flex gap-6 items-center">
          <a href="#home" className="hover:text-yellow-400">Home</a>
          <a href="#products" className="hover:text-yellow-400">Menu</a>
          <a href="#features" className="hover:text-yellow-400">How it Works</a>
          <a href="#contact" className="hover:text-yellow-400">Contact</a>
          <Button text="Order Now" />
        </div>

        <button onClick={() => setOpen(!open)} className="md:hidden text-yellow-400">
          ☰
        </button>
      </div>

      {open && (
        <div className="md:hidden flex flex-col items-center gap-4 bg-green-900 pb-4">
          <a href="#home">Home</a>
          <a href="#products">Menu</a>
          <a href="#features">How it Works</a>
          <a href="#contact">Contact</a>
          <Button text="Order Now" />
        </div>
      )}
    </nav>
  );
}