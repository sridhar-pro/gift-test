"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import CategorySection from "./Category";

import { useRouter } from "next/navigation";
import ComboSection from "./Combo";

import { combos } from "@/app/data/products";

import { useAuth } from "../components/AuthContext";
import CorporateGiftingBanner from "./Banner";
import WhyChooseYuukke from "./WhyChoose";
import Prebook from "./Prebook";
import CategoryCr from "./Category_cr";

// const baseImageUrl = "https://marketplace.betalearnings.com/assets/uploads/";

export default function Home() {
  const [apiProducts, setApiProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [errorCategories, setErrorCategories] = useState(null);
  const [errorProducts, setErrorProducts] = useState(null);

  const router = useRouter();
  const [clickedId, setClickedId] = useState(null);

  // useEffect(() => {
  //   // Track recursion depth to prevent infinite loops
  //   let retryCount = 0;
  //   const MAX_RETRIES = 2;

  //   async function fetchCategories() {
  //     try {
  //       setLoadingCategories(true);

  //       // Debug
  //       console.log(`Attempt #${retryCount + 1} - Fetching categories...`);

  //       // 1. Token handling
  //       let authToken = localStorage.getItem("authToken");
  //       console.log("Current authToken:", authToken ? "Exists" : "Missing");

  //       if (!authToken) {
  //         console.log("Attempting login...");
  //         const authResponse = await fetch(
  //           "https://marketplace.betalearnings.com/api/v1/Auth/api_login",
  //           {
  //             method: "POST",
  //             headers: { "Content-Type": "application/json" },
  //             body: JSON.stringify({
  //               username: "admin",
  //               password: "Admin@123",
  //             }),
  //           }
  //         );

  //         const authData = await authResponse.json();
  //         console.log("Login response:", authData);

  //         if (authData.status !== "success") {
  //           throw new Error(
  //             "Login failed: " + (authData.message || "Unknown error")
  //           );
  //         }

  //         authToken = authData.token;
  //         localStorage.setItem("authToken", authToken);
  //         console.log("New token stored");
  //       }

  //       // 2. API Request
  //       const res = await fetch("/api/categories", {
  //         method: "GET",
  //         headers: {
  //           "Content-Type": "application/json",
  //           Authorization: `Bearer ${authToken}`,
  //         },
  //       });

  //       console.log("API response status:", res.status);

  //       // 3. Handle 401 (token expired)
  //       if (res.status === 401) {
  //         localStorage.removeItem("authToken");
  //         console.warn("Token expired - clearing and retrying...");

  //         if (retryCount < MAX_RETRIES) {
  //           retryCount++;
  //           return fetchCategories();
  //         }
  //         throw new Error("Max retries reached");
  //       }

  //       if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

  //       // 4. Process data
  //       const data = await res.json();
  //       console.log("API response data:", data);

  //       const categoriesList = Array.isArray(data?.data)
  //         ? data.data
  //         : Array.isArray(data?.categories)
  //         ? data.categories
  //         : [];

  //       setCategories(categoriesList);
  //       setErrorCategories(null);
  //     } catch (error) {
  //       console.error("Fetch error:", error);
  //       setErrorCategories(
  //         error.message.includes("Max retries")
  //           ? "Session expired. Please refresh the page."
  //           : error.message
  //       );
  //       setCategories([]);

  //       // Redirect to login if unauthorized
  //       if (
  //         error.message.includes("401") ||
  //         error.message.includes("Login failed")
  //       ) {
  //         router.push("/login"); // Make sure router is imported
  //       }
  //     } finally {
  //       setLoadingCategories(false);
  //     }
  //   }

  //   fetchCategories();
  // }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoadingProducts(true);

        // Debug: Check if token exists initially
        // console.log(
        //   "Initial token check in localStorage:",
        //   localStorage.getItem("authToken")
        // );

        // Step 1: Get or refresh authToken
        let authToken = localStorage.getItem("authToken");
        // console.log("Retrieved authToken:", authToken);

        if (!authToken) {
          // console.log("No authToken found, attempting to login...");
          const authResponse = await fetch("/api/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              username: "admin",
              password: "Admin@123",
            }),
          });

          const authData = await authResponse.json();
          // console.log("Login API response:", authData);

          if (authData.status === "success") {
            authToken = authData.token;
            localStorage.setItem("authToken", authToken);
            // console.log("New authToken stored:", authToken);
          } else {
            throw new Error("Authentication failed");
          }
        }

        // Step 2: Make authenticated request
        // console.log("Making request with authToken:", authToken);
        const response = await fetch("/api/getproducts", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify({
            filters: {
              page: 1,
              limit: 24,
              offset: 0,
              gifts_products: 1,
            },
          }),
        });

        // Step 3: Handle 401 Unauthorized
        if (!response.ok) {
          console.log("Request failed with status:", response.status); // Debug
          if (response.status === 401) {
            localStorage.removeItem("authToken");
            console.log("Removed invalid authToken, retrying..."); // Debug
            return fetchProducts(); // retry
          }
          throw new Error(`Request failed with status ${response.status}`);
        }

        // Step 4: Process response
        const data = await response.json();
        // console.log("Fetched Products: ", data);

        const fetchedProducts = Array.isArray(data?.products)
          ? data.products
          : [];

        setApiProducts(fetchedProducts);
      } catch (error) {
        console.error("Error fetching products:", error);
        setErrorProducts(error.message || "Failed to fetch products");
        setApiProducts([]);
      } finally {
        setLoadingProducts(false);
      }
    };

    fetchProducts();
  }, []);

  const [outOfStockMessage, setOutOfStockMessage] = useState("");

  const handleProductClick = (product) => {
    if (product.qty === 0) {
      setOutOfStockMessage(
        `${product.name || "This product"} is currently out of stock.`
      );
    } else {
      window.location.href = `/product/${product.slug}`;
    }
  };

  return (
    <div className="">
      {/* Combos Section */}
      {/* <ComboSection combos={combos} /> */}
      <CorporateGiftingBanner />
      <WhyChooseYuukke />
      <CategoryCr />
      <Prebook />

      {/* Categories Section */}
      {/* <CategorySection /> */}

      {/* Top Products Section */}
      <div className="hidden px-4 md:px-8 py-8 mb-12">
        {/* Header */}
        <motion.div
          className="text-center mb-10"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          // variants={fadeInUp}
          // transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <h2 className="text-4xl font-extrabold text-gray-900 tracking-wide uppercase inline-block relative">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#A00030] to-[#000940]">
              Top Products
            </span>
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-16 h-1 bg-[#A00030] rounded-full mt-1"></div>
          </h2>
          <p className="mt-2 text-gray-600 text-sm md:text-base max-w-2xl mx-auto">
            Discover our most loved products—handpicked just for you.
          </p>
        </motion.div>

        {/* State Handling */}
        {loadingProducts ? (
          <p className="text-center text-gray-500">Loading products...</p>
        ) : errorProducts ? (
          <p className="text-center text-red-500">{errorProducts}</p>
        ) : apiProducts.length === 0 ? (
          <p className="text-center text-gray-500">No products found.</p>
        ) : (
          <motion.div
            className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-2"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={{
              hidden: {},
              visible: {
                transition: { staggerChildren: 0.15 },
              },
            }}
          >
            {apiProducts.map((product) => {
              const promoAvailable =
                product.promo_price && product.promo_price < product.price;
              const offerPercent = promoAvailable
                ? Math.round(
                    ((product.price - product.promo_price) / product.price) *
                      100
                  )
                : null;
              const daysLeft = product.end_date
                ? Math.max(
                    0,
                    Math.ceil(
                      (new Date(product.end_date).getTime() -
                        new Date().getTime()) /
                        (1000 * 60 * 60 * 24)
                    )
                  )
                : null;
              const isOutOfStock =
                product.quantity == null || product.quantity <= 0;

              const ProductCard = (
                <motion.div
                  // variants={fadeInUp}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                  whileHover={{ scale: !isOutOfStock ? 1.02 : 1 }}
                  className={`bg-white p-3 rounded-2xl shadow-sm flex flex-col relative h-full transition-all duration-300 ${
                    isOutOfStock
                      ? "opacity-60 cursor-not-allowed"
                      : "cursor-pointer"
                  }`}
                >
                  {/* Image Section */}
                  <div className="relative w-full h-[200px] md:h-[220px] rounded-xl overflow-hidden">
                    <Image
                      src={
                        product.image
                          ? `https://marketplace.yuukke.com/assets/uploads/${product.image}`
                          : "/gray.jpeg"
                      }
                      alt={product.name || "Image not found!"}
                      fill
                      className="object-contain"
                    />
                    {promoAvailable && (
                      <span className="absolute top-2 left-2 bg-gradient-to-r from-red-500 to-pink-600 text-white text-xs font-semibold px-2 py-0.5 rounded shadow-md whitespace-nowrap sm:hidden">
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
                      <p className="text-sm text-gray-500 capitalize line-clamp-2 h-[40px]">
                        {product.short_description ||
                          "Great quality and value!"}
                      </p>
                    </div>

                    {/* Price Row */}
                    <div className="mt-2 flex items-center justify-between">
                      <p className="text-sm text-gray-800 font-semibold">
                        ₹
                        {promoAvailable
                          ? parseFloat(product.promo_price).toLocaleString()
                          : parseFloat(product.price).toLocaleString()}
                      </p>
                      {promoAvailable && (
                        <div className="flex items-center gap-1">
                          <p className="text-sm text-gray-400 line-through">
                            ₹{parseFloat(product.price).toLocaleString()}
                          </p>
                          <span className="hidden md:flex text-xs font-bold text-pink-600 bg-pink-100 px-2 py-0.5 rounded">
                            {offerPercent}% OFF
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Offer Countdown */}
                    {promoAvailable &&
                      product.end_date &&
                      (() => {
                        const now = new Date();
                        const endDate = new Date(product.end_date);
                        const isSameDay =
                          now.getFullYear() === endDate.getFullYear() &&
                          now.getMonth() === endDate.getMonth() &&
                          now.getDate() === endDate.getDate();

                        if (isSameDay) {
                          const endOfDay = new Date();
                          endOfDay.setHours(23, 59, 59, 999);
                          const timeDiff = endOfDay.getTime() - now.getTime();
                          if (timeDiff > 0) {
                            const hoursLeft = Math.ceil(
                              timeDiff / (1000 * 60 * 60)
                            );
                            return (
                              <p className="text-xs font-semibold text-red-600">
                                Offer ends in {hoursLeft} hour
                                {hoursLeft !== 1 ? "s" : ""}
                              </p>
                            );
                          }
                        } else {
                          const endOfDay = new Date(endDate);
                          endOfDay.setHours(23, 59, 59, 999);
                          const timeDiff = endOfDay.getTime() - now.getTime();
                          const daysLeft = Math.ceil(
                            timeDiff / (1000 * 60 * 60 * 24)
                          );
                          if (daysLeft > 0) {
                            return (
                              <p className="text-xs font-semibold text-red-600">
                                Offer ends in {daysLeft} day
                                {daysLeft !== 1 ? "s" : ""}
                              </p>
                            );
                          }
                        }

                        return null;
                      })()}
                  </div>
                </motion.div>
              );

              return isOutOfStock ? (
                <div key={product.id}>{ProductCard}</div>
              ) : (
                <Link
                  href={`/product/${product.slug}`}
                  key={product.id}
                  passHref
                >
                  {ProductCard}
                </Link>
              );
            })}
          </motion.div>
        )}
      </div>
    </div>
  );
}
