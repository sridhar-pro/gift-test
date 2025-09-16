"use client";
import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import PopupForm from "../components/PopupForm2";
import { useSession } from "../context/SessionContext";
import { useAuth } from "../utills/AuthContext";
import toast from "react-hot-toast";
import { Pencil, PhoneCallIcon, Trash2 } from "lucide-react";

export default function CheckoutPage() {
  const [checkoutData, setCheckoutData] = useState(null);
  const [selectedContents, setSelectedContents] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const leftSectionRef = useRef(null);

  const { getValidToken } = useAuth();
  const { companyId, isLoggedIn } = useSession();
  console.log("Id:", companyId);

  const [addresses, setAddresses] = useState([]);
  const [formData, setFormData] = useState({
    line1: "",
    line2: "",
    city: "",
    state: "",
    postal_code: "",
    country: "",
    landmark: "",
    phone: "",
  });
  const [selectedAddress, setSelectedAddress] = useState(null);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // ✅ Fetch Addresses
  const fetchAddresses = async () => {
    try {
      setLoading(true);
      const token = await getValidToken();

      const res = await fetch("/api/customer_address", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ company_id: companyId }),
      });

      const data = await res.json();
      if (res.ok && data.status) {
        setAddresses(data.data);
      } else {
        toast.error(data.message || "Failed to fetch addresses ❌");
      }
    } catch (error) {
      console.error("Addresses API Error ❌", error);
      toast.error("Something went wrong ❌");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (companyId) fetchAddresses();
  }, [companyId]);

  // ✅ Input handler
  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // ✅ Add Address
  const handleAddAddress = async (e) => {
    e.preventDefault();
    try {
      const token = await getValidToken();
      const res = await fetch("/api/edit_address", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          company_id: companyId,
          ...formData,
          active: 1,
        }),
      });

      const data = await res.json();
      if (res.ok && data.status) {
        toast.success("Address added successfully ✅");
        setIsAddModalOpen(false);
        setFormData({
          line1: "",
          line2: "",
          city: "",
          state: "",
          postal_code: "",
          country: "",
          landmark: "",
          phone: "",
        });
        fetchAddresses();
      } else {
        toast.error(data.message || "Failed to add address ❌");
      }
    } catch (error) {
      console.error("Add Address API Error ❌", error);
      toast.error("Something went wrong ❌");
    }
  };

  // ✅ Update Address
  const handleUpdateAddress = async (e) => {
    e.preventDefault();
    try {
      const token = await getValidToken();
      const res = await fetch("/api/edit_address", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          id: selectedAddress.id,
          company_id: selectedAddress.company_id,
          ...formData,
          active: 1,
        }),
      });

      const data = await res.json();
      if (res.ok && data.status) {
        toast.success("Address updated successfully ✅");
        setIsEditModalOpen(false);
        fetchAddresses();
      } else {
        toast.error(data.message || "Failed to update address ❌");
      }
    } catch (error) {
      console.error("Update Address API Error ❌", error);
      toast.error("Something went wrong ❌");
    }
  };

  // ✅ Select Address
  const handleSelectAddress = (id) => {
    const address = addresses.find((addr) => addr.id === id);
    if (address) {
      setSelectedAddress(address);
    }
  };

  // ✅ Edit Address
  const handleEditClick = (address) => {
    setSelectedAddress(address);
    setFormData({
      line1: address.line1 || "",
      line2: address.line2 || "",
      city: address.city || "",
      state: address.state || "",
      postal_code: address.postal_code || "",
      country: address.country || "",
      landmark: address.landmark || "",
      phone: address.phone || "",
    });
    setIsEditModalOpen(true);
  };

  useEffect(() => {
    const stored = sessionStorage.getItem("checkoutData");
    if (stored) {
      const parsed = JSON.parse(stored);
      setCheckoutData(parsed);
      setQuantity(parsed.quantity || 1);
    }

    const storedContents = localStorage.getItem("selectedContents");
    if (storedContents) {
      setSelectedContents(JSON.parse(storedContents));
    }

    setLoading(false);
  }, []);

  // Handle delete address
  const handleDeleteAddress = async (id) => {
    toast.custom((t) => (
      <div className="p-5 bg-white rounded-2xl shadow-xl border border-gray-200 w-80 text-center">
        {/* Icon */}
        <div className="w-12 h-12 mx-auto flex items-center justify-center bg-red-100 rounded-full mb-3">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-7 w-7 text-red-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </div>

        {/* Title */}
        <h3 className="text-lg font-semibold text-gray-800 mb-1">
          Delete Address?
        </h3>
        <p className="text-sm text-gray-500 mb-4">
          This action cannot be undone.
        </p>

        {/* Buttons */}
        <div className="flex justify-center gap-4">
          <button
            onClick={() => toast.dismiss(t.id)}
            className="px-5 py-2 text-gray-600 hover:text-gray-800 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
          >
            Cancel
          </button>

          <button
            onClick={async () => {
              try {
                const token = await getValidToken();
                const res = await fetch("/api/delete_address", {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                  },
                  body: JSON.stringify({ id }),
                });

                const data = await res.json();
                if (res.ok && data.status) {
                  toast.success("Address deleted successfully", {
                    position: "top-right",
                  });
                  fetchAddresses();
                } else {
                  toast.error(data.message || "Failed to delete ❌");
                }
              } catch (error) {
                console.error("Delete Address API Error ❌", error);
                toast.error("Something went wrong ❌");
              } finally {
                toast.dismiss(t.id);
              }
            }}
            className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg shadow-md transition"
          >
            Delete
          </button>
        </div>
      </div>
    ));
  };

  // Scroll-lock logic
  useEffect(() => {
    const handleWheel = (e) => {
      const left = leftSectionRef.current;
      if (!left) return;

      const isScrollable =
        left.scrollHeight > left.clientHeight &&
        left.scrollTop + left.clientHeight < left.scrollHeight;

      if (isScrollable) {
        e.preventDefault();
        left.scrollTop += e.deltaY;
      }
    };

    window.addEventListener("wheel", handleWheel, { passive: false });
    return () => window.removeEventListener("wheel", handleWheel);
  }, []);

  if (loading) {
    return (
      <div className="min-h-[85vh] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-gray-200 border-t-[#a00300] rounded-full animate-spin"></div>
      </div>
    );
  }

  // ✅ Empty Checkout Fallback
  if (!checkoutData || !checkoutData.categoryContent) {
    return (
      <div className="min-h-[85vh] flex flex-col items-center justify-center bg-gray-50 px-6 text-center font-gift">
        <Image
          src="/empty-cart.png"
          alt="No hamper"
          width={220}
          height={220}
          className="mb-6 opacity-80"
        />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          No Hamper Selected
        </h2>
        <p className="text-gray-600 mb-6">
          Looks like you haven’t picked any hampers yet. Start building your
          perfect gift box 🎁
        </p>
        <Link
          href="/#featured-products"
          className="px-6 py-3 rounded-lg bg-[#A00300] text-white font-medium shadow-md hover:bg-[#800200] transition"
        >
          Browse Hampers
        </Link>
      </div>
    );
  }

  // ✅ Normal Checkout Flow
  const { product, category, categoryContent } = checkoutData;

  const unitPrice = categoryContent?.price
    ? categoryContent.price / 100
    : product?.price
    ? product.price / 100
    : 0;

  const totalPrice = (unitPrice * quantity).toFixed(2);

  // ✅ Fetch checkout data with clear variable names
  const checkoutInfo = JSON.parse(sessionStorage.getItem("checkoutData")) || {};
  const packageVariants = checkoutInfo?.selectedVariants || {};
  const packageContents = checkoutInfo?.selectedContents || [];

  // ✅ Special case for Signature Conscious hamper
  const isSignaturePackage =
    checkoutInfo?.categoryContent?.name === "Signature Consicious";

  return (
    <div className="min-h-screen bg-gray-50 flex justify-center font-gift">
      <div className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-2 gap-8 p-6 lg:p-12 relative">
        {/* Right Section (Order Summary) */}
        <div className="order-1 lg:order-2 mt-2 w-full max-w-md lg:sticky lg:top-8 h-fit self-start">
          <div className="overflow-hidden">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 tracking-tight mb-6 text-left">
                Order Summary
              </h2>

              <div className="flex flex-col items-center text-center">
                <Image
                  src={
                    categoryContent?.image
                      ? categoryContent.image.startsWith("/")
                        ? categoryContent.image
                        : `https://marketplace.yuukke.com/assets/uploads/${categoryContent.image}`
                      : product?.image || "/product.png"
                  }
                  alt={categoryContent?.name || product?.name || "Product"}
                  width={180}
                  height={180}
                  className="rounded-2xl border border-gray-200 shadow-lg mb-4 object-cover"
                />

                <p className="text-lg font-semibold text-gray-900">
                  {categoryContent?.name || product?.name || "Product"}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  Quantity: <span className="font-semibold">{quantity}</span>
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Price per item: ₹{unitPrice.toFixed(2)}
                </p>
              </div>

              {/* ✅ Package Contents Section */}
              {packageContents?.length > 0 && (
                <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-100 shadow-inner p-5 mt-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">
                    This package consists of:
                  </h3>
                  <ul className="space-y-3">
                    {packageContents.map((item, idx) => (
                      <li
                        key={idx}
                        className="flex items-center space-x-3 text-gray-700 hover:text-[#a00300] transition-colors duration-300"
                      >
                        <span className="w-2.5 h-2.5 bg-[#a00300] rounded-full"></span>
                        <span className="text-sm leading-tight">
                          {isSignaturePackage
                            ? packageVariants[item] || item
                            : item}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="my-6 border-t border-gray-200" />

              <div className="flex justify-between items-center">
                <span className="text-xl font-semibold text-gray-900">
                  Total ({quantity} item{quantity > 1 ? "s" : ""})
                </span>
                <span className="text-3xl font-bold text-[#a00300] tracking-tight">
                  ₹{totalPrice}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div
          ref={leftSectionRef}
          className="order-2 lg:order-1 space-y-8 pr-0 lg:pr-8 max-h-screen overflow-y-auto scrollbar-hide"
        >
          {/* 🚚 Customer Address (Only for logged-in users) */}
          {isLoggedIn ? (
            <>
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 mb-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Delivery Address
                  </h3>
                </div>

                {loading ? (
                  <p>Loading addresses…</p>
                ) : (
                  <>
                    {addresses && addresses.length > 0 ? (
                      // ✅ Sort addresses: selectedAddress first
                      [...addresses]
                        .sort((a, b) => {
                          if (selectedAddress?.id === a.id) return -1;
                          if (selectedAddress?.id === b.id) return 1;
                          return 0;
                        })
                        .map((address) => (
                          <div
                            key={address.id}
                            className={`border rounded-lg p-4 bg-gray-50 shadow-sm mb-3 flex justify-between items-start cursor-pointer transition ${
                              selectedAddress?.id === address.id
                                ? "border-green-500 bg-green-50"
                                : ""
                            }`}
                            onClick={() => handleSelectAddress(address.id)}
                          >
                            {/* Left: Radio + Address Info */}
                            <div className="flex items-start gap-3">
                              <input
                                type="radio"
                                name="selectedAddress"
                                checked={selectedAddress?.id === address.id}
                                onChange={() => handleSelectAddress(address.id)}
                                className="mt-1 w-4 h-4 text-green-600 border-gray-300 focus:ring-green-500 cursor-pointer"
                              />
                              <div>
                                <p className="font-semibold text-gray-900">
                                  Delivery to {address.line1}
                                </p>
                                <p className="text-sm text-gray-600">
                                  {address.line2}, {address.city} -{" "}
                                  {address.postal_code}
                                </p>
                                <p className="text-sm text-gray-600">
                                  {address.state}, {address.country}
                                  {address.landmark &&
                                    `, Landmark: ${address.landmark}`}
                                </p>
                                <p className="text-sm text-gray-600 flex items-center gap-1">
                                  <PhoneCallIcon className="w-4 h-4" />
                                  {address.phone}
                                </p>
                              </div>
                            </div>

                            {/* Right: Edit/Delete Buttons */}
                            <div className="flex gap-3">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditClick(address);
                                }}
                                className="text-blue-600 hover:text-blue-800"
                                aria-label="Edit address"
                              >
                                <Pencil className="w-5 h-5" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteAddress(address.id);
                                }}
                                className="text-red-600 hover:text-red-800"
                                aria-label="Delete address"
                              >
                                <Trash2 className="w-5 h-5" />
                              </button>
                            </div>
                          </div>
                        ))
                    ) : (
                      <p className="text-gray-500 text-sm">
                        No addresses found.
                      </p>
                    )}

                    {/* Buttons Row */}
                    <div className="flex justify-end items-center gap-4 mt-2">
                      <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="text-sm font-medium underline text-green-600 hover:text-green-800 transition-colors"
                      >
                        + Add Address
                      </button>
                    </div>
                  </>
                )}
              </div>

              {/* ➕ Add Address Modal */}
              {isAddModalOpen && (
                <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
                  <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-lg">
                    <h2 className="text-lg font-semibold mb-4 text-gray-800">
                      Add New Address
                    </h2>
                    <form onSubmit={handleAddAddress} className="space-y-3">
                      {Object.keys(formData).map((field) => (
                        <input
                          key={field}
                          type="text"
                          name={field}
                          placeholder={field.replace("_", " ").toUpperCase()}
                          value={formData[field]}
                          onChange={handleChange}
                          className="w-full border p-2 rounded-lg"
                        />
                      ))}
                      <div className="flex justify-end space-x-3 mt-4">
                        <button
                          type="button"
                          onClick={() => setIsAddModalOpen(false)}
                          className="px-4 py-2 border rounded-lg text-gray-600 hover:bg-gray-100"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                        >
                          Add
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {/* ✏️ Edit Address Modal */}
              {isEditModalOpen && selectedAddress && (
                <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
                  <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-lg">
                    <h2 className="text-lg font-semibold mb-4 text-gray-800">
                      Edit Address
                    </h2>
                    <form onSubmit={handleUpdateAddress} className="space-y-3">
                      {Object.keys(formData).map((field) => (
                        <input
                          key={field}
                          type="text"
                          name={field}
                          placeholder={field.replace("_", " ").toUpperCase()}
                          value={formData[field]}
                          onChange={handleChange}
                          className="w-full border p-2 rounded-lg"
                        />
                      ))}
                      <div className="flex justify-end space-x-3 mt-4">
                        <button
                          type="button"
                          onClick={() => setIsEditModalOpen(false)}
                          className="px-4 py-2 border rounded-lg text-gray-600 hover:bg-gray-100"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                          Save
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {/* ✅ Hidden PopupForm but with API-selected address */}
              <div>
                <PopupForm
                  inline={true}
                  product={product}
                  category={category}
                  categoryContent={categoryContent}
                  apiAddress={selectedAddress} // 👈 pass selected address
                />
              </div>
            </>
          ) : (
            // 🟢 Guest users → Normal PopupForm
            <PopupForm
              inline={true}
              product={product}
              category={category}
              categoryContent={categoryContent}
            />
          )}
        </div>

        <div className="hidden lg:block absolute left-1/2 top-0 bottom-0 w-px bg-gray-200" />
      </div>
    </div>
  );
}
