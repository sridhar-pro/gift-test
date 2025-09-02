"use client";

import { motion } from "framer-motion";
import BuildCustomBox from "@/app/components/BuildCustomBox/BuildCustomBox";

const pageVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

export default function CustomBoxPage() {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={pageVariants}
      className="min-h-screen"
    >
      <BuildCustomBox />
    </motion.div>
  );
}
