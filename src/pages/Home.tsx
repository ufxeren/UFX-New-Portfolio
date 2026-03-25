import Hero from '../components/Hero';
import Portfolio from '../components/Portfolio';
import BeforeAfter from '../components/BeforeAfter';
import Contact from '../components/Contact';

export default function Home() {
  return (
    <div className="flex flex-col">
      <Hero />
      <Portfolio />
      <BeforeAfter />
      <Contact />
    </div>
  );
}
