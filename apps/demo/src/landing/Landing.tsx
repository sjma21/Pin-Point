import './landing.css';
import Navbar from './Navbar';
import Hero from './Hero';
import HowItWorks from './HowItWorks';
import Features from './Features';
import DemoCta from './DemoCta';
import Comparison from './Comparison';
import InstallSection from './InstallSection';
import Footer from './Footer';

export default function Landing() {
  return (
    <div className="landing">
      <Navbar />
      <Hero />
      <HowItWorks />
      <Features />
      <DemoCta />
      <Comparison />
      <InstallSection />
      <Footer />
    </div>
  );
}
