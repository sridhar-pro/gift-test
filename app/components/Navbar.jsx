"use client";
import { ChevronDown, Heart, Menu, ShoppingCart, User, X } from "lucide-react";
import { IoMdArrowRoundForward, IoMdArrowRoundBack } from "react-icons/io";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import SearchBar from "./SearchBar";
import { useRouter } from "next/navigation";
import BundleView from "./BuildCustomBox/Bundlefile";

const messages = [
  "Unlock exclusive savings: Enjoy 25% off on all Sanskruthi Solutions products!",
  "Enjoy free shipping on orders above Rs. 1000!",
];

export default function Navbar({
  // Pass all required props from your parent component
  selectedProducts,
  selectedBoxes,
  selectedAddons,
  allProducts,
  allBoxes,
  allAddons,
  formatPrice,
  handleUpdateProductQuantity,
  handleRemoveProduct,
  step,
  setStep,
  nextStep,
}) {
  const [language, setLanguage] = useState("EN");
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [origin, setOrigin] = useState("");
  const languages = ["EN", "GU", "HI", "TA", "TE"];

  const [isModalOpen, setIsModalOpen] = useState(false);
  const modalRef = useRef(null);

  const [isSearchExpanded, setIsSearchExpanded] = useState(false);

  const [productsOpen, setProductsOpen] = useState(false);
  const [productCategories, setProductCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isProductsOpen, setIsProductsOpen] = useState(false);
  const [isOdopOpen, setIsOdopOpen] = useState(false);

  const router = useRouter();

  // Fetch categories with authentication
  useEffect(() => {
    if (typeof window !== "undefined") {
      setOrigin(window.location.origin);
    }

    const fetchCategories = async () => {
      try {
        setLoading(true);

        // 1. Get or refresh authentication token
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
          if (authData.status === "success") {
            authToken = authData.token;
            localStorage.setItem("authToken", authToken);
          } else {
            throw new Error("Authentication failed");
          }
        }

        // 2. Make authenticated request
        const response = await fetch("/api/homeCategory", {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        });

        // 3. Handle unauthorized responses
        if (!response.ok) {
          if (response.status === 401) {
            localStorage.removeItem("authToken");
            return fetchCategories();
          }
          throw new Error(`Request failed with status ${response.status}`);
        }

        const data = await response.json();

        // 4. Process response data - handle both array and object formats
        let categories = [];
        if (Array.isArray(data)) {
          categories = data;
        } else if (Array.isArray(data?.data)) {
          categories = data.data;
        } else {
          console.warn("Unexpected API response structure:", data);
          categories = [];
        }

        setProductCategories(categories);
        // console.log("Processed categories:", categories);
      } catch (error) {
        console.error("Failed to fetch categories:", error);
        setProductCategories([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Marquee navigation handlers
  const handleNext = () => {
    setDirection(1);
    setIndex((prev) => (prev + 1) % messages.length);
  };

  const handlePrev = () => {
    setDirection(-1);
    setIndex((prev) => (prev - 1 + messages.length) % messages.length);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      handleNext();
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      {/* Top Marquee */}
      <div className="bg-black text-white text-xs md:text-sm lg:text-base h-10 flex items-center justify-center font-serif relative overflow-hidden">
        <button onClick={handlePrev} className="absolute left-5 md:left-48">
          <IoMdArrowRoundBack className="w-4 h-4 text-white opacity-90" />
        </button>

        <div className="relative w-full max-w-[300px] md:max-w-full flex justify-center items-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={index}
              initial={{ x: direction === 1 ? 100 : -100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: direction === 1 ? -100 : 100, opacity: 0 }}
              transition={{ duration: 0.6 }}
              className="absolute text-center px-4"
            >
              {messages[index]}
            </motion.div>
          </AnimatePresence>
        </div>

        <button onClick={handleNext} className="absolute right-5 md:right-48">
          <IoMdArrowRoundForward className="w-4 h-4 text-white opacity-90" />
        </button>
      </div>

      {/* Main Navbar */}
      <nav className="bg-[#f9f9f959] shadow-sm px-6 py-3 md:py-8 top-0 z-[100] font-serif">
        <div className="flex justify-between items-center w-full ">
          {/* Logo */}
          <Link href="https://shop.yuukke.com/" className="flex items-center">
            <div className="relative w-[100px] h-[50px] lg:w-[170px] lg:h-[45px]">
              <Image
                src="/logo.png"
                alt="MyGiftBox Logo"
                fill
                priority
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                className="object-contain"
              />
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex space-x-6 text-base font-medium text-neutral-500 tracking-wider flex-shrink">
            <div className="flex items-center space-x-12">
              {/* Products Dropdown */}
              <div className="relative group">
                <button className="hover:text-black transition flex items-center gap-1 cursor-pointer py-2">
                  Products
                  <ChevronDown className="w-4 h-4 mt-1 transition-transform group-hover:rotate-180" />
                </button>
                <div className="absolute left-0 top-full mt-2 w-[40rem] bg-white border border-gray-200 rounded-xl shadow-xl z-50 p-6 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 ease-out pointer-events-auto">
                  {loading ? (
                    <div className="grid grid-cols-3 gap-4">
                      {[...Array(6)].map((_, i) => (
                        <div key={i} className="animate-pulse">
                          <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-2"></div>
                          <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto"></div>
                        </div>
                      ))}
                    </div>
                  ) : productCategories.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {productCategories.map((category) => (
                        <a
                          key={category.id}
                          href={`https://marketplace.yuukke.com/category/${category.slug}`}
                          className="group flex flex-col items-center hover:bg-gray-50 rounded-lg p-3 transition-colors"
                        >
                          <span className="text-sm font-medium text-gray-800 group-hover:text-black text-center">
                            {category.name}
                          </span>
                        </a>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4 text-gray-500">
                      No categories found
                    </div>
                  )}
                </div>
              </div>

              {/* ODOP Dropdown */}
              <div className="relative group">
                <Link
                  href="#"
                  className="hover:text-black transition flex items-center gap-1 py-2"
                >
                  ODOP
                  <ChevronDown className="w-4 h-4 mt-1 transition-transform group-hover:rotate-180" />
                </Link>
                <div className="absolute left-0 top-full mt-2 bg-white border border-gray-200 rounded-lg shadow-xl z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 ease-out px-4 py-3 pointer-events-auto w-48">
                  <a
                    href={`${
                      process.env.NEXT_PUBLIC_BASE_URL
                    }/odop/uttar-pradesh?returnUrl=${encodeURIComponent(
                      origin
                    )}`}
                    className="block px-4 py-2 hover:bg-gray-100 text-gray-800 text-sm rounded transition-colors"
                  >
                    Uttar Pradesh
                  </a>
                  <a
                    href={`${
                      process.env.NEXT_PUBLIC_BASE_URL
                    }/odop_register?returnUrl=${encodeURIComponent(origin)}`}
                    className="block px-4 py-2 hover:bg-gray-100 text-gray-800 text-sm rounded transition-colors mt-1"
                  >
                    ODOP Registration
                  </a>
                </div>
              </div>
            </div>

            <a
              href="https://shop.yuukke.com/products/offers"
              className="hover:text-black transition py-2"
            >
              Offers
            </a>

            <Link href="/" className="hover:text-black transition py-2">
              Gifts
            </Link>
          </div>

          {/* Right Side Icons */}
          <div className="hidden md:flex items-center space-x-6 flex-shrink-0">
            <SearchBar />
            <button
              aria-label="Profile"
              onClick={() =>
                (window.location.href = `https://shop.yuukke.com/login`)
              }
              className="flex items-center justify-center"
            >
              <User className="w-5 h-5 text-black" />
            </button>
            <a
              href="https://marketplace.yuukke.com/shop/wishlist"
              aria-label="Favorites"
              className="flex items-center justify-center"
            >
              <Heart className="w-5 h-5 text-black cursor-pointer" />
            </a>
            <button
              onClick={() => router.push("/checkout")}
              aria-label="Cart"
              className="relative flex items-center justify-center hover:scale-105 transition-transform"
            >
              <ShoppingCart className="w-5 h-5 text-black" />
            </button>
          </div>

          {/* Mobile Hamburger Button */}
          <div className="md:hidden flex items-center gap-3">
            {/* Search on Mobile */}
            <SearchBar />

            {/* Mobile Cart */}
            <button
              onClick={() => router.push("/checkout")}
              aria-label="Cart"
              className="relative flex items-center justify-center hover:scale-105 transition-transform"
            >
              <ShoppingCart className="w-5 h-5 text-black" />
            </button>

            {/* Mobile Menu Toggler */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle Menu"
              className="flex items-center justify-center"
            >
              {mobileMenuOpen ? (
                <X className="w-7 h-7 text-gray-900" />
              ) : (
                <Menu className="w-7 h-7 text-gray-900" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 px-4 space-y-3 text-sm text-gray-700">
            {/* Products */}
            <button
              onClick={() => setIsProductsOpen(!isProductsOpen)}
              className="w-full text-left font-medium hover:text-black transition"
            >
              Products {isProductsOpen ? "▲" : "▼"}
            </button>
            {isProductsOpen && (
              <div className="ml-4 mt-2 space-y-1 text-gray-600">
                {productCategories.map((category) => (
                  <a
                    key={category.id}
                    href={`https://marketplace.yuukke.com/category/${category.slug}`}
                    className="block px-4 py-2 hover:bg-gray-100 text-gray-800 text-sm rounded"
                  >
                    {category.name}
                  </a>
                ))}
              </div>
            )}

            {/* ODOP */}
            <button
              onClick={() => setIsOdopOpen(!isOdopOpen)}
              className="w-full text-left font-medium hover:text-black transition"
            >
              ODOP {isOdopOpen ? "▲" : "▼"}
            </button>
            {isOdopOpen && (
              <div className="ml-4 mt-2 space-y-1 text-gray-600">
                <a
                  href={`${
                    process.env.NEXT_PUBLIC_BASE_URL
                  }/odop/uttar-pradesh?returnUrl=${encodeURIComponent(origin)}`}
                  className="block px-4 py-2 hover:bg-gray-100 text-gray-800 text-sm rounded"
                >
                  Uttar Pradesh
                </a>
                <a
                  href={`${
                    process.env.NEXT_PUBLIC_BASE_URL
                  }/odop_register?returnUrl=${encodeURIComponent(origin)}`}
                  className="block px-4 py-2 hover:bg-gray-100 text-gray-800 text-sm rounded"
                >
                  ODOP Registration
                </a>
              </div>
            )}

            {/* Offers & Gifts */}
            <a
              href="https://shop.yuukke.com/products/offers"
              className="block py-1 hover:text-black transition"
            >
              Offers
            </a>
            <Link href="/" className="block py-1 hover:text-black transition">
              Gifts
            </Link>
          </div>
        )}
        {/* <AnimatePresence>
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
                onClick={(e) => e.stopPropagation()}
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
        </AnimatePresence> */}
      </nav>
    </>
  );
}
