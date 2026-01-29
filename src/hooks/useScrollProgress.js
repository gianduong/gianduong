import { useScroll, useTransform } from "framer-motion";

/**
 * Hook for scrollytelling - provides scroll progress and transforms
 * @param {Object} options - { target: ref, offset: ['start end', 'end start'] }
 * @returns {Object} { scrollYProgress, scrollY }
 */
export function useScrollProgress(options = {}) {
  const { scrollYProgress, scrollY } = useScroll(options);
  return { scrollYProgress, scrollY };
}

/**
 * Create transform for opacity based on scroll progress
 */
export function useScrollOpacity(scrollYProgress, range = [0, 0.3]) {
  return useTransform(scrollYProgress, range, [0, 1]);
}

/**
 * Create transform for y position (parallax) based on scroll progress
 */
export function useScrollY(scrollYProgress, range = [0, 1], output = [0, -100]) {
  return useTransform(scrollYProgress, range, output);
}
