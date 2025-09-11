"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";

// 👉 util to make clean slugs
const slugify = (text) =>
  text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-") // spaces → dashes
    .replace(/[^\w\-]+/g, "") // remove special chars
    .replace(/\-\-+/g, "-"); // collapse multiple dashes

export default function RelatedCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();
  const currentCategoryId =
    typeof window !== "undefined"
      ? localStorage.getItem("selectedCategoryId")
      : null;

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);

        let authToken = localStorage.getItem("authToken");
        if (!authToken) {
          const authResponse = await fetch("/api/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username: "admin", password: "Admin@123" }),
          });
          const authData = await authResponse.json();
          if (authData.status === "success") {
            authToken = authData.token;
            localStorage.setItem("authToken", authToken);
          } else throw new Error("Authentication failed");
        }

        const query = new URLSearchParams({ limit: 24, offset: 0 }).toString();

        const response = await fetch(`/api/category_cr?${query}`, {
          headers: { Authorization: `Bearer ${authToken}` },
        });

        if (!response.ok) {
          if (response.status === 401) {
            localStorage.removeItem("authToken");
            return fetchCategories();
          }
          throw new Error(`Request failed with status ${response.status}`);
        }

        const data = await response.json();
        const filtered = (Array.isArray(data?.data) ? data.data : []).filter(
          (cat) => String(cat.id) !== String(currentCategoryId) // prevent type mismatch
        );

        setCategories(filtered);
      } catch (err) {
        console.error("Error fetching related categories:", err);
        setError(err.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, [currentCategoryId]);

  const handleCategoryClick = (cat) => {
    const slug = slugify(cat.name);
    localStorage.setItem("selectedCategoryId", cat.id); // keep ID
    router.push(`/product-list/${slug}`); // slug-based route
  };

  const scrollRef = (direction) => {
    const container = document.getElementById("related-category-slider");
    if (container) {
      container.scrollBy({
        left: direction === "left" ? -300 : 300,
        behavior: "smooth",
      });
    }
  };

  if (loading)
    return (
      <div className="w-8 h-8 border-4 border-[#b3b1b1] border-t-transparent rounded-full animate-spin"></div>
    );
  if (error) return <p className="text-red-500">{error}</p>;
  if (categories.length === 0) return null;

  return (
    <div className="relative px-4 md:px-8 py-6">
      {/* Navigation buttons */}
      {categories.length > 1 && (
        <>
          <button
            onClick={() => scrollRef("left")}
            className="absolute -left-2 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-white shadow-lg hover:bg-gray-50 transition "
          >
            <ChevronLeft className="h-5 w-5 text-gray-700" />
          </button>
          <button
            onClick={() => scrollRef("right")}
            className="absolute -right-2 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-white shadow-lg hover:bg-gray-50 transition "
          >
            <ChevronRight className="h-5 w-5 text-gray-700" />
          </button>
        </>
      )}

      {/* Slider */}
      <div
        id="related-category-slider"
        className="flex overflow-x-auto gap-6 scroll-smooth scrollbar-hide pb-4"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {categories.map((cat) => (
          <motion.div
            key={cat.id}
            whileHover={{ y: -5 }}
            transition={{ duration: 0.2 }}
            className="flex-shrink-0 w-48 sm:w-52 md:w-48 lg:w-52 bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 cursor-pointer"
            onClick={() => handleCategoryClick(cat)}
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
                <p className="text-sm text-gray-600 line-clamp-2 flex-grow">
                  {cat.description ||
                    "Discover our exclusive collection of festive hampers."}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
