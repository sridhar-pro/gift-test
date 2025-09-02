// components/CustomPopup.jsx
"use client";

import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle } from "lucide-react";

const CustomPopup = ({ show, onClose, message }) => {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-50 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="absolute bottom-2 md:bottom-[30rem] left-3 md:left-[43rem] transform -translate-x-1/2 bg-white rounded-xl shadow-xl p-6 max-w-sm text-center pointer-events-auto"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
          >
            <div className="flex justify-center mb-4 text-yellow-500">
              <AlertTriangle size={32} />
            </div>
            <p className="text-sm text-gray-800 font-semibold">{message}</p>
            <button
              className="mt-4 px-4 py-2 bg-black text-white rounded-full text-sm hover:bg-gray-900"
              onClick={onClose}
            >
              Got it!
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CustomPopup;
