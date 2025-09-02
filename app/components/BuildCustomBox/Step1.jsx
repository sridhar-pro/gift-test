"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import ButtonSecondary from "../Button/ButtonSecondary";
import { ArrowRight, X, Palette, Save, PackageCheck } from "lucide-react";
import { productsData } from "@/app/data/products";

import BundleView from "./Bundlefile";

export default function Step1({
  onNext,
  selectedProducts,
  setSelectedProducts,
}) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [productCounts, setProductCounts] = useState(selectedProducts || {});
  const [errorMessage, setErrorMessage] = useState("");
  const [showPopError, setShowPopError] = useState(false);
  const [errorMessages, setErrorMessages] = useState({});
  const [clickedAddIds, setClickedAddIds] = useState(new Set());

  const [isModalOpen, setIsModalOpen] = useState(false);
  const modalRef = useRef(null);

  const [showColorModal, setShowColorModal] = useState(false);
  const [colorInput, setColorInput] = useState("");
  const [pendingColorProductId, setPendingColorProductId] = useState(null);
  const [selectedColors, setSelectedColors] = useState("");

  const handleColorSelect = (productId, color) => {
    setSelectedColors((prev) => ({
      ...prev,
      [productId]: color,
    }));
  };

  const getImageSrc = (image) => {
    if (!image) return "/fallback.png";
    if (image.startsWith("http") || image.startsWith("/")) return image;
    return `https://marketplace.yuukke.com/assets/uploads/${image}`;
  };

  const [showGif, setShowGif] = useState(null);

  const productsNeedingColor = new Set([
    "multicolour-batik-print-drum-lampshade",
  ]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        // console.group("[Product Fetch] Starting products fetch...");

        // 1. Get authentication token
        // console.log("1. Checking for auth token...");
        let authToken = localStorage.getItem("authToken");

        if (!authToken) {
          // console.log("No token found, authenticating...");
          const authResponse = await fetch(
            "https://marketplace.yuukke.com/api/v1/Auth/api_login",
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                username: "admin",
                password: "Admin@123",
              }),
            }
          );

          const authData = await authResponse.json();
          if (authData.status === "success") {
            authToken = authData.token;
            localStorage.setItem("authToken", authToken);
            // console.log("New token obtained:", authToken);
          } else {
            throw new Error("Authentication failed");
          }
        }

        // 2. Prepare request
        const categoryId = localStorage.getItem('selectedCategoryId');

        const requestBody = {
          filters: {
            page: 1,
            query: "",
            limit: 24,
            offset: 0,
            gifts_products: 0,
            category: {
              id: categoryId || "888" // Use the stored ID or a default
             },
          },
        };

        // console.log("2. Making API request with:", {
        //   url: "/api/getProducts",
        //   headers: {
        //     "Content-Type": "application/json",
        //     Accept: "application/json",
        //     Authorization: `Bearer ${authToken}`,
        //   },
        //   body: requestBody,
        // });

        // 3. Make the request
      
    
        const response = await fetch("/api/getProducts", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify(requestBody),
        });

        // console.log("3. Response status:", response.status);

        // 4. Handle response
        if (!response.ok) {
          if (response.status === 401) {
            // console.warn("Authentication expired, clearing token...");
            localStorage.removeItem("authToken");
            // Optionally retry the fetch
            return fetchProducts();
          }
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const responseText = await response.text();
        // console.log("4. Raw response:", responseText);

        if (!responseText.trim()) {
          console.warn("Empty response received");
          setProducts([]);
          return;
        }

        const data = JSON.parse(responseText);
        // console.log("5. Parsed data:", data);

        if (!data?.products) {
          throw new Error("Invalid response structure");
        }

        // 5. Transform data
        const mappedProducts = data.products.map((product) => ({
          id: product.id,
          name: product.name,
          image: product.image,
          price: product.price,
          promo_price: product.promo_price,
          promotion: product.promotion,
          quantity: product.quantity,
          category: product.type,
          slug: product.slug,
          end_date: product.end_date,
          minimum_order_qty: product.minimum_order_qty,
          minimum_order_limit: product.minimum_order_limit,
        }));

        // console.log("6. Mapped products:", mappedProducts);
        setProducts(mappedProducts);
      } catch (error) {
        console.error("[Product Fetch Error]", error);
        setProducts([]);
        setErrorMessage(error.message || "Failed to load products");
      } finally {
        setLoading(false);
        console.groupEnd();
      }
    };

    fetchProducts();
  }, []);

  useEffect(() => {
    // Clear only on full page refresh
    if (
      typeof window !== "undefined" &&
      performance.navigation.type === PerformanceNavigation.TYPE_RELOAD
    ) {
      localStorage.removeItem("selectedProducts");
      localStorage.removeItem("totalPrice");
    }

    if (!products.length) return;

    const totalItemsCount = Object.values(productCounts).reduce(
      (sum, item) => sum + (item.quantity || 0),
      0
    );

    const totalPriceSum = Object.values(productCounts).reduce(
      (sum, item) => sum + (item.quantity || 0) * (item.price || 0),
      0
    );

    localStorage.setItem("selectedProducts", JSON.stringify(productCounts));
    localStorage.setItem("totalPrice", totalPriceSum.toString());

    // console.log("Saved to localStorage:", {
    //   selectedProducts: productCounts,
    //   totalPrice: totalPriceSum,
    // });
  }, [productCounts, products]);

  const handleAdd = (id) => {
    const product = products.find((p) => p.id === id);
    if (!product) return;

    if (productsNeedingColor.has(product.slug)) {
      setPendingColorProductId(id);
      setShowColorModal(true); // show the textbox modal
      return;
    }

    continueAddProduct(id); // default case
  };

  const continueAddProduct = (id) => {
    const product = products.find((p) => p.id === id);
    if (!product) return;

    const isPromo = product.promotion === "1";
    const price = isPromo
      ? parseFloat(product.promo_price)
      : parseFloat(product.price);

    const maxAllowedQty = Math.max(
      0,
      Math.floor(parseFloat(product.quantity)) - 0
    );
    const currentQuantity = productCounts[id]?.quantity || 0;

    if (currentQuantity >= maxAllowedQty) {
      setErrorMessages((prev) => ({
        ...prev,
        [id]: `Only ${maxAllowedQty} allowed. 1 left in stock.`,
      }));

      setTimeout(() => {
        setErrorMessages((prev) => ({
          ...prev,
          [id]: null,
        }));
      }, 6000);
      return;
    }

    // 🧠 Logic for minimum_order_qty based on minimum_order_limit
    const shouldUseMinimumQty =
      product.minimum_order_limit === "1" &&
      Number(product.minimum_order_qty) > 0 &&
      currentQuantity === 0;

    const updatedQuantity = shouldUseMinimumQty
      ? Number(product.minimum_order_qty)
      : currentQuantity + 1;

    const updated = {
      ...productCounts,
      [id]: {
        quantity: updatedQuantity,
        name: product.name,
        price: price || 0,
        image: getImageSrc(product.image),
      },
    };

    setProductCounts(updated);
    setSelectedProducts(updated);

    setShowGif(id);

    setTimeout(() => {
      setShowGif(null);
      setIsModalOpen(true);
    }, 1000);

    setClickedAddIds((prev) => new Set(prev).add(id));
    setTimeout(() => {
      setClickedAddIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }, 800);
  };

  const handleRemove = (id) => {
    const product = products.find((p) => p.id === id);
    if (!product) return;

    const currentQuantity = productCounts[id]?.quantity || 0;

    // 🧠 Respect minimum_order_limit logic
    const hasMinimumLimit = product.minimum_order_limit === "1";
    const minimumQty = Number(product.minimum_order_qty);

    let updatedQuantity = currentQuantity - 1;

    if (hasMinimumLimit && minimumQty > 0) {
      // If current is at or below minimum, removing should reset to 0
      if (currentQuantity <= minimumQty) {
        updatedQuantity = 0;
      }
    }

    updatedQuantity = Math.max(updatedQuantity, 0);

    const updated = { ...productCounts };

    if (updatedQuantity === 0) {
      delete updated[id];
    } else {
      updated[id] = {
        ...updated[id],
        quantity: updatedQuantity,
      };
    }

    setProductCounts(updated);
    setSelectedProducts(updated);
  };

  const calculateTotalPrice = () =>
    Object.values(productCounts).reduce(
      (total, item) => total + (item.quantity || 0) * (item.price || 0),
      0
    );

  const handleNext = () => {
    if (calculateTotalPrice() < 1000) {
      setErrorMessage(
        "Please select products worth at least ₹1000 to continue."
      );
      setShowPopError(true);
      setTimeout(() => setShowPopError(false), 2000);
    } else {
      setErrorMessage("");
      setShowPopError(false);

      window.scrollTo({ top: 300, behavior: "smooth" });

      onNext();
    }
  };
  // useEffect(() => {
  //   const initialCounts = {};

  //   products.forEach((product) => {
  //     const minQty =
  //       product.minimum_order_limit === "1" &&
  //       Number(product.minimum_order_qty) > 0
  //         ? Number(product.minimum_order_qty)
  //         : 0;

  //     initialCounts[product.id] = {
  //       quantity: minQty,
  //       // Add more fields if needed (like name, price, etc.)
  //     };
  //   });

  //   setProductCounts(initialCounts);
  // }, [products]);

  const showColorForIds = ["1186", "1313", "1315"];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <motion.div
          className="w-12 h-12 border-4 border-t-transparent border-gray-400 rounded-full"
          animate={{ rotate: 360 }}
          transition={{
            repeat: Infinity,
            duration: 0.8,
            ease: "linear",
          }}
        />
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <div className="text-center text-gray-600 mt-10">
        No products loaded. Please try again later.
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col justify-between gap-10 px-0 md:px-6 relative">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 md:gap-4">
        <div className="block md:hidden sticky top-0 z-40 bg-white border-b border-gray-300 px-4 py-0 md:py-3">
          <h3 className="text-[1.7rem] text-center font-semibold text-black uppercase">
            Choose Gifts
          </h3>
          <p className="text-gray-700 mt-1 text-sm text-center">
            Choose a minimum of ₹1000 worth of products
          </p>
        </div>

        {/* Desktop Heading */}
        <div className="hidden md:flex md:flex-col">
          <h3 className="text-3xl font-semibold text-black uppercase">
            Choose Gifts
          </h3>
          <p className="text-gray-700 mt-1 text-sm">
            Choose a minimum of ₹1000 worth of products
          </p>
        </div>
        <ButtonSecondary
          onClick={handleNext}
          className="bg-black text-white px-5 py-2 rounded hover:opacity-90 transition flex items-center gap-2 mt-4 md:mt-0"
        >
          Next <ArrowRight className="w-5 h-5" />
        </ButtonSecondary>
      </div>

      {/* Error popup */}
      <AnimatePresence>
        {errorMessage && showPopError && (
          <motion.div
            key="error-toast"
            initial={{ y: -50, opacity: 0, scale: 0.9 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: -20, opacity: 0, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
            className="fixed top-24 md:top-[28rem] right-2 md:right-1/4 left-2 md:left-1/4 text-center transform -translate-x-1/2 z-50 bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded shadow-lg text-sm font-semibold"
          >
            {errorMessage}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Products grid */}
      <div className="px-0 md:px-8">
        {products.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-6 mt-2">
            {products.map((product) => {
              const price = parseFloat(product.promo_price || product.price);
              const oldPrice = parseFloat(product.price);
              const promoAvailable =
                product.promotion === "1" &&
                !isNaN(price) &&
                !isNaN(oldPrice) &&
                oldPrice > price;

              const offerPercent = promoAvailable
                ? Math.round(((oldPrice - price) / oldPrice) * 100)
                : null;

              const isOutOfStock =
                product.quantity == null || parseInt(product.quantity) <= 0;

              return (
                <motion.div
                  key={product.id}
                  whileHover={{ scale: !isOutOfStock ? 1.02 : 1 }}
                  className={`bg-white p-3 rounded-2xl shadow-sm flex flex-col relative h-full ${
                    isOutOfStock
                      ? "opacity-60 cursor-not-allowed"
                      : "cursor-pointer"
                  }`}
                >
                  {/* Image Section */}
                  <div className="relative w-full h-[200px] md:h-[220px] rounded-xl overflow-hidden">
                    <Image
                      src={getImageSrc(product.image)}
                      alt={product.name || "Image not found!"}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                      className="object-contain"
                      priority
                    />

                    {promoAvailable && (
                      <span className="absolute top-2 left-2 bg-gradient-to-r from-red-500 to-pink-600 text-white text-xs font-semibold px-2 py-0.5 rounded shadow-md whitespace-nowrap">
                        {offerPercent}% OFF
                      </span>
                    )}
                    {isOutOfStock && (
                      <span className="absolute top-2 right-2 bg-gradient-to-r from-gray-500 to-gray-700 text-white text-xs font-bold px-2 py-0.5 rounded shadow-md">
                        Out of Stock
                      </span>
                    )}
                  </div>
                  {/* Content Section */}
                  <div className="flex flex-col justify-between flex-grow p-4 min-h-[170px]">
                    <div>
                      <h3 className="text-base font-bold text-gray-900 line-clamp-2 h-[48px]">
                        {(() => {
                          if (!product.name) return "...";
                          const words = product.name.split(" ");
                          let text =
                            words.length <= 8
                              ? product.name
                              : words.slice(0, 8).join(" ") + " ...";
                          return text.charAt(0).toUpperCase() + text.slice(1);
                        })()}
                      </h3>
                    </div>

                    {/* Price + Quantity Counter */}
                    <div className="mt-2 flex flex-col gap-2">
                      <div className="flex items-center justify-between flex-wrap gap-1">
                        <div className="text-sm text-gray-900 font-semibold">
                          ₹
                          {price.toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                          })}
                          {promoAvailable && (
                            <span className="ml-2">
                              <span className="line-through text-gray-400 text-sm">
                                ₹
                                {oldPrice.toLocaleString(undefined, {
                                  minimumFractionDigits: 2,
                                })}
                              </span>
                              <br className="block sm:hidden" />
                              <span className="text-red-600 font-semibold text-xs ml-2">
                                ({offerPercent}% OFF)
                              </span>
                            </span>
                          )}
                        </div>
                      </div>

                      {!isOutOfStock && (
                        <>
                          <div className="flex items-center justify-between gap-0 mt-4 md:mt-2">
                            {showGif === product.id && (
                              <motion.div
                                initial={{ opacity: 0, y: 20, scale: 0.5 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: -20, scale: 0.5 }}
                                transition={{ duration: 0.3 }}
                                className="absolute top-[19rem] md:top-72 right-6 md:right-7 transform -translate-x-1/2 z-50 pointer-events-none"
                              >
                                <img
                                  src="/add.gif"
                                  alt="Item added"
                                  className="w-12 h-12 object-contain"
                                />
                              </motion.div>
                            )}
                            {/* Remove Button */}
                            <motion.button
                              onClick={() => handleRemove(product.id)}
                              className="bg-gray-200 text-gray-700 p-1.5 md:p-2 rounded-lg hover:bg-gray-300 transition-all shadow-md hover:shadow-lg"
                              aria-label="Remove"
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.9 }}
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="w-4 h-4"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M20 12H4"
                                />
                              </svg>
                            </motion.button>

                            {/* Quantity Display */}
                            <motion.div
                              key={productCounts[product.id]?.quantity}
                              initial={{ scale: 0.8, opacity: 0 }}
                              animate={{
                                scale: 1,
                                opacity: 1,
                                color: clickedAddIds.has(product.id)
                                  ? "#911439"
                                  : "#000000",
                              }}
                              transition={{
                                type: "spring",
                                stiffness: 500,
                                damping: 15,
                              }}
                              className="relative"
                            >
                              <span className="text-xl font-medium min-w-[24px] text-center block">
                                {productCounts[product.id]?.quantity || 0}
                              </span>

                              {/* Floating +1 indicator */}
                              {clickedAddIds.has(product.id) && (
                                <motion.span
                                  initial={{
                                    y: 0,
                                    opacity: 1,
                                    scale: 1,
                                    color: "#911439",
                                  }}
                                  animate={{
                                    y: -20,
                                    opacity: 0,
                                    scale: 1.5,
                                  }}
                                  transition={{
                                    duration: 0.6,
                                    ease: "easeOut",
                                  }}
                                  className="absolute inset-0 flex items-center justify-center pointer-events-none"
                                >
                                  +1
                                </motion.span>
                              )}
                            </motion.div>

                            {/* Add Button */}
                            <motion.button
                              onClick={() => handleAdd(product.id)}
                              className="relative bg-black text-white p-1.5 rounded-lg shadow-md hover:shadow-lg overflow-hidden"
                              aria-label="Add"
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.9 }}
                              animate={
                                clickedAddIds.has(product.id)
                                  ? {
                                      backgroundColor: [
                                        "#000000",
                                        "#911439",
                                        "#000000",
                                      ],
                                      transition: {
                                        duration: 0.8,
                                        ease: "easeInOut",
                                      },
                                    }
                                  : { backgroundColor: "#000000" }
                              }
                            >
                              {/* Ripple Effect */}
                              {clickedAddIds.has(product.id) && (
                                <motion.span
                                  className="absolute inset-0 bg-white opacity-30 rounded-full"
                                  initial={{ scale: 0, opacity: 0.7 }}
                                  animate={{ scale: 2, opacity: 0 }}
                                  transition={{ duration: 0.6 }}
                                />
                              )}

                              <div className="relative flex items-center justify-center">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="w-4 h-4 md:w-5 md:h-5 relative z-10"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    // className="stroke-[4] md:stroke-[2]"
                                    d="M12 4v16m8-8H4"
                                  />
                                </svg>
                                {/* Mobile-only text */}
                                {/* <span className="md:hidden text-base">+</span> */}
                              </div>
                            </motion.button>
                          </div>

                          {/* Quantity limit warning */}
                          {errorMessages[product.id] && (
                            <p className="text-sm text-red-600 font-medium mt-1">
                              🚫 Quantity limit exceeded.
                            </p>
                          )}
                          {product.minimum_order_limit === "1" &&
                            Number(product.minimum_order_qty) > 0 && (
                              <p className="flex items-center gap-2 text-xs font-semibold mt-1 text-yellow-700 bg-yellow-100 px-2 py-1 rounded-md w-fit">
                                <PackageCheck className="w-4 h-4 text-yellow-700" />
                                Minimum Order:{" "}
                                <span className="text-black font-bold">
                                  {product.minimum_order_qty}
                                </span>
                              </p>
                            )}
                        </>
                      )}
                    </div>
                  </div>

                  {showColorForIds.includes(String(product.id)) && (
                    <div className="mt-4">
                      <div className="flex justify-between items-center sm:flex-row flex-col sm:gap-0 gap-2">
                        <span className="text-sm text-gray-600 font-medium italic flex items-center gap-1">
                          <Palette className="w-4 h-4 text-gray-500" />
                          Your Color Preference:
                        </span>

                        <div className="flex gap-2 sm:justify-end justify-start">
                          {["red", "blue", "yellow", "black", "green"].map(
                            (color) => (
                              <div
                                key={color}
                                className={`
                                w-5 h-5 rounded-full border-2 cursor-pointer transition duration-200
                                ${
                                  selectedColors[product.id] === color
                                    ? "border-black scale-110"
                                    : "border-gray-300"
                                }
                              `}
                                style={{ backgroundColor: color }}
                                onClick={() => {
                                  const key = `color_preference_${product.id}`;
                                  localStorage.setItem(key, color);
                                  console.log("✅ Color preference saved:", {
                                    productId: product.id,
                                    color,
                                    localStorageKey: key,
                                  });
                                  handleColorSelect(product.id, color);
                                }}
                              />
                            )
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        ) : (
          <p className="text-center text-gray-500 mt-10">
            No products available.
          </p>
        )}
      </div>

      <div className="mt-4 text-right text-lg font-semibold text-gray-900 px-4 md:px-8">
        Total: ₹
        {calculateTotalPrice().toLocaleString(undefined, {
          minimumFractionDigits: 2,
        })}
      </div>

      {/* Mobile footer with Next button */}
      <div className="flex justify-end">
        <ButtonSecondary
          onClick={handleNext}
          className="bg-black text-white px-5 py-2 rounded hover:opacity-90 transition flex items-center gap-2"
        >
          Next <ArrowRight className="w-5 h-5" />
        </ButtonSecondary>
      </div>

      {/* <AnimatePresence>
        {showColorModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[120] bg-black/50 backdrop-blur-sm flex justify-center items-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="relative w-full max-w-md bg-white rounded-2xl shadow-xl p-6"
            >
              <button
                onClick={() => {
                  setShowColorModal(false);
                  setColorInput("");
                  setPendingColorProductId(null);
                }}
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
                aria-label="Close"
              >
                <X size={20} />
              </button>

              <div className="flex items-center gap-2 mb-4">
                <Palette className="text-pink-600" size={22} />
                <h2 className="text-lg font-semibold text-gray-800">
                  Mention Your Color Preference
                </h2>
              </div>

              <input
                type="text"
                value={colorInput}
                onChange={(e) => setColorInput(e.target.value)}
                placeholder="e.g., Red, Blue, Pastel Green..."
                className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
              />

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowColorModal(false);
                    setColorInput("");
                    setPendingColorProductId(null);
                  }}
                  className="px-4 py-2 text-sm text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (!colorInput.trim()) {
                      alert("Please enter a color!");
                      console.warn(
                        "❌ Empty color input — user needs to type something."
                      );
                      return;
                    }

                    const key = `color_preference_${pendingColorProductId}`;
                    localStorage.setItem(key, colorInput.trim());

                    console.log("✅ Color preference saved:", {
                      productId: pendingColorProductId,
                      color: colorInput.trim(),
                      localStorageKey: key,
                    });

                    setShowColorModal(false);
                    continueAddProduct(pendingColorProductId);

                    setColorInput("");
                    setPendingColorProductId(null);
                  }}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-white bg-black rounded-lg hover:opacity-90 transition-opacity"
                >
                  <Save size={16} />
                  Save & Continue
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence> */}

      {/* Bundle Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            key="bundle-backdrop"
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
              key="bundle-sidebar"
              ref={modalRef}
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 28 }}
              className="fixed top-0 right-0 w-full sm:max-w-lg h-full bg-white shadow-2xl z-[100] rounded-tl-3xl rounded-bl-3xl overflow-hidden"
              onClick={(e) => e.stopPropagation()} // prevent click from bubbling to backdrop
            >
              {Object.keys(productCounts).length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{ delay: 0.1 }}
                  className="text-center text-gray-500 text-lg mt-12"
                >
                  Your bundle is currently empty.
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ delay: 0.1 }}
                  className="h-full w-full"
                >
                  <BundleView
                    selectedProducts={productCounts}
                    onUpdateProductQuantity={(id, quantity) => {
                      const updated = { ...productCounts };
                      if (quantity === 0) {
                        delete updated[id];
                      } else {
                        updated[id] = {
                          ...updated[id],
                          quantity: quantity,
                        };
                      }
                      setProductCounts(updated);
                      setSelectedProducts(updated);
                    }}
                    onRemoveProduct={(id) => {
                      const updated = { ...productCounts };
                      delete updated[id];
                      setProductCounts(updated);
                      setSelectedProducts(updated);
                    }}
                    closeModal={() => setIsModalOpen(false)}
                    setStep={onNext}
                    nextStep={onNext}
                  />
                </motion.div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
