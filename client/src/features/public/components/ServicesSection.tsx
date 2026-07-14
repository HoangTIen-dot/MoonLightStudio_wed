import { motion } from 'framer-motion';
import { services } from '../homepage.data';

export function ServicesSection() {
  return (
    <section id="services" className="bg-white px-5 py-24 text-zinc-950 sm:px-10 md:py-32">
      <div className="mx-auto max-w-6xl">
        <div className="mb-14 flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <p className="mb-4 text-sm font-medium uppercase tracking-[0.35em] text-zinc-500">Services</p>
            <h2 className="max-w-3xl text-5xl font-black uppercase leading-none tracking-[-0.06em] sm:text-7xl">
              Technical Excellence & Creative Design
            </h2>
          </div>
        </div>
        <div className="border-t border-zinc-950">
          {services.map(([number, title, description]) => (
            <motion.div
              key={title}
              className="grid gap-5 border-b border-zinc-950 py-7 md:grid-cols-[0.25fr_0.75fr_1fr]"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.65 }}
            >
              <span className="text-sm font-semibold text-zinc-500">{number}</span>
              <h3 className="text-3xl font-black uppercase tracking-[-0.04em]">{title}</h3>
              <p className="text-base leading-relaxed text-zinc-600">{description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
