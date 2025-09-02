"use client";

import { Gift, ArrowRight, Clock, ShieldCheck } from "lucide-react";
import Link from "next/link";
import PopupForm from "../components/PopupForm";
import { useState } from "react";

export default function Prebook() {
  const [isFormOpen, setIsFormOpen] = useState(true);

  return (
    <section className="relative overflow-hidden font-gift">
      {/* 🌄 Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center  opacity-95 -z-20"
        style={{
          backgroundImage: "url('/gift-2.webp')",
        }}
      />

      {/* 🟡 Golden to Transparent Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-[hsl(30,45%,40%)] to-transparent -z-10" />
      <div className="relative mx-auto max-w-7xl px-6 py-8 sm:py-20 lg:px-8">
        <div className="mx-auto max-w-5xl text-center">
          {/* Heading */}
          <div className="mb-6">
            <h1 className="text-4xl sm:text-4xl lg:text-6xl font-extrabold text-white tracking-tight flex justify-center items-center gap-3 text-center">
              <span>
                Ready to Transform Your
                <br />
                <span className="bg-gradient-to-r from-[hsl(51,100%,67%)] to-[hsl(51,100%,67%)] bg-clip-text text-transparent">
                  Corporate Gifting?
                </span>
              </span>
            </h1>
          </div>

          {/* Description */}
          <p className="mx-auto max-w-3xl text-xl leading-relaxed text-white">
            Join the early adopters and secure your 20% discount. Limited-time
            offer for forward-thinking companies.
          </p>
        </div>

        <div className="flex justify-center items-center mt-10 flex-col gap-4">
          {/* Buttons */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 mt-4">
            {/* Prebook Now Button */}
            {/* <Link href="/">
              <button className="flex items-center gap-2 px-10 py-4 rounded-md text-white text-lg font-semibold bg-[linear-gradient(135deg,hsl(0,50%,30%),hsl(345,70%,40%),hsl(0,60%,50%))] hover:opacity-90 hover:scale-105 transform transition-all duration-300">
                <Gift className="h-5 w-5 text-white" />
                Prebook Now - 20% off
                <ArrowRight className="h-5 w-5 text-white" />
              </button>
            </Link> */}
            <button
              onClick={() => setIsFormOpen(true)}
              className="flex items-center justify-center gap-2 px-8 py-4 rounded-md text-white text-md font-semibold bg-[linear-gradient(135deg,hsl(0,50%,30%),hsl(345,70%,40%),hsl(0,60%,50%))] hover:opacity-90 hover:scale-105 transform transition-all duration-300 w-full sm:w-auto"
            >
              Prebook Now
              <ArrowRight className="h-5 w-5 text-white" />
            </button>

            <PopupForm
              isOpen={isFormOpen}
              onClose={() => setIsFormOpen(false)}
            />

            {/* Expiry Text */}
            <div className="flex flex-col sm:flex-row sm:items-center text-center sm:text-left gap-2 text-sm text-white sm:text-sm">
              <div className="flex justify-center sm:justify-start items-center gap-2">
                <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
                Offer expires in 30 days
              </div>
            </div>
          </div>
        </div>

        {/* Feature Highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-16 w-full max-w-4xl mx-auto px-0 md:px-4">
          {/* Feature 1: Exclusive Access */}
          <div className="backdrop-blur-md bg-white/10 rounded-md p-6 text-center text-white border border-white/20">
            <div className="flex items-center justify-center w-12 h-12 mx-auto rounded-full bg-[hsl(51,100%,67%)] mb-4">
              <Gift className="w-6 h-6 text-gray-800" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Exclusive Access</h3>
            <p className="text-sm text-white/80">
              Be first to access our premium corporate gifting platform
            </p>
          </div>

          {/* Feature 2: Guaranteed Satisfaction */}
          <div className="backdrop-blur-md bg-white/10 rounded-md p-6 text-center text-white border border-white/20">
            <div className="flex items-center justify-center w-12 h-12 mx-auto rounded-full bg-[hsl(51,100%,67%)] mb-4">
              <ShieldCheck className="w-6 h-6 text-black" />
            </div>
            <h3 className="text-lg font-semibold mb-2">
              Guaranteed Satisfaction
            </h3>
            <p className="text-sm text-white/80">
              100% money-back guarantee if you're not completely satisfied
            </p>
          </div>

          {/* Feature 3: Priority Support */}
          <div className="backdrop-blur-md bg-white/10 rounded-md p-6 text-center text-white border border-white/20">
            <div className="flex items-center justify-center w-12 h-12 mx-auto rounded-full bg-[hsl(51,100%,67%)] mb-4">
              <Clock className="w-6 h-6 text-black" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Priority Support</h3>
            <p className="text-sm text-white/80">
              Dedicated account manager and priority customer support
            </p>
          </div>
        </div>

        {/* Divider Line */}
        <hr className="my-12 border-t border-white/30 w-full max-w-5xl mx-auto" />

        {/* Trusted By Section */}
        <div className="text-center text-white">
          <h2 className="text-sm sm:text-sm text-gray-200  mb-4">
            Trusted by companies worldwide
          </h2>

          {/* Company Types - Text Only, No Background */}
          <div className="flex flex-wrap justify-center items-center gap-6 text-sm sm:text-base font-medium text-white backdrop-blur-sm">
            <span className="bg-white/10 text-gray-200 px-2 rounded-md backdrop-blur-sm bg-clip-text ">
              Fortune 500
            </span>
            <span className="bg-white/10 text-gray-200  px-2 rounded-md backdrop-blur-sm bg-clip-text ">
              Startups
            </span>
            <span className="bg-white/10 text-gray-200  px-2 rounded-md backdrop-blur-sm bg-clip-text">
              SMEs
            </span>
            <span className="bg-white/10 text-gray-200  px-2 rounded-md backdrop-blur-sm bg-clip-text ">
              Non-profits
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
