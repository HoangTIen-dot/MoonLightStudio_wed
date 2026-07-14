import type { ReactNode } from 'react';
import { motion } from 'framer-motion';

type FadeInProps = {
  children: ReactNode;
  className?: string;
};

export function FadeIn({ children, className = '' }: FadeInProps) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}
