"use client";
import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import PopupForm from "../components/PopupForm2";

export default function CheckoutPage() {
  const [checkoutData, setCheckoutData] = useState(null);
  const [selectedCategoryContent, setSelectedCategoryContent] = useState(null);
  const [selectedContents, setSelectedContents] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const leftSectionRef = useRef(null);

  useEffect(() => {
    const storedContent = localStorage.getItem("selectedCategoryContent");
    if (storedContent) {
      setSelectedCategoryContent(JSON.parse(storedContent));
    }

    const stored = sessionStorage.getItem("checkoutData");
    if (stored) {
      const parsed = JSON.parse(stored);
      setCheckoutData(parsed);
      setQuantity(parsed.quantity || 1);
    }

    const storedContents = localStorage.getItem("selectedContents");
    if (storedContents) {
      setSelectedContents(JSON.parse(storedContents));
    }

    setLoading(false); // ✅ done checking storage
  }, []);

  // Scroll-lock logic
  useEffect(() => {
    const handleWheel = (e) => {
      const left = leftSectionRef.current;
      if (!left) return;

      const isScrollable =
        left.scrollHeight > left.clientHeight &&
        left.scrollTop + left.clientHeight < left.scrollHeight;

      if (isScrollable) {
        e.preventDefault();
        left.scrollTop += e.deltaY;
      }
    };

    window.addEventListener("wheel", handleWheel, { passive: false });
    return () => window.removeEventListener("wheel", handleWheel);
  }, []);

  if (loading) {
    return (
      <div className="min-h-[85vh] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-gray-200 border-t-[#a00300] rounded-full animate-spin"></div>
      </div>
    );
  }

  // ✅ Empty Checkout Fallback
  if (!checkoutData || !selectedCategoryContent) {
    return (
      <div className="min-h-[85vh] flex flex-col items-center justify-center bg-gray-50 px-6 text-center font-gift">
        <Image
          src="/empty-cart.png"
          alt="No hamper"
          width={220}
          height={220}
          className="mb-6 opacity-80"
        />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          No Hamper Selected
        </h2>
        <p className="text-gray-600 mb-6">
          Looks like you haven’t picked any hampers yet. Start building your
          perfect gift box 🎁
        </p>
        <Link
          href="/#featured-products"
          className="px-6 py-3 rounded-lg bg-[#A00300] text-white font-medium shadow-md hover:bg-[#800200] transition"
        >
          Browse Hampers
        </Link>
      </div>
    );
  }

  // ✅ Normal Checkout Flow
  const { product, category, categoryContent } = checkoutData;
  const unitPrice = selectedCategoryContent
    ? selectedCategoryContent.price / 100
    : 0;

  const totalPrice = (unitPrice * quantity).toFixed(2);

  return (
    <div className="min-h-screen bg-gray-50 flex justify-center font-gift">
      <div className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-2 gap-8 p-6 lg:p-12 relative">
        {/* Right Section (Order Summary) */}
        <div className="order-1 lg:order-2 mt-2 w-full max-w-md lg:sticky lg:top-8 h-fit self-start">
          <div className="overflow-hidden">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 tracking-tight mb-6 text-left">
                Order Summary
              </h2>

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
                <p className="text-sm text-gray-600 mt-1">
                  Quantity: <span className="font-semibold">{quantity}</span>
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Price per item: ₹{unitPrice.toFixed(2)}
                </p>
              </div>

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

              <div className="my-6 border-t border-gray-200" />

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

        {/* Left Section (Popup Form) */}
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

        <div className="hidden lg:block absolute left-1/2 top-0 bottom-0 w-px bg-gray-200" />
      </div>
    </div>
  );
}
