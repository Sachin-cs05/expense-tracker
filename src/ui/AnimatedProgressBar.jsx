import { motion } from "framer-motion";
import { useEffect, useState } from "react";

/**
 * Animated progress bar with smooth fill and dynamic color transition.
 * Color shifts from red → yellow → green as value increases from 0 → 100.
 * Optionally inverted for budget bars (green when low usage, red when high).
 */
export function AnimatedProgressBar({ value = 0, tone, inverted = false, height = 8, className = "" }) {
  const [shouldAnimate, setShouldAnimate] = useState(false);
  const clampedValue = Math.max(0, Math.min(100, value));

  useEffect(() => {
    // Delay animation start to ensure component is mounted
    const timer = setTimeout(() => setShouldAnimate(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Determine color based on value or explicit tone
  const color = tone ? `var(--${tone})` : getDynamicColor(clampedValue, inverted);

  return (
    <div
      className={`animated-progress-track ${className}`}
      style={{ height }}
      role="progressbar"
      aria-valuenow={Math.round(clampedValue)}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <motion.div
        className="animated-progress-fill"
        initial={{ width: 0 }}
        animate={shouldAnimate ? { width: `${clampedValue}%` } : { width: 0 }}
        transition={{
          duration: 1,
          ease: [0.25, 0.46, 0.45, 0.94],
          delay: 0.2
        }}
        style={{
          height: "100%",
          borderRadius: 999,
          background: color,
          boxShadow: clampedValue > 10 ? `0 0 8px ${color}40` : "none"
        }}
      />
    </div>
  );
}

function getDynamicColor(value, inverted) {
  // For budget bars, high = bad (inverted)
  const normalizedValue = inverted ? 100 - value : value;

  if (normalizedValue >= 70) return "var(--positive)";
  if (normalizedValue >= 40) return "var(--warning)";
  return "var(--negative)";
}
