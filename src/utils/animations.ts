import { Variants, Transition } from 'framer-motion';

// =====================
// FRAMER MOTION VARIANTS
// =====================

// Basic fade animations
export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 }
};

export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 }
};

export const fadeInDown: Variants = {
  hidden: { opacity: 0, y: -30 },
  visible: { opacity: 1, y: 0 }
};

export const fadeInLeft: Variants = {
  hidden: { opacity: 0, x: -50 },
  visible: { opacity: 1, x: 0 }
};

export const fadeInRight: Variants = {
  hidden: { opacity: 0, x: 50 },
  visible: { opacity: 1, x: 0 }
};

// Scale animations
export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { opacity: 1, scale: 1 }
};

export const scaleInBounce: Variants = {
  hidden: { opacity: 0, scale: 0.5 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 15
    }
  }
};

export const popIn: Variants = {
  hidden: { opacity: 0, scale: 0 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 20
    }
  }
};

// Rotation animations
export const rotateIn: Variants = {
  hidden: { opacity: 0, rotate: -180, scale: 0 },
  visible: { 
    opacity: 1, 
    rotate: 0, 
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 200,
      damping: 15
    }
  }
};

// Slide animations
export const slideInLeft: Variants = {
  hidden: { x: -100, opacity: 0 },
  visible: { x: 0, opacity: 1 }
};

export const slideInRight: Variants = {
  hidden: { x: 100, opacity: 0 },
  visible: { x: 0, opacity: 1 }
};

export const slideInUp: Variants = {
  hidden: { y: 100, opacity: 0 },
  visible: { y: 0, opacity: 1 }
};

export const slideInDown: Variants = {
  hidden: { y: -100, opacity: 0 },
  visible: { y: 0, opacity: 1 }
};

// Bounce drop from top
export const bounceDown: Variants = {
  hidden: { y: -200, opacity: 0 },
  visible: { 
    y: 0, 
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 20
    }
  }
};

// Flip animations
export const flipIn: Variants = {
  hidden: { rotateY: 90, opacity: 0 },
  visible: { 
    rotateY: 0, 
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 200,
      damping: 20
    }
  }
};

export const flip3D: Variants = {
  hidden: { rotateX: -90, opacity: 0, scale: 0.8 },
  visible: { 
    rotateX: 0, 
    opacity: 1, 
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 200,
      damping: 15
    }
  }
};

// Container variants for staggering children
export const staggerContainer: Variants = {
  hidden: { opacity: 1 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

export const staggerContainerFast: Variants = {
  hidden: { opacity: 1 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1
    }
  }
};

export const staggerContainerSlow: Variants = {
  hidden: { opacity: 1 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.3
    }
  }
};

// Wave cascade for chips/badges
export const waveContainer: Variants = {
  hidden: { opacity: 1 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1
    }
  }
};

// Stamp thud effect
export const stampThud: Variants = {
  hidden: { 
    opacity: 0, 
    scale: 2, 
    rotate: -15 
  },
  visible: { 
    opacity: 1, 
    scale: 1, 
    rotate: 0,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 15
    }
  }
};

// =====================
// SPRING TRANSITIONS
// =====================
export const springBounce: Transition = {
  type: "spring",
  stiffness: 300,
  damping: 15
};

export const springGentle: Transition = {
  type: "spring",
  stiffness: 200,
  damping: 20
};

export const springSnappy: Transition = {
  type: "spring",
  stiffness: 400,
  damping: 25
};

// =====================
// EASING FUNCTIONS
// =====================
export const easings = {
  entrance: [0.34, 1.56, 0.64, 1],
  exit: [0.4, 0, 0.2, 1],
  smooth: [0.4, 0, 0.2, 1],
  bounce: [0.68, -0.55, 0.265, 1.55],
};

// =====================
// COMMON TRANSITIONS
// =====================
export const transitions = {
  quick: { duration: 0.25, ease: easings.smooth },
  medium: { duration: 0.5, ease: easings.smooth },
  slow: { duration: 0.8, ease: easings.smooth },
  hero: { duration: 1.2, ease: easings.entrance },
};

// =====================
// HOVER ANIMATIONS
// =====================
export const hoverScale = {
  scale: 1.05,
  transition: { duration: 0.2 }
};

export const hoverGlow = {
  scale: 1.02,
  boxShadow: "0 0 20px rgba(255, 91, 4, 0.3)",
  transition: { duration: 0.3 }
};

export const tapScale = {
  scale: 0.95
};

// =====================
// GSAP HELPERS
// =====================

// Counter animation using requestAnimationFrame (no GSAP dependency in this file)
export const animateCounter = (
  element: HTMLElement,
  endValue: number,
  duration: number = 1500,
  onUpdate?: (value: number) => void
) => {
  const startTime = performance.now();
  const startValue = 0;

  const updateCounter = (currentTime: number) => {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    
    // Ease out cubic
    const easeProgress = 1 - Math.pow(1 - progress, 3);
    const currentValue = Math.round(startValue + (endValue - startValue) * easeProgress);
    
    if (element) {
      element.textContent = currentValue.toString();
    }
    
    if (onUpdate) {
      onUpdate(currentValue);
    }
    
    if (progress < 1) {
      requestAnimationFrame(updateCounter);
    }
  };

  requestAnimationFrame(updateCounter);
};

// Word-by-word animation data
export const splitTextToWords = (text: string): string[] => {
  return text.split(' ');
};

// Character-by-character animation data
export const splitTextToChars = (text: string): string[] => {
  return text.split('');
};
