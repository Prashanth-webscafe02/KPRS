import Navigation from '@/components/Navigation';
import Hero from '@/components/Hero';
import CopperWinding from '@/components/CopperWinding';
import TransformerAnatomy from '@/components/TransformerAnatomy';
import ProductExhibition from '@/components/ProductExhibition';
import Testing from '@/components/Testing';
import Sectors from '@/components/Sectors';
import Footer from '@/components/Footer';
import MotionController from '@/components/MotionController';

export default function Page() {
  return (
    <>
      <Navigation />
      <main>
        <Hero />
        <CopperWinding />
        <TransformerAnatomy />
        <ProductExhibition />
        <Testing />
        <Sectors />
      </main>
      <Footer />
      <MotionController />
    </>
  );
}
