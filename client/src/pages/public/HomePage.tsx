import { AboutSection } from '../../features/public/components/AboutSection';
import { ContactSection } from '../../features/public/components/ContactSection';
import { HeroSection } from '../../features/public/components/HeroSection';
import { MarqueeSection } from '../../features/public/components/MarqueeSection';
import { ProjectsSection } from '../../features/public/components/ProjectsSection';
import { ServicesSection } from '../../features/public/components/ServicesSection';

export function HomePage() {
  return (
    <>
      <HeroSection />
      <MarqueeSection />
      <AboutSection />
      <ServicesSection />
      <ProjectsSection />
      <ContactSection />
    </>
  );
}
