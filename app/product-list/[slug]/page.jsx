"use client";
import { Suspense, useEffect, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter, useParams } from "next/navigation";
import PopupForm from "../../components/PopupForm2";
import Related from "../../Home/Related";
import PopupForm1 from "../../components/PopupForm";
import {
  ArrowLeft,
  Minus,
  Plus,
  ArrowRight,
  MessageCircle,
  ShoppingCart,
} from "lucide-react";
import {
  categoryContent,
  staticProducts,
  categoryContentsMap,
} from "@/app/data/products";

function ProductListInner() {
  const router = useRouter();
  const params = useParams();
  const slug = params?.slug; // ✅ Always defined now

  const [category, setCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeImg, setActiveImg] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const [selectedOption, setSelectedOption] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [savedVariants, setSavedVariants] = useState(() => {
    // Load previously saved variants from localStorage on mount
    if (typeof window !== "undefined") {
      return JSON.parse(localStorage.getItem("selectedVariants")) || {};
    }
    return {};
  });

  const [isPopupOpen, setIsPopupOpen] = useState(false);

  const openPopup = () => setIsPopupOpen(true);
  const closePopup = () => setIsPopupOpen(false);

  const [isOpen, setIsOpen] = useState(false);
  const [formMode, setFormMode] = useState("quotation");

  const increaseQuantity = () =>
    setQuantity((prev) => (prev < 10 ? prev + 1 : 10));

  const decreaseQuantity = () =>
    setQuantity((prev) => (prev > 1 ? prev - 1 : 1));

  // ✅ Utility: slugify function for consistent comparison
  const slugify = (text) =>
    text
      ?.toString()
      ?.toLowerCase()
      ?.trim()
      ?.replace(/\s+/g, "-")
      ?.replace(/[^\w\-]+/g, "")
      ?.replace(/\-\-+/g, "-");

  // ✅ Find matching category by name instead of ID
  const findCategoryBySlug = (slug) => {
    for (const [id, content] of Object.entries(categoryContent)) {
      if (slugify(content.name) === slug) {
        return { id, ...content };
      }
    }
    return null;
  };

  useEffect(() => {
    if (!slug) return;

    try {
      setLoading(true);

      // ✅ Find the category based on slug
      const matchedCategory = findCategoryBySlug(slug);

      if (!matchedCategory) {
        console.warn(`❌ No category found for slug: ${slug}`);
        router.push("/"); // fallback to home if slug is invalid
        return;
      }

      setCategory(matchedCategory);

      // ✅ Fetch products based on category name instead of ID
      // You can replace this with API call if products are dynamic
      setProducts(staticProducts[matchedCategory.id] || staticProducts.default);

      // ✅ Save selected category for later use
      localStorage.setItem("selectedCategoryId", matchedCategory.id);
    } catch (err) {
      console.error("Error initializing page:", err);
    } finally {
      setLoading(false);
    }
  }, [slug, router]);

  const currentCategoryContent =
    categoryContent[category?.id] || categoryContent["default"];

  const defaultCatalogue =
    currentCategoryContent?.name || currentCategoryContent;

  const allImages = products.flatMap((p) =>
    p.images?.length > 0 ? p.images : [p.image]
  );

  useEffect(() => {
    if (allImages.length > 0) {
      setActiveImg(allImages[0]);
    } else {
      setActiveImg(null);
    }
  }, [products]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#A00030]"></div>
      </div>
    );
  }

  const handleCheckout = () => {
    const payload = {
      product: selectedProduct,
      category,
      categoryContent: currentCategoryContent,
      quantity,
      selectedVariants: savedVariants, // ✅ store selected variants
      selectedContents:
        currentCategoryContent?.name === "Signature Conscious"
          ? [
              savedVariants["Eco Coffee Mug 220 ml"] || "Eco Coffee Mug 220 ml",
              savedVariants["Fabric Cover Notebook"] || "Fabric Cover Notebook",
              savedVariants["Metal Flower Shape Candle"] ||
                "Metal Flower Shape Candle",
              savedVariants["Mixed Dry Fruits 100gm"] ||
                "Mixed Dry Fruits 100gm",
            ]
          : categoryContentsMap[currentCategoryContent?.name] || [],
    };

    sessionStorage.setItem("checkoutData", JSON.stringify(payload));
    router.push("/checkout");
  };
  const handleBack = () => {
    router.back();
  };

  return (
    <div className="min-h-screen bg-gray-50 font-gift">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={handleBack}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                <ArrowLeft className="h-6 w-6 text-gray-700" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {category?.name || "Gift Products"}
                </h1>
                <p className="text-gray-600">
                  {products.length} products available
                </p>
              </div>
            </div>

            {/* Common Order Button - Moved to top right */}
            {/* <button
              onClick={handleOrderNow}
              className="px-6 py-2 bg-[#A00030] text-white rounded-lg hover:bg-[#800025] transition-colors text-sm font-medium hidden md:block"
            >
              Order This Collection
            </button> */}
          </div>
        </div>
      </div>

      {/* Category Content Section */}
      <div className="container mx-auto px-4 py-8">
        {/* Products Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Side - Hero + Thumbnails */}
          <div className="flex flex-col gap-4">
            <div className="flex md:hidden">
              <h2 className="text-3xl font-bold text-[#A00030] mb-3">
                {currentCategoryContent.title}
              </h2>
            </div>
            {/* Hero Image */}
            <motion.div
              key={activeImg}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="relative w-full aspect-square bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl overflow-hidden shadow-md"
            >
              <Image
                src={activeImg || "/default-product.jpg"}
                alt="Selected product"
                fill
                className="object-contain p-6"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </motion.div>

            {/* Thumbnails */}
            <div className="flex gap-3 overflow-x-auto scrollbar-hide">
              {allImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImg(img)}
                  className={`relative w-20 h-20 flex-shrink-0 rounded-md border overflow-hidden ${
                    activeImg === img
                      ? "border-gray-800"
                      : "border-gray-200 hover:border-gray-400"
                  }`}
                >
                  <Image
                    src={img || "/default-product.jpg"}
                    alt={`thumb-${idx}`}
                    fill
                    className="object-contain p-1"
                  />
                </button>
              ))}
            </div>

            {/* Description */}
            <p className="text-gray-700  text-justify">
              {currentCategoryContent.description}
            </p>
            {/* Mobile Price & Checkout Section */}
            <div className="flex md:hidden flex-col w-full mt-4 space-y-3">
              {/* Price Section */}
              <div className="mb-6">
                <p className="text-3xl font-bold text-gray-900">
                  ₹{" "}
                  {((currentCategoryContent.price / 100) * quantity).toFixed(2)}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  (₹ {(currentCategoryContent.price / 100).toFixed(2)} per item
                  · TAX included · FREE Shipping)
                </p>
              </div>

              {/* Quantity + Button Wrapper */}
              <div className="flex flex-col xs:flex-row items-stretch xs:items-center gap-3 w-full">
                {/* Quantity Selector */}
                <div className="flex items-center justify-between border border-gray-300 rounded-lg shadow-sm w-full xs:w-auto">
                  <button
                    onClick={decreaseQuantity}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 transition disabled:opacity-50"
                    disabled={quantity === 1}
                  >
                    <Minus className="h-4 w-4 text-gray-600" />
                  </button>
                  <span className="px-4 py-2 font-semibold text-gray-800 select-none min-w-[30px] text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={increaseQuantity}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 transition"
                  >
                    <Plus className="h-4 w-4 text-gray-600" />
                  </button>
                </div>

                {/* Pay & Proceed Button */}
                <button
                  onClick={handleCheckout}
                  className="bg-black hover:bg-gray-800 text-white font-semibold px-6 py-3 rounded-lg shadow transition-all w-full xs:w-auto mb-0"
                >
                  Pay & Proceed
                </button>

                <button
                  onClick={() => {
                    setFormMode("prebooking");
                    setIsOpen(true);
                  }}
                  className="flex items-center justify-center gap-2 px-8 py-4 rounded-md text-white text-md font-semibold bg-[linear-gradient(135deg,hsl(0,50%,30%),hsl(345,70%,40%),hsl(0,60%,50%))] hover:opacity-90 hover:scale-105 transform transition-all duration-300 w-full sm:w-auto"
                >
                  Prebook Now
                  <ArrowRight className="h-5 w-5 text-white" />
                </button>

                <PopupForm1
                  isOpen={isOpen}
                  onClose={() => setIsOpen(false)}
                  mode={formMode}
                  defaultCatalogue={defaultCatalogue} // ✅ Use the derived variable directly
                />
              </div>
              {categoryContentsMap[currentCategoryContent?.name] && (
                <div className="mt-4 mb-8">
                  <h3 className="font-semibold text-gray-800 mb-2">
                    Contents:
                  </h3>
                  <ul className="list-disc list-inside space-y-1 text-gray-700">
                    {currentCategoryContent?.name === "Signature Consicious"
                      ? [
                          // Use selected variants if any, else fall back to defaults
                          savedVariants["Eco Coffee Mug 220 ml"] ||
                            "Eco Coffee Mug 220 ml",
                          savedVariants["Fabric Cover Notebook"] ||
                            "Fabric Cover Notebook",
                          savedVariants["Metal Flower Shape Candle"] ||
                            "Metal Flower Shape Candle",
                          savedVariants["Mixed Dry Fruits 100gm"] ||
                            "Mixed Dry Fruits 100gm",
                        ].map((item, idx) => <li key={idx}>{item}</li>)
                      : categoryContentsMap[currentCategoryContent.name].map(
                          (item, idx) => <li key={idx}>{item}</li>
                        )}
                  </ul>
                </div>
              )}
            </div>

            {/* === New Section: Choose Options (only for category 888) === */}
            {currentCategoryContent?.name === "Signature Consicious" && (
              <div className="mt-4">
                <h3 className="font-semibold text-gray-800 mb-2">
                  Choose Options:
                </h3>
                <div className="space-y-2">
                  {[
                    {
                      name: "Eco Coffee Mug 220 ml",
                      variants: [
                        {
                          name: "Premium Coffee Mug - Black",
                          image: "/product-list/coffeemugblack.png",
                        },
                        {
                          name: "Premium Coffee Mug - Sandal",
                          image: "/product-list/coffeemugsandal.png",
                        },
                      ],
                    },
                    {
                      name: "Fabric Cover Notebook",
                      variants: [
                        {
                          name: "Bamboo Diary",
                          image: "/product-list/14.jpg",
                        },
                        {
                          name: "Blue Diary",
                          image: "/product-list/13.jpg",
                        },
                        {
                          name: "Cork and Red Diary",
                          image: "/product-list/12.jpg",
                        },
                        {
                          name: "Cork Diary",
                          image: "/product-list/11.jpg",
                        },
                        {
                          name: "Cork Fabric Diary",
                          image: "/product-list/10.jpg",
                        },
                        {
                          name: "Cork Visiting Card",
                          image: "/product-list/9.jpg",
                        },
                        {
                          name: "Kalamkari Notebook",
                          image: "/product-list/8.jpg",
                        },
                      ],
                    },
                    {
                      name: "Metal Flower Shape Candle",
                      variants: [
                        {
                          name: "Metal Flower Candle Variant",
                          image: "/product-list/3.jpg",
                        },
                      ],
                    },
                    {
                      name: "Mixed Dry Fruits 100gm",
                      variants: [
                        {
                          name: "Mixed Dry Fruits 100gm",
                          image: "/product-list/mixednuts.png",
                        },
                      ],
                    },
                  ].map((item, idx) => {
                    const selectedVariantName = savedVariants[item.name]; // get saved variant for this option
                    return (
                      <button
                        key={idx}
                        onClick={() => setSelectedOption(item)}
                        className="w-full flex items-center justify-between px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition"
                      >
                        <span className="text-gray-800">
                          {/* If variant is selected, show it; else show base option name */}
                          {selectedVariantName || item.name}
                        </span>

                        {/* Always show "Change Option" */}
                        <span className="text-sm bg-[#a00300] text-white p-1 font-bold rounded-md ml-2">
                          Change Option
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* === Popup / Modal for Variants === */}
            <AnimatePresence>
              {selectedOption && (
                <motion.div
                  className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <motion.div
                    className="bg-white rounded-xl p-6 w-[35rem] shadow-lg relative"
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                  >
                    {/* Close Button */}
                    <button
                      onClick={() => {
                        setSelectedOption(null);
                        setSelectedVariant(null);
                      }}
                      className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
                    >
                      ✕
                    </button>

                    <h4 className="font-bold text-lg mb-4">
                      {selectedOption.name} - Variants
                    </h4>

                    <div className="grid grid-cols-2 gap-4">
                      {selectedOption.variants.map((variant, idx) => {
                        const isSelected =
                          selectedVariant?.name === variant.name;
                        return (
                          <div
                            key={idx}
                            onClick={() => {
                              setSelectedVariant(variant);

                              // Save to localStorage
                              const updatedVariants = {
                                ...savedVariants,
                                [selectedOption.name]: variant.name, // use option name as key
                              };
                              setSavedVariants(updatedVariants);
                              localStorage.setItem(
                                "selectedVariants",
                                JSON.stringify(updatedVariants)
                              );
                            }}
                            className={`flex flex-col items-center p-2 border rounded-lg transition cursor-pointer ${
                              isSelected
                                ? "border-red-500 bg-red-50 shadow-md"
                                : "border-gray-300 hover:shadow-md"
                            }`}
                          >
                            <img
                              src={variant.image}
                              alt={variant.name}
                              className="w-20 h-20 object-cover rounded-md mb-2"
                            />
                            <span
                              className={`text-sm ${
                                isSelected
                                  ? "text-red-600 font-semibold"
                                  : "text-gray-700"
                              }`}
                            >
                              {variant.name}
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    {/* Confirm Selection (optional) */}
                    {selectedVariant && (
                      <div className="mt-6 flex justify-end">
                        <button
                          onClick={() => {
                            // console.log("User selected:", selectedVariant);
                            setSelectedOption(null); // close modal
                          }}
                          className="px-4 py-2 bg-[#a00300] text-white rounded-lg hover:bg-red-700 transition"
                        >
                          Confirm
                        </button>
                      </div>
                    )}
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Wrapper for Key Features + Static Images */}
            <div className="flex flex-col lg:flex-row lg:gap-6 border-t pt-4">
              {/* Left: Key Features */}
              <div className="flex-1">
                <h3 className="font-semibold text-gray-800 mb-3">
                  Key Features:
                </h3>
                <ul className="space-y-2">
                  {currentCategoryContent.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <span className="mr-2">•</span>
                      <span className="text-gray-600">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Right: Static Badges */}
            <div className="mt-8 lg:mt-10">
              {/* <h3 className="text-lg font-semibold text-gray-800 mb-3">
                Trusted By:
              </h3> */}
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-4 items-center justify-items-center">
                {[
                  "1.webp",
                  "2.webp",
                  "3.webp",
                  "4.webp",
                  "5.webp",
                  "6.webp",
                ].map((img, i) => (
                  <div
                    key={i}
                    className="w-20 h-20 sm:w-24 sm:h-24 flex justify-center items-center"
                  >
                    <Image
                      src={`/${img}`}
                      alt={`badge-${i + 1}`}
                      width={96}
                      height={96}
                      className="object-contain"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Side - Product Details */}
          <div className="p-6">
            <div className="hidden md:flex flex-col justify-start">
              {/* Title */}
              <h2 className="text-3xl font-bold text-[#A00030] mb-3">
                {currentCategoryContent.title}
              </h2>

              {/* Price Section */}
              <div className="mb-6">
                <p className="text-3xl font-bold text-gray-900">
                  ₹{" "}
                  {((currentCategoryContent.price / 100) * quantity).toFixed(2)}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  (₹ {(currentCategoryContent.price / 100).toFixed(2)} per item
                  · TAX included · FREE Shipping)
                </p>
              </div>

              {categoryContentsMap[currentCategoryContent?.name] && (
                <div className="mt-4 mb-8">
                  <h3 className="font-semibold text-gray-800 mb-2">
                    Contents:
                  </h3>
                  <ul className="list-disc list-inside space-y-1 text-gray-700">
                    {currentCategoryContent?.name === "Signature Consicious"
                      ? [
                          // Use selected variants if any, else fall back to defaults
                          savedVariants["Eco Coffee Mug 220 ml"] ||
                            "Eco Coffee Mug 220 ml",
                          savedVariants["Fabric Cover Notebook"] ||
                            "Fabric Cover Notebook",
                          savedVariants["Metal Flower Shape Candle"] ||
                            "Metal Flower Shape Candle",
                          savedVariants["Mixed Dry Fruits 100gm"] ||
                            "Mixed Dry Fruits 100gm",
                        ].map((item, idx) => <li key={idx}>{item}</li>)
                      : categoryContentsMap[currentCategoryContent.name].map(
                          (item, idx) => <li key={idx}>{item}</li>
                        )}
                  </ul>
                </div>
              )}
              <div className="hidden md:flex items-center gap-6 mt-4">
                {/* Quantity Selector */}
                <div className="flex items-center border border-gray-300 rounded-full overflow-hidden shadow-md bg-white transition-all duration-300 hover:shadow-lg">
                  <button
                    onClick={decreaseQuantity}
                    className="px-4 py-3 bg-gray-100 hover:bg-gray-200 transition disabled:opacity-40 disabled:cursor-not-allowed"
                    disabled={quantity === 1}
                    aria-label="Decrease Quantity"
                  >
                    <Minus className="h-5 w-5 text-gray-700" />
                  </button>
                  <span className="px-5 py-3 font-semibold text-gray-900 text-lg min-w-[40px] text-center select-none">
                    {quantity}
                  </span>
                  <button
                    onClick={increaseQuantity}
                    className="px-4 py-3 bg-gray-100 hover:bg-gray-200 transition"
                    aria-label="Increase Quantity"
                  >
                    <Plus className="h-5 w-5 text-gray-700" />
                  </button>
                </div>

                {/* Pay & Proceed Button */}
                <button
                  onClick={handleCheckout}
                  className="bg-black hover:bg-gray-800 text-white font-semibold px-6 py-3 rounded-md shadow transition-all"
                >
                  Pay & Proceed
                </button>

                <button
                  onClick={() => {
                    setFormMode("prebooking");
                    setIsOpen(true);
                  }}
                  className="flex items-center justify-center gap-2 px-8 py-4 rounded-md text-white text-md font-semibold bg-[linear-gradient(135deg,hsl(0,50%,30%),hsl(345,70%,40%),hsl(0,60%,50%))] hover:opacity-90 hover:scale-105 transform transition-all duration-300 w-full sm:w-auto"
                >
                  Prebook Now
                  <ArrowRight className="h-5 w-5 text-white" />
                </button>

                <PopupForm1
                  isOpen={isOpen}
                  onClose={() => setIsOpen(false)}
                  mode={formMode}
                  defaultCatalogue={defaultCatalogue} // ✅ Use the derived variable directly
                />
              </div>
            </div>

            <div>
              {/* ⬇️ Related Products Section */}
              <div className="mt-12">
                <h3 className="text-2xl font-bold mb-4">You may also like</h3>
                <Related />

                {/* 🌟 Enquiry Section */}
                <div className="mt-12 text-center">
                  {/* Heading */}
                  <h4 className="text-2xl font-semibold text-gray-800">
                    Have a Question or Need Bulk Orders?
                  </h4>
                  <p className="mt-2 text-gray-600 text-sm sm:text-base max-w-xl mx-auto">
                    Click on{" "}
                    <span className="font-semibold text-[#a00300] cursor-pointer">
                      "Enquire Now"
                    </span>{" "}
                    to discuss this hamper or explore more options. You can also
                    reach us via <br className="flex md:hidden" />
                    <span className="font-semibold text-[#a00300]">
                      email
                    </span>{" "}
                    at{" "}
                    <a
                      href="mailto:hello@thegoodroad.in"
                      className="font-semibold text-[#a00300] hover:underline"
                    >
                      support@yuukke.com
                    </a>{" "}
                    .
                  </p>

                  {/* Enquiry Button */}
                  <div className="mt-6 flex justify-center">
                    <button
                      onClick={openPopup}
                      className="group relative inline-flex items-center justify-center gap-2 px-6 py-3
          text-white font-semibold text-base
          rounded-md bg-gradient-to-r from-[#a00300] via-[#b30000] to-[#ff4d4d]
          shadow-md shadow-red-300/30 hover:shadow-red-400/50
          transition-all duration-300 ease-in-out
          transform hover:scale-105 hover:-translate-y-1
          focus:outline-none focus:ring-4 focus:ring-red-300"
                    >
                      <MessageCircle className="w-5 h-5" />
                      <span className="relative z-10">Enquire Now</span>
                      <span className="absolute inset-0 rounded-md bg-gradient-to-r from-[#ff6b6b] to-[#a00300] opacity-0 group-hover:opacity-20 transition duration-300"></span>
                    </button>
                  </div>

                  {/* Trust Note */}
                  <p className="mt-3 text-xs text-gray-500">
                    We usually reply within{" "}
                    <span className="font-semibold text-[#a00300]">
                      24 hours
                    </span>
                    .
                  </p>
                </div>
              </div>

              {/* ⬇️ Popup Form */}
              <PopupForm1 isOpen={isPopupOpen} onClose={closePopup} />
            </div>
          </div>
        </div>
        {products.length === 0 && (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
              <ShoppingCart className="h-8 w-8 text-gray-400" />
            </div>
            <p className="text-gray-500">No products found in this category.</p>
            <button
              onClick={handleBack}
              className="mt-4 px-6 py-2 bg-[#A00030] text-white rounded-lg hover:bg-[#800025] transition-colors"
            >
              Browse Categories
            </button>
          </div>
        )}
      </div>

      {/* Payment Form Popup */}
      <PopupForm
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        product={selectedProduct}
        category={category}
        categoryContent={currentCategoryContent}
        defaultCatalogue={defaultCatalogue}
      />
    </div>
  );
}

export default function ProductList() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      }
    >
      <ProductListInner />
    </Suspense>
  );
}

{
  /* Content Container */
}
{
  /* <div className="p-4 flex flex-col flex-grow">
                <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 text-sm md:text-base">
                  {product.name}
                </h3>
                <p className="text-gray-600 text-xs md:text-sm mb-3 line-clamp-2 flex-grow">
                  {product.description}
                </p>
                <div className="flex items-center justify-between mt-auto">
                  <span className="text-lg font-bold text-[#A00030]">
                    {product.price}
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleAddToCart(product.id)}
                      className="p-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors flex items-center justify-center"
                    >
                      <ShoppingCart className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleOrderNow(product)}
                      className="px-4 py-2 bg-[#A00030] text-white rounded-lg hover:bg-[#800025] transition-colors text-sm md:hidden"
                    >
                      Order
                    </button>
                  </div>
                </div>
              </div> */
}

{
  /* Additional Images Section */
}
{
  /* <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mt-12">
          <div className="bg-white rounded-xl shadow-sm p-6 flex flex-col items-center">
            <div className="relative w-24 h-24 rounded-full bg-gray-50 overflow-hidden mb-4">
              <Image
                src="/icon-product/1.webp"
                alt="Consciously Crafted"
                width={300}
                height={300}
                className="object-contain p-5"
                sizes="(max-width: 768px) 96px, 96px"
              />
            </div>
            <div className="text-center">
              <h3 className="font-semibold text-gray-900">
                CONSCIOUSLY CRAFTED
              </h3>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 flex flex-col items-center">
            <div className="relative w-24 h-24 rounded-full bg-gray-50 overflow-hidden mb-4">
              <Image
                src="/icon-product/2.webp"
                alt="Premium Quality"
                width={300}
                height={300}
                className="object-contain p-5"
                sizes="(max-width: 768px) 96px, 96px"
              />
            </div>
            <div className="text-center">
              <h3 className="font-semibold text-gray-900">PREMIUM QUALITY</h3>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 flex flex-col items-center">
            <div className="relative w-24 h-24 rounded-full bg-gray-50 overflow-hidden mb-4">
              <Image
                src="/icon-product/3.webp"
                alt="On-Time Delivery"
                width={300}
                height={300}
                className="object-contain p-5"
                sizes="(max-width: 768px) 96px, 96px"
              />
            </div>
            <div className="text-center">
              <h3 className="font-semibold text-gray-900">ON-TIME DELIVERY</h3>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 flex flex-col items-center">
            <div className="relative w-24 h-24 rounded-full bg-gray-50 overflow-hidden mb-4">
              <Image
                src="/icon-product/4.webp"
                alt="Eco Friendly"
                width={300}
                height={300}
                className="object-contain p-5"
                sizes="(max-width: 768px) 96px, 96px"
              />
            </div>
            <div className="text-center">
              <h3 className="font-semibold text-gray-900">ECO FRIENDLY</h3>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 flex flex-col items-center">
            <div className="relative w-24 h-24 rounded-full bg-gray-50 overflow-hidden mb-4">
              <Image
                src="/icon-product/5.webp"
                alt="Artisan Made"
                width={300}
                height={300}
                className="object-contain p-5"
                sizes="(max-width: 768px) 96px, 96px"
              />
            </div>
            <div className="text-center">
              <h3 className="font-semibold text-gray-900">ARTISAN MADE</h3>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 flex flex-col items-center">
            <div className="relative w-24 h-24 rounded-full bg-gray-50 overflow-hidden mb-4">
              <Image
                src="/icon-product/6.webp"
                alt="Customizable"
                width={300}
                height={300}
                className="object-contain p-5"
                sizes="(max-width: 768px) 96px, 96px"
              />
            </div>
            <div className="text-center">
              <h3 className="font-semibold text-gray-900">CUSTOMIZABLE</h3>
            </div>
          </div>
        </div> */
}

{
  /* <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-xl shadow-md p-6 mb-8 mt-6"
        >
          <p className="text-gray-700 mb-4">
            {currentCategoryContent.description}
          </p>

          <div className="flex flex-col lg:flex-row lg:gap-6 border-t pt-4">
            <div className="flex-1">
              <h3 className="font-semibold text-gray-800 mb-3">
                Key Features:
              </h3>
              <ul className="space-y-2">
                {currentCategoryContent.features.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <span className="mr-2">•</span>
                    <span className="text-gray-600">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="grid grid-cols-3 gap-1 mt-4 lg:mt-0 lg:w-[40%]">
              {["1.webp", "2.webp", "3.webp", "4.webp", "5.webp", "6.webp"].map(
                (img, i) => (
                  <div key={i} className="flex justify-center items-center">
                    <Image
                      src={`/${img}`}
                      alt={`image ${i + 1}`}
                      width={120}
                      height={120}
                      className="object-cover rounded-md"
                    />
                  </div>
                )
              )}
            </div>
          </div>

          <div className="mt-6 md:hidden">
            <button
              onClick={handleOrderNow}
              className="w-full px-6 py-3 bg-[#A00030] text-white rounded-lg hover:bg-[#800025] transition-colors text-sm font-medium"
            >
              Order This Collection
            </button>
          </div>
        </motion.div> */
}

{
  /* Premium Inquiry Form */
}
{
  /* <form className="bg-gray-50 rounded-2xl shadow-md p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Full Name"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-1 focus:ring-[#A00030] focus:border-[#A00030] outline-none"
                />
                <input
                  type="tel"
                  placeholder="Phone"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-1 focus:ring-[#A00030] focus:border-[#A00030] outline-none"
                />
              </div>

              <input
                type="email"
                placeholder="Email"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-1 focus:ring-[#A00030] focus:border-[#A00030] outline-none"
              />

              <input
                type="text"
                placeholder="City"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-1 focus:ring-[#A00030] focus:border-[#A00030] outline-none"
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Gifting For"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-1 focus:ring-[#A00030] focus:border-[#A00030] outline-none"
                />
                <input
                  type="number"
                  placeholder="Budget (₹)"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-1 focus:ring-[#A00030] focus:border-[#A00030] outline-none"
                />
              </div>

              <input
                type="number"
                placeholder="Quantity"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-1 focus:ring-[#A00030] focus:border-[#A00030] outline-none"
              />

              <button
                type="submit"
                className="w-full bg-[#A00030] text-white font-semibold py-3 rounded-lg hover:bg-[#870027] transition-all duration-300"
              >
                Order this collection
              </button>
            </form> */
}
