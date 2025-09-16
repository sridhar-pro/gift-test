"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight, CircleCheck, Gem, Gift, Leaf } from "lucide-react";
import { useRouter } from "next/navigation";
import { categoryContent } from "../data/products";

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

        const query = new URLSearchParams({ limit: 24, offset: 0 }).toString();
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

  // Utility: Convert category name to slug
  const slugify = (text) =>
    text
      .toString()
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-") // spaces → dashes
      .replace(/[^\w\-]+/g, "") // remove non-word chars
      .replace(/\-\-+/g, "-"); // collapse multiple dashes

  // Handle category click
  const handleCategoryClick = (category) => {
    const slug = slugify(category.name);
    localStorage.setItem("selectedCategoryId", category.id);
    router.push(`/product-list/${slug}`);
  };

  return (
    <>
      {/* Stats Section */}
      <div className="mt-16 text-center mb-6 font-gift">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-8 items-center justify-center">
            {[
              { title: "Curated Collections", img: "/badges/2.png" },
              { title: "Fast & Global Delivery", img: "/badges/3.png" },
              { title: "Premium Packaging", img: "/badges/4.png" },
              { title: "Conscious Commerce", img: "/badges/1.png" },
              { title: "Quality Assured", img: "/badges/5.png" },
              {
                title: "Timely Delivery",
                img: "/badges/6.png",
                subtitle: "20-25 Business Days",
              },
              { title: "Secure Payment", img: "/badges/7.png" },
            ].map((badge, idx) => (
              <div key={idx} className="flex flex-col items-center">
                <img
                  src={badge.img}
                  alt={badge.title}
                  className="w-20 h-20 sm:w-24 sm:h-24 object-contain hover:scale-110 transition-transform duration-300"
                />
                <p className="mt-3 text-sm sm:text-base font-semibold text-gray-700">
                  {badge.title}
                </p>
                {badge.subtitle && (
                  <p className="text-xs sm:text-sm text-gray-500 mt-1">
                    {badge.subtitle}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
      <div
        id="featured-products"
        className="relative px-6 md:px-10 py-2 md:py-12 bg-gradient-to-b from-gray-50 to-white font-gift"
      >
        {/* Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl sm:text-4xl lg:text-6xl font-bold text-gray-900 mb-3">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#A00030] to-[#000940] capitalize">
              Featured Gifting Hampers
            </span>
          </h2>
          <p className="text-gray-600 text-sm md:text-lg max-w-2xl mx-auto">
            Discover our handpicked selection of premium corporate gifts,
            crafted to make lasting impressions.
          </p>
        </motion.div>

        {/* State Handling */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-xl overflow-hidden shadow-md border border-gray-100 h-[340px] flex flex-col animate-pulse"
              >
                {/* Image Section Skeleton */}
                <div className="w-full h-[260px] bg-gray-200"></div>

                {/* Content Skeleton */}
                <div className="p-3 flex flex-col flex-1">
                  {/* Title */}
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>

                  {/* Description lines */}
                  <div className="h-3 bg-gray-200 rounded w-full mb-1"></div>
                  <div className="h-3 bg-gray-200 rounded w-5/6 mb-3"></div>

                  {/* Price + Button */}
                  <div className="mt-auto flex justify-between items-center">
                    <div className="h-4 bg-gray-200 rounded w-20"></div>
                    <div className="h-4 bg-gray-200 rounded w-12"></div>
                  </div>
                </div>
              </div>
            ))}
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
            {categories.map((cat) => {
              const staticData = categoryContent[cat.id];
              const price = staticData ? staticData.price / 100 : "—";

              // ✅ Tags mapping
              const tagMap = {
                890: ["Eco", "Premium"],
                891: ["Premium"],
                896: ["Eco"],
                897: ["Premium"],
              };

              const tags = tagMap[cat.id] || [];

              return (
                <motion.div
                  key={cat.id}
                  whileHover={{ y: -5 }}
                  transition={{ duration: 0.2 }}
                  className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 cursor-pointer h-[340px] flex flex-col"
                  onClick={() => handleCategoryClick(cat)}
                >
                  {/* Image Section */}
                  <div className="relative w-full h-[260px] bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
                    <Image
                      src={
                        cat.image
                          ? `https://marketplace.yuukke.com/assets/uploads/${cat.image}`
                          : "/gray.jpeg"
                      }
                      alt={cat.name}
                      fill
                      className="object-cover transition-transform duration-500 hover:scale-105"
                    />

                    {/* ✅ Tags Overlay */}
                    {tags.length > 0 && (
                      <div className="absolute top-2 left-2 flex flex-wrap gap-2">
                        {tags.map((tag) => (
                          <span
                            key={tag}
                            className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full shadow-sm border ${
                              tag === "Eco"
                                ? "bg-green-50 text-green-700 border-green-200"
                                : "bg-red-50 text-red-700 border-purple-200"
                            }`}
                          >
                            {tag === "Eco" && <Leaf className="w-3 h-3" />}
                            {tag === "Premium" && (
                              <CircleCheck className="w-3 h-3" />
                            )}
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-3 flex flex-col flex-1">
                    <h3 className="text-md font-bold text-gray-900 line-clamp-1 mb-1">
                      {cat.name}
                    </h3>

                    <p className="text-xs text-gray-600 line-clamp-2 mb-2">
                      {cat.description
                        ? cat.description.includes(".")
                          ? cat.description.split(".")[0] + "."
                          : cat.description
                        : "Discover our exclusive collection of festive hampers."}
                    </p>
                    <div className="mt-auto flex justify-between items-center">
                      <p className="text-md text-gray-900 flex items-center">
                        From{" "}
                        <span className="ml-1 text-[#a00300] font-bold">
                          ₹ {price}
                        </span>
                      </p>
                      <button className="flex items-center text-xs font-medium text-[#a00300] hover:text-red-800 transition-colors">
                        View
                        <ArrowRight className="h-4 w-4 ml-1" strokeWidth={2} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
