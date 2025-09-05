"use client";
import { useState } from "react";
import {
  Mail,
  Phone,
  Clock,
  DollarSign,
  Gift,
  Truck,
  Plus,
} from "lucide-react";

export default function NeedHelp() {
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    {
      icon: <DollarSign className="h-5 w-5 text-[#0F766E]" />,
      question: "What is our starting range for Bulk Orders & Retail Orders?",
      answer: "Our bulk orders start at ₹5,000. Retail orders start at ₹1,000.",
    },
    {
      icon: <Gift className="h-5 w-5 text-[#0F766E]" />,
      question: "Do we provide customisation options?",
      answer:
        "Yes! We offer complete customisation for hampers and packaging based on your needs.",
    },
    {
      icon: <Truck className="h-5 w-5 text-[#0F766E]" />,
      question: "How long do we take to deliver the hampers?",
      answer:
        "Delivery usually takes 3-5 business days depending on the location.",
    },
  ];

  return (
    <div className="bg-white flex justify-center items-center py-12 px-6 font-gift">
      <div className="bg-[#D21F32] rounded-lg shadow-lg w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-10 p-8">
        {/* Left Section */}
        <div>
          <h2 className="text-3xl sm:text-4xl font-semibold text-white">
            Need Help?
          </h2>
          <p className="text-white text-sm mt-2 leading-relaxed">
            For Order-related & Bulk Order queries, contact us below:
          </p>

          <div className="mt-6 space-y-5">
            {/* Email */}
            <div>
              <p className="uppercase text-xs text-white/70 tracking-wider">
                Email
              </p>
              <p className="text-lg font-medium text-white">
                hello@thegoodroad.in
              </p>
            </div>

            {/* Phone */}
            <div>
              <p className="uppercase text-xs text-white/70 tracking-wider">
                Phone
              </p>
              <p className="text-lg font-medium text-white">+91 93112 05938</p>
            </div>

            {/* Response Time */}
            <div>
              <p className="uppercase text-xs text-white/70 tracking-wider">
                Average Response Time
              </p>
              <p className="text-lg font-medium text-white">
                1-2 Business Days
              </p>
            </div>
          </div>
        </div>

        {/* Right Section - FAQs */}
        <div className="flex flex-col gap-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-white rounded-lg shadow hover:shadow-md transition-all duration-300 p-5 cursor-pointer"
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {faq.icon}
                  <span className="text-gray-800 font-medium">
                    {faq.question}
                  </span>
                </div>
                <Plus
                  className={`h-5 w-5 text-gray-600 transform transition-transform duration-300 ${
                    openIndex === index ? "rotate-45" : ""
                  }`}
                />
              </div>
              {openIndex === index && (
                <p className="mt-3 text-gray-600 text-sm leading-relaxed">
                  {faq.answer}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
