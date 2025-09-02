"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Star, Gift } from "lucide-react";
import { useRouter } from "next/navigation";

export default function CategoryCr() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);

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

        // ✅ use query params for GET
        const query = new URLSearchParams({
          limit: 24,
          offset: 0,
        }).toString();

        const response = await fetch(`/api/category_cr?${query}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${authToken}`,
          },
        });

        if (!response.ok) {
          if (response.status === 401) {
            localStorage.removeItem("authToken");
            return fetchCategories(); // retry
          }
          throw new Error(`Request failed with status ${response.status}`);
        }

        const data = await response.json();
        // console.log("data", data);
        setCategories(Array.isArray(data?.data) ? data.data : []);
      } catch (error) {
        console.error("Error fetching categories:", error);
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Handle category click - redirect to custom box page with category ID
  const handleCategoryClick = (categoryId) => {
    // Store the category ID to be used in the custom box page
    localStorage.setItem("selectedCategoryId", categoryId);

    // Redirect to the custom box page
    router.push("/product-list");
  };

  // slider scroll logic
  const scrollRef = (direction) => {
    const container = document.getElementById("category-slider");
    if (container) {
      const scrollAmount = 300;
      container.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="relative px-6 md:px-10 py-2 md:py-12 bg-gradient-to-b from-gray-50 to-white font-gift">
      {/* Header */}
      <motion.div
        className="text-center mb-12"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
      >
        {/* <div className="inline-flex items-center justify-center mb-4">
          <div className="w-12 h-12 rounded-full bg-gradient-to-r from-pink-100 to-purple-100 flex items-center justify-center">
            <Gift className="h-6 w-6 text-[#A00030]" />
          </div>
        </div> */}
        <h2 className="text-4xl sm:text-4xl lg:text-6xl font-bold text-gray-900 mb-3">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#A00030] to-[#000940] capitalize">
            Gifting Catalogue
          </span>
        </h2>
        <p className="text-gray-600 text-sm md:text-lg max-w-2xl mx-auto">
          Explore our sustainable & festive gifting hampers. Perfect for every
          occasion.
        </p>
      </motion.div>

      {/* State Handling */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-pulse flex space-x-4">
            <div className="rounded-full bg-gray-200 h-12 w-12"></div>
            <div className="flex-1 space-y-4 py-1">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              </div>
            </div>
          </div>
        </div>
      ) : error ? (
        <p className="text-center text-red-500">{error}</p>
      ) : categories.length === 0 ? (
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
            <Gift className="h-8 w-8 text-gray-400" />
          </div>
          <p className="text-gray-500">No categories found.</p>
        </div>
      ) : (
        <div className="relative px-4 md:px-8">
          {/* Navigation Buttons - only show when more than 1 */}
          {categories.length > 1 && (
            <>
              <button
                onClick={() => scrollRef("left")}
                className="absolute -left-2 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-white shadow-lg hover:bg-gray-50 transition-all duration-300 hover:scale-110 flex"
                aria-label="Previous categories"
              >
                <ChevronLeft className="h-5 w-5 text-gray-700" />
              </button>

              <button
                onClick={() => scrollRef("right")}
                className="absolute -right-2 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-white shadow-lg hover:bg-gray-50 transition-all duration-300 hover:scale-110 flex"
                aria-label="Next categories"
              >
                <ChevronRight className="h-5 w-5 text-gray-700" />
              </button>
            </>
          )}

          {/* Desktop + Mobile Slider */}
          <div
            id="category-slider"
            className="flex overflow-x-auto gap-6 scroll-smooth scrollbar-hide pb-4"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {categories.map((cat) => (
              <motion.div
                key={cat.id}
                whileHover={{ y: -5 }}
                transition={{ duration: 0.2 }}
                className="flex-shrink-0 w-64 sm:w-72 md:w-60 lg:w-80 bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 cursor-pointer"
                onClick={() => handleCategoryClick(cat.id)}
              >
                <div className="flex flex-col h-full">
                  <div className="relative w-full aspect-square bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
                    <Image
                      src={
                        cat.image
                          ? `https://marketplace.yuukke.com/assets/uploads/${cat.image}`
                          : "/gray.jpeg"
                      }
                      alt={cat.name}
                      width={240}
                      height={240}
                      className="object-contain w-full h-full transition-transform duration-500 hover:scale-105"
                    />
                  </div>

                  <div className="p-5 flex flex-col flex-grow">
                    <h3 className="text-lg font-bold text-gray-900 line-clamp-1 mb-2">
                      {cat.name}
                    </h3>
                    <p className="text-sm text-gray-600 line-clamp-2 mb-4 flex-grow">
                      {cat.description ||
                        "Discover our exclusive collection of festive hampers."}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* ⬇️ The power bar goes here, full width & centered */}
      <div className="mt-16 text-center text-gray-400 mb-6">
        <div className="grid grid-cols-2 sm:flex sm:justify-center sm:items-center sm:gap-32 gap-y-10 gap-x-0">
          {/* Stat 1 */}
          <div>
            <p className="text-3xl font-extrabold text-[hsl(25,50%,30%)]">
              100%
            </p>
            <p className="text-md">Eco-Friendly</p>
          </div>

          {/* Stat 2 */}
          <div>
            <p className="text-3xl font-extrabold text-[hsl(25,50%,30%)]">
              15-45 Business Days
            </p>
            <p className="text-md">Delivery Time</p>
          </div>

          {/* Stat 3 */}
          <div>
            <p className="text-3xl font-extrabold text-[hsl(25,50%,30%)]">
              24/7
            </p>
            <p className="text-md">Support</p>
          </div>

          {/* Stat 4 */}
          <div>
            <p className="text-3xl font-extrabold text-[hsl(25,50%,30%)]">
              Global
            </p>
            <p className="text-md">Reach</p>
          </div>
        </div>
      </div>
    </div>
  );
}
