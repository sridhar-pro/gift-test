// components/BottomBar.jsx
"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingCart,
  Wallet,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  IndianRupee,
  Info,
} from "lucide-react";
import BundleView from "./Bundlefile";
import { useRef, useState } from "react";
import CustomPopup from "../CustomPopup";

const BottomBar = ({
  step,
  setStep,
  nextStep,
  totalItems,
  totalPrice,
  selectedBoxes,
  selectedAddons,
  selectedProducts,
  allProducts,
  allBoxes,
  allAddons,
  formatPrice,
  isModalOpen,
  setIsModalOpen,
  handleUpdateProductQuantity,
  handleRemoveProduct,
}) => {
  const modalRef = useRef(null);
  const [isModalIsOpen, setIsModalIsOpen] = useState(false);
  const [showWarning, setShowWarning] = useState(false);

  return (
    <>
      {step !== 4 && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="sticky bottom-0 bg-gradient-to-r from-gray-100 via-white to-gray-100 border-t border-gray-300 px-2 py-3 sm:px-14 sm:py-5 shadow-xl z-40 w-full backdrop-blur-md"
        >
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-0 w-full">
            {/* Left Section */}
            <div className="text-gray-800 font-medium text-xs sm:text-base uppercase text-center sm:text-left flex flex-wrap items-center gap-2 sm:gap-4">
              <span className="flex items-center gap-1 font-sans font-semibold tracking-wide">
                <ShoppingCart className="w-4 h-4 text-black" />
                Items: {totalItems}
              </span>
              <span className="flex items-center gap-1 font-sans font-semibold tracking-wide">
                <Wallet className="w-4 h-4 text-black" />
                Total: {formatPrice(totalPrice)}
              </span>
            </div>

            {/* Center Section */}
            {step === 1 && (
              <div className="w-full px-8 md:px-3 sm:max-w-md flex flex-col items-center gap-2 sm:gap-3">
                <div className="w-full h-2 sm:h-4 bg-gray-300 rounded-full overflow-hidden shadow-inner">
                  <motion.div
                    className={`h-full rounded-full ${
                      totalPrice >= 1000
                        ? "bg-gradient-to-r from-emerald-400 to-green-600 shadow-lg"
                        : "bg-gradient-to-r from-red-400 to-red-500"
                    }`}
                    initial={{ width: 0 }}
                    animate={{
                      width: `${Math.min(100, (totalPrice / 1000) * 100)}%`,
                    }}
                    transition={{ duration: 0.5, ease: "easeInOut" }}
                  />
                </div>

                <motion.div
                  key={totalPrice >= 1000 ? "eligible" : "incomplete"}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="w-full flex flex-col sm:flex-row sm:items-center justify-between text-[11px] sm:text-sm font-semibold tracking-wide gap-2"
                >
                  <span
                    className={`flex items-center gap-1 ${
                      totalPrice >= 1000 ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {totalPrice >= 1000 ? (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        ₹1000+ worth of products selected. You can proceed.
                      </>
                    ) : (
                      <>
                        <IndianRupee size={14} />
                        {Math.min(totalPrice, 1000)} of{" "}
                        <IndianRupee size={14} />
                        1000 selected
                      </>
                    )}
                  </span>
                  {totalPrice >= 1000 && (
                    <button
                      onClick={() => {
                        setStep(2);
                        window.scrollTo({ top: 300, behavior: "smooth" });
                      }}
                      className="w-fit px-3 py-1 text-[11px] sm:px-4 sm:py-1.5 bg-black text-white rounded-full font-semibold hover:bg-gray-900 transition flex items-center gap-1 ml-auto sm:ml-2"
                    >
                      Next <ArrowRight className="w-4 h-4" />
                    </button>
                  )}
                </motion.div>
              </div>
            )}

            {step === 2 && (
              <div className="w-full px-2 sm:max-w-md flex flex-col items-center gap-2 sm:gap-3 lg:hidden">
                <motion.div
                  key={"step2-box-check"}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="w-full flex flex-col sm:flex-row sm:items-center justify-between text-[11px] sm:text-xs font-semibold tracking-wide gap-2"
                >
                  {Object.keys(selectedBoxes).length > 0 ? (
                    <div className="flex items-center justify-between gap-2 text-green-600 w-full">
                      <span className="flex items-center gap-1 ml-10">
                        <CheckCircle2 className="w-4 h-4" />
                        One box selected. You can proceed.
                      </span>
                      <button
                        onClick={() => {
                          setStep(3);
                          window.scrollTo({ top: 300, behavior: "smooth" });
                        }}
                        className="px-3 py-1 text-[11px] sm:text-sm bg-black text-white rounded-full font-semibold hover:bg-gray-900 transition flex items-center gap-1 mr-9"
                      >
                        Next <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <span className="text-red-600 text-[12px] flex items-center gap-1 ml-8">
                      <AlertTriangle className="w-4 h-4" />
                      Please select one box to continue.
                    </span>
                  )}
                </motion.div>
              </div>
            )}

            {step === 3 && (
              <div className="w-full px-2 sm:max-w-md flex flex-col items-center gap-2 sm:gap-3 lg:hidden">
                <motion.div
                  key={"step3-addon-check"}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="w-full flex flex-col sm:flex-row sm:items-center justify-between text-[11px] sm:text-sm font-semibold tracking-wide gap-2"
                >
                  <div className="flex items-center justify-between gap-2 text-blue-600 w-full">
                    <span className="flex items-center gap-1 ml-10">
                      <Info className="w-4 h-4" />
                      Add-ons? Optional. Skip if you like.
                    </span>
                    <button
                      onClick={() => {
                        setStep(4);
                        window.scrollTo({ top: 300, behavior: "smooth" });
                      }}
                      className={`px-3 py-1 text-[11px] sm:text-sm rounded-full font-semibold transition flex items-center gap-1 mr-9 ${
                        selectedAddons.length > 0
                          ? "bg-black text-white hover:bg-gray-900"
                          : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                      }`}
                    >
                      {selectedAddons.length > 0 ? "Next" : "Skip"}{" "}
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              </div>
            )}

            {/* Right Button */}
            <motion.button
              onClick={() => {
                setIsModalOpen(true); // Open modal freely, no more "bundle is empty" drama
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-black text-white w-80 sm:w-40 px-4 py-3 sm:px-6 sm:py-3 rounded-full hover:bg-gray-900 transition uppercase text-xs sm:text-sm font-semibold tracking-wide shadow-md mb-2 md:mb-0"
            >
              View Bundle
            </motion.button>
          </div>
        </motion.div>
      )}

      {/* Bundle Modal */}

      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            key="bundle-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[99] bg-black/30 backdrop-blur-sm"
            onClick={(e) => {
              if (modalRef.current && !modalRef.current.contains(e.target)) {
                setIsModalOpen(false);
              }
            }}
          >
            <motion.div
              ref={modalRef}
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 28 }}
              className="fixed top-0 right-0 w-full sm:max-w-lg h-full bg-white shadow-2xl z-[100] rounded-3xl flex flex-col p-10 overflow-x-auto no-scrollbar"
              onClick={(e) => e.stopPropagation()} // stop click from bubbling to backdrop
            >
              <BundleView
                selectedProducts={selectedProducts}
                selectedBoxes={selectedBoxes}
                selectedAddons={selectedAddons}
                allProducts={allProducts}
                allBoxes={allBoxes}
                allAddons={allAddons}
                formatPrice={formatPrice}
                onUpdateProductQuantity={handleUpdateProductQuantity}
                onRemoveProduct={handleRemoveProduct}
                currentStep={step}
                setStep={setStep}
                nextStep={nextStep}
                closeModal={() => setIsModalOpen(false)}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default BottomBar;
