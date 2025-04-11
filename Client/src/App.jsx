import Header from './assets/components/Header';
import Body from './assets/components/Body';
import Footer from './assets/components/Footer';
import FeatureCard from './assets/components/FeatureCard';


function App() {

  return (
      <div className="min-h-screen bg-gray-50">
        <Header /> 
        <FeatureCard />
        <Body />
        <Footer />
      </div>
  )
}

export default App
