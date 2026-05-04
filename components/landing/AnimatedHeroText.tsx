"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function AnimatedHeroText() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.2,
        staggerChildren: 0.15,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: [0.25, 0.1, 0.25, 1],
      },
    },
  };

  return (
    <div className="relative z-10 flex items-center justify-center h-full text-center text-white">
      <motion.div
        className="space-y-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div className="space-y-6" variants={itemVariants}>
          <motion.h1
            role="heading"
            aria-level={1}
            className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-bold leading-tight tracking-tight"
            variants={itemVariants}
          >
            The Operating System for E-commerce
          </motion.h1>

          <motion.p
            className="max-w-3xl mx-auto text-xl sm:text-2xl text-white/90 leading-relaxed"
            variants={itemVariants}
          >
            Gain 3-5 hours per week by automating your entire e-commerce
            business
          </motion.p>
        </motion.div>

        <motion.div
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          variants={itemVariants}
        >
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link href="/auth/signup" passHref>
              <Button
                size="lg"
                className="bg-white text-black hover:bg-white/90 transition-all duration-300 shadow-2xl text-lg px-8 py-6 font-semibold"
              >
                Get Started Free
              </Button>
            </Link>
          </motion.div>

          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              variant="outline"
              size="lg"
              className="border-white/30 text-white hover:bg-white/10 hover:border-white/50 transition-all duration-300 backdrop-blur-sm text-lg px-8 py-6 font-semibold"
            >
              Learn More
            </Button>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
}
