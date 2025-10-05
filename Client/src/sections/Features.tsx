const features = [
  { title: '1️⃣ Browse Menu', desc: 'Explore your favorite Ethiopian dishes.' },
  { title: '2️⃣ Place Order', desc: 'Order online easily with secure payment.' },
  { title: '3️⃣ Enjoy Meal', desc: 'Get your meal delivered fresh & hot.' },
];

export default function Features() {
  return (
    <section id="features" className="py-16 px-4 bg-yellow-50">
      <div className="max-w-5xl mx-auto text-center">
        <h2 className="text-3xl font-bold mb-10 text-gray-800">How It Works</h2>

        <div className="grid md:grid-cols-3 gap-8">
          {features.map((f) => (
            <div key={f.title} className="bg-white shadow-lg rounded-2xl p-6 hover:shadow-xl transition">
              <h3 className="text-xl font-semibold mb-3 text-green-800">{f.title}</h3>
              <p className="text-gray-600">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}