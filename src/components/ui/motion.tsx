"use client";

import { motion, type Variants } from "framer-motion";
import { type ReactNode } from "react";

/* ─── Fade-in on scroll (or mount) ─── */
interface FadeInProps {
    children: ReactNode;
    className?: string;
    delay?: number;
    duration?: number;
    direction?: "up" | "down" | "left" | "right" | "none";
    distance?: number;
    once?: boolean;
}

const directionMap: Record<string, { x: number; y: number }> = {
    up: { x: 0, y: 1 },
    down: { x: 0, y: -1 },
    left: { x: 1, y: 0 },
    right: { x: -1, y: 0 },
    none: { x: 0, y: 0 },
};

export function FadeIn({
    children,
    className,
    delay = 0,
    duration = 0.5,
    direction = "up",
    distance = 24,
    once = true,
}: FadeInProps) {
    const dir = directionMap[direction];
    return (
        <motion.div
            className={className}
            initial={{
                opacity: 0,
                x: (dir.x ?? 0) * distance,
                y: (dir.y ?? 0) * distance,
            }}
            whileInView={{ opacity: 1, x: 0, y: 0 }}
            viewport={{ once, margin: "-50px" }}
            transition={{
                duration,
                delay,
                ease: [0.25, 0.4, 0.25, 1],
            }}
        >
            {children}
        </motion.div>
    );
}

/* ─── Staggered container ─── */
interface StaggerProps {
    children: ReactNode;
    className?: string;
    staggerDelay?: number;
    delay?: number;
}

const staggerVariants: Variants = {
    hidden: {},
    visible: (custom: { staggerDelay: number; delay: number }) => ({
        transition: {
            staggerChildren: custom.staggerDelay,
            delayChildren: custom.delay,
        },
    }),
};

const staggerItemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.45, ease: [0.25, 0.4, 0.25, 1] },
    },
};

export function StaggerContainer({
    children,
    className,
    staggerDelay = 0.08,
    delay = 0,
}: StaggerProps) {
    return (
        <motion.div
            className={className}
            variants={staggerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-40px" }}
            custom={{ staggerDelay, delay }}
        >
            {children}
        </motion.div>
    );
}

export function StaggerItem({
    children,
    className,
}: {
    children: ReactNode;
    className?: string;
}) {
    return (
        <motion.div className={className} variants={staggerItemVariants}>
            {children}
        </motion.div>
    );
}

/* ─── Scale-on-hover card ─── */
export function ScaleCard({
    children,
    className,
}: {
    children: ReactNode;
    className?: string;
}) {
    return (
        <motion.div
            className={className}
            whileHover={{ scale: 1.02, y: -4 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
            {children}
        </motion.div>
    );
}

/* ─── Page transition wrapper ─── */
export function PageTransition({
    children,
    className,
}: {
    children: ReactNode;
    className?: string;
}) {
    return (
        <motion.div
            className={className}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
        >
            {children}
        </motion.div>
    );
}
