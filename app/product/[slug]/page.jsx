import React from "react";
import Image from "next/image";
import Link from "next/link";

import { redirect } from "next/navigation";

const getProductDetails = async (slug) => {
  try {
    // Use absolute URL for API routes in server components
    const baseUrl =
      "https://marketplace.yuukke.com/api/v1/Marketv2/getProductDetails/";

    // Fetch auth token
    const authResponse = await fetch(
      "https://marketplace.yuukke.com/api/v1/Auth/api_login",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: "admin",
          password: "Admin@123",
        }),
        cache: "no-store", // Important for auth requests
      }
    );

    if (!authResponse.ok) {
      throw new Error(`Auth failed with status: ${authResponse.status}`);
    }

    const authData = await authResponse.json();
    if (authData.status !== "success") {
      throw new Error("Authentication failed: Invalid response");
    }

    // Fetch product details
    const productResponse = await fetch(`${baseUrl}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authData.token}`,
      },
      body: JSON.stringify({ slug }),
      cache: "no-store",
    });

    if (!productResponse.ok) {
      throw new Error(`Product fetch failed: ${productResponse.status}`);
    }

    return await productResponse.json();
  } catch (error) {
    console.error("Error in getProductDetails:", error);
    return null;
  }
};

const formatPrice = (price) => {
  return parseFloat(String(price).replace(/,/g, "")).toFixed(2);
};

// Helper function to parse product_details without DOMParser
const parseProductDetails = (html) => {
  // Remove extra whitespace and normalize the HTML string
  const cleanedHtml = html.replace(/\s+/g, " ").trim();

  // Split into paragraphs based on <p> tags
  const paragraphs = cleanedHtml
    .split(/<\/p>\s*<p>/)
    .map((p) => p.replace(/<\/?p>/g, "").trim())
    .filter((p) => p);

  // First paragraph is the description
  const description = paragraphs[0] || "";

  // Second paragraph contains specs and care instructions
  const specsRaw = paragraphs[1] || "";
  // Split by <br> tags and clean up
  const specsLines = specsRaw
    .split("<br>")
    .map((line) => line.replace(/^\*/, "").trim())
    .filter((line) => line);

  // Extract care instructions
  const careIndex = specsLines.findIndex((line) =>
    line.includes("Wash & Care")
  );
  const careInstructions =
    careIndex !== -1
      ? specsLines[careIndex].replace("Wash & Care / Maintenance -", "").trim()
      : "";
  const specs =
    careIndex !== -1
      ? specsLines.slice(0, careIndex).concat(specsLines.slice(careIndex + 1))
      : specsLines;

  return { description, specs, careInstructions };
};

const ProductPage = async ({ params, searchParams }) => {
  const { slug } = params;
  const response = await getProductDetails(slug);
  const product = response?.data?.[0];
  const selectedImageIndex = Number(searchParams.img) || 0;

  if (!product) {
    redirect("/custom-box");
  }

  const allImages = [product.p_image, ...(product.product_image || [])].filter(
    (img) => img && typeof img === "string" && img.trim() !== ""
  );

  const mainImage = allImages[selectedImageIndex] || allImages[0] || null;
  const price = formatPrice(product.price);
  const cost = formatPrice(product.cost);
  const discount =
    price > cost ? (((price - cost) / price) * 100).toFixed(0) : 0;

  // Parse product details
  const { description, specs, careInstructions } = parseProductDetails(
    product.product_details
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Product Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">
          {product.p_name}
        </h1>
        <div className="flex items-center mt-3 space-x-3">
          <span className="text-base text-gray-600 font-medium">
            {product.category}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Product Images */}
        <div className="space-y-6">
          {mainImage && (
            <div className="relative w-full h-[500px] rounded-2xl overflow-hidden">
              <Image
                src={mainImage}
                alt={product.p_name || "Product image"}
                fill={true}
                className="object-cover p-4"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                priority
              />
              {discount > 0 && (
                <span className="absolute top-4 left-4 bg-red-600 text-white text-sm font-semibold px-4 py-2 rounded-full shadow-md">
                  {discount}% OFF
                </span>
              )}
            </div>
          )}

          {/* Thumbnail Gallery */}
          {allImages.length > 1 && (
            <div className="grid grid-cols-4 gap-3">
              {allImages.slice(0, 4).map((img, index) => (
                <Link
                  key={index}
                  href={`?img=${index}`}
                  scroll={false}
                  className={`relative h-28 rounded-lg overflow-hidden cursor-pointer shadow-sm hover:shadow-md transition-shadow ${
                    selectedImageIndex === index ? "ring-2 ring-[#A00030]" : ""
                  }`}
                >
                  <Image
                    src={img}
                    alt={`${product.p_name || "Product"} - Image ${index + 1}`}
                    fill
                    className="object-cover"
                    loading="lazy"
                    sizes="25vw"
                  />
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Product Details */}
        <div className="bg-white p-8 rounded-2xl shadow-lg">
          {/* Pricing */}
          <div className="mb-8">
            <div className="flex items-center gap-4">
              <p className="text-4xl font-extrabold text-gray-900">₹{price}</p>
              {discount > 0 && (
                <>
                  <p className="text-xl text-gray-400 line-through">₹{cost}</p>
                  <span className="text-sm font-bold text-red-600 bg-red-100 px-3 py-1.5 rounded-full">
                    Save {discount}%
                  </span>
                </>
              )}
            </div>
            <p className="text-sm text-gray-500 mt-2">
              {product.tax_method === "inclusive"
                ? "Inclusive of all taxes"
                : "+ Taxes applicable"}
            </p>
          </div>

          {/* Action Button */}
          <div>
            <Link href="/custom-box">
              <button className="w-full bg-gradient-to-r from-[#A00030] to-[#000940] text-white py-4 px-6 rounded-lg font-semibold text-lg hover:opacity-85 transition-opacity">
                Create Your Own Hamper
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* Product Description */}
      <div className="mt-12 bg-white p-10 rounded-2xl shadow-xl border border-gray-200">
        <div className="flex items-center gap-4 mb-8">
          <svg
            className="w-8 h-8 text-gray-800"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 18 4.5h-1.5m-6 0H6a2.25 2.25 0 0 0-2.25 2.25v9.75A2.25 2.25 0 0 0 6 18.75h1.5m9-12v-1.5a3 3 0 0 0-3-3h-3a3 3 0 0 0-3 3v1.5"
            />
          </svg>
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            Product Details
          </h2>
        </div>
        <div className="space-y-10">
          {/* Description */}
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              About This Item
            </h3>
            <div
              className="prose prose-md max-w-none text-gray-700 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: description }}
            ></div>
          </div>

          {/* Specifications */}
          {specs.length > 0 && (
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Specifications
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {specs.map((spec, index) => {
                  const [key, value] = spec
                    .split(" - ")
                    .map((s) => s.trim())
                    .filter(Boolean);
                  if (!key || !value) return null;
                  return (
                    <div key={index} className="flex items-start gap-3">
                      <span className="text-gray-500 font-medium capitalize">
                        {key}:
                      </span>
                      <span className="text-gray-800">{value}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Care Instructions */}
          {careInstructions && (
            <div className="bg-gray-50 p-6 rounded-lg">
              <div className="flex items-center gap-3 mb-3">
                <svg
                  className="w-6 h-6 text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4.5 12.75l6 6 9-13.5"
                  />
                </svg>
                <h3 className="text-lg font-semibold text-gray-900">
                  Care Instructions
                </h3>
              </div>
              <p className="text-gray-700 leading-relaxed">
                {careInstructions}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductPage;
