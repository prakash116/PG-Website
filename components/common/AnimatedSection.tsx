"use client";

import { motion, type Variants } from "framer-motion";
import { cn } from "@/lib/utils";

const EASE = [0.22, 1, 0.36, 1] as const;

interface AnimatedSectionProps {
  children: React.ReactNode;
  className?: string;
  /** Seconds to wait before animating in */
  delay?: number;
  /** Initial vertical offset in px */
  y?: number;
}

/** Fade + rise reveal once the element scrolls into view. */
export function AnimatedSection({
  children,
  className,
  delay = 0,
  y = 28,
}: AnimatedSectionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-64px" }}
      transition={{ duration: 0.65, delay, ease: EASE }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

const staggerParent: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.09 } },
};

const staggerChild: Variants = {
  hidden: { opacity: 0, y: 26 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } },
};

/** Parent that staggers each <StaggerItem> child as the group enters the viewport. */
export function StaggerGroup({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      variants={staggerParent}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-64px" }}
      className={cn(className)}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div variants={staggerChild} className={className}>
      {children}
    </motion.div>
  );
}
