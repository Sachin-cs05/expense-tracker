import { motion } from "framer-motion";

/**
 * Animated card wrapper with fade-in on mount and hover lift effect.
 * Drop-in replacement for <Card> when you want entrance animation.
 */
export function AnimatedCard({ children, className = "", delay = 0, ...props }) {
  return (
    <motion.div
      className={`card ${className}`}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.4,
        delay,
        ease: [0.25, 0.46, 0.45, 0.94]
      }}
      whileHover={{
        y: -2,
        transition: { duration: 0.2 }
      }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

/**
 * Fade-in wrapper for chart containers. Adds a subtle grow effect.
 */
export function ChartFadeIn({ children, delay = 0.2 }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        duration: 0.5,
        delay,
        ease: [0.25, 0.46, 0.45, 0.94]
      }}
    >
      {children}
    </motion.div>
  );
}

/**
 * Staggered list item animation — use as a wrapper around each item.
 */
export function StaggerItem({ children, index = 0, ...props }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{
        duration: 0.3,
        delay: index * 0.05,
        ease: "easeOut"
      }}
      {...props}
    >
      {children}
    </motion.div>
  );
}
