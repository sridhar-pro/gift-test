"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import Image from "next/image";

const containerVariants = {
  hidden: { opacity: 1 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const ComboSection = ({ combos }) => {
  const handleClick = (e, combo) => {
    // Optional: if you want to track clicked ID, define and use state here
    // setClickedId(combo.id);
  };

  return (
    <div className="px-4 md:px-8 mb-12">
      <div className="text-center mb-10">
        <h2 className="text-4xl font-extrabold text-gray-900 tracking-wide uppercase inline-block relative">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#A00030] to-[#000940]">
            Combos
          </span>
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-16 h-1 bg-[#A00030] rounded-full mt-1"></div>
        </h2>
        <p className="mt-2 text-gray-600 text-sm md:text-base max-w-2xl mx-auto">
          Explore our handpicked combo packs—perfectly curated for your special
          occasions.
        </p>
      </div>

      <motion.div
        className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-2"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {combos.map((combo) => {
          const discountPrice = combo.salePercent
            ? Math.round(combo.price * (1 - combo.salePercent / 100))
            : combo.price;

          return (
            <motion.div
              key={combo.id}
              variants={itemVariants}
              whileHover={{ scale: 1.02 }}
              className="bg-white cursor-pointer flex flex-col justify-start h-full"
              role="button"
              aria-label={`View details for ${combo.name}`}
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") handleClick(e, combo);
              }}
            >
              <Link
                href="/custom-box"
                className="w-full h-full flex flex-col"
                onClick={(e) => handleClick(e, combo)}
                passHref
              >
                <div className="w-full h-32 md:h-72 relative rounded-md overflow-hidden">
                  <Image
                    src={combo.image}
                    alt={combo.name}
                    fill
                    className="object-cover rounded-md"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                    priority
                  />
                  {combo.sale && (
                    <>
                      {/* Mobile badge */}
                      <span className="absolute top-2 left-2 bg-gradient-to-r from-red-500 to-pink-600 text-white text-xs font-semibold px-2 py-0.5 rounded shadow-md whitespace-nowrap sm:hidden">
                        {combo.sale}
                      </span>

                      {/* Desktop badge */}
                      <span className="hidden sm:inline absolute top-3 left-3 bg-pink-600 text-white text-xs font-bold px-3 py-1 rounded shadow-md select-none pointer-events-none">
                        {combo.sale}
                      </span>
                    </>
                  )}
                </div>
                <div className="p-4 flex flex-col justify-start flex-grow">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-gray-900 line-clamp-2 md:line-clamp-none">
                      {combo.name}
                    </h3>
                  </div>
                  <p className="text-sm text-gray-500 capitalize">
                    {combo.description}
                  </p>
                  <div className="mt-2 flex items-center justify-between">
                    <p className="text-sm text-gray-800 font-semibold">
                      ₹{discountPrice.toLocaleString()}
                    </p>
                    {combo.salePercent && (
                      <div className="flex items-center gap-1">
                        <p className="text-sm text-gray-400 line-through">
                          ₹{combo.price.toLocaleString()}
                        </p>
                        <span className="hidden md:flex text-xs font-bold text-pink-600 bg-pink-100 px-2 py-0.5 rounded">
                          {combo.sale}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
};

export default ComboSection;
