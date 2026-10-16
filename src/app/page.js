import Hero from '@/components/Hero';
import BentoFeatures from '@/components/BentoFeatures';
import PricingSection from '@/components/PricingSection';
import CtaFooter from '@/components/CtaFooter';
export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white selection:bg-white/20">
      <Hero />
      <BentoFeatures />
      <PricingSection />
      <CtaFooter />
    </main>
  );
}