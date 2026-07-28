'use client';
import { motion, AnimatePresence } from 'framer-motion';

export default function NavTransition({ show }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(35,42,59,0.2)', pointerEvents: 'none',
          }}
        >
          <motion.div
            initial={{ scale: 2.6, opacity: 0, rotate: -10 }}
            animate={{
              scale: [2.6, 0.85, 1.05, 1],
              opacity: [0, 1, 1, 1],
              rotate: [-10, 3, -1, 0],
            }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{
              duration: 0.85,
              times: [0, 0.55, 0.8, 1],
              ease: "easeOut",
            }}
            style={{
              width: 140, height: 140, borderRadius: '50%',
              border: '5px solid var(--color-stamp-green, #2F6B4F)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--color-stamp-green, #2F6B4F)',
              fontFamily: 'var(--font-rozha, serif)', fontSize: 17,
              letterSpacing: '2px', textTransform: 'uppercase',
              background: 'rgba(243,233,210,0.95)',
              boxShadow: '0 10px 30px rgba(0,0,0,0.25)',
            }}
          >
            digiKhata
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}