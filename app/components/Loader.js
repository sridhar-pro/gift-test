// components/Loader.js
"use client";

import { motion } from "framer-motion";

export const Loader = () => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-transparent  backdrop-blur-none">
      <motion.div className="flex space-x-2" initial="hidden" animate="visible">
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            className="w-4 h-4 bg-gradient-to-r from-[#A00030] to-[#000940] rounded-full"
            variants={{
              hidden: { opacity: 0, y: 10 },
              visible: {
                opacity: 1,
                y: 0,
                transition: {
                  repeat: Infinity,
                  repeatType: "reverse",
                  duration: 0.6,
                  delay: i * 0.2,
                },
              },
            }}
          />
        ))}
      </motion.div>
    </div>
  );
};
