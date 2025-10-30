/**
 * Animated Page Wrapper using Framer Motion
 * Provides smooth page transitions and animations
 */

import React from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';

interface AnimatedPageProps {
  children: React.ReactNode;
  className?: string;
}

// Page transition variants
const pageVariants: Variants = {
  initial: {
    opacity: 0,
    y: 20,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: 'easeOut',
    },
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: {
      duration: 0.2,
      ease: 'easeIn',
    },
  },
};

/**
 * Animated page wrapper component
 * Usage: Wrap your page content with <AnimatedPage>
 */
export const AnimatedPage: React.FC<AnimatedPageProps> = ({ children, className = '' }) => {
  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageVariants}
      className={className}
    >
      {children}
    </motion.div>
  );
};

/**
 * Staggered children animation
 * Animates children one by one with a delay
 */
interface StaggerContainerProps {
  children: React.ReactNode;
  staggerDelay?: number;
  className?: string;
}

export const StaggerContainer: React.FC<StaggerContainerProps> = ({
  children,
  staggerDelay = 0.05,
  className = '',
}) => {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: staggerDelay,
      },
    },
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className={className}
    >
      {children}
    </motion.div>
  );
};

/**
 * Animated list item
 * Use inside StaggerContainer for staggered animations
 */
interface AnimatedItemProps {
  children: React.ReactNode;
  className?: string;
}

export const AnimatedItem: React.FC<AnimatedItemProps> = ({ children, className = '' }) => {
  const itemVariants: Variants = {
    hidden: {
      opacity: 0,
      y: 10,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.3,
      },
    },
  };

  return (
    <motion.div variants={itemVariants} className={className}>
      {children}
    </motion.div>
  );
};

/**
 * Fade in animation wrapper
 */
interface FadeInProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  className?: string;
}

export const FadeIn: React.FC<FadeInProps> = ({
  children,
  delay = 0,
  duration = 0.3,
  className = '',
}) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

/**
 * Scale in animation for modals
 */
interface ScaleInProps {
  children: React.ReactNode;
  className?: string;
}

export const ScaleIn: React.FC<ScaleInProps> = ({ children, className = '' }) => {
  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.9, opacity: 0 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

/**
 * Slide in from side
 */
interface SlideInProps {
  children: React.ReactNode;
  direction?: 'left' | 'right' | 'top' | 'bottom';
  className?: string;
}

export const SlideIn: React.FC<SlideInProps> = ({
  children,
  direction = 'right',
  className = '',
}) => {
  const directionOffset = {
    left: { x: -50, y: 0 },
    right: { x: 50, y: 0 },
    top: { x: 0, y: -50 },
    bottom: { x: 0, y: 50 },
  };

  const { x, y } = directionOffset[direction];

  return (
    <motion.div
      initial={{ x, y, opacity: 0 }}
      animate={{ x: 0, y: 0, opacity: 1 }}
      exit={{ x, y, opacity: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

/**
 * Hover scale animation
 */
interface HoverScaleProps {
  children: React.ReactNode;
  scale?: number;
  className?: string;
}

export const HoverScale: React.FC<HoverScaleProps> = ({
  children,
  scale = 1.05,
  className = '',
}) => {
  return (
    <motion.div whileHover={{ scale }} whileTap={{ scale: 0.98 }} className={className}>
      {children}
    </motion.div>
  );
};

export default AnimatedPage;
