"use client";

import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";

const SearchBar = () => {
  const [isActive, setIsActive] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const router = useRouter();
  const timeoutRef = useRef(null);
  const containerRef = useRef(null);

  const handleSearch = async (searchTerm) => {
    if (!searchTerm.trim()) {
      setResults([]);
      return;
    }

    const token = localStorage.getItem("authToken");
    if (!token) {
      console.warn("No auth token found. Aborting search.");
      return;
    }

    try {
      const response = await axios.post(
        "/api/getProducts",
        {
          filters: {
            page: 1,
            query: searchTerm,
            limit: 10,
            gifts_products: 1,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data?.products) {
        setResults(response.data.products);
        setShowDropdown(true);
      }
    } catch (error) {
      console.error("Search failed:", error);
      setResults([]);
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);

    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => handleSearch(value), 400);
  };

  const handleClickOutside = (event) => {
    if (containerRef.current && !containerRef.current.contains(event.target)) {
      setIsActive(false);
      setShowDropdown(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative flex items-center gap-2 z-50">
      {/* Search Icon / Search Bar */}
      {!isActive ? (
        <button
          onClick={() => setIsActive(true)}
          className="p-2 hover:bg-gray-100 rounded-full transition"
          aria-label="Open Search"
        >
          <Search className="w-5 h-5 text-black" />
        </button>
      ) : (
        <div className="flex items-center border rounded-full px-3 py-2 shadow-md bg-white transition-all duration-300 ease-in-out w-[180px] sm:w-[180px] md:w-[400px]">
          {/* Search icon */}
          <Search className="w-4 h-4 md:w-5 md:h-5 text-gray-400 mr-2" />

          {/* Input */}
          <input
            type="text"
            value={query}
            onChange={handleInputChange}
            autoFocus
            placeholder="Search..."
            className="flex-1 text-xs md:text-sm outline-none bg-transparent placeholder:text-xs md:placeholder:text-sm"
          />

          {/* Clear button */}
          {query && (
            <button
              onClick={() => setQuery("")}
              className="text-gray-400 hover:text-gray-600 transition mr-2"
              aria-label="Clear Search"
            >
              {/* <X className="w-4 h-4" /> */}
            </button>
          )}

          {/* Close button */}
          <button
            onClick={() => {
              setQuery("");
              setResults([]);
              setIsActive(false);
              setShowDropdown(false);
            }}
            className="text-gray-400 hover:text-gray-600 transition ml-1 sm:ml-0"
            aria-label="Close Search"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>
      )}

      {/* Dropdown Results */}
      {showDropdown && results.length > 0 && (
        <div
          className="absolute top-full right-0 mt-2 w-[230px] sm:w-[260px] md:w-[400px] bg-white border rounded-xl shadow-2xl max-h-80 overflow-y-auto z-[200]"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          <style jsx>{`
            div::-webkit-scrollbar {
              display: none;
            }
          `}</style>
          <div className="p-2">
            {results.map((product) => (
              <div
                key={product.id}
                onClick={() => router.push(`/product/${product.slug}`)}
                className="flex gap-3 items-start p-3 hover:bg-gray-50 cursor-pointer transition border-b last:border-none"
              >
                <img
                  src={`https://marketplace.yuukke.com/assets/uploads/${product.image}`}
                  alt={product.name}
                  className="w-10 h-10 md:w-14 md:h-14 rounded-lg object-cover shadow-sm flex-shrink-0"
                  onError={(e) => {
                    e.target.src = "/placeholder-product.jpg";
                  }}
                />
                <div className="flex-1 min-w-0 text-left">
                  <h3 className="text-xs md:text-sm font-semibold text-gray-800 line-clamp-1">
                    {product.name}
                  </h3>
                  <p className="text-[10px] md:text-xs text-gray-500 line-clamp-2 mt-1">
                    {product.description || "A perfect gift for any occasion."}
                  </p>
                  <p className="text-xs md:text-sm font-bold text-gray-900 mt-1">
                    ₹
                    {parseFloat(product.promo_price || product.price).toFixed(
                      2
                    )}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchBar;
