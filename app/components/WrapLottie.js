// components/WrapLottie.js
"use client";
import { useEffect } from "react";
import Lottie from "react-lottie-player";
import wrapAnimation from "@/public/animations/gift-wrap.json"; // adjust path as needed

export default function WrapLottie({ onFinish }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onFinish();
    }, 3000); // match the duration of the Lottie animation
    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <Lottie
        loop={false}
        play
        animationData={wrapAnimation}
        style={{ width: 300, height: 300 }}
      />
    </div>
  );
}
