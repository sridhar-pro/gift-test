"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Gift,
  Box,
  MessageCircle,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

const steps = [
  {
    label: (
      <span>
        Select <br className="block sm:hidden" />
        Products
      </span>
    ),
    icon: Gift,
  },
  {
    label: (
      <span>
        Choose <br className="block sm:hidden" />
        Gift Box
      </span>
    ),
    icon: Box,
  },
  {
    label: (
      <span>
        Add-Ons <br className="block sm:hidden" />
        (Optional)
      </span>
    ),
    icon: MessageCircle,
  },
  {
    label: (
      <span>
        Review <br className="block sm:hidden" />& Confirm
      </span>
    ),
    icon: CheckCircle,
  },
];

export default function StepIndicator({ currentStep, setStep }) {
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => {
        setErrorMessage("");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [errorMessage]);

  return (
    <div className="relative">
      {/* Stepper UI */}
      <div className="flex justify-between items-center mb-10 px-0 md:px-4 lg:px-4 flex-wrap sm:flex-nowrap">
        {steps.map(({ label, icon: Icon }, index) => {
          const stepNum = index + 1;
          const isActive = stepNum === currentStep;

          return (
            <div
              key={index}
              className="flex-1 text-center relative z-10 mb-6 sm:mb-0"
            >
              <div
                onClick={() => {
                  if (stepNum === 2) {
                    try {
                      const data = JSON.parse(
                        localStorage.getItem("totalPrice")
                      );
                      const total = typeof data === "number" ? data : 0;

                      if (total > 1000) {
                        setStep(stepNum);
                        setErrorMessage("");
                      } else {
                        setErrorMessage(
                          "Minimum cart value of ₹1000 is required to choose a gift box."
                        );
                      }
                    } catch (error) {
                      console.error("Error parsing localStorage:", error);
                      setErrorMessage(
                        "Something went wrong. Please try again."
                      );
                    }
                    // } else if (stepNum === 3 || stepNum === 4) {
                    //   if (currentStep >= 2) {
                    //     setStep(stepNum);
                    //     setErrorMessage("");
                    //   } else {
                    //     setErrorMessage(
                    //       "Please complete Step 2 before continuing."
                    //     );
                    //   }
                  } else {
                    setStep(stepNum);
                    setErrorMessage("");
                  }
                }}
                className={`rounded-full w-14 h-14 sm:w-20 sm:h-20 mx-auto mb-2 border-2 cursor-pointer
                  ${
                    stepNum <= currentStep
                      ? "bg-black text-white border-white"
                      : "bg-white text-gray-600 border-gray-400"
                  }
                  flex items-center justify-center transition-all duration-300`}
              >
                <Icon size={24} className="sm:size-[35px]" />
              </div>

              <p
                className={`text-xs sm:text-base ${
                  isActive ? "text-black font-medium" : "text-gray-500"
                }`}
              >
                {label}
              </p>

              {index < steps.length - 1 && (
                <div className="absolute top-8 md:top-10 left-0 w-full h-0.5 transform translate-x-1/2 -z-10">
                  <div
                    className={`border-t w-full h-0 ${
                      currentStep > index + 1
                        ? "border-black"
                        : "border-dotted border-gray-400"
                    }`}
                  ></div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Error Toast */}
      <AnimatePresence>
        {errorMessage && (
          <motion.div
            key="error-toast"
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -50, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed top-[28rem] md:top-[29rem] left-0 md:left-1/3 transform -translate-x-1/2 bg-red-100 text-red-800 border border-red-300 px-4 py-3 rounded-xl shadow-lg z-50 max-w-xl w-full sm:max-w-xl text-sm sm:text-base flex items-center space-x-3"
          >
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span className="flex-1">{errorMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
