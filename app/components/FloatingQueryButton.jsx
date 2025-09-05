"use client";
import { useState } from "react";
import { MessageCircleQuestion } from "lucide-react"; // ✅ Better icon for queries
import PopupForm from "./PopupForm";

export default function FloatingQueryButton() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      {/* Floating Button */}
      <div className="fixed bottom-6 right-6 flex flex-col items-center z-50">
        <button
          onClick={() => setIsModalOpen(true)}
          className="relative w-16 h-16 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 group"
          aria-label="Open Query Form"
        >
          {/* Glowing Gradient Background */}
          <span className="absolute inset-0 rounded-full bg-gradient-to-r from-red-600 via-pink-500 to-red-700 animate-pulse opacity-80 group-hover:opacity-100 blur-sm"></span>

          {/* Actual Button */}
          <span className="relative w-14 h-14 rounded-full bg-[#A00030] flex items-center justify-center hover:scale-110 transition-all duration-300 shadow-md">
            <MessageCircleQuestion className="h-7 w-7 text-white drop-shadow-md" />
          </span>
        </button>

        {/* Label */}
        {/* <span className="mt-3 px-3 py-1 text-sm font-semibold rounded-lg bg-black/60 text-white backdrop-blur-md shadow-md select-none">
          Query Form
        </span> */}
      </div>

      {/* Popup Form */}
      <PopupForm isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
}
