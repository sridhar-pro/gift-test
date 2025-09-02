"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import WrapLottie from "../WrapLottie";

export default function Step4({
  selectedProducts = {},
  selectedBoxes = {},
  selectedAddons = [],
  onBack,
  onConfirm,
  formatPrice,
  onUpdateProductQuantity,
  onRemoveProduct,
}) {
  const [error, setError] = useState("");
  const [showWrapAnimation, setShowWrapAnimation] = useState(false);
  const [success, setSuccess] = useState(false);
  const [loadedFromStorage, setLoadedFromStorage] = useState(false);

  const [localProducts, setLocalProducts] = useState({});
  const [localBoxes, setLocalBoxes] = useState({});
  const [localAddons, setLocalAddons] = useState([]);

  const [selectedDate, setSelectedDate] = useState("");
  const [dateTouched, setDateTouched] = useState(false); // to force user to interact

  const isDateValid = selectedDate !== "";

  const router = useRouter();
  const [suggestedProductList, setSuggestedProductList] = useState([]);

  useEffect(() => {
    if (loadedFromStorage) return;

    const storedProducts = localStorage.getItem("selectedProducts");
    const storedBoxes = localStorage.getItem("selectedBoxes");
    const storedAddons = localStorage.getItem("selectedAddons");

    setLocalProducts(
      storedProducts ? JSON.parse(storedProducts) : selectedProducts
    );
    setLocalBoxes(storedBoxes ? JSON.parse(storedBoxes) : selectedBoxes);
    setLocalAddons(storedAddons ? JSON.parse(storedAddons) : selectedAddons);

    setLoadedFromStorage(true);
  }, [loadedFromStorage, selectedProducts, selectedBoxes, selectedAddons]);

  useEffect(() => {
    const stored = localStorage.getItem("suggested_bundle_products");
    if (stored) {
      setSuggestedProductList(Object.values(JSON.parse(stored)));
    }
  }, []);

  const updateLocalStorage = (key, value) => {
    localStorage.setItem(key, JSON.stringify(value));
  };

  const getSafeImageUrl = (img) => {
    const BASE_URL = "https://marketplace.yuukke.com/assets/uploads/";
    if (!img) return "/gray.jpeg";
    if (img.startsWith("http://") || img.startsWith("https://")) return img;
    const normalizedBase = BASE_URL.endsWith("/") ? BASE_URL : BASE_URL + "/";
    return normalizedBase + (img.startsWith("/") ? img.slice(1) : img);
  };

  const getSafeImageUrl2 = (img) => {
    const BASE_URL = "https://marketplace.yuukke.com/assets/uploads/";
    // console.log("getSafeImageUrl2 input:", img);

    if (!img) {
      console.log(
        "getSafeImageUrl2 output: Fallback to /gray.jpeg (img is falsy)"
      );
      return "/gray.jpeg";
    }

    if (img.startsWith("http://") || img.startsWith("https://")) {
      console.log("getSafeImageUrl2 output: Returning full URL", img);
      return img;
    }

    const normalizedBase = BASE_URL.endsWith("/") ? BASE_URL : BASE_URL + "/";
    const normalizedImg = img.startsWith("/") ? img.slice(1) : img;
    const finalUrl = normalizedBase + normalizedImg;
    // console.log("getSafeImageUrl2 output: Constructed URL", finalUrl);
    return finalUrl;
  };

  const getProductDetails = () =>
    Object.entries(localProducts).map(([id, data]) => ({
      ...data,
      id: parseInt(id),
    }));

  const getBoxDetails = () =>
    Object.entries(localBoxes).map(([id, data]) => ({
      ...data,
      id: parseInt(id),
      quantity: 1,
    }));

  const getAddonDetails = () => localAddons;

  const selectedProductList = getProductDetails();
  const selectedBoxList = getBoxDetails();
  const selectedAddonList = getAddonDetails();

  const calculateTotal = () => {
    const products = selectedProductList.reduce(
      (sum, p) => sum + p.price * p.quantity,
      0
    );

    const boxes = selectedBoxList.reduce(
      (sum, b) => sum + parseFloat(b.price || 0) * (b.quantity || 1),
      0
    );

    const addons = selectedAddonList.reduce(
      (sum, a) => sum + parseFloat(a.price || 0),
      0
    );

    const suggested = suggestedProductList.reduce(
      (sum, s) => sum + s.price * (s.quantity || 1),
      0
    );

    return products + boxes + addons + suggested;
  };

  const [total, setTotal] = useState(0);

  useEffect(() => {
    const newTotal = calculateTotal();
    setTotal(newTotal);
  }, [
    selectedProductList,
    selectedBoxList,
    selectedAddonList,
    suggestedProductList,
  ]);

  // const total = calculateTotal();

  const handleRemove = (id) => {
    let updated = false;

    if (localProducts[id]) {
      const copy = { ...localProducts };
      delete copy[id];
      setLocalProducts(copy);
      updateLocalStorage("selectedProducts", copy);
      updated = true;
    }

    if (localBoxes[id]) {
      const copy = { ...localBoxes };
      delete copy[id];
      setLocalBoxes(copy);
      updateLocalStorage("selectedBoxes", copy);
      updated = true;
    }

    if (localAddons.find((a) => a.id === id)) {
      const filtered = localAddons.filter((a) => a.id !== id);
      setLocalAddons(filtered);
      updateLocalStorage("selectedAddons", filtered);
      updated = true;
    }

    // 🧠 Suggested Products Removal
    const suggestedIndex = suggestedProductList.findIndex((p) => p.id === id);
    if (suggestedIndex !== -1) {
      const updatedList = [...suggestedProductList];
      updatedList.splice(suggestedIndex, 1);
      setSuggestedProductList(updatedList);
      updateLocalStorage("suggested_bundle_products", updatedList);
      updated = true;
    }

    if (updated) onRemoveProduct?.(id);
  };

  const handleUpdateQuantity = (id, qty) => {
    if (qty < 1) return;

    if (localProducts[id]) {
      const updated = {
        ...localProducts,
        [id]: {
          ...localProducts[id],
          quantity: qty,
        },
      };
      setLocalProducts(updated);
      updateLocalStorage("selectedProducts", updated);
      onUpdateProductQuantity?.(id, qty);
      return;
    }

    // 🧠 Handle Quantity Update for Suggested Products
    const suggestedIndex = suggestedProductList.findIndex((p) => p.id === id);
    if (suggestedIndex !== -1) {
      const updatedList = [...suggestedProductList];
      updatedList[suggestedIndex] = {
        ...updatedList[suggestedIndex],
        quantity: qty,
      };
      setSuggestedProductList(updatedList);
      updateLocalStorage("suggested_bundle_products", updatedList);
      onUpdateProductQuantity?.(id, qty);
    }
  };

  const handleConfirm = () => {
    if (!selectedProductList.length) {
      setError("Please select at least one product before confirming.");
    } else if (!selectedBoxList.length) {
      setError("Please select one gift box before confirming.");
    } else {
      setError("");
      setShowWrapAnimation(true);
    }
  };

  const handleWrapAnimationFinish = () => {
    setShowWrapAnimation(false);
    handleProceed();
  };

  const handleProceed = async () => {
    onConfirm?.();

    const giftMessage = localStorage.getItem("giftMessage") || "";

    let cartId = localStorage.getItem("cart_id");
    if (!cartId) {
      cartId =
        Math.random().toString(36).substring(2, 15) +
        Math.random().toString(36).substring(2, 15);
      localStorage.setItem("cart_id", cartId);
    }

    // 🧠 Include color preferences from localStorage
    const productDetails = selectedProductList.map((p) => ({
      id: String(p.id),
      quantity: p.quantity,
      color: localStorage.getItem(`color_preference_${p.id}`) || null, // or "" if you want empty string instead of null
    }));

    const suggestedFromStorage =
      JSON.parse(localStorage.getItem("suggested_bundle_products")) || {};

    const suggestedProductDetails = Object.values(suggestedFromStorage).map(
      (p) => ({
        id: String(p.id),
        quantity: p.quantity,
        color: localStorage.getItem(`color_preference_${p.id}`) || null,
      })
    );

    const allProducts = [...productDetails, ...suggestedProductDetails];

    if (!isDateValid) return alert("📅 Please select a delivery date!");

    const payload = {
      selected_country: "IN",
      historypincode: 614624,
      cart_id: cartId,
      product_ids: allProducts.map((p) => p.id),
      qty: allProducts.map((p) => p.quantity),
      color: allProducts.map((p) => p.color),
      box_id: selectedBoxList[0]?.id || 1,
      addons_id: selectedAddonList.map((a) => String(a.id)),
      box_text: giftMessage,
      delivery_date_gift: selectedDate,
    };

    console.log("📦 Final Payload with Colors:", payload);

    const summaryData = {
      products: selectedProductList,
      boxes: selectedBoxList,
      addons: selectedAddonList,
      subtotal: total,
      tax: total * 0.1,
      total: total * 1.1,
    };

    localStorage.setItem("orderSummary", JSON.stringify(summaryData));
    try {
      // 1. Authentication - Get or refresh token
      let authToken = localStorage.getItem("authToken");
      if (!authToken) {
        const authResponse = await fetch("/api/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: "admin",
            password: "Admin@123",
          }),
        });

        const authData = await authResponse.json();
        if (authData.status !== "success") {
          throw new Error("Authentication failed");
        }
        authToken = authData.token;
        localStorage.setItem("authToken", authToken);
      }

      // 2. Make authenticated gift card request
      const res = await fetch("/api/addGiftCard", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify(payload),
      });

      // 3. Handle unauthorized responses
      if (res.status === 401) {
        localStorage.removeItem("authToken");
        throw new Error("Session expired. Please try again.");
      }

      if (!res.ok) {
        throw new Error(`Request failed with status ${res.status}`);
      }

      // 4. Process response
      const result = await res.json();

      if (
        result.status === "success" &&
        result.redirect_link?.startsWith("https://")
      ) {
        // ✅ Clean up time before redirect
        localStorage.removeItem("selectedProducts");
        localStorage.removeItem("selectedBoxes");
        localStorage.removeItem("selectedAddons");
        localStorage.removeItem("suggested_bundle_products");

        setSuccess(true);
        window.location.href = result.redirect_link;
      } else {
        console.error("Invalid response:", result);
        const errorMsg =
          result.message || "Received invalid response from server";
        setError(errorMsg);

        // 🐞 Debugging logs
        if (!result.redirect_link) {
          console.warn("Missing redirect_link in response");
        } else if (!result.redirect_link.startsWith("https://")) {
          console.warn("Insecure redirect URL:", result.redirect_link);
        }
      }
    } catch (err) {
      console.error("Gift card submission failed:", err);

      // User-friendly error messages
      const errorMessage = err.message.includes("Failed to fetch")
        ? "Network error. Please check your connection."
        : err.message.includes("Session expired")
        ? "Your session expired. Please try again."
        : "Something went wrong. Please try again.";

      setError(errorMessage);
    }
  };

  const allDisplayProducts = [...selectedProductList, ...suggestedProductList];

  return (
    <div className="p-0 md:p-8 w-full max-w-full mx-auto relative space-y-12 overflow-x-hidden">
      {/* Wrap Animation */}
      <AnimatePresence>
        {showWrapAnimation && (
          <WrapLottie onFinish={handleWrapAnimationFinish} />
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="block md:hidden sticky top-0 z-10 bg-white border-b border-gray-300 px-4 py-3">
        <h3 className="text-[1.7rem] text-center font-semibold text-black uppercase">
          Review & Confirm
        </h3>
      </div>
      <div className="hidden md:block">
        <h3 className="text-[2rem] text-center font-semibold text-black uppercase">
          Review & Confirm
        </h3>
      </div>

      <div>
        {selectedProductList.length === 0 &&
        selectedBoxList.length === 0 &&
        selectedAddonList.length === 0 ? (
          <div className="text-center text-gray-400 text-xl py-28 font-light tracking-wide">
            Please select some products to build your gift box.
          </div>
        ) : (
          <div className="space-y-6">
            {/* Products, Boxes, and Addons rendering remains the same */}
            {/* ... */}
            {allDisplayProducts.map((item) => (
              <div
                key={item.id}
                className="flex flex-col md:grid md:grid-cols-12 gap-4 md:gap-6 py-4 px-4 md:px-6 border border-gray-200 rounded-xl bg-white shadow-sm"
              >
                <div className="flex items-start gap-4 md:col-span-5">
                  <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg border border-gray-200">
                    <Image
                      src={getSafeImageUrl(item.image)}
                      alt={item.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-base md:text-lg font-semibold text-gray-900">
                      {item.name}
                    </h3>
                  </div>
                </div>

                <div className="md:col-span-2 text-left md:text-center text-base md:text-lg font-semibold text-[#911439] font-sans flex items-center">
                  ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                </div>

                <div className="md:col-span-3 flex items-center gap-2 justify-start md:justify-center">
                  <button
                    className="px-3 py-2 bg-gray-200 text-gray-700 rounded-full font-bold hover:bg-gray-300 disabled:opacity-50"
                    onClick={() =>
                      handleUpdateQuantity(item.id, item.quantity - 1)
                    }
                    disabled={item.quantity <= 1}
                  >
                    −
                  </button>
                  <span className="font-medium text-gray-800">
                    {item.quantity}
                  </span>
                  <button
                    className="px-3 py-1 bg-gray-200 text-gray-700 rounded-full font-bold hover:bg-gray-300"
                    onClick={() =>
                      handleUpdateQuantity(item.id, item.quantity + 1)
                    }
                  >
                    +
                  </button>
                </div>

                <div className="md:col-span-2 flex items-center justify-start md:justify-end">
                  <button
                    className="text-sm text-red-600 hover:underline"
                    onClick={() => handleRemove(item.id)}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}

            {/* Boxes */}
            {selectedBoxList.map((item) => (
              <div
                key={item.id}
                className="flex flex-col md:grid md:grid-cols-12 gap-4 md:gap-6 py-4 px-4 md:px-6 border border-gray-200 rounded-xl bg-white shadow-sm"
              >
                <div className="flex items-center md:items-start gap-4 md:col-span-5">
                  <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg border border-gray-200">
                    <Image
                      src={getSafeImageUrl2(item.image)}
                      alt={item.name}
                      fill
                      className="object-cover"
                      onError={() =>
                        console.error(
                          `Failed to load image for ${
                            item.name
                          }: ${getSafeImageUrl2(item.image)}`
                        )
                      }
                    />
                  </div>
                  <h3 className="text-base md:text-lg font-semibold text-gray-900">
                    {item.name}
                  </h3>
                </div>

                <div className="md:col-span-2 text-left md:text-center text-base md:text-lg font-semibold text-[#911439] font-sans flex items-center">
                  ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                </div>

                <div className="md:col-span-3 flex items-center gap-2 justify-start md:justify-center">
                  {item.quantity}
                </div>

                <div className="md:col-span-2 flex items-center justify-start md:justify-end">
                  <button
                    className="text-sm text-red-600 hover:underline"
                    onClick={() => handleRemove(item.id)}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}

            {/* Add-ons */}
            {selectedAddonList.map((item) => (
              <div
                key={item.id}
                className="flex flex-col md:grid md:grid-cols-12 gap-4 md:gap-6 py-4 px-4 md:px-6 border border-gray-200 rounded-xl bg-white shadow-sm"
              >
                <div className="flex items-center md:items-start gap-4 md:col-span-5">
                  <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg border border-gray-200">
                    <Image
                      src={getSafeImageUrl2(item.image)}
                      alt={item.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <h3 className="text-base md:text-lg font-semibold text-gray-900">
                    {item.title}
                  </h3>
                </div>

                <div className="md:col-span-2 text-left md:text-center text-base md:text-lg font-semibold text-[#911439] font-sans flex items-center">
                  ₹{parseFloat(item.price || 0).toLocaleString("en-IN")}
                </div>

                <div className="md:col-span-3 flex items-center gap-2 justify-start md:justify-center">
                  1 {/* Hardcoded quantity as 1 */}
                </div>

                <div className="md:col-span-2 flex items-center justify-start md:justify-end">
                  <button
                    className="text-sm text-red-600 hover:underline"
                    onClick={() => handleRemove(item.id)}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}

            {error && (
              <p className="text-red-600 font-semibold text-center text-lg mt-8">
                {error}
              </p>
            )}

            {/* Total Price */}
            <div className="text-right mt-4 md:mt-8 font-bold text-2xl md:text-3xl text-[#911439] font-sans">
              Total: ₹{total.toLocaleString("en-IN")}
            </div>
            {/* Delivery Date Picker - Enforce +14 Days */}
            <div className="w-full flex justify-end mt-6">
              <div className="sm:w-72 w-full">
                <label className="block text-sm font-semibold text-gray-700 mb-2 ml-1 italic">
                  Select Delivery Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => {
                    setSelectedDate(e.target.value);
                    setDateTouched(true);
                  }}
                  min={
                    new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
                      .toISOString()
                      .split("T")[0]
                  }
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#911439] focus:border-[#911439] text-gray-800 transition"
                />
                {!isDateValid && dateTouched && (
                  <p className="text-sm text-red-500 mt-1">
                    Please select a valid delivery date.
                  </p>
                )}
              </div>
            </div>

            {/* Navigation Buttons */}
            <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 mt-8">
              <button
                onClick={onBack}
                className="border border-[#911439] text-[#911439] px-6 py-3 rounded-xl font-semibold hover:bg-[#911439] hover:text-white transition w-full sm:w-auto"
              >
                Go Back
              </button>

              {/* Confirm Button with Tooltip on the Left */}
              <div className="relative group w-full sm:w-auto">
                <button
                  onClick={() => {
                    if (selectedDate) handleConfirm();
                  }}
                  disabled={!selectedDate}
                  className={`px-6 py-3 rounded-xl font-semibold transition w-full sm:w-auto ${
                    selectedDate
                      ? "bg-[#911439] text-white hover:bg-pink-900"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  Confirm & Build Box
                </button>

                {/* Tooltip on the left */}
                {!selectedDate && (
                  <div className="absolute top-1/2 left-0 -translate-x-full -translate-y-1/2 bg-[#911439] text-white text-xs px-3 py-2 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition duration-200 pointer-events-none whitespace-nowrap z-10">
                    Please choose a delivery date to place your order
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
