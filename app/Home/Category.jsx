"use client";

import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
// import { categories, productsData, categoryContent } from "@/app/data/products";

const CategoryProducts = () => {
  const [activeCategory, setActiveCategory] = useState("Zen Zone");
  const productsGridRef = useRef(null);

  const products = productsData[activeCategory] || [];
  const { title, description } = categoryContent[activeCategory] || {};

  const handleCategoryClick = (category) => {
    setActiveCategory(category);

    if (window.innerWidth <= 768 && productsGridRef.current) {
      setTimeout(() => {
        productsGridRef.current.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 100);
    }
  };

  return (
    <div className="px-4 md:px-8 py-12 relative">
      <div className="text-center mb-10">
        <h2 className="text-4xl font-extrabold text-gray-900 tracking-wide uppercase inline-block relative">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#A00030] to-[#000940]">
            Categories
          </span>
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-16 h-1 bg-[#A00030] rounded-full mt-1"></div>
        </h2>
        <p className="mt-2 text-gray-600 text-sm md:text-base max-w-2xl mx-auto">
          Discover a wide range of thoughtfully organized categories to help you
          find the perfect gift with ease.
        </p>
      </div>

      <motion.div
        className="flex justify-center gap-20 flex-wrap mb-8"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={{
          hidden: {},
          visible: {
            transition: {
              staggerChildren: 0.2,
            },
          },
        }}
      >
        {categories.map((cat) => (
          <motion.div
            key={cat.title}
            className="flex flex-col items-center w-[125px]"
            variants={{
              hidden: { opacity: 0, y: 30 },
              visible: { opacity: 1, y: 0 },
            }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <motion.button
              className="relative w-[120px] h-[120px] rounded-xl overflow-hidden"
              onClick={() => handleCategoryClick(cat.title)}
              whileHover={{ scale: 1.05 }}
              animate={{
                scale: activeCategory === cat.title ? 1.05 : 1,
              }}
              transition={{ type: "spring", stiffness: 300, damping: 22 }}
            >
              <Image
                src={cat.image}
                alt={cat.title}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-cover"
              />
            </motion.button>
            <p className="text-center text-lg font-bold mt-2">{cat.title}</p>
          </motion.div>
        ))}
      </motion.div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeCategory + "-heading"}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="text-center max-w-5xl mx-auto mb-10 mt-24"
        >
          <h3 className="text-2xl md:text-4xl font-bold text-gray-800">
            {title}
          </h3>
          <p className="mt-4 text-gray-600 text-sm md:text-base">
            {description}
          </p>
        </motion.div>
      </AnimatePresence>

      <AnimatePresence mode="wait">
        <motion.div
          ref={productsGridRef}
          key={activeCategory}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6"
        >
          {products.map((product, i) => {
            const promoAvailable =
              product.promo_price && product.promo_price < product.price;
            const offerPercent = promoAvailable
              ? Math.round(
                  ((product.price - product.promo_price) / product.price) * 100
                )
              : null;

            return (
              <Link
                href={`/product/${product.slug}`}
                key={product.id || `${activeCategory}-${i}`}
              >
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  className="bg-white p-3 rounded-2xl shadow-sm flex flex-col relative h-full min-h-[380px] cursor-pointer"
                >
                  <div className="relative w-full h-[200px] md:h-[220px] rounded-xl overflow-hidden">
                    <Image
                      src={product.image}
                      alt={product.title}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-contain"
                    />

                    {promoAvailable && (
                      <span className="absolute top-2 left-2 bg-gradient-to-r from-red-500 to-pink-600 text-white text-xs font-semibold px-2 py-0.5 rounded shadow-md">
                        {offerPercent}% OFF
                      </span>
                    )}
                  </div>

                  <div className="flex flex-col justify-between flex-grow p-4">
                    <div>
                      <h3 className="text-base font-bold text-gray-900 line-clamp-2">
                        {product.title}
                      </h3>
                      <p className="text-sm text-gray-500 capitalize line-clamp-2 h-[40px]">
                        High-quality gift product
                      </p>
                    </div>

                    <div className="mt-2 flex items-center justify-between">
                      <p className="text-sm text-gray-800 font-semibold">
                        ₹{promoAvailable ? product.promo_price : product.price}
                      </p>
                      {promoAvailable && (
                        <div className="flex items-center gap-1">
                          <p className="text-sm text-gray-400 line-through">
                            ₹{product.price}
                          </p>
                          <span className="hidden md:flex text-xs font-bold text-pink-600 bg-pink-100 px-2 py-0.5 rounded">
                            {offerPercent}% OFF
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              </Link>
            );
          })}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default CategoryProducts;
