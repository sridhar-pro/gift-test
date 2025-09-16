"use client";
import { Suspense, useEffect, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { useRouter, useParams } from "next/navigation";
import PopupForm from "../components/PopupForm2";
import Related from "../Home/Related";
import PopupForm1 from "../components/PopupForm";
import { categoryContent } from "../data/products"; // ✅ Import your static content

function ProductListInner() {
  const router = useRouter();
  const params = useParams();
  const slug = params?.slug; // ✅ Always defined now

  const [category, setCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeImg, setActiveImg] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // ✅ Utility: slugify function for consistent comparison
  const slugify = (text) =>
    text
      ?.toString()
      ?.toLowerCase()
      ?.trim()
      ?.replace(/\s+/g, "-")
      ?.replace(/[^\w\-]+/g, "")
      ?.replace(/\-\-+/g, "-");

  // ✅ Find matching category by name instead of ID
  const findCategoryBySlug = (slug) => {
    for (const [id, content] of Object.entries(categoryContent)) {
      if (slugify(content.name) === slug) {
        return { id, ...content };
      }
    }
    return null;
  };

  useEffect(() => {
    if (!slug) return;

    try {
      setLoading(true);

      // ✅ Find the category based on slug
      const matchedCategory = findCategoryBySlug(slug);

      if (!matchedCategory) {
        console.warn(`❌ No category found for slug: ${slug}`);
        router.push("/"); // fallback to home if slug is invalid
        return;
      }

      setCategory(matchedCategory);

      // ✅ Fetch products based on category name instead of ID
      // You can replace this with API call if products are dynamic
      setProducts(staticProducts[matchedCategory.id] || staticProducts.default);

      // ✅ Save selected category for later use
      localStorage.setItem("selectedCategoryId", matchedCategory.id);
    } catch (err) {
      console.error("Error initializing page:", err);
    } finally {
      setLoading(false);
    }
  }, [slug, router]);

  const currentCategoryContent =
    categoryContent[category?.id] || categoryContent["default"];

  const allImages = products.flatMap((p) =>
    p.images?.length > 0 ? p.images : [p.image]
  );

  useEffect(() => {
    if (allImages.length > 0) {
      setActiveImg(allImages[0]);
    } else {
      setActiveImg(null);
    }
  }, [products]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#A00030]"></div>
      </div>
    );
  }

  const handleCheckout = () => {
    const payload = {
      product: selectedProduct,
      category,
      categoryContent: currentCategoryContent,
      quantity,
    };
    sessionStorage.setItem("checkoutData", JSON.stringify(payload));
    router.push("/checkout");
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
      image: "/product-list/def1.png",
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
      image: "/product-list/def4.jpg",
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
      price: 79000, // ₹600 in paise for Razorpay
      image: "/product-list/def3.png",
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
      image: "/product-list/def2.png",
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
      image: "/product-list/def5.jpg",
    },
    898: {
      name: "The Bamboo Luxe Hamper",
      title: "The Bamboo Luxe Hamper",
      description:
        "Whether it’s corporate gifting, festive occasions, or eco-friendly celebrations, this hamper blends luxury with sustainability. Every piece is crafted to inspire mindful living while empowering women entrepreneurs and artisans through Yuukke.",
      tagline: "Nature’s touch, packed with care.",
      features: [
        "Bamboo Water Bottle – stylish & reusable ",
        "Eco Diary with Bamboo Pen – for mindful notes & ideas ",
        "Handcrafted Bamboo Coasters – blending elegance & sustainability ",
        "Bamboo Phone Holder – functional & natural ",
        "Eco Coffee Mug – perfect for everyday impact ",
      ],
      price: 345000, // ₹2,990 in paise for Razorpay
      image: "/product-list/s6.jpg",
    },
    897: {
      name: "The Conscious Luxe Corporate Hamper",
      title: "The Conscious Luxe Corporate Hamper",
      description:
        "Upgrade corporate gifting with purpose. The Conscious Luxe Corporate Hamper blends premium cork-base work essentials with festive warmth — perfect for professionals who value sustainability and style. Thoughtfully curated to inspire productivity, balance, and conscious living.",
      tagline: "Luxury that cares for the planet.",
      features: [
        "Premium Curation – Handpicked eco-luxe essentials for high-end gifting",
        "Sustainable & Stylish – Crafted with environmentally responsible materials",
        "Perfect for CXOs & VIPs – Leaves a sophisticated and lasting impression",
        "Corporate Elegance – A thoughtful blend of sustainability and exclusivity",
      ],
      price: 350000, // ₹4,500 in paise for Razorpay
      image: "/product-list/s9.jpg",
    },
    899: {
      name: "Eco Luxe Workday Kit Hamper",
      title: "Eco Luxe Workday Kit Hamper",
      description:
        "Elevate your corporate gifting with the Eco Luxe Workday Kit — a premium, thoughtfully curated bundle featuring a cork-finish laptop bag, eco journal, eco mug, and coasters. Perfect for teams that value impact as much as excellence, this kit combines elegance with eco-conscious utility.",
      tagline: "Crafted with care. Gifted with intent.",
      features: [
        "Premium Curation – Handpicked eco-luxe essentials for high-end gifting",
        "Sustainable & Stylish – Crafted with environmentally responsible materials",
        "Perfect for CXOs & VIPs – Leaves a sophisticated and lasting impression",
        "Corporate Elegance – A thoughtful blend of sustainability and exclusivity",
      ],
      price: 290000, // ₹4,500 in paise for Razorpay
      image: "/product-list/s898.jpg",
    },
    900: {
      name: "The Prosperity Box",
      title: "The Prosperity Box",
      description:
        "Designed for discerning professionals, The Prosperity Box is the ideal corporate gift — combining cultural symbolism with premium quality. Perfect for expressing appreciation, strengthening partnerships, and building goodwill this festive season.",
      tagline: "Celebrate Partnership. Gift Prosperity",
      features: [
        "Cultural Symbolism – Infused with traditional motifs that signify prosperity and goodwill",
        "Premium Quality – A sophisticated selection of high-end essentials curated for elegance",
        "Corporate Appreciation – Ideal for expressing gratitude and strengthening business ties",
        "Festive Elegance – Perfectly designed to celebrate occasions with class and charm",
      ],
      price: 125000, // ₹4,500 in paise for Razorpay
      image: "/product-list/s70.png",
    },
    901: {
      name: "Eco-Excellence Kit",
      title: "Eco-Excellence Kit",
      description:
        "Celebrate your team with a gift that blends purpose and practicality — featuring a Cork Journal, Eco Mug, Cork Pen, and Coaster. Each piece is thoughtfully designed to reflect eco- conscious living while honoring high achievers.",
      tagline: "Reward performance, the sustainable way.",
      features: [
        "Eco-Friendly Essentials – Includes a Cork Journal, Eco Mug, Pen, and Coaster",
        "Sustainable Gifting – Thoughtfully crafted with environmentally conscious materials",
        "Purposeful & Practical – Everyday utility items with a premium eco-touch",
        "Recognition with Responsibility – Perfect for honoring achievers while promoting green values",
      ],
      price: 150000, // ₹4,500 in paise for Razorpay
      image: "/2.jpeg",
    },
    902: {
      name: "Celebration Treasures",
      title: "Celebration Treasures",
      description:
        " Make your festive gifting meaningful with Yuukke’s Celebration Treasures Hamper — a perfect blend of sustainability, tradition, and artisanal charm. Curated with love and care, this exclusive hamper is beautifully packed in a woven bamboo basket and filled with handcrafted treasures that light up every celebration.",
      tagline: "Reward performance, the sustainable way.",
      features: [
        "Eco-conscious & sustainable",
        "Handcrafted by skilled artisans",
        "Thoughtfully curated for festive and corporate gifting",
        "Packed in an elegant woven bamboo basket ",
      ],
      price: 150000, // ₹4,500 in paise for Razorpay
      image: "/product-list/ham11.png",
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
        id: 0,
        name: "Premium Coffee Mug",
        description: "Elegant ceramic coffee mug with premium finish",
        price: "₹1,499",
        rating: 4.8,
        image: "/product-list/def1.png",
      },
      {
        id: 1,
        name: "Premium Coffee Mug - black",
        description: "Elegant ceramic coffee mug with premium finish",
        price: "₹1,499",
        rating: 4.8,
        image: "/product-list/coffeemugblack.png",
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
        image: "/product-list/mixednuts.png",
      },
    ],
    890: [
      {
        id: 3,
        name: "Premium Coffee Mug",
        description: "Elegant ceramic coffee mug with premium finish",
        price: "₹1,499",
        rating: 4.8,
        image: "/product-list/def4.jpg",
      },
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
      {
        id: 16,
        name: "Mixed Dry Fruits 100gm",
        description: "Selection of finest coffee beans and accessories",
        price: "₹2,299",
        rating: 4.7,
        image: "/product-list/mixednuts.png",
      },
    ],
    891: [
      {
        id: 0,
        name: "Premium Coffee Mug",
        description: "Elegant ceramic coffee mug with premium finish",
        price: "₹1,499",
        rating: 4.8,
        image: "/product-list/def3.png",
      },
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
        id: 16,
        name: "Mixed Dry Fruits 100gm",
        description: "Selection of finest coffee beans and accessories",
        price: "₹2,299",
        rating: 4.7,
        image: "/product-list/mixednuts.png",
      },
    ],
    889: [
      {
        id: "0",
        name: "Premium Coffee Mug",
        description: "Elegant ceramic coffee mug with premium finish",
        price: "₹1,499",
        rating: 4.8,
        image: "/product-list/def2.png",
      },
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
        id: 0,
        name: "Wine & Cheese Set",
        description: "Fine wine paired with artisan cheeses",
        price: "₹4,299",
        rating: 4.8,
        image: "/product-list/def5.jpg",
      },
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
    898: [
      {
        id: 1,
        name: "Wine & Cheese Set",
        description: "Fine wine paired with artisan cheeses",
        price: "₹4,299",
        rating: 4.8,
        image: "/product-list/s6.jpg",
      },
      {
        id: 3,
        name: "Wine & Cheese Set",
        description: "Fine wine paired with artisan cheeses",
        price: "₹4,299",
        rating: 4.8,
        image: "/product-list/s2.jpg",
      },
      {
        id: 4,
        name: "Wine & Cheese Set",
        description: "Fine wine paired with artisan cheeses",
        price: "₹4,299",
        rating: 4.8,
        image: "/product-list/s7.jpg",
      },
      {
        id: 5,
        name: "Wine & Cheese Set",
        description: "Fine wine paired with artisan cheeses",
        price: "₹4,299",
        rating: 4.8,
        image: "/product-list/s5.jpg",
      },
      {
        id: 6,
        name: "Wine & Cheese Set",
        description: "Fine wine paired with artisan cheeses",
        price: "₹4,299",
        rating: 4.8,
        image: "/product-list/s1.jpg",
      },
      {
        id: 7,
        name: "Wine & Cheese Set",
        description: "Fine wine paired with artisan cheeses",
        price: "₹4,299",
        rating: 4.8,
        image: "/product-list/s21.png",
      },
      {
        id: 8,
        name: "Wine & Cheese Set",
        description: "Fine wine paired with artisan cheeses",
        price: "₹4,299",
        rating: 4.8,
        image: "/product-list/nuts.png",
      },
    ],
    897: [
      {
        id: 1,
        name: "Wine & Cheese Set",
        description: "Fine wine paired with artisan cheeses",
        price: "₹4,299",
        rating: 4.8,
        image: "/product-list/s9.jpg",
      },
      {
        id: 2,
        name: "Wine & Cheese Set",
        description: "Fine wine paired with artisan cheeses",
        price: "₹4,299",
        rating: 4.8,
        image: "/product-list/15.jpg",
      },
      {
        id: 3,
        name: "Wine & Cheese Set",
        description: "Fine wine paired with artisan cheeses",
        price: "₹4,299",
        rating: 4.8,
        image: "/product-list/coffeemugblack.png",
      },
      {
        id: 4,
        name: "Wine & Cheese Set",
        description: "Fine wine paired with artisan cheeses",
        price: "₹4,299",
        rating: 4.8,
        image: "/product-list/s8.jpg",
      },
      {
        id: 5,
        name: "Wine & Cheese Set",
        description: "Fine wine paired with artisan cheeses",
        price: "₹4,299",
        rating: 4.8,
        image: "/product-list/s20.png",
      },
      {
        id: 8,
        name: "Wine & Cheese Set",
        description: "Fine wine paired with artisan cheeses",
        price: "₹4,299",
        rating: 4.8,
        image: "/product-list/s10.jpg",
      },
    ],
    899: [
      {
        id: 1,
        name: "Wine & Cheese Set",
        description: "Fine wine paired with artisan cheeses",
        price: "₹4,299",
        rating: 4.8,
        image: "/product-list/s898.jpg",
      },
      {
        id: 2,
        name: "Wine & Cheese Set",
        description: "Fine wine paired with artisan cheeses",
        price: "₹4,299",
        rating: 4.8,
        image: "/product-list/8981.jpg",
      },
      {
        id: 5,
        name: "Wine & Cheese Set",
        description: "Fine wine paired with artisan cheeses",
        price: "₹4,299",
        rating: 4.8,
        image: "/product-list/s7.jpg",
      },
      {
        id: 3,
        name: "Wine & Cheese Set",
        description: "Fine wine paired with artisan cheeses",
        price: "₹4,299",
        rating: 4.8,
        image: "/product-list/8982.jpg",
      },
      {
        id: 4,
        name: "Wine & Cheese Set",
        description: "Fine wine paired with artisan cheeses",
        price: "₹4,299",
        rating: 4.8,
        image: "/product-list/8983.jpg",
      },
      {
        id: 4,
        name: "Wine & Cheese Set",
        description: "Fine wine paired with artisan cheeses",
        price: "₹4,299",
        rating: 4.8,
        image: "/product-list/8995.png",
      },
    ],
    900: [
      {
        id: 1,
        name: "Wine & Cheese Set",
        description: "Fine wine paired with artisan cheeses",
        price: "₹4,299",
        rating: 4.8,
        image: "/product-list/s70.png",
      },
      {
        id: 2,
        name: "Wine & Cheese Set",
        description: "Fine wine paired with artisan cheeses",
        price: "₹4,299",
        rating: 4.8,
        image: "/product-list/s9001.png",
      },
      {
        id: 3,
        name: "Wine & Cheese Set",
        description: "Fine wine paired with artisan cheeses",
        price: "₹4,299",
        rating: 4.8,
        image: "/product-list/s9002.png",
      },
      {
        id: 4,
        name: "Wine & Cheese Set",
        description: "Fine wine paired with artisan cheeses",
        price: "₹4,299",
        rating: 4.8,
        image: "/product-list/mixednuts.png",
      },
    ],
    901: [
      {
        id: 1,
        name: "Wine & Cheese Set",
        description: "Fine wine paired with artisan cheeses",
        price: "₹4,299",
        rating: 4.8,
        image: "/2.jpeg",
      },
      {
        id: 2,
        name: "Wine & Cheese Set",
        description: "Fine wine paired with artisan cheeses",
        price: "₹4,299",
        rating: 4.8,
        image: "/product-list/s9011.jpg",
      },
      {
        id: 3,
        name: "Wine & Cheese Set",
        description: "Fine wine paired with artisan cheeses",
        price: "₹4,299",
        rating: 4.8,
        image: "/product-list/s2.jpg",
      },
      {
        id: 4,
        name: "Wine & Cheese Set",
        description: "Fine wine paired with artisan cheeses",
        price: "₹4,299",
        rating: 4.8,
        image: "/product-list/s9013.jpg",
      },
      // {
      //   id: 5,
      //   name: "Wine & Cheese Set",
      //   description: "Fine wine paired with artisan cheeses",
      //   price: "₹4,299",
      //   rating: 4.8,
      //   image: "/product-list/s9014.png",
      // },
    ],
    902: [
      {
        id: 1,
        name: "Wine & Cheese Set",
        description: "Fine wine paired with artisan cheeses",
        price: "₹4,299",
        rating: 4.8,
        image: "/product-list/ham11.png",
      },
      {
        id: 2,
        name: "Wine & Cheese Set",
        description: "Fine wine paired with artisan cheeses",
        price: "₹4,299",
        rating: 4.8,
        image: "/product-list/9026.png",
      },
      {
        id: 6,
        name: "Wine & Cheese Set",
        description: "Fine wine paired with artisan cheeses",
        price: "₹4,299",
        rating: 4.8,
        image: "/product-list/9027.png",
      },
      {
        id: 3,
        name: "Wine & Cheese Set",
        description: "Fine wine paired with artisan cheeses",
        price: "₹4,299",
        rating: 4.8,
        image: "/product-list/9022.png",
      },
      {
        id: 4,
        name: "Wine & Cheese Set",
        description: "Fine wine paired with artisan cheeses",
        price: "₹4,299",
        rating: 4.8,
        image: "/product-list/9023.png",
      },
      {
        id: 5,
        name: "Wine & Cheese Set",
        description: "Fine wine paired with artisan cheeses",
        price: "₹4,299",
        rating: 4.8,
        image: "/product-list/9024.png",
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

  const categoryContentsMap = {
    "Signature Conscious": [
      "Eco Coffee Mug 220 ml",
      "Fabric Cover Notebook",
      "Metal Flower Shape Candle",
      "Mixed Dry Fruits 100gm",
    ],
    "Mini Treasures": [
      "Brass Candle with Rich Velvet Pouch",
      "Flavoured DipTea (3 sachets)",
      "Almonds 50g",
      "Cashews 50g",
    ],
    "Eco Luxe": [
      "Wooden candle",
      "Coffee Mug",
      "Black Flask",
      "Kalamkari Tray",
      "Kalamkari Coaster",
      "Mixed Dry Fruits 100gm",
    ],
    "Gratitude Box": [
      "Metal Flower shape candle",
      "Ganesh idol embellished Fridge Magnet",
      "Mixed Dry Fruits 100gm",
    ],
    "Elite Desk Hamper": [
      "Silk Fabric Cover notebook",
      "Mixed Dry Fruits 100gm",
      "Elegant Organiser",
      "Handmade Flower-Shaped Candle",
    ],
    "The Bamboo Luxe Hamper": [
      "Bamboo Water Bottle",
      "Eco Diary with Bamboo Pen ",
      "Handcrafted Bamboo Coasters",
      "Bamboo Phone Holder",
      "Eco Coffee Mug",
      "Almonds 50g",
    ],
    "The Conscious Luxe Corporate Hamper": [
      "Cork Base Black Bottle (500ml)",
      "Cork Base Black Mug (450ml)",
      "Cork Base A5 Diary (160 ruled pages) ",
      "Cork Base Metal Card Holder (4 x 2.5 inches) ",
      "Cork Base Ball Pen (Blue Ink) ",
      "Set of 2 Small Diyas ",
      "Personalized Greeting Card",
    ],
    "Eco Luxe Workday Kit Hamper": [
      "Cork finish Laptop Bag",
      "Bamboo Water Bottle",
      "Eco Journal",
      "Eco Mug",
      "Premium Bamboo Coasters",
    ],
    "The Prosperity Box": [
      "Metal Lakshmi Ganesha Diya holder with wooden base",
      "Mixed Dry Fruits 100gm",
      "Embellished Pichwai Theme wall hanging",
    ],
    "Eco-Excellence Kit": ["Cork Journal", "Eco Mug", "Cork Pen", "Coaster"],
    "Celebration Treasures": [
      "Bell Thoran with Fiary Light",
      "Terracota Handpainted Diyas 4 nos",
      "Rose Candle",
      "Incense stick holder",
      "Incense sticks ",
    ],
  };

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
            <div className="flex md:hidden">
              <h2 className="text-3xl font-bold text-[#A00030] mb-3">
                {currentCategoryContent.title}
              </h2>
            </div>
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

            {/* Description */}
            <p className="text-gray-700  text-justify">
              {currentCategoryContent.description}
            </p>
            {/* Mobile Price & Checkout Section */}
            <div className="flex md:hidden flex-col w-full mt-4 space-y-3">
              {/* Price Section */}
              <div className="mb-6">
                <p className="text-3xl font-bold text-gray-900">
                  ₹{" "}
                  {((currentCategoryContent.price / 100) * quantity).toFixed(2)}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  (₹ {(currentCategoryContent.price / 100).toFixed(2)} per item
                  · TAX included · FREE Shipping)
                </p>
              </div>

              {/* Quantity + Button Wrapper */}
              <div className="flex flex-col xs:flex-row items-stretch xs:items-center gap-3 w-full">
                {/* Quantity Selector */}
                <div className="flex items-center justify-between border border-gray-300 rounded-lg shadow-sm w-full xs:w-auto">
                  <button
                    onClick={decreaseQuantity}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 transition disabled:opacity-50"
                    disabled={quantity === 1}
                  >
                    <Minus className="h-4 w-4 text-gray-600" />
                  </button>
                  <span className="px-4 py-2 font-semibold text-gray-800 select-none min-w-[30px] text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={increaseQuantity}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 transition"
                  >
                    <Plus className="h-4 w-4 text-gray-600" />
                  </button>
                </div>

                {/* Pay & Proceed Button */}
                <button
                  onClick={handleCheckout}
                  className="bg-black hover:bg-gray-800 text-white font-semibold px-6 py-3 rounded-lg shadow transition-all w-full xs:w-auto mb-0"
                >
                  Pay & Proceed
                </button>

                <button
                  onClick={() => {
                    setFormMode("prebooking");
                    setIsOpen(true);
                  }}
                  className="flex items-center justify-center gap-2 px-8 py-4 rounded-md text-white text-md font-semibold bg-[linear-gradient(135deg,hsl(0,50%,30%),hsl(345,70%,40%),hsl(0,60%,50%))] hover:opacity-90 hover:scale-105 transform transition-all duration-300 w-full sm:w-auto"
                >
                  Prebook Now
                  <ArrowRight className="h-5 w-5 text-white" />
                </button>

                <PopupForm1
                  isOpen={isOpen}
                  onClose={() => setIsOpen(false)}
                  mode={formMode}
                  defaultCatalogue={defaultCatalogue} // ✅ Use the derived variable directly
                />
              </div>
              {categoryContentsMap[currentCategoryContent?.name] && (
                <div className="mt-4 mb-8">
                  <h3 className="font-semibold text-gray-800 mb-2">
                    Contents:
                  </h3>
                  <ul className="list-disc list-inside space-y-1 text-gray-700">
                    {currentCategoryContent?.name === "Signature Conscious"
                      ? [
                          // Use selected variants if any, else fall back to defaults
                          savedVariants["Eco Coffee Mug 220 ml"] ||
                            "Eco Coffee Mug 220 ml",
                          savedVariants["Fabric Cover Notebook"] ||
                            "Fabric Cover Notebook",
                          savedVariants["Metal Flower Shape Candle"] ||
                            "Metal Flower Shape Candle",
                          savedVariants["Mixed Dry Fruits 100gm"] ||
                            "Mixed Dry Fruits 100gm",
                        ].map((item, idx) => <li key={idx}>{item}</li>)
                      : categoryContentsMap[currentCategoryContent.name].map(
                          (item, idx) => <li key={idx}>{item}</li>
                        )}
                  </ul>
                </div>
              )}
            </div>

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
                          image: "/product-list/coffeemugblack.png",
                        },
                        {
                          name: "Premium Coffee Mug - Sandal",
                          image: "/product-list/coffeemugsandal.png",
                        },
                      ],
                    },
                    {
                      name: "Fabric Cover Notebook",
                      variants: [
                        {
                          name: "Bamboo Diary",
                          image: "/product-list/14.jpg",
                        },
                        {
                          name: "Blue Diary",
                          image: "/product-list/13.jpg",
                        },
                        {
                          name: "Cork and Red Diary",
                          image: "/product-list/12.jpg",
                        },
                        {
                          name: "Cork Diary",
                          image: "/product-list/11.jpg",
                        },
                        {
                          name: "Cork Fabric Diary",
                          image: "/product-list/10.jpg",
                        },
                        {
                          name: "Cork Visiting Card",
                          image: "/product-list/9.jpg",
                        },
                        {
                          name: "Kalamkari Notebook",
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
                          image: "/product-list/mixednuts.png",
                        },
                      ],
                    },
                  ].map((item, idx) => {
                    const selectedVariantName = savedVariants[item.name]; // get saved variant for this option
                    return (
                      <button
                        key={idx}
                        onClick={() => setSelectedOption(item)}
                        className="w-full flex items-center justify-between px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition"
                      >
                        <span className="text-gray-800">
                          {/* If variant is selected, show it; else show base option name */}
                          {selectedVariantName || item.name}
                        </span>

                        {/* Always show "Change Option" */}
                        <span className="text-sm bg-[#a00300] text-white p-1 font-bold rounded-md ml-2">
                          Change Option
                        </span>
                      </button>
                    );
                  })}
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
                            // console.log("User selected:", selectedVariant);
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
          <div className="p-6">
            <div className="hidden md:flex flex-col justify-start">
              {/* Title */}
              <h2 className="text-3xl font-bold text-[#A00030] mb-3">
                {currentCategoryContent.title}
              </h2>

              {/* Price Section */}
              <div className="mb-6">
                <p className="text-3xl font-bold text-gray-900">
                  ₹{" "}
                  {((currentCategoryContent.price / 100) * quantity).toFixed(2)}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  (₹ {(currentCategoryContent.price / 100).toFixed(2)} per item
                  · TAX included · FREE Shipping)
                </p>
              </div>

              {categoryContentsMap[currentCategoryContent?.name] && (
                <div className="mt-4 mb-8">
                  <h3 className="font-semibold text-gray-800 mb-2">
                    Contents:
                  </h3>
                  <ul className="list-disc list-inside space-y-1 text-gray-700">
                    {currentCategoryContent?.name === "Signature Conscious"
                      ? [
                          // Use selected variants if any, else fall back to defaults
                          savedVariants["Eco Coffee Mug 220 ml"] ||
                            "Eco Coffee Mug 220 ml",
                          savedVariants["Fabric Cover Notebook"] ||
                            "Fabric Cover Notebook",
                          savedVariants["Metal Flower Shape Candle"] ||
                            "Metal Flower Shape Candle",
                          savedVariants["Mixed Dry Fruits 100gm"] ||
                            "Mixed Dry Fruits 100gm",
                        ].map((item, idx) => <li key={idx}>{item}</li>)
                      : categoryContentsMap[currentCategoryContent.name].map(
                          (item, idx) => <li key={idx}>{item}</li>
                        )}
                  </ul>
                </div>
              )}
              <div className="hidden md:flex items-center gap-6 mt-4">
                {/* Quantity Selector */}
                <div className="flex items-center border border-gray-300 rounded-full overflow-hidden shadow-md bg-white transition-all duration-300 hover:shadow-lg">
                  <button
                    onClick={decreaseQuantity}
                    className="px-4 py-3 bg-gray-100 hover:bg-gray-200 transition disabled:opacity-40 disabled:cursor-not-allowed"
                    disabled={quantity === 1}
                    aria-label="Decrease Quantity"
                  >
                    <Minus className="h-5 w-5 text-gray-700" />
                  </button>
                  <span className="px-5 py-3 font-semibold text-gray-900 text-lg min-w-[40px] text-center select-none">
                    {quantity}
                  </span>
                  <button
                    onClick={increaseQuantity}
                    className="px-4 py-3 bg-gray-100 hover:bg-gray-200 transition"
                    aria-label="Increase Quantity"
                  >
                    <Plus className="h-5 w-5 text-gray-700" />
                  </button>
                </div>

                {/* Pay & Proceed Button */}
                <button
                  onClick={handleCheckout}
                  className="bg-black hover:bg-gray-800 text-white font-semibold px-6 py-3 rounded-md shadow transition-all"
                >
                  Pay & Proceed
                </button>

                <button
                  onClick={() => {
                    setFormMode("prebooking");
                    setIsOpen(true);
                  }}
                  className="flex items-center justify-center gap-2 px-8 py-4 rounded-md text-white text-md font-semibold bg-[linear-gradient(135deg,hsl(0,50%,30%),hsl(345,70%,40%),hsl(0,60%,50%))] hover:opacity-90 hover:scale-105 transform transition-all duration-300 w-full sm:w-auto"
                >
                  Prebook Now
                  <ArrowRight className="h-5 w-5 text-white" />
                </button>

                <PopupForm1
                  isOpen={isOpen}
                  onClose={() => setIsOpen(false)}
                  mode={formMode}
                  defaultCatalogue={defaultCatalogue} // ✅ Use the derived variable directly
                />
              </div>
            </div>

            <div>
              {/* ⬇️ Related Products Section */}
              <div className="mt-12">
                <h3 className="text-2xl font-bold mb-4">You may also like</h3>
                <Related />

                {/* 🌟 Enquiry Section */}
                <div className="mt-12 text-center">
                  {/* Heading */}
                  <h4 className="text-2xl font-semibold text-gray-800">
                    Have a Question or Need Bulk Orders?
                  </h4>
                  <p className="mt-2 text-gray-600 text-sm sm:text-base max-w-xl mx-auto">
                    Click on{" "}
                    <span className="font-semibold text-[#a00300] cursor-pointer">
                      "Enquire Now"
                    </span>{" "}
                    to discuss this hamper or explore more options. You can also
                    reach us via <br className="flex md:hidden" />
                    <span className="font-semibold text-[#a00300]">
                      email
                    </span>{" "}
                    at{" "}
                    <a
                      href="mailto:hello@thegoodroad.in"
                      className="font-semibold text-[#a00300] hover:underline"
                    >
                      support@yuukke.com
                    </a>{" "}
                    .
                  </p>

                  {/* Enquiry Button */}
                  <div className="mt-6 flex justify-center">
                    <button
                      onClick={openPopup}
                      className="group relative inline-flex items-center justify-center gap-2 px-6 py-3
          text-white font-semibold text-base
          rounded-md bg-gradient-to-r from-[#a00300] via-[#b30000] to-[#ff4d4d]
          shadow-md shadow-red-300/30 hover:shadow-red-400/50
          transition-all duration-300 ease-in-out
          transform hover:scale-105 hover:-translate-y-1
          focus:outline-none focus:ring-4 focus:ring-red-300"
                    >
                      <MessageCircle className="w-5 h-5" />
                      <span className="relative z-10">Enquire Now</span>
                      <span className="absolute inset-0 rounded-md bg-gradient-to-r from-[#ff6b6b] to-[#a00300] opacity-0 group-hover:opacity-20 transition duration-300"></span>
                    </button>
                  </div>

                  {/* Trust Note */}
                  <p className="mt-3 text-xs text-gray-500">
                    We usually reply within{" "}
                    <span className="font-semibold text-[#a00300]">
                      24 hours
                    </span>
                    .
                  </p>
                </div>
              </div>

              {/* ⬇️ Popup Form */}
              <PopupForm1 isOpen={isPopupOpen} onClose={closePopup} />
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
        defaultCatalogue={defaultCatalogue}
      />
    </div>
  );
}

export default function ProductList() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      }
    >
      <ProductListInner />
    </Suspense>
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
