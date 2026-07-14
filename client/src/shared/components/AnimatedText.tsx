import { motion } from 'framer-motion';

type AnimatedTextProps = {
  text: string;
};

export function AnimatedText({ text }: AnimatedTextProps) {
  return (
    <p className="max-w-4xl text-3xl font-semibold uppercase leading-[0.98] tracking-[-0.05em] text-white sm:text-5xl md:text-6xl">
      {text.split(' ').map((word, index) => (
        <motion.span
          key={`${word}-${index}`}
          className="mr-3 inline-block"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55, delay: index * 0.025 }}
        >
          {word}
        </motion.span>
      ))}
    </p>
  );
}
