export default function Footer() {
  return (
    <footer id="contact" className="bg-gray-900 text-gray-300 py-8 px-4">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="text-yellow-400 font-bold text-lg">eGebeya</span>
          <span className="text-xs text-gray-500">| Est. 2025</span>
        </div>
        <div className="text-sm text-gray-400">
          © 2025 eGebeya. All rights reserved.
        </div>
        <div className="text-xs text-gray-400 flex flex-col md:items-end items-center">
          <span>Contact: <a href="tensaedeme61@gmail.com" className="text-yellow-400 hover:underline">info@egebeya.com</a></span>
          <span>Phone: <a href="tel:+251961189659" className="text-yellow-400 hover:underline">+251 900 000 000</a></span>
        </div>
      </div>
    </footer>
  );
}