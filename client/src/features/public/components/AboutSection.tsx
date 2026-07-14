import { decorativeImages } from '../homepage.data';
import { AnimatedText } from '../../../shared/components/AnimatedText';
import { FadeIn } from '../../../shared/components/FadeIn';

export function AboutSection() {
  return (
    <section id="about" className="relative overflow-hidden bg-[#0C0C0C] px-5 py-24 sm:px-10 md:py-36">
      <img
        src={decorativeImages[0]}
        alt="Reflective 3D material"
        className="absolute -right-20 top-16 h-40 w-40 rounded-full object-cover opacity-70 blur-[1px] sm:h-64 sm:w-64"
      />
      <img
        src={decorativeImages[1]}
        alt="Abstract 3D glass"
        className="absolute -left-12 bottom-20 h-36 w-36 rotate-12 rounded-[2rem] object-cover opacity-60 sm:h-56 sm:w-56"
      />
      <div className="relative z-10 mx-auto max-w-6xl">
        <FadeIn>
          <p className="mb-6 text-sm font-light uppercase tracking-[0.35em] text-white/45">Who We Are</p>
        </FadeIn>
        <AnimatedText text="Bridging the gap between imagination and reality." />
        <FadeIn className="mt-10 flex flex-col items-start gap-8 md:ml-auto md:max-w-xl">
          <p className="text-lg font-light leading-relaxed text-white/65">
            Founded in 2018 in Ho Chi Minh City, Moonlight Studio is a premium post-production partner. We specialize in high-quality storytelling, CGI, and VFX for TV commercials and digital films.
          </p>
          <p className="text-lg font-light leading-relaxed text-white/65">
            By leveraging advanced expertise, we provide visual solutions for global corporations and agencies that require both technical excellence and creative innovation.
          </p>
        </FadeIn>
      </div>
    </section>
  );
}
