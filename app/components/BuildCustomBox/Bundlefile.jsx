"use client";
import Image from "next/image";
import { ArrowRight, Loader2 } from "lucide-react";
import { Trash2 } from "lucide-react";

import { productsData } from "@/app/data/products";
import { useEffect, useRef, useState } from "react";

function formatPrice(price) {
  return Number(price).toLocaleString("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  });
}

const BASE_URL = "https://marketplace.yuukke.com/assets/uploads/";
const getSafeImageUrl = (img) => {
  if (!img) return "/gray.jpeg";
  if (img.startsWith("http://") || img.startsWith("https://")) return img;
  const normalizedBaseUrl = BASE_URL.endsWith("/") ? BASE_URL : `${BASE_URL}/`;
  const normalizedImg = img.startsWith("/") ? img.slice(1) : img;
  return `${normalizedBaseUrl}${normalizedImg}`;
};

export default function BundleView({
  selectedProducts = {},
  selectedBoxes = {},
  selectedAddons = [],
  onUpdateProductQuantity = () => {},
  onRemoveProduct = () => {},
  currentStep,
  setStep,
  nextStep,
  closeModal,
}) {
  // console.log("selectedBoxes:", selectedBoxes);
  const handleNextStep = () => {
    if (currentStep < 4) {
      setStep(currentStep + 1);
    }
  };

  const incProduct = (id) => {
    const currentQty = selectedProducts[id]?.quantity || 0;
    onUpdateProductQuantity(id, currentQty + 1);
  };

  const decProduct = (id) => {
    const currentQty = selectedProducts[id]?.quantity || 0;
    if (currentQty > 1) {
      onUpdateProductQuantity(id, currentQty - 1);
    }
  };

  const removeProduct = (id, type) => {
    onRemoveProduct(id, type);
  };

  const Card = ({
    title,
    image,
    price,
    quantity,
    onDec,
    onInc,
    onDel,
    type,
  }) => (
    <div className="hide-vertical-scrollbar max-h-64 overflow-y-auto pr-1">
      <div className="flex items-start gap-4 border-b pb-4 relative">
        <div className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
          <Image
            src={getSafeImageUrl(image)}
            alt={title || "Item"}
            fill
            className="object-contain"
          />
        </div>

        <div className="flex-1 pr-12">
          {" "}
          {/* leave space for controls on the right */}
          <p className="text-lg font-thin text-gray-900">{title}</p>
          <p className="text-lg text-gray-500">
            {formatPrice((price || 0) * (quantity || 1))}
          </p>
        </div>

        {type === "product" && (
          <div className="absolute bottom-4 right-10 flex items-center gap-2 bg-gray-50 rounded px-1 py-0.5 shadow-sm">
            <button
              onClick={onDec}
              className="w-6 h-6 text-sm font-bold text-gray-800 rounded hover:bg-gray-200"
            >
              −
            </button>
            <span className="text-sm">{quantity}</span>
            <button
              onClick={onInc}
              className="w-6 h-6 text-sm font-bold text-gray-800 rounded hover:bg-gray-200"
            >
              +
            </button>
          </div>
        )}

        <button
          onClick={onDel}
          className="text-gray-400 hover:text-red-500 absolute top-0 right-0"
          title="Remove"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>
    </div>
  );

  // Helper function to save to localStorage
  const saveToLocalStorage = (products) => {
    localStorage.setItem("savedProducts", JSON.stringify(products));
  };

  // In your component
  const [savedProducts, setSavedProducts] = useState(() => {
    // Initialize from localStorage
    const saved = localStorage.getItem("savedProducts");
    return saved ? JSON.parse(saved) : {};
  });

  const savedProductCards = Object.entries(savedProducts).map(([id, data]) => {
    if (!data?.quantity) return null;

    return (
      <Card
        key={`saved-${id}`}
        title={data.name}
        image={data.image}
        price={data.price}
        quantity={data.quantity}
        onDec={() => {
          const newQty = Math.max(1, data.quantity - 1);
          const updatedProducts = {
            ...savedProducts,
            [id]: { ...savedProducts[id], quantity: newQty },
          };
          setSavedProducts(updatedProducts);
          saveToLocalStorage(updatedProducts);
        }}
        onInc={() => {
          const updatedProducts = {
            ...savedProducts,
            [id]: { ...savedProducts[id], quantity: data.quantity + 1 },
          };
          setSavedProducts(updatedProducts);
          saveToLocalStorage(updatedProducts);
        }}
        onDel={() => {
          const newProducts = { ...savedProducts };
          delete newProducts[id];
          setSavedProducts(newProducts);
          saveToLocalStorage(newProducts);
        }}
        type="product"
      />
    );
  });

  useEffect(() => {
    const saved = localStorage.getItem("savedProducts");
    if (saved) {
      setSavedProducts(JSON.parse(saved));
    }
  }, []);

  const productCards = Object.entries(selectedProducts).map(([id, data]) => {
    if (!data?.quantity) return null;
    return (
      <Card
        key={`prod-${id}`}
        title={data.name}
        image={data.image}
        price={data.price}
        quantity={data.quantity}
        onDec={() => decProduct(id)}
        onInc={() => incProduct(id)}
        onDel={() => removeProduct(id, "product")}
        type="product"
      />
    );
  });

  const boxCards = Object.entries(selectedBoxes).map(([id, data]) => {
    if (data?.price === undefined) return null;
    return (
      <Card
        key={`box-${id}`}
        title={data.name}
        image={data.image}
        price={data.price || 0}
        quantity={data.quantity || 1}
        onDel={() => removeProduct(id, "box")}
        type="box"
      />
    );
  });

  const addonCards = selectedAddons.map((addon) => {
    if (!addon?.id) return null;
    return (
      <Card
        key={`addon-${addon.id}`}
        title={addon.title}
        image={addon.image}
        price={addon.price}
        quantity={1}
        onDel={() => removeProduct(addon.id, "addon")}
        type="addon"
      />
    );
  });

  // 2. Update all the total calculations
  const productTotal = Object.values(selectedProducts).reduce(
    (acc, prod) => acc + (prod.quantity * prod.price || 0),
    0
  );

  const boxTotal = Object.values(selectedBoxes).reduce(
    (acc, box) => acc + (box.quantity || 1) * (box.price || 0),
    0
  );

  const addonTotal = selectedAddons.reduce(
    (acc, addon) => acc + Number(addon.price || 0),
    0
  );

  // New: Calculate total for saved products
  const savedProductsTotal = Object.values(savedProducts).reduce(
    (acc, prod) => acc + (prod.quantity || 1) * (prod.price || 0),
    0
  );

  // Updated grand total that includes everything
  const grandTotal = productTotal + boxTotal + addonTotal + savedProductsTotal;

  const scrollRef = useRef(null);
  const [suggestedProducts, setSuggestedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [itemWidth, setItemWidth] = useState(0);

  useEffect(() => {
    const fetchPromoProducts = async () => {
      const token = localStorage.getItem("authToken"); // Or use context: useAuth()?.token

      if (!token) {
        console.warn("No auth token found. Aborting fetch.");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch("/api/getProducts", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            filters: {
              page: "1",
              query: "",
              limit: "24",
              gifts_products: "1",
              offset: 0,
            },
          }),
        });

        const data = await response.json();
        const filtered = Array.isArray(data?.products)
          ? data.products.filter((p) => p.promo_price !== null).reverse() // 🪞 This flips the array order
          : [];

        setSuggestedProducts(filtered);
      } catch (error) {
        console.error("Fetch error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPromoProducts();
  }, []);

  useEffect(() => {
    if (scrollRef.current && scrollRef.current.children.length > 0) {
      const firstChild = scrollRef.current.children[0];
      setItemWidth(firstChild.getBoundingClientRect().width + 16); // add gap
    }
  }, [suggestedProducts]);

  useEffect(() => {
    if (!itemWidth || suggestedProducts.length === 0) return;

    const interval = setInterval(() => {
      const container = scrollRef.current;
      const totalItems = suggestedProducts.length;
      const nextIndex = (currentIndex + 1) % totalItems;
      const scrollX = nextIndex * itemWidth;

      container.scrollTo({ left: scrollX, behavior: "smooth" });
      setCurrentIndex(nextIndex);
    }, 3000);

    return () => clearInterval(interval);
  }, [currentIndex, itemWidth, suggestedProducts.length]);

  const formatPrice = (price) =>
    price ? `₹${parseFloat(price).toFixed(0)}` : "";

  return (
    <div className="fixed top-0 right-0 w-full sm:max-w-lg h-full bg-white shadow-2xl z-[100] rounded-tl-3xl rounded-bl-3xl flex flex-col p-10 overflow-x-auto no-scrollbar">
      {/* Header */}
      <div className="flex justify-between items-center px-4 py-4 border-b font-thin text-4xl text-gray-800">
        Cart
        <button
          onClick={closeModal}
          className="text-gray-500 hover:text-black text-2xl border border-gray-300 rounded-3xl px-4 py-1"
        >
          &times;
        </button>
      </div>

      <div className="hide-vertical-scrollbar overflow-y-auto">
        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto py-6 space-y-8 scrollbar-thin capitalize scrollbar-thumb-gray-300">
          {productCards}
          {boxCards}
          {addonCards}
          {savedProductCards}

          {/* May like */}
          <div className="mt-4">
            <h2 className="text-lg font-semibold mb-2 capitalize">
              You May Also Like
            </h2>

            <div
              ref={scrollRef}
              className="flex gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory no-scrollbar pb-2"
            >
              {loading ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                suggestedProducts.map((product) => (
                  <div
                    key={product.id}
                    className="min-w-full flex snap-start bg-white rounded-md shadow-sm"
                  >
                    <div className="relative w-36 h-36 flex-shrink-0">
                      <Image
                        src={`https://marketplace.yuukke.com/assets/uploads/${product.image}`}
                        alt={product.name}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover"
                      />
                    </div>

                    <div className="w-80 p-4 flex flex-col justify-between">
                      <div>
                        <p className="text-base font-medium">{product.name}</p>
                        <p className="text-sm text-black font-semibold">
                          {formatPrice(product.promo_price)}
                          <span className="line-through text-gray-400 text-xs ml-2">
                            {formatPrice(product.price)}
                          </span>
                        </p>
                      </div>

                      <button
                        className="self-end mt-4 bg-gray-900 text-white text-sm px-4 py-1.5 rounded hover:bg-gray-700 transition"
                        onClick={() => {
                          const productToAdd = {
                            id: product.id,
                            name: product.name,
                            image: product.image,
                            price: product.promo_price || product.price,
                            quantity: 1,
                          };

                          // 1. Update suggested_bundle_products
                          const suggestedExisting =
                            JSON.parse(
                              localStorage.getItem("suggested_bundle_products")
                            ) || {};
                          const updatedSuggested = {
                            ...suggestedExisting,
                            [product.id]: productToAdd,
                          };
                          localStorage.setItem(
                            "suggested_bundle_products",
                            JSON.stringify(updatedSuggested)
                          );

                          // 2. Optional: color preference
                          localStorage.setItem(
                            `color_preference_${product.id}`,
                            product.color || ""
                          );

                          // 3. Update savedProducts state + its localStorage
                          setSavedProducts((prev) => {
                            const updated = {
                              ...prev,
                              [product.id]: productToAdd,
                            };
                            localStorage.setItem(
                              "savedProducts",
                              JSON.stringify(updated)
                            );
                            return updated;
                          });

                          console.log("Added to bundle:", productToAdd);
                        }}
                      >
                        Add
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-4 py-4 border-t">
        <div className="flex justify-between items-center mb-3 text-sm">
          <span>Subtotal</span>
          <span className="font-semibold text-xl">
            {formatPrice(grandTotal)}
          </span>
        </div>
        <p className="text-xs text-gray-500 mb-4">
          Shipping and taxes calculated at checkout.
        </p>
        <div className="flex gap-2 item-end justify-end">
          <button
            className={`w-1/2 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition
    ${
      (currentStep === 1 && grandTotal < 1000) ||
      (currentStep === 2 && Object.keys(selectedBoxes).length === 0)
        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
        : "bg-red-500 text-white hover:bg-red-600"
    }`}
            onClick={() => {
              if (
                (currentStep === 1 && grandTotal < 1000) ||
                (currentStep === 2 && Object.keys(selectedBoxes).length === 0)
              )
                return;

              window.scrollTo({ top: 0, behavior: "smooth" });
              nextStep();
              closeModal();
            }}
            disabled={
              (currentStep === 1 && grandTotal < 1000) ||
              (currentStep === 2 && Object.keys(selectedBoxes).length === 0)
            }
          >
            {currentStep === 1 && grandTotal < 1000
              ? "Select ₹1000+ Products"
              : currentStep === 2 && Object.keys(selectedBoxes).length === 0
              ? "Select a Box to Continue"
              : "Next Page"}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
