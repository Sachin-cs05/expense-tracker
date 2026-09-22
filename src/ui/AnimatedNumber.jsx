import { useEffect, useRef, useState } from "react";
import { useInView, useMotionValue, useSpring } from "framer-motion";

/**
 * Animated count-up number component for dashboard totals.
 * Uses framer-motion springs for smooth, physics-based counting.
 * Respects prefers-reduced-motion — shows the final value immediately.
 */
export function AnimatedNumber({ value, prefix = "", suffix = "", duration = 1.2, formatOptions }) {
  const ref = useRef(null);
  const motionValue = useMotionValue(0);
  const springValue = useSpring(motionValue, {
    damping: 30,
    stiffness: 100,
    duration: duration * 1000
  });
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const [displayValue, setDisplayValue] = useState("0");

  // Check for prefers-reduced-motion
  const prefersReducedMotion = typeof window !== "undefined"
    && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  useEffect(() => {
    if (prefersReducedMotion) {
      setDisplayValue(formatNumber(value, formatOptions));
      return;
    }

    if (isInView) {
      motionValue.set(value);
    }
  }, [isInView, value, motionValue, prefersReducedMotion, formatOptions]);

  useEffect(() => {
    if (prefersReducedMotion) return;

    const unsubscribe = springValue.on("change", (latest) => {
      setDisplayValue(formatNumber(latest, formatOptions));
    });

    return unsubscribe;
  }, [springValue, prefersReducedMotion, formatOptions]);

  return (
    <span ref={ref}>
      {prefix}{displayValue}{suffix}
    </span>
  );
}

function formatNumber(value, options) {
  if (options?.style === "currency") {
    return Number(value).toLocaleString("en-IN", { maximumFractionDigits: 2 });
  }
  if (options?.decimals !== undefined) {
    return Number(value).toFixed(options.decimals);
  }
  return Math.round(value).toLocaleString("en-IN");
}
