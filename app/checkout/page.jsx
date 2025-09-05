"use client";
import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import PopupForm from "../components/PopupForm2";

export default function CheckoutPage() {
  const [checkoutData, setCheckoutData] = useState(null);
  const [selectedCategoryContent, setSelectedCategoryContent] = useState(null);
  const [selectedContents, setSelectedContents] = useState([]);
  const [quantity, setQuantity] = useState(1); // ✅ NEW — Track quantity
  const leftSectionRef = useRef(null);

  // Fetch selected category details
  useEffect(() => {
    const storedContent = localStorage.getItem("selectedCategoryContent");
    if (storedContent) {
      setSelectedCategoryContent(JSON.parse(storedContent));
    }
  }, []);

  // Fetch checkout data from sessionStorage
  useEffect(() => {
    const stored = sessionStorage.getItem("checkoutData");
    if (stored) {
      const parsed = JSON.parse(stored);
      setCheckoutData(parsed);
      setQuantity(parsed.quantity || 1); // ✅ Load saved quantity
    }
  }, []);

  // Fetch selected contents from localStorage
  useEffect(() => {
    const storedContents = localStorage.getItem("selectedContents");
    if (storedContents) {
      setSelectedContents(JSON.parse(storedContents));
    }
  }, []);

  // Scroll-lock logic
  useEffect(() => {
    const handleWheel = (e) => {
      const left = leftSectionRef.current;
      if (!left) return;

      const isScrollable =
        left.scrollHeight > left.clientHeight &&
        left.scrollTop + left.clientHeight < left.scrollHeight;

      // If left section has more to scroll, lock page scroll
      if (isScrollable) {
        e.preventDefault();
        left.scrollTop += e.deltaY;
      }
    };

    // Attach listeners for mouse + touch scrolling
    window.addEventListener("wheel", handleWheel, { passive: false });

    return () => {
      window.removeEventListener("wheel", handleWheel);
    };
  }, []);

  if (!checkoutData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        {/* Spinner */}
        <div className="w-10 h-10 border-4 border-gray-100 border-t-[#a3a2a2] rounded-full animate-spin"></div>
      </div>
    );
  }

  const { product, category, categoryContent } = checkoutData;
  const unitPrice = selectedCategoryContent
    ? selectedCategoryContent.price / 100
    : 0;

  const totalPrice = (unitPrice * quantity).toFixed(2);

  return (
    <div className="min-h-screen bg-gray-50 flex justify-center font-gift">
      <div className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-2 gap-8 p-6 lg:p-12 relative">
        {/* ✅ Right Section (Order Summary) */}
        <div className="order-1 lg:order-2 mt-2 w-full max-w-md lg:sticky lg:top-8 h-fit self-start">
          <div className="overflow-hidden">
            <div className="p-6">
              {/* Header */}
              <h2 className="text-2xl font-bold text-gray-900 tracking-tight mb-6 text-left">
                Order Summary
              </h2>

              {/* Product Section */}
              <div className="flex flex-col items-center text-center">
                <Image
                  src={
                    selectedCategoryContent?.image
                      ? selectedCategoryContent.image.startsWith("/")
                        ? selectedCategoryContent.image
                        : `https://marketplace.yuukke.com/assets/uploads/${selectedCategoryContent.image}`
                      : "/product.png"
                  }
                  alt={selectedCategoryContent?.name || "Product"}
                  width={180}
                  height={180}
                  className="rounded-2xl border border-gray-200 shadow-lg mb-4 object-cover"
                />

                <p className="text-lg font-semibold text-gray-900">
                  {selectedCategoryContent?.name || "Product"}
                </p>
                {/* ✅ Show Selected Quantity */}
                <p className="text-sm text-gray-600 mt-1">
                  Quantity: <span className="font-semibold">{quantity}</span>
                </p>
                {/* ✅ Show Price Per Item */}
                <p className="text-xs text-gray-400 mt-1">
                  Price per item: ₹{unitPrice.toFixed(2)}
                </p>
              </div>

              {/* Package Contents */}
              {selectedContents?.length > 0 && (
                <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-100 shadow-inner p-5 mt-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">
                    This package consists of:
                  </h3>
                  <ul className="space-y-3">
                    {selectedContents.map((item, idx) => (
                      <li
                        key={idx}
                        className="flex items-center space-x-3 text-gray-700 hover:text-[#a00300] transition-colors duration-300"
                      >
                        <span className="w-2.5 h-2.5 bg-[#a00300] rounded-full"></span>
                        <span className="text-sm leading-tight">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Divider */}
              <div className="my-6 border-t border-gray-200" />

              {/* ✅ Updated Total Section */}
              <div className="flex justify-between items-center">
                <span className="text-xl font-semibold text-gray-900">
                  Total ({quantity} item{quantity > 1 ? "s" : ""})
                </span>
                <span className="text-3xl font-bold text-[#a00300] tracking-tight">
                  ₹{totalPrice}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ✅ Left Section (Popup Form) */}
        <div
          ref={leftSectionRef}
          className="order-2 lg:order-1 space-y-8 pr-0 lg:pr-8 max-h-screen overflow-y-auto scrollbar-hide"
        >
          <PopupForm
            inline={true}
            product={product}
            category={category}
            categoryContent={categoryContent}
          />
        </div>

        {/* Divider */}
        <div className="hidden lg:block absolute left-1/2 top-0 bottom-0 w-px bg-gray-200" />
      </div>
    </div>
  );
}
