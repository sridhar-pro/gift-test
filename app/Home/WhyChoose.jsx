import { useRef } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Heart, Leaf, Sparkles } from "lucide-react";

const reasons = [
  {
    title: "Thoughtful",
    icon: Heart,
    color: "hsl(51, 100%, 67%)",
    description:
      "Every gift is carefully curated to reflect your company's values and strengthen business relationships with personal touches.",
    img: "/1.jpeg",
  },
  {
    title: "Sustainable",
    icon: Leaf,
    color: "hsl(30, 45%, 40%)",
    description:
      "Eco-friendly packaging and ethically sourced products that demonstrate your commitment to environmental responsibility.",
    img: "/2.jpeg",
  },
  {
    title: "Unforgettable",
    icon: Sparkles,
    color: "hsl(25, 50%, 30%)",
    description:
      "Create memorable experiences that leave lasting impressions and drive meaningful business impact.",
    img: "/3.jpeg",
  },
];

export default function WhyChooseYuukke() {
  const sliderRef = useRef(null);

  const scroll = (direction) => {
    if (!sliderRef.current) return;
    const scrollAmount = sliderRef.current.offsetWidth; // scroll by container width
    sliderRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  return (
    <section className="py-20 px-4 bg-white font-gift">
      <div className="max-w-7xl mx-auto text-center">
        <h2 className="text-4xl md:text-[3.40rem] font-bold mb-4">
          Why Choose Yuukke?
        </h2>
        <p className="text-gray-500 max-w-3xl mx-auto mb-12 mt-10 text-xl leading-relaxed">
          Transform your corporate gifting strategy with our unique approach
          that combines thoughtfulness, sustainability, and unforgettable
          experiences.
        </p>

        <div>
          {/* Desktop Grid */}
          <div className="hidden sm:grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 place-items-center">
            {reasons.map((item, idx) => (
              <div
                key={idx}
                className="bg-neutral-50 rounded-xl shadow-sm overflow-hidden border border-gray-100 max-w-sm mx-auto transition-transform duration-500 hover:scale-[1.02] hover:shadow-[0_12px_24px_-6px_rgba(120,120,120,0.25)]"
              >
                <div className="relative h-80 w-full overflow-hidden">
                  <Image
                    src={item.img}
                    alt={item.title}
                    fill
                    className="object-cover transition-transform duration-500 ease-in-out scale-100 hover:scale-110"
                  />
                </div>

                <div className="p-6 text-left">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="p-2 rounded-full bg-white">
                      <item.icon
                        className="w-6 h-6"
                        style={{ color: item.color }}
                      />
                    </span>
                    <h3 className="text-2xl font-bold">{item.title}</h3>
                  </div>
                  <p className="text-gray-400 text-md leading-[2] mt-6">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Mobile Slider */}
          <div className="relative sm:hidden ">
            {/* Arrows */}
            <button
              onClick={() => scroll("left")}
              className="absolute top-1/2 -left-2 transform -translate-y-1/2 z-10 p-2 rounded-full bg-white shadow-md"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <div
              ref={sliderRef}
              className="flex gap-6 overflow-x-auto snap-x snap-mandatory scroll-smooth scrollbar-hidden  px-2"
            >
              {reasons.map((item, idx) => (
                <div
                  key={idx}
                  className="bg-neutral-50 rounded-xl shadow-sm overflow-hidden border border-gray-100 min-w-[85%] snap-center transition-transform duration-500 hover:scale-[1.02] hover:shadow-[0_12px_24px_-6px_rgba(120,120,120,0.25)]"
                >
                  <div className="relative h-72 w-full overflow-hidden">
                    <Image
                      src={item.img}
                      alt={item.title}
                      fill
                      className="object-cover transition-transform duration-500 ease-in-out scale-100 hover:scale-110"
                    />
                  </div>

                  <div className="p-6 text-left">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="p-2 rounded-full bg-white">
                        <item.icon
                          className="w-6 h-6"
                          style={{ color: item.color }}
                        />
                      </span>
                      <h3 className="text-lg font-bold">{item.title}</h3>
                    </div>
                    <p className="text-gray-400 text-sm leading-[1.8] mt-4">
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => scroll("right")}
              className="absolute top-1/2 -right-2 transform -translate-y-1/2 z-10 p-2 rounded-full bg-white shadow-md"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
