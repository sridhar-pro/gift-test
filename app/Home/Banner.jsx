"use client";

import {
  Gift,
  Leaf,
  Heart,
  CheckCircle,
  Star,
  ArrowRight,
  FileText,
  ArrowDown,
} from "lucide-react";
import Link from "next/link";
import PopupForm from "../components/PopupForm";
import { useState } from "react";

export default function CorporateGiftingBanner() {
  const [isOpen, setIsOpen] = useState(false);
  const [formMode, setFormMode] = useState("quotation");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const scrollToGiftCategory = () => {
    const giftCategorySection = document.getElementById("category-slider");
    if (giftCategorySection) {
      giftCategorySection.scrollIntoView({ behavior: "smooth" });
    }
  };
  return (
    <section className="relative overflow-hidden font-gift">
      {/* 🌄 Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-95 -z-20"
        style={{ backgroundImage: "url('/hero-gifting.jpg')" }}
      />

      {/* 🟡 Golden to Transparent Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-[hsl(30,45%,40%)]  to-transparent -z-10" />
      <div className="relative mx-auto max-w-7xl px-6 py-8 sm:py-20 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          {/* Heading */}
          <div className="mb-10">
            <div className="hidden sm:inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-md px-6 py-3 text-sm font-medium text-white mb-6 border border-white/20 shadow-sm">
              <Star className="h-6 w-6 fill-[hsl(51,100%,67%)] text-transparent" />
              Yuukke Marketplace
            </div>

            <h1 className="text-5xl sm:text-5xl lg:text-7xl font-extrabold bg-gradient-to-r from-[hsl(51,100%,67%)] to-orange-500 bg-clip-text text-transparent tracking-tight flex justify-center items-center gap-3 text-center">
              <span>
                Corporate <br className="block sm:hidden " />{" "}
                <span className="block sm:hidden h-2" aria-hidden="true" />{" "}
                Gifting <br />
                <span className="bg-gradient-to-r from-[hsl(51,100%,67%)] to-orange-500 bg-clip-text text-transparent">
                  Reimagined
                </span>
              </span>
            </h1>
          </div>

          {/* Description */}
          <p className="mx-auto mt-4 md:mt-6 max-w-3xl text-xl md:text-2xl leading-relaxed text-white">
            Create meaningful connections with gifts that are thoughtful,
            sustainable, and unforgettable—leaving a lasting impact on{" "}
            <br className="hidden lg:block" /> your business relationships.
          </p>
        </div>
        <div className="flex justify-center items-center mt-10 flex-col gap-4">
          {/* Top badge */}
          <div className="inline-flex items-center gap-2 rounded-full bg-[hsl(51,100%,67%)] px-8 py-4 text-sm font-medium text-[hsl(30,10%,20%)] border border-white/20 shadow-sm">
            <span className="text-2xl font-bold">20% OFF</span>
            Early Booking Pricing
          </div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 mt-4">
            {/* Prebook Now Button */}
            {/* <button
              onClick={() => {
                setFormMode("prebooking");
                setIsOpen(true);
              }}
              className="flex items-center justify-center gap-2 px-8 py-4 rounded-md text-white text-md font-semibold bg-[linear-gradient(135deg,hsl(0,50%,30%),hsl(345,70%,40%),hsl(0,60%,50%))] hover:opacity-90 hover:scale-105 transform transition-all duration-300 w-full sm:w-auto"
            >
              Prebook Now
              <ArrowRight className="h-5 w-5 text-white" />
            </button> */}

            <PopupForm
              isOpen={isOpen}
              onClose={() => setIsOpen(false)}
              mode={formMode}
            />

            {/* Explore Catalog Button */}
            <button
              onClick={() => {
                setFormMode("quotation");
                setIsOpen(true);
              }}
              className="flex items-center justify-center px-8 py-4 rounded-md text-black text-md font-semibold bg-white hover:bg-[linear-gradient(105deg,hsl(51,100%,67%),hsl(40,70%,45%),#333333)] hover:text-white transition-all duration-300 w-full sm:w-auto group"
            >
              Get a Quote
              <FileText className="h-4 w-4 ml-1 text-black group-hover:text-white transition-colors duration-300" />
            </button>

            {/* Featured Products Button */}
            <button
              onClick={() => {
                const section = document.getElementById("featured-products");
                if (section) {
                  section.scrollIntoView({ behavior: "smooth" });
                }
              }}
              className="flex items-center justify-center gap-2 px-8 py-4 rounded-md text-white text-md font-semibold bg-[linear-gradient(135deg,hsl(0,50%,30%),hsl(345,70%,40%),hsl(0,60%,50%))] hover:opacity-90 hover:scale-105 transform transition-all duration-300 w-full sm:w-auto"
            >
              Explore Catelogue
              <ArrowDown className="h-5 w-5 text-white animate-bounce" />
            </button>
          </div>

          {/* Stats */}
          <div className="mt-8 flex flex-col items-center text-center text-white">
            {/* Row for first two on small screens, all three on large */}
            <div className="flex flex-col sm:flex-row gap-10 justify-center items-center">
              <div className="flex gap-10">
                <div>
                  <p className="text-2xl font-extrabold">1000+</p>
                  <p className="text-sm text-white">Happy Customers</p>
                </div>
                <div>
                  <p className="text-2xl font-extrabold">20K+</p>
                  <p className="text-sm text-white">Gifts Delivered</p>
                </div>
              </div>
            </div>

            {/* Third stat placed below */}
            <div className="mt-6">
              <p className="text-2xl font-extrabold">95%</p>
              <p className="text-sm text-white">Satisfaction Rate</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
