'use client';
import { motion } from 'framer-motion';

export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 18, rotate: 0.4 }}
      animate={{ opacity: 1, x: 0, rotate: 0 }}
      transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
    >
      {children}
    </motion.div>
  );
}