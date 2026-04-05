import { Hero } from '../components/Hero';
import { ShowDontTell } from '../components/ShowDontTell';
import { CoreFeatures } from '../components/CoreFeatures';
import { ImpactSection } from '../components/ImpactSection';
import { TrustBanner } from '../components/TrustBanner';
import { MoatSection } from '../components/MoatSection';
import { TechnicalTrust } from '../components/TechnicalTrust';

export function HomePage() {
  return (
    <>
      <Hero />
      <ShowDontTell />
      <CoreFeatures />
      <ImpactSection />
      <TrustBanner />
      <MoatSection />
      <TechnicalTrust />
    </>
  );
}
