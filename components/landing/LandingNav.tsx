"use client";
import { motion } from "framer-motion";
import Link from "next/link";

export function LandingNav() {
  return (
    <header className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between p-6">
      <motion.div
        className="flex items-center group cursor-pointer"
        whileHover={{ scale: 1.05 }}
        transition={{ type: "spring", stiffness: 400, damping: 10 }}
      >
        <motion.svg
          fill="none"
          viewBox="0 0 100 100"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
          className="size-10 text-white group-hover:drop-shadow-lg transition-all duration-300"
          style={{
            filter: "url(#logo-glow)",
          }}
          whileHover={{
            fill: "url(#logo-gradient)",
            rotate: [0, -2, 2, 0],
            transition: {
              fill: { duration: 0.3 },
              rotate: { duration: 0.6, ease: "easeInOut" },
            },
          }}
        >
          <motion.path
            d="M 40 25 C 20 25 20 45 40 45 C 60 45 60 65 40 65"
            stroke="currentColor"
            strokeWidth="8"
            fill="none"
            strokeLinecap="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
          />
          <motion.path
            d="M 60 25 L 60 85 M 60 25 L 80 25 M 60 55 L 75 55"
            stroke="currentColor"
            strokeWidth="8"
            fill="none"
            strokeLinecap="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 1, delay: 0.4 }}
          />
        </motion.svg>

        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-white/60 rounded-full"
              style={{
                left: `${20 + Math.random() * 60}%`,
                top: `${20 + Math.random() * 60}%`,
              }}
              animate={{
                y: [-10, -20, -10],
                x: [0, Math.random() * 20 - 10, 0],
                opacity: [0, 1, 0],
                scale: [0, 1, 0],
              }}
              transition={{
                duration: 2,
                repeat: Number.POSITIVE_INFINITY,
                delay: i * 0.2,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>
      </motion.div>

      <nav className="flex items-center space-x-2">
        <a
          href="#"
          className="text-white/80 hover:text-white text-xs font-light px-3 py-2 rounded-full hover:bg-white/10 transition-all duration-200"
        >
          Features
        </a>
        <a
          href="#"
          className="text-white/80 hover:text-white text-xs font-light px-3 py-2 rounded-full hover:bg-white/10 transition-all duration-200"
        >
          Pricing
        </a>
        <a
          href="#"
          className="text-white/80 hover:text-white text-xs font-light px-3 py-2 rounded-full hover:bg-white/10 transition-all duration-200"
        >
          Docs
        </a>
      </nav>

      <div className="relative flex items-center">
        <Link href="/auth/signin" passHref>
          <motion.button
            className="px-6 py-2 rounded-full bg-white text-black font-normal text-xs transition-all duration-300 hover:bg-white/90 cursor-pointer h-8 flex items-center"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Login
          </motion.button>
        </Link>
      </div>
    </header>
  );
}
