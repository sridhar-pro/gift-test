"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Star, ShoppingCart } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import PopupForm from "../components/PopupForm2"; // Import the form component
import Related from "../Home/Related";

export default function ProductList() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [category, setCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const [selectedOption, setSelectedOption] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [savedVariants, setSavedVariants] = useState(() => {
    // Load previously saved variants from localStorage on mount
    if (typeof window !== "undefined") {
      return JSON.parse(localStorage.getItem("selectedVariants")) || {};
    }
    return {};
  });
  useEffect(() => {
    console.log("Saved Variants:", savedVariants);
  }, [savedVariants]);

  // Flatten all product images into a single gallery array
  // Compute all images based on current products
  const allImages = products.flatMap((p) =>
    p.images?.length > 0 ? p.images : [p.image]
  );

  // State for active hero image
  const [activeImg, setActiveImg] = useState(allImages[0] || null);

  // Whenever products change (new category), reset activeImg to first image
  useEffect(() => {
    if (allImages.length > 0) {
      setActiveImg(allImages[0]); // reset to first image of new category
    } else {
      setActiveImg(null);
    }
  }, [products]); // <-- notice we watch `products`, not `allImages`

  // Then the thumbnail click handler
  const handleThumbnailClick = (img) => {
    setActiveImg(img); // allows user to pick any thumbnail
  };

  // Category content data
  const categoryContent = {
    888: {
      name: "Signature Conscious",
      title:
        "Signature Conscious Selection Hamper | Sustainable & Artisan-Crafted Festive Gift Box | Premium Corporate & Diwali Gifting",
      description:
        "The Signature Conscious Selection Hamper is where luxury meets responsibility. This eco-friendly, artisan-crafted hamper brings together sustainable lifestyle essentials, festive treats, and handcrafted keepsakes. Perfect for Diwali, corporate clients, or loved ones who value purpose-driven gifting.",
      tagline: "Celebrate consciously, gift meaningfully.",
      features: [
        "Eco-Conscious Luxury – Blends festive elegance with sustainable living.",
        "Artisan-Made – Handpicked items crafted by women artisans and small businesses.",
        "Versatile Gifting – Ideal for corporates, families, and festive celebrations.",
        "Sustainable & Stylish – Premium packaging with minimal environmental impact.",
        "Gift with Purpose – Every hamper supports artisan livelihoods and conscious commerce.",
      ],
      price: 87500, // ₹500 in paise for Razorpay
    },
    890: {
      name: "Eco Luxe",
      title:
        "Eco-Luxe Selection Hamper | Luxury Sustainable Festive Gift Box | Premium Eco-Friendly Corporate & Personal Gifting",
      description:
        "The Eco-Luxe Selection Hamper is curated for those who love indulgence with integrity. Combining eco-conscious design with high-end artisanal products — from organic beauty to premium homeware — this hamper is a refined choice for Diwali, festive, and corporate gifting.",
      tagline: "Luxury that loves back.",
      features: [
        "Luxury with Purpose – Premium artisan-crafted products made sustainably.",
        "Eco-Luxe Essentials – Organic, eco-friendly items with a luxe finish.",
        "Perfect for Premium Gifting – Great for executives, clients, and loved ones.",
        "Sustainably Packaged – Elegant, eco-conscious festive packaging.",
        "Sophisticated & Sustainable – A modern hamper for mindful celebrations.",
      ],
      price: 200000, // ₹750 in paise for Razorpay
    },
    891: {
      name: "Gratitude Box",
      title:
        "Gratitude Box | Thoughtful Festive Hamper for Employees, Clients & Loved Ones | Sustainable Diwali & Corporate Gifting",
      description:
        "The Gratitude Box is a heartfelt way to say thank you. Curated with sustainable festive products and artisan-crafted essentials, this hamper celebrates relationships with warmth, authenticity, and impact. Perfect for employees, clients, and personal gifting.",
      tagline: "When thanks need to be extraordinary.",
      features: [
        "Gift of Gratitude – A hamper designed to appreciate and celebrate bonds.",
        "Sustainably Curated – Eco-friendly, artisan-made festive products.",
        "Perfect for Employees & Clients – An ideal corporate gifting solution.",
        "Festive & Thoughtful – Designed to spread joy during Diwali and beyond.",
        "Impact-Driven – Every purchase supports women artisans and small businesses.",
      ],
      price: 80000, // ₹600 in paise for Razorpay
    },
    889: {
      name: "Mini Treasures",
      title:
        "Mini Treasures | Compact Festive Gift Hamper | Thoughtful & Eco-Friendly Diwali Gifting",
      description:
        "The Mini Treasures Hamper is proof that small gifts can carry big joy. A compact curation of festive essentials, this hamper is perfect for employees, friends, and family — offering a taste of Yuukke's conscious and celebratory spirit.",
      tagline: "Little gifts, big smiles.",
      features: [
        "Compact & Thoughtful – Perfect for meaningful gestures on a budget",
        "Eco-Friendly Festivity – Features handcrafted, sustainable products",
        "Ideal for Bulk Gifting – Employees, colleagues, or friends",
        "Affordable & Joyful – Small hamper, big impact",
      ],
      price: 60000, // ₹400 in paise for Razorpay
    },
    896: {
      name: "Elite Desk Hamper",
      title: "Elite essentials for mindful professionals.",
      description:
        "The Elite Desk Hamper is a perfect blend of elegance and utility — designed for professionals who value style and substance. Featuring a sleek desk organiser, a fabric-covered notebook, and a handmade flower-shaped candle, this hamper makes workspaces more inspiring and gifting more meaningful.",
      tagline: "Little gifts, big smiles.",
      features: [
        "Compact & Thoughtful – Perfect for meaningful gestures on a budget",
        "Eco-Friendly Festivity – Features handcrafted, sustainable products",
        "Ideal for Bulk Gifting – Employees, colleagues, or friends",
        "Affordable & Joyful – Small hamper, big impact",
      ],
      price: 250000, // ₹400 in paise for Razorpay
    },
    default: {
      name: "Premium Gifts",
      title:
        "Premium Gift Collection | Exquisite Presentation | Memorable Gifting",
      description:
        "Discover our curated collection of premium gifts, each thoughtfully designed to create lasting impressions for any occasion.",
      tagline: "Elevate your gifting experience.",
      features: [
        "Premium Quality – Finest materials and craftsmanship",
        "Versatile Options – Perfect for various occasions and recipients",
        "Elegant Packaging – Beautiful presentation that impresses",
        "Meaningful Selection – Gifts that resonate with recipients",
      ],
      price: 50000, // ₹500 in paise for Razorpay
    },
  };

  // Static product data for demonstration
  const staticProducts = {
    // Products for different categories
    888: [
      {
        id: 1,
        name: "Premium Coffee Mug",
        description: "Elegant ceramic coffee mug with premium finish",
        price: "₹1,499",
        rating: 4.8,
        image: "/product-list/coffee mug.png",
      },
      {
        id: 11,
        name: "Gourmet Coffee Hamper",
        description: "Selection of finest coffee beans and accessories",
        price: "₹2,299",
        rating: 4.7,
        image: "/Copy of ecomug1r.png",
      },
      {
        id: 4,
        name: "Gourmet Coffee Hamper",
        description: "Selection of finest coffee beans and accessories",
        price: "₹2,299",
        rating: 4.7,
        image: "/product-list/14.jpg",
      },
      {
        id: 5,
        name: "Gourmet Coffee Hamper",
        description: "Selection of finest coffee beans and accessories",
        price: "₹2,299",
        rating: 4.7,
        image: "/product-list/13.jpg",
      },
      {
        id: 6,
        name: "Gourmet Coffee Hamper",
        description: "Selection of finest coffee beans and accessories",
        price: "₹2,299",
        rating: 4.7,
        image: "/product-list/12.jpg",
      },
      {
        id: 7,
        name: "Gourmet Coffee Hamper",
        description: "Selection of finest coffee beans and accessories",
        price: "₹2,299",
        rating: 4.7,
        image: "/product-list/11.jpg",
      },
      {
        id: 8,
        name: "Gourmet Coffee Hamper",
        description: "Selection of finest coffee beans and accessories",
        price: "₹2,299",
        rating: 4.7,
        image: "/product-list/10.jpg",
      },
      {
        id: 9,
        name: "Gourmet Coffee Hamper",
        description: "Selection of finest coffee beans and accessories",
        price: "₹2,299",
        rating: 4.7,
        image: "/product-list/9.jpg",
      },
      {
        id: 10,
        name: "Gourmet Coffee Hamper",
        description: "Selection of finest coffee beans and accessories",
        price: "₹2,299",
        rating: 4.7,
        image: "/product-list/8.jpg",
      },
      {
        id: 15,
        name: "Gourmet Coffee Hamper",
        description: "Selection of finest coffee beans and accessories",
        price: "₹2,299",
        rating: 4.7,
        image: "/product-list/3.jpg",
      },
      {
        id: 16,
        name: "Mixed Dry Fruits 100gm",
        description: "Selection of finest coffee beans and accessories",
        price: "₹2,299",
        rating: 4.7,
        image: "/product-list/nuts.png",
      },
    ],
    890: [
      {
        id: 1,
        name: "Artisanal Tea Collection",
        description: "Premium teas from around the world",
        price: "₹1,799",
        rating: 4.9,
        image: "/eco-luxe/coffee mug.png",
      },
      {
        id: 2,
        name: "Artisanal Tea Collection",
        description: "Premium teas from around the world",
        price: "₹1,799",
        rating: 4.9,
        image: "/eco-luxe/4.jpg",
      },
      {
        id: 3,
        name: "Artisanal Tea Collection",
        description: "Premium teas from around the world",
        price: "₹1,799",
        rating: 4.9,
        image: "/eco-luxe/20.jpg",
      },
      {
        id: 4,
        name: "Gourmet Coffee Hamper",
        description: "Selection of finest coffee beans and accessories",
        price: "₹2,299",
        rating: 4.7,
        image: "/product-list/2.png",
      },
      {
        id: 5,
        name: "Gourmet Coffee Hamper",
        description: "Selection of finest coffee beans and accessories",
        price: "₹2,299",
        rating: 4.7,
        image: "/product-list/15.jpg",
      },
    ],
    891: [
      {
        id: 1,
        name: "Wine & Cheese Set",
        description: "Fine wine paired with artisan cheeses",
        price: "₹4,299",
        rating: 4.8,
        image: "/product-list/3.jpg",
      },
      {
        id: 2,
        name: "Wine & Cheese Set",
        description: "Fine wine paired with artisan cheeses",
        price: "₹4,299",
        rating: 4.8,
        image: "/gratitude/ganesha fridge magnet_r.png",
      },
      {
        id: 3,
        name: "Wine & Cheese Set",
        description: "Fine wine paired with artisan cheeses",
        price: "₹4,299",
        rating: 4.8,
        image: "/product-list/nuts.png",
      },
    ],
    889: [
      {
        id: 1,
        name: "Wine & Cheese Set",
        description: "Fine wine paired with artisan cheeses",
        price: "₹4,299",
        rating: 4.8,
        image: "/treasures/17.jpg",
      },
      {
        id: 3,
        name: "Wine & Cheese Set",
        description: "Fine wine paired with artisan cheeses",
        price: "₹4,299",
        rating: 4.8,
        image: "/treasures/6cb0a5ca68b104dc6f017f7703c6b2a3.webp",
      },
      {
        id: 4,
        name: "Wine & Cheese Set",
        description: "Fine wine paired with artisan cheeses",
        price: "₹4,299",
        rating: 4.8,
        image: "/product-list/brasscandle.png",
      },
    ],
    896: [
      {
        id: 1,
        name: "Wine & Cheese Set",
        description: "Fine wine paired with artisan cheeses",
        price: "₹4,299",
        rating: 4.8,
        image: "/product-list/elite1.png",
      },
      {
        id: 2,
        name: "Wine & Cheese Set",
        description: "Fine wine paired with artisan cheeses",
        price: "₹4,299",
        rating: 4.8,
        image: "/product-list/elite2.png",
      },
      {
        id: 3,
        name: "Wine & Cheese Set",
        description: "Fine wine paired with artisan cheeses",
        price: "₹4,299",
        rating: 4.8,
        image: "/product-list/elite3.png",
      },
      {
        id: 4,
        name: "Wine & Cheese Set",
        description: "Fine wine paired with artisan cheeses",
        price: "₹4,299",
        rating: 4.8,
        image: "/product-list/nuts.png",
      },
    ],
    // Default products for any category
    default: [
      {
        id: 7,
        name: "Corporate Gift Set",
        description: "Elegant gifts for business partners and clients",
        price: "₹2,999",
        rating: 4.7,
        image: "/corporate-gift.jpg",
      },
      {
        id: 8,
        name: "Personalized Gift Box",
        description: "Customizable gift box with personal touches",
        price: "₹3,799",
        rating: 4.8,
        image: "/personalized-box.jpg",
      },
    ],
  };

  useEffect(() => {
    const initializePage = () => {
      try {
        setLoading(true);

        const queryCategoryId = searchParams.get("categoryId");
        const storedCategoryId = localStorage.getItem("selectedCategoryId");
        const categoryId = queryCategoryId || storedCategoryId;

        if (!categoryId) {
          router.push("/"); // redirect if no category
          return;
        }

        // Update state
        setCategory({
          id: categoryId,
          name:
            categoryContent[categoryId]?.name ||
            categoryContent["default"].name,
        });

        // Save to localStorage (keeps consistency)
        localStorage.setItem("selectedCategoryId", categoryId);

        // Get products
        setProducts(staticProducts[categoryId] || staticProducts.default);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    initializePage();
  }, [router, searchParams]);

  const handleBack = () => {
    router.back();
  };

  const handleAddToCart = (productId) => {
    console.log("Added product to cart:", productId);
    // Add your cart logic here
  };

  const handleOrderNow = () => {
    // Set selectedProduct to null since we're ordering the entire category
    setSelectedProduct(null);
    setShowForm(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#A00030]"></div>
      </div>
    );
  }

  const currentCategoryContent =
    categoryContent[category?.id] || categoryContent["default"];

  return (
    <div className="min-h-screen bg-gray-50 font-gift">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={handleBack}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                <ArrowLeft className="h-6 w-6 text-gray-700" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {category?.name || "Gift Products"}
                </h1>
                <p className="text-gray-600">
                  {products.length} products available
                </p>
              </div>
            </div>

            {/* Common Order Button - Moved to top right */}
            {/* <button
              onClick={handleOrderNow}
              className="px-6 py-2 bg-[#A00030] text-white rounded-lg hover:bg-[#800025] transition-colors text-sm font-medium hidden md:block"
            >
              Order This Collection
            </button> */}
          </div>
        </div>
      </div>

      {/* Category Content Section */}
      <div className="container mx-auto px-4 py-8">
        {/* Products Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Side - Hero + Thumbnails */}
          <div className="flex flex-col gap-4">
            {/* Hero Image */}
            <motion.div
              key={activeImg}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="relative w-full aspect-square bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl overflow-hidden shadow-md"
            >
              <Image
                src={activeImg || "/default-product.jpg"}
                alt="Selected product"
                fill
                className="object-contain p-6"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </motion.div>

            {/* Thumbnails */}
            <div className="flex gap-3 overflow-x-auto scrollbar-hide">
              {allImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImg(img)}
                  className={`relative w-20 h-20 flex-shrink-0 rounded-md border overflow-hidden ${
                    activeImg === img
                      ? "border-gray-800"
                      : "border-gray-200 hover:border-gray-400"
                  }`}
                >
                  <Image
                    src={img || "/default-product.jpg"}
                    alt={`thumb-${idx}`}
                    fill
                    className="object-contain p-1"
                  />
                </button>
              ))}
            </div>

            {/* === New Section: Mini Treasures Contents === */}
            {currentCategoryContent?.name === "Mini Treasures" && (
              <div className="mt-4 mb-8">
                <h3 className="font-semibold text-gray-800 mb-2">Contents:</h3>
                <ul className="list-disc list-inside space-y-1 text-gray-700">
                  <li>Brass Candle with Rich Velvet Pouch</li>
                  <li>Flavoured DipTea (3 sachets)</li>
                  <li>Almonds 50g</li>
                  <li>Cashews 50g</li>
                </ul>
              </div>
            )}

            {/* === New Section: Gratitude Box Contents === */}
            {currentCategoryContent?.name === "Gratitude Box" && (
              <div className="mt-4 mb-8">
                <h3 className="font-semibold text-gray-800 mb-2">Contents:</h3>
                <ul className="list-disc list-inside space-y-1 text-gray-700">
                  <li>Metal Flower shape candle</li>
                  <li>Ganesh idol embellished Fridge Magnet</li>
                  <li>Mixed Dry Fruits 100gm</li>
                </ul>
              </div>
            )}

            {/* === New Section: Elite Desk HamperContents === */}
            {currentCategoryContent?.name === "Elite Desk Hamper" && (
              <div className="mt-4 mb-8">
                <h3 className="font-semibold text-gray-800 mb-2">Contents:</h3>
                <ul className="list-disc list-inside space-y-1 text-gray-700">
                  <li>Silk Fabric Cover notebook</li>
                  <li>Mixed Dry Fruits 100gm</li>
                  <li>Elegant Organiser</li>
                  <li>Handmade Flower-Shaped Candle</li>
                </ul>
              </div>
            )}

            {/* === New Section: Choose Options (only for category 888) === */}
            {currentCategoryContent?.name === "Signature Conscious" && (
              <div className="mt-4">
                <h3 className="font-semibold text-gray-800 mb-2">
                  Choose Options:
                </h3>
                <div className="space-y-2">
                  {[
                    {
                      name: "Eco Coffee Mug 220 ml",
                      variants: [
                        {
                          name: "Premium Coffee Mug - Black",
                          image: "/product-list/coffee mug.png",
                        },
                        {
                          name: "Premium Coffee Mug - Sandal",
                          image: "/Copy of ecomug1r.png",
                        },
                      ],
                    },
                    {
                      name: "Fabric Cover Notebook",
                      variants: [
                        {
                          name: "Notebook Variant 1",
                          image: "/product-list/14.jpg",
                        },
                        {
                          name: "Notebook Variant 2",
                          image: "/product-list/13.jpg",
                        },
                        {
                          name: "Notebook Variant 3",
                          image: "/product-list/12.jpg",
                        },
                        {
                          name: "Notebook Variant 4",
                          image: "/product-list/11.jpg",
                        },
                        {
                          name: "Notebook Variant 5",
                          image: "/product-list/10.jpg",
                        },
                        {
                          name: "Notebook Variant 6",
                          image: "/product-list/9.jpg",
                        },
                        {
                          name: "Notebook Variant 7",
                          image: "/product-list/8.jpg",
                        },
                      ],
                    },
                    {
                      name: "Metal Flower Shape Candle",
                      variants: [
                        {
                          name: "Metal Flower Candle Variant",
                          image: "/product-list/3.jpg",
                        },
                      ],
                    },
                    {
                      name: "Mixed Dry Fruits 100gm",
                      variants: [
                        {
                          name: "Mixed Dry Fruits 100gm",
                          image: "/product-list/nuts.png",
                        },
                      ],
                    },
                  ].map((item, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedOption(item)}
                      className="w-full text-left px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition"
                    >
                      {item.name}
                      <span className="text-sm bg-[#a00300] text-white p-1 font-bold rounded-md ml-2">
                        Change Option
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* === Popup / Modal for Variants === */}
            <AnimatePresence>
              {selectedOption && (
                <motion.div
                  className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <motion.div
                    className="bg-white rounded-xl p-6 w-[35rem] shadow-lg relative"
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                  >
                    {/* Close Button */}
                    <button
                      onClick={() => {
                        setSelectedOption(null);
                        setSelectedVariant(null);
                      }}
                      className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
                    >
                      ✕
                    </button>

                    <h4 className="font-bold text-lg mb-4">
                      {selectedOption.name} - Variants
                    </h4>

                    <div className="grid grid-cols-2 gap-4">
                      {selectedOption.variants.map((variant, idx) => {
                        const isSelected =
                          selectedVariant?.name === variant.name;
                        return (
                          <div
                            key={idx}
                            onClick={() => {
                              setSelectedVariant(variant);

                              // Save to localStorage
                              const updatedVariants = {
                                ...savedVariants,
                                [selectedOption.name]: variant.name, // use option name as key
                              };
                              setSavedVariants(updatedVariants);
                              localStorage.setItem(
                                "selectedVariants",
                                JSON.stringify(updatedVariants)
                              );
                            }}
                            className={`flex flex-col items-center p-2 border rounded-lg transition cursor-pointer ${
                              isSelected
                                ? "border-red-500 bg-red-50 shadow-md"
                                : "border-gray-300 hover:shadow-md"
                            }`}
                          >
                            <img
                              src={variant.image}
                              alt={variant.name}
                              className="w-20 h-20 object-cover rounded-md mb-2"
                            />
                            <span
                              className={`text-sm ${
                                isSelected
                                  ? "text-red-600 font-semibold"
                                  : "text-gray-700"
                              }`}
                            >
                              {variant.name}
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    {/* Confirm Selection (optional) */}
                    {selectedVariant && (
                      <div className="mt-6 flex justify-end">
                        <button
                          onClick={() => {
                            console.log("User selected:", selectedVariant);
                            setSelectedOption(null); // close modal
                          }}
                          className="px-4 py-2 bg-[#a00300] text-white rounded-lg hover:bg-red-700 transition"
                        >
                          Confirm
                        </button>
                      </div>
                    )}
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex md:hidden flex-col justify-start p-6">
              {/* Title */}
              <h2 className="text-3xl font-bold text-[#A00030] mb-3">
                {currentCategoryContent.title}
              </h2>

              {/* Price Section */}
              <div className="mb-6">
                <p className="text-3xl font-bold text-gray-900">
                  ₹ {(currentCategoryContent.price / 100).toFixed(2)}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  (TAX included · FREE Shipping)
                </p>
              </div>
              <div className="">
                <PopupForm
                  inline={true}
                  product={selectedProduct}
                  category={category}
                  categoryContent={currentCategoryContent}
                />
              </div>
            </div>

            {/* Description */}
            <p className="text-gray-700 mb-4 text-justify">
              {currentCategoryContent.description}
            </p>

            {/* Wrapper for Key Features + Static Images */}
            <div className="flex flex-col lg:flex-row lg:gap-6 border-t pt-4">
              {/* Left: Key Features */}
              <div className="flex-1">
                <h3 className="font-semibold text-gray-800 mb-3">
                  Key Features:
                </h3>
                <ul className="space-y-2">
                  {currentCategoryContent.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <span className="mr-2">•</span>
                      <span className="text-gray-600">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Right: Static Badges */}
            <div className="mt-8 lg:mt-10">
              {/* <h3 className="text-lg font-semibold text-gray-800 mb-3">
                Trusted By:
              </h3> */}
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-4 items-center justify-items-center">
                {[
                  "1.webp",
                  "2.webp",
                  "3.webp",
                  "4.webp",
                  "5.webp",
                  "6.webp",
                ].map((img, i) => (
                  <div
                    key={i}
                    className="w-20 h-20 sm:w-24 sm:h-24 flex justify-center items-center"
                  >
                    <Image
                      src={`/${img}`}
                      alt={`badge-${i + 1}`}
                      width={96}
                      height={96}
                      className="object-contain"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Side - Product Details */}
          <div className="">
            <div className="hidden md:flex flex-col justify-start p-6">
              {/* Title */}
              <h2 className="text-3xl font-bold text-[#A00030] mb-3">
                {currentCategoryContent.title}
              </h2>

              {/* Price Section */}
              <div className="mb-6">
                <p className="text-3xl font-bold text-gray-900">
                  ₹ {(currentCategoryContent.price / 100).toFixed(2)}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  (TAX included · FREE Shipping)
                </p>
              </div>
              <div className="">
                <PopupForm
                  inline={true}
                  product={selectedProduct}
                  category={category}
                  categoryContent={currentCategoryContent}
                />
              </div>
            </div>

            {/* ⬇️ Related Products Section */}
            <div className="mt-12">
              <h3 className="text-2xl font-bold mb-4">You may also like</h3>
              <Related />
            </div>
          </div>
        </div>
        {products.length === 0 && (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
              <ShoppingCart className="h-8 w-8 text-gray-400" />
            </div>
            <p className="text-gray-500">No products found in this category.</p>
            <button
              onClick={handleBack}
              className="mt-4 px-6 py-2 bg-[#A00030] text-white rounded-lg hover:bg-[#800025] transition-colors"
            >
              Browse Categories
            </button>
          </div>
        )}
      </div>

      {/* Payment Form Popup */}
      <PopupForm
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        product={selectedProduct}
        category={category}
        categoryContent={currentCategoryContent}
      />
    </div>
  );
}

{
  /* Content Container */
}
{
  /* <div className="p-4 flex flex-col flex-grow">
                <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 text-sm md:text-base">
                  {product.name}
                </h3>
                <p className="text-gray-600 text-xs md:text-sm mb-3 line-clamp-2 flex-grow">
                  {product.description}
                </p>
                <div className="flex items-center justify-between mt-auto">
                  <span className="text-lg font-bold text-[#A00030]">
                    {product.price}
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleAddToCart(product.id)}
                      className="p-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors flex items-center justify-center"
                    >
                      <ShoppingCart className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleOrderNow(product)}
                      className="px-4 py-2 bg-[#A00030] text-white rounded-lg hover:bg-[#800025] transition-colors text-sm md:hidden"
                    >
                      Order
                    </button>
                  </div>
                </div>
              </div> */
}

{
  /* Additional Images Section */
}
{
  /* <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mt-12">
          <div className="bg-white rounded-xl shadow-sm p-6 flex flex-col items-center">
            <div className="relative w-24 h-24 rounded-full bg-gray-50 overflow-hidden mb-4">
              <Image
                src="/icon-product/1.webp"
                alt="Consciously Crafted"
                width={300}
                height={300}
                className="object-contain p-5"
                sizes="(max-width: 768px) 96px, 96px"
              />
            </div>
            <div className="text-center">
              <h3 className="font-semibold text-gray-900">
                CONSCIOUSLY CRAFTED
              </h3>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 flex flex-col items-center">
            <div className="relative w-24 h-24 rounded-full bg-gray-50 overflow-hidden mb-4">
              <Image
                src="/icon-product/2.webp"
                alt="Premium Quality"
                width={300}
                height={300}
                className="object-contain p-5"
                sizes="(max-width: 768px) 96px, 96px"
              />
            </div>
            <div className="text-center">
              <h3 className="font-semibold text-gray-900">PREMIUM QUALITY</h3>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 flex flex-col items-center">
            <div className="relative w-24 h-24 rounded-full bg-gray-50 overflow-hidden mb-4">
              <Image
                src="/icon-product/3.webp"
                alt="On-Time Delivery"
                width={300}
                height={300}
                className="object-contain p-5"
                sizes="(max-width: 768px) 96px, 96px"
              />
            </div>
            <div className="text-center">
              <h3 className="font-semibold text-gray-900">ON-TIME DELIVERY</h3>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 flex flex-col items-center">
            <div className="relative w-24 h-24 rounded-full bg-gray-50 overflow-hidden mb-4">
              <Image
                src="/icon-product/4.webp"
                alt="Eco Friendly"
                width={300}
                height={300}
                className="object-contain p-5"
                sizes="(max-width: 768px) 96px, 96px"
              />
            </div>
            <div className="text-center">
              <h3 className="font-semibold text-gray-900">ECO FRIENDLY</h3>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 flex flex-col items-center">
            <div className="relative w-24 h-24 rounded-full bg-gray-50 overflow-hidden mb-4">
              <Image
                src="/icon-product/5.webp"
                alt="Artisan Made"
                width={300}
                height={300}
                className="object-contain p-5"
                sizes="(max-width: 768px) 96px, 96px"
              />
            </div>
            <div className="text-center">
              <h3 className="font-semibold text-gray-900">ARTISAN MADE</h3>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 flex flex-col items-center">
            <div className="relative w-24 h-24 rounded-full bg-gray-50 overflow-hidden mb-4">
              <Image
                src="/icon-product/6.webp"
                alt="Customizable"
                width={300}
                height={300}
                className="object-contain p-5"
                sizes="(max-width: 768px) 96px, 96px"
              />
            </div>
            <div className="text-center">
              <h3 className="font-semibold text-gray-900">CUSTOMIZABLE</h3>
            </div>
          </div>
        </div> */
}

{
  /* <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-xl shadow-md p-6 mb-8 mt-6"
        >
          <p className="text-gray-700 mb-4">
            {currentCategoryContent.description}
          </p>

          <div className="flex flex-col lg:flex-row lg:gap-6 border-t pt-4">
            <div className="flex-1">
              <h3 className="font-semibold text-gray-800 mb-3">
                Key Features:
              </h3>
              <ul className="space-y-2">
                {currentCategoryContent.features.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <span className="mr-2">•</span>
                    <span className="text-gray-600">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="grid grid-cols-3 gap-1 mt-4 lg:mt-0 lg:w-[40%]">
              {["1.webp", "2.webp", "3.webp", "4.webp", "5.webp", "6.webp"].map(
                (img, i) => (
                  <div key={i} className="flex justify-center items-center">
                    <Image
                      src={`/${img}`}
                      alt={`image ${i + 1}`}
                      width={120}
                      height={120}
                      className="object-cover rounded-md"
                    />
                  </div>
                )
              )}
            </div>
          </div>

          <div className="mt-6 md:hidden">
            <button
              onClick={handleOrderNow}
              className="w-full px-6 py-3 bg-[#A00030] text-white rounded-lg hover:bg-[#800025] transition-colors text-sm font-medium"
            >
              Order This Collection
            </button>
          </div>
        </motion.div> */
}

{
  /* Premium Inquiry Form */
}
{
  /* <form className="bg-gray-50 rounded-2xl shadow-md p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Full Name"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-1 focus:ring-[#A00030] focus:border-[#A00030] outline-none"
                />
                <input
                  type="tel"
                  placeholder="Phone"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-1 focus:ring-[#A00030] focus:border-[#A00030] outline-none"
                />
              </div>

              <input
                type="email"
                placeholder="Email"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-1 focus:ring-[#A00030] focus:border-[#A00030] outline-none"
              />

              <input
                type="text"
                placeholder="City"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-1 focus:ring-[#A00030] focus:border-[#A00030] outline-none"
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Gifting For"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-1 focus:ring-[#A00030] focus:border-[#A00030] outline-none"
                />
                <input
                  type="number"
                  placeholder="Budget (₹)"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-1 focus:ring-[#A00030] focus:border-[#A00030] outline-none"
                />
              </div>

              <input
                type="number"
                placeholder="Quantity"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-1 focus:ring-[#A00030] focus:border-[#A00030] outline-none"
              />

              <button
                type="submit"
                className="w-full bg-[#A00030] text-white font-semibold py-3 rounded-lg hover:bg-[#870027] transition-all duration-300"
              >
                Order this collection
              </button>
            </form> */
}
