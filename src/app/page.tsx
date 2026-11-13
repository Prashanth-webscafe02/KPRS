import Hero from '@/components/Hero';
import CopperWinding from '@/components/CopperWinding';
import TransformerAnatomy from '@/components/TransformerAnatomy';
import ProductExhibition from '@/components/ProductExhibition';
import Testing from '@/components/Testing';
import Sectors from '@/components/Sectors';
import Enquire from '@/components/Enquire';
import MotionController from '@/components/MotionController';

export default function Page() {
  return (
    <>
      <main id="content" className="home">
        <Hero />
        <CopperWinding />
        <TransformerAnatomy />
        <ProductExhibition />
        <Testing />
        <Sectors />
        <Enquire />
      </main>
      {/* Vertical scroll gauge (desktop), driven by lib/animations/chrome.ts */}
      <div className="gauge" aria-hidden="true">
        <div className="gauge__ticks"></div>
        <div className="gauge__needle" data-gauge-needle></div>
        <span className="gauge__read" data-gauge-read>000</span>
      </div>
      <MotionController />
    </>
  );
}
