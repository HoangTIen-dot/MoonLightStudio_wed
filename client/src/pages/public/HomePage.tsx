import { AboutSection } from '../../features/public/components/AboutSection';
import { ContactSection } from '../../features/public/components/ContactSection';
import { HeroSection } from '../../features/public/components/HeroSection';
import { MarqueeSection } from '../../features/public/components/MarqueeSection';
import { ProjectsSection } from '../../features/public/components/ProjectsSection';
import { ServicesSection } from '../../features/public/components/ServicesSection';
import { usePublicLanguage } from '../../features/public/i18n';

export function HomePage() {
  const { language, setLanguage, copy } = usePublicLanguage();

  return (
    <>
      <HeroSection copy={copy} language={language} onLanguageChange={setLanguage} />
      <MarqueeSection copy={copy.marquee} />
      <AboutSection copy={copy.about} />
      <ServicesSection copy={copy.services} />
      <ProjectsSection copy={copy.projects} />
      <ContactSection copy={copy.contact} />
    </>
  );
}
