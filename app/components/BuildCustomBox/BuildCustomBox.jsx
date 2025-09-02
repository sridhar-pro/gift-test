"use client";

import { useState, useEffect, useRef } from "react";
// import { useSearchParams } from "next/navigation";
import StepIndicator from "./StepIndicator";
import Step1 from "./Step1";
import Step2 from "./Step2";
import Step3 from "./Step3";
import Step4 from "./Step4";
import BottomBar from "./BottomBar";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";

import { discountedProducts } from "@/app/data/products";

export default function BuildCustomBox() {
  const [step, setStep] = useState(1);
  const [selectedProducts, setSelectedProducts] = useState({});
  const [selectedBoxes, setSelectedBoxes] = useState({});
  const [selectedAddons, setSelectedAddons] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [allProducts, setAllProducts] = useState([]);
  const [allBoxes, setAllBoxes] = useState([]);
  const [allAddons, setAllAddons] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  const [totalItems, setTotalItems] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);

  const modalRef = useRef();

  const getImageSrc = (image) => {
    if (!image) return "/fallback.png";
    if (image.startsWith("http") || image.startsWith("/")) return image;
    return `https://marketplace.yuukke.com/assets/uploads/${image}`;
  };

  // Inside your component
  const [products, setProducts] = useState([]);
  const [showOfferPopup, setShowOfferPopup] = useState(false);
  const [currentOffer, setCurrentOffer] = useState(null);
  const [isChanging, setIsChanging] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [currentProgress, setCurrentProgress] = useState(100);

  // const searchParams = useSearchParams();

  // Listen for the `step` in the URL
  // useEffect(() => {
  //   const stepFromURL = parseInt(searchParams.get("step"));
  //   if (stepFromURL && stepFromURL >= 1 && stepFromURL <= 4) {
  //     setStep(stepFromURL);
  //   }
  // }, [searchParams]);
  const popupTimeoutRef = useRef(null);
  const rotationIntervalRef = useRef(null);
  const hasTimerStartedRef = useRef(false);

  const getRandomOffer = () =>
    products?.[Math.floor(Math.random() * products.length)];

  const startOfferFlow = () => {
    if (hasTimerStartedRef.current) return;
    hasTimerStartedRef.current = true;

    setShowOfferPopup(true);
    const startTime = Date.now();

    const updateProgress = () => {
      const elapsed = (Date.now() - startTime) / 1000;
      const remaining = Math.max(0, 180 - elapsed);
      setTimeLeft(Math.floor(remaining));
      setCurrentProgress((remaining / 180) * 100);

      if (remaining > 0) {
        requestAnimationFrame(updateProgress);
      } else {
        setShowOfferPopup(false);
      }
    };
    requestAnimationFrame(updateProgress);

    rotationIntervalRef.current = setInterval(() => {
      setIsChanging(true);
      setTimeout(() => {
        setCurrentOffer(getRandomOffer());
        setIsChanging(false);
      }, 300);
    }, 10000);
  };
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true); // ⏳ Show loader while fetching

        let authToken = localStorage.getItem("authToken");

        if (!authToken) {
          console.log("🔐 No token found, authenticating...");

          const authResponse = await fetch("/api/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              username: "admin",
              password: "Admin@123",
            }),
          });

          const authData = await authResponse.json();

          if (authData.status === "success") {
            authToken = authData.token;
            localStorage.setItem("authToken", authToken);
          } else {
            throw new Error("❌ Authentication failed");
          }
        }

        // 🧾 Construct the request body with filters
        const requestBody = {
          filters: {
            page: 1,
            query: "",
            limit: 24,
            offset: 0,
            gifts_products: 1,
          },
        };

        const productResponse = await fetch("/api/getProducts", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify(requestBody),
        });

        if (productResponse.status === 401) {
          console.warn("⚠️ Token expired, clearing and retrying...");
          localStorage.removeItem("authToken");
          return fetchProducts(); // 🔁 Retry once
        }

        if (!productResponse.ok) {
          const text = await productResponse.text();
          throw new Error(
            `❌ Failed to fetch products: ${text || productResponse.status}`
          );
        }

        const text = await productResponse.text();
        if (!text) {
          throw new Error("📭 Empty response from /api/getProducts");
        }

        const data = JSON.parse(text);

        setProducts(data?.products || []); // Adjust based on API response structure
      } catch (error) {
        console.error("🔥 Error during product fetch:", error);
      } finally {
        setLoading(false); // ✅ Hide loader
      }
    };

    fetchProducts();
  }, []);

  useEffect(() => {
    if (step === 1 && products.length > 0) {
      setCurrentOffer(getRandomOffer());

      popupTimeoutRef.current = setTimeout(() => {
        startOfferFlow();
      }, 300000); // 5 minutes

      return () => {
        if (popupTimeoutRef.current) clearTimeout(popupTimeoutRef.current);
        if (rotationIntervalRef.current)
          clearInterval(rotationIntervalRef.current);
      };
    }
  }, [step, products]);

  const closeOfferPopup = () => {
    setShowOfferPopup(false);
    hasTimerStartedRef.current = false; // 🧼 Reset the timer state
    if (rotationIntervalRef.current) clearInterval(rotationIntervalRef.current);
  };

  const openOfferPopup = () => {
    if (popupTimeoutRef.current) clearTimeout(popupTimeoutRef.current);
    startOfferFlow();
  };

  const CountdownTimer = ({ timeLeft }) => {
    const formatTime = (seconds) => {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
    };

    return (
      <span className="font-extrabold font-sans ml-1">
        {formatTime(timeLeft)}
      </span>
    );
  };

  // Load selections from localStorage on initial render
  useEffect(() => {
    const productData =
      JSON.parse(localStorage.getItem("selectedProducts")) || {};
    const boxData = JSON.parse(localStorage.getItem("selectedBoxes")) || {};
    const addonData = JSON.parse(localStorage.getItem("selectedAddons")) || [];

    setSelectedProducts(productData);
    setSelectedBoxes(boxData);
    setSelectedAddons(addonData);

    setLoading(false);
  }, []);

  // Sync selections and totals live whenever selections change
  useEffect(() => {
    // Save to localStorage
    localStorage.setItem("selectedProducts", JSON.stringify(selectedProducts));
    localStorage.setItem("selectedBoxes", JSON.stringify(selectedBoxes));
    localStorage.setItem("selectedAddons", JSON.stringify(selectedAddons));

    // Calculate total items count
    const productCount = Object.values(selectedProducts).reduce(
      (acc, item) => acc + (item.quantity || 0),
      0
    );
    const boxCount = Object.keys(selectedBoxes).length > 0 ? 1 : 0; // assuming one box max
    const addonCount = selectedAddons.length;
    const totalItemCount = productCount + boxCount + addonCount;
    setTotalItems(totalItemCount);

    // Calculate total price
    const productTotal = Object.values(selectedProducts).reduce(
      (acc, item) => acc + (parseFloat(item.price) * item.quantity || 0),
      0
    );
    const boxTotal = Object.values(selectedBoxes).reduce(
      (acc, item) => acc + parseFloat(item.price || 0),
      0
    );
    const addonTotal = selectedAddons.reduce(
      (acc, item) => acc + parseFloat(item.price || 0),
      0
    );
    const total = productTotal + boxTotal + addonTotal;
    setTotalPrice(total);
  }, [selectedProducts, selectedBoxes, selectedAddons]);

  function formatPrice(price) {
    return Number(price).toLocaleString("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    });
  }

  const handleUpdateProductQuantity = (productId, newQuantity) => {
    setSelectedProducts((prev) => {
      if (newQuantity <= 0) {
        const updated = { ...prev };
        delete updated[productId];
        return updated;
      }
      return {
        ...prev,
        [productId]: {
          ...prev[productId],
          quantity: newQuantity,
        },
      };
    });
  };

  const handleRemoveProduct = (id, type) => {
    if (type === "product") {
      setSelectedProducts((prev) => {
        const updated = { ...prev };
        delete updated[id];
        return updated;
      });
    } else if (type === "box") {
      setSelectedBoxes((prev) => {
        const updated = { ...prev };
        delete updated[id];
        return updated;
      });
    } else if (type === "addon") {
      setSelectedAddons((prev) => {
        return prev.filter((addon) => addon.id !== id);
      });
    }
  };

  // Fetch authentication token helper function
  const getAuthToken = async () => {
    try {
      // Check localStorage first
      const storedToken = localStorage.getItem("authToken");
      if (storedToken) return storedToken;

      // If no token, fetch new one
      const response = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: "admin",
          password: "Admin@123",
        }),
      });

      const data = await response.json();
      if (data.status === "success") {
        localStorage.setItem("authToken", data.token);
        return data.token;
      }
      throw new Error("Authentication failed");
    } catch (error) {
      console.error("Auth error:", error);
      throw error;
    }
  };

  // Fetch products with authentication
  useEffect(() => {
    async function fetchProducts() {
      try {
        setLoading(true);
        const token = await getAuthToken();

        const res = await fetch("/api/getProducts", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            filters: {
              page: 1,
              query: "",
              limit: 24,
              offset: 0,
              gifts_products: 1,
            },
          }),
        });

        if (!res.ok) {
          if (res.status === 401) {
            localStorage.removeItem("authToken");
            return fetchProducts(); // Retry with new token
          }
          throw new Error(`Failed to fetch products: ${res.status}`);
        }

        const data = await res.json();
        setAllProducts(data.data || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, []);

  // Fetch boxes with authentication
  useEffect(() => {
    async function fetchBoxes() {
      try {
        const token = await getAuthToken();
        const res = await fetch("/api/giftBox", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          if (res.status === 401) {
            localStorage.removeItem("authToken");
            return fetchBoxes(); // Retry with new token
          }
          throw new Error(`Failed to fetch boxes: ${res.status}`);
        }

        const data = await res.json();
        setAllBoxes(data.data || []);
      } catch (err) {
        setError(err.message);
      }
    }

    if (step === 2 && allBoxes.length === 0) {
      fetchBoxes();
    }
  }, [step, allBoxes.length]);

  // Fetch addons with authentication
  useEffect(() => {
    async function fetchAddons() {
      try {
        const token = await getAuthToken();
        const res = await fetch("/api/addGiftAddons", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          if (res.status === 401) {
            localStorage.removeItem("authToken");
            return fetchAddons(); // Retry with new token
          }
          throw new Error(`Failed to fetch addons: ${res.status}`);
        }

        const data = await res.json();
        setAllAddons(data.data || []);
      } catch (err) {
        setError(err.message);
      }
    }

    if (step === 3 && allAddons.length === 0) {
      fetchAddons();
    }
  }, [step, allAddons.length]);

  const canGoToStep = (targetStep) => {
    const productTotal = Object.entries(selectedProducts).reduce(
      (acc, [id, data]) => {
        const product = allProducts.find((p) => p.id === parseInt(id));
        return acc + (product ? product.price * (data?.quantity || 1) : 0);
      },
      0
    );

    if (targetStep === 2) return productTotal >= 1000;
    if (targetStep === 3 || targetStep === 4)
      return (
        productTotal >= 1000 &&
        Object.values(selectedBoxes).some((qty) => qty > 0)
      );
    return true;
  };

  const nextStep = () => setStep((prev) => Math.min(prev + 1, 4));
  const prevStep = () => setStep((prev) => Math.max(prev - 1, 1));

  // if (loading) return <p className="text-center py-20">Loading...</p>;
  if (error)
    return <p className="text-center py-20 text-red-600">Error: {error}</p>;

  const stepComponents = {
    1: (
      <>
        {showOfferPopup && (
          <motion.div
            initial={{ y: -200, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="fixed top-[20%] right-4 translate-y-[-50%] z-50 w-80 bg-white shadow-xl rounded-lg border-2 border-gray-300 overflow-hidden"
          >
            {/* Close Button */}
            <button
              onClick={closeOfferPopup}
              className="absolute top-2 right-2 z-50 text-white bg-black bg-opacity-50 hover:bg-opacity-80 rounded-full p-1"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>

            {/* Timer */}
            <div className="absolute z-40 top-2 left-2 right-2 bg-black bg-opacity-80 text-white text-xl uppercase font-light px-2 py-4 rounded-md flex justify-center items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              Sale ends in :
              <br />
              <span className="text-5xl font-extrabold text-red-500">
                <CountdownTimer timeLeft={timeLeft} />
              </span>
            </div>

            {/* Content */}
            <div className="p-4">
              <div className="relative hidden sm:flex  h-56 bg-gray-100 overflow-hidden mt-20">
                <div className="absolute inset-0 flex items-center justify-center">
                  {currentOffer?.image && (
                    <img
                      key={currentOffer.image}
                      src={getImageSrc(currentOffer.image)}
                      alt={currentOffer.title || "Image not found!"}
                      className={`w-full h-full object-cover transition-all duration-300 ${
                        isChanging
                          ? "opacity-0 scale-95"
                          : "opacity-100 scale-100"
                      }`}
                    />
                  )}
                </div>
              </div>

              <div
                className={`mt-2 transition-opacity duration-300 ${
                  isChanging ? "opacity-0" : "opacity-100"
                }`}
              >
                <h3 className="font-bold text-lg text-red-600 mt-20 sm:mt-0 mb-1">
                  Limited Time Offer!
                </h3>
                <p className="text-sm font-medium text-gray-800 line-clamp-2">
                  {currentOffer?.title}
                </p>
                <div className="flex items-center mt-2">
                  <span className="text-lg font-bold text-red-600">
                    ₹{currentOffer?.promo_price}
                  </span>
                  <span className="ml-2 text-sm text-gray-500 line-through">
                    ₹{currentOffer?.price}
                  </span>
                  <span className="ml-auto text-xs font-bold bg-red-100 text-red-600 px-2 py-0.5 rounded">
                    {currentOffer &&
                      Math.round(
                        (1 - currentOffer.promo_price / currentOffer.price) *
                          100
                      )}
                    % OFF
                  </span>
                </div>
              </div>

              <Link
                href={`/product/${currentOffer?.slug}`}
                className="mt-3 block w-full text-center bg-gradient-to-r from-red-800 to-red-900 hover:from-red-600 hover:to-red-700 text-white font-medium py-2 px-4 rounded-md shadow-md transition hover:shadow-lg"
                onClick={closeOfferPopup}
              >
                Shop Now →
              </Link>
            </div>
          </motion.div>
        )}

        {!showOfferPopup && (
          <button
            onClick={openOfferPopup}
            className="flex fixed bottom-40 right-6 z-[90] bg-white rounded-full p-3 shadow-lg transition"
          >
            <img
              src="/open-gift.gif"
              alt="Open Gift"
              className="w-8 md:w-14 h-8 md:h-14"
            />
          </button>
        )}

        <Step1
          onNext={nextStep}
          onBack={prevStep}
          selectedProducts={selectedProducts}
          setSelectedProducts={setSelectedProducts}
          allProducts={allProducts}
        />
      </>
    ),
    2: (
      <Step2
        onNext={nextStep}
        onBack={prevStep}
        selectedBoxes={selectedBoxes}
        setSelectedBoxes={setSelectedBoxes}
        allBoxes={allBoxes}
      />
    ),
    3: (
      <Step3
        onNext={nextStep}
        onBack={prevStep}
        selectedAddons={selectedAddons}
        setSelectedAddons={setSelectedAddons}
        allAddons={allAddons}
      />
    ),
    4: (
      <Step4
        selectedProducts={selectedProducts}
        selectedBoxes={selectedBoxes}
        selectedAddons={selectedAddons}
        allProducts={allProducts}
        allBoxes={allBoxes}
        allAddons={allAddons}
        totalPrice={totalPrice}
        formatPrice={formatPrice}
        onBack={prevStep}
        onUpdateProductQuantity={handleUpdateProductQuantity}
        onRemoveProduct={handleRemoveProduct}
      />
    ),
  };

  return (
    <div className="relative w-auto min-h-screen bg-white flex flex-col justify-between px-0 md:px-6 py-4 md:py-10">
      <div className="w-full px-0 md:px-8">
        <h2 className="text-[2.5rem] font-bold px-4 text-center text-black mb-6 md:mb-10 uppercase">
          Build Your Custom Gift Box
        </h2>

        <StepIndicator
          currentStep={step}
          setStep={setStep}
          canGoToStep={canGoToStep}
          cartTotal={totalPrice}
          setErrorMessage={setErrorMessage}
        />

        {errorMessage && (
          <div className="text-red-600 text-center font-medium mb-4">
            {errorMessage}
          </div>
        )}

        <div className="mt-8 px-8 mb-4 relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.4 }}
              className="w-full"
            >
              {stepComponents[step]}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <BottomBar
        step={step}
        setStep={setStep}
        nextStep={nextStep}
        totalItems={totalItems}
        totalPrice={totalPrice}
        selectedBoxes={selectedBoxes}
        selectedAddons={selectedAddons}
        selectedProducts={selectedProducts}
        allProducts={allProducts}
        allBoxes={allBoxes}
        allAddons={allAddons}
        formatPrice={formatPrice}
        isModalOpen={isModalOpen}
        setIsModalOpen={setIsModalOpen}
        handleUpdateProductQuantity={handleUpdateProductQuantity}
        handleRemoveProduct={handleRemoveProduct}
      />
    </div>
  );
}
