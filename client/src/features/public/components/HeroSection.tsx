import { useEffect, useRef, useState } from 'react';
import { Menu } from 'lucide-react';
import siteLogo from '../../../assets/images/moon.png';
import heroRevealImage from '../../../assets/images/LOGO.png';
import heroBaseImage from '../../../assets/images/LOGO_MoonLight.png';
import { AnimatedText } from '../../../shared/components/AnimatedText';
import { FadeIn } from '../../../shared/components/FadeIn';
import type { PublicCopy, PublicLanguage } from '../i18n';
import { RevealLayer } from './RevealLayer';

type HeroSectionProps = {
  copy: PublicCopy;
  language: PublicLanguage;
  onLanguageChange: (language: PublicLanguage) => void;
};

export function HeroSection({ copy, language, onLanguageChange }: HeroSectionProps) {
  const mouse = useRef({ x: -999, y: -999 });
  const smooth = useRef({ x: -999, y: -999 });
  const rafRef = useRef<number | null>(null);
  const [cursorPos, setCursorPos] = useState({ x: -999, y: -999 });
  const [activeNavIndex, setActiveNavIndex] = useState(0);
  const navTargets = ['about', 'services', 'projects', 'contact'];

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouse.current.x = e.clientX;
      mouse.current.y = e.clientY;
    };

    const tick = () => {
      smooth.current.x += (mouse.current.x - smooth.current.x) * 0.1;
      smooth.current.y += (mouse.current.y - smooth.current.y) * 0.1;
      setCursorPos({ x: smooth.current.x, y: smooth.current.y });
      rafRef.current = requestAnimationFrame(tick);
    };

    window.addEventListener('mousemove', handleMouseMove);
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <section className="relative w-full overflow-hidden h-screen bg-black" style={{ height: '100dvh' }}>
      <div
        className="absolute inset-0 bg-center bg-cover bg-no-repeat z-10 hero-zoom"
        style={{ backgroundImage: `url(${heroBaseImage})` }}
      />
      <div className="absolute inset-0 z-20 bg-black/25" />
      <RevealLayer image={heroRevealImage} cursorX={cursorPos.x} cursorY={cursorPos.y} />

      <nav className="fixed top-0 left-0 right-0 z-[100] flex items-center justify-between p-4 sm:p-5">
        <a href="#" className="block h-12 w-32 overflow-hidden rounded-md sm:h-14 sm:w-44 lg:h-16 lg:w-52" aria-label="MoonLight Studio">
          <img src={siteLogo} alt="MoonLight Studio" className="h-full w-full object-cover" />
        </a>
        <div
          className="hidden md:grid absolute left-1/2 -translate-x-1/2 grid-cols-4 bg-white/20 backdrop-blur-md border border-white/30 rounded-full p-2"
          onMouseLeave={() => setActiveNavIndex(0)}
        >
          <span
            className="pointer-events-none absolute bottom-2 top-2 rounded-full bg-white shadow-sm transition-transform duration-300 ease-out"
            style={{
              left: 8,
              width: 'calc((100% - 16px) / 4)',
              transform: `translateX(${activeNavIndex * 100}%)`,
            }}
          />
          {copy.nav.map((item, index) => (
            <a
              key={item}
              href={`#${navTargets[index]}`}
              onFocus={() => setActiveNavIndex(index)}
              onMouseEnter={() => setActiveNavIndex(index)}
              onClick={() => setActiveNavIndex(index)}
              className={`relative z-10 min-w-24 rounded-full px-4 py-1.5 text-center text-sm font-semibold transition-colors duration-300 ${
                activeNavIndex === index ? 'text-gray-950' : 'text-white/80 hover:text-white'
              }`}
            >
              {item}
            </a>
          ))}
        </div>
        <a
          href="#contact"
          className="hidden md:block bg-white text-gray-900 text-sm font-semibold px-6 py-2.5 rounded-full hover:bg-gray-100"
        >
          {copy.hero.contact}
        </a>
        <div className="flex items-center gap-1 rounded-full border border-white/25 bg-black/20 p-1 text-xs font-bold text-white">
          {(['en', 'vi'] as PublicLanguage[]).map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => onLanguageChange(item)}
              className={`rounded-full px-3 py-1 uppercase transition ${
                language === item ? 'bg-white text-zinc-950' : 'text-white/70 hover:text-white'
              }`}
              aria-label={`${copy.languageLabel}: ${item.toUpperCase()}`}
            >
              {item}
            </button>
          ))}
        </div>
        <button className="md:hidden text-white" aria-label={copy.hero.openNavigation}>
          <Menu />
        </button>
      </nav>

      <div
        className="hidden sm:block absolute bottom-14 left-10 md:left-14 z-50 max-w-[1180px] hero-anim hero-fade"
        style={{ animationDelay: '0.7s' }}
      >
        <FadeIn>
          <p className="mb-6 text-sm font-light uppercase tracking-[0.35em] text-white/45">{copy.hero.eyebrow}</p>
        </FadeIn>
        <AnimatedText text={copy.hero.headline} />
      </div>

      <div
        className="absolute bottom-10 sm:bottom-12 left-5 right-5 sm:left-auto sm:right-10 md:right-5 z-50 max-w-full sm:max-w-[280px] flex flex-col items-start gap-4 sm:gap-5 hero-anim hero-fade"
        style={{ animationDelay: '0.85s' }}
      >
        <p className="text-sm sm:text-base text-white/80 leading-relaxed">
          {copy.hero.body}
        </p>
      </div>
    </section>
  );
}
