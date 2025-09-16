"use client";
import { useState, useEffect } from "react";
import {
  X,
  FileText,
  Gift,
  CreditCard,
  CheckCircle,
  Wallet2,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "../context/SessionContext";

const PopupForm = ({
  isOpen = false,
  onClose,
  product,
  category,
  categoryContent,
  inline = false,
  defaultCatalogue,
  apiAddress,
}) => {
  const router = useRouter();

  const [quantity, setQuantity] = useState(1);
  const { isLoggedIn } = useSession();

  // 👇 hide form if address is passed
  const useApiAddress = !!apiAddress;

  // ✅ Fetch quantity from sessionStorage if available
  useEffect(() => {
    const stored = sessionStorage.getItem("checkoutData");
    if (stored) {
      const parsed = JSON.parse(stored);
      setQuantity(parsed?.quantity || 1);
    }
  }, []);

  // console.log("🟢 PopupForm defaultCatalogue:", defaultCatalogue);

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    city: "",
    state: "", // ✅ added
    address: "", // ✅ added
    pincode: "", // ✅ added
    landmark: "",
    giftingFor: "",
    budget: "",
    quantity: "",
    prebookingType: "order", // Changed from "quotation" to "order"
    catalogue: defaultCatalogue ?? categoryContent?.title ?? "",
  });

  const [loading, setLoading] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [insertedId, setInsertedId] = useState(null);

  const [selectedMethod, setSelectedMethod] = useState("razorpay");
  const [showInfo, setShowInfo] = useState(true);

  const handleRadioChange = (e) => {
    setSelectedMethod(e.target.value);
    setShowInfo(true);
  };

  const handleToggle = () => {
    if (selectedMethod === "razorpay") {
      setShowInfo((prev) => !prev);
    } else {
      setSelectedMethod("razorpay");
      setShowInfo(true);
    }
  };

  // Load Razorpay script
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      // Reset form when opened
      setFormData({
        name: "",
        phone: "",
        email: "",
        city: "",
        state: "", // ✅ added
        address: "", // ✅ added
        pincode: "", // ✅ added
        landmark: "",
        giftingFor: "",
        budget: "",
        quantity: "",
        prebookingType: "order",
        catalogue: defaultCatalogue ?? categoryContent?.title ?? "",
      });
      setPaymentSuccess(false);
      setInsertedId(null);
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen, category, defaultCatalogue, categoryContent?.title]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Initialize Razorpay payment
  const initiatePayment = async (prebookingId) => {
    return new Promise((resolve, reject) => {
      const amount = (categoryContent?.price || 50000) * quantity;

      const options = {
        key: "rzp_live_lclCyKLWqjYCIJ", // Your Razorpay key rzp_test_Gnu8neTnUU656M /rzp_live_lclCyKLWqjYCIJ
        amount: amount.toString(), // Amount in paise
        currency: "INR",
        name: "Corporate Gifting",
        description: `Pre-booking for ${categoryContent?.name || "Product"}`,
        image:
          "https://marketplace.yuukke.com/themes/default/admin/assets/images/fav.ico",
        order_id: null,
        handler: function (response) {
          resolve(response);
        },
        modal: {
          ondismiss: function () {
            reject(new Error("Payment cancelled")); // payment cancelled
          },
        },
        prefill: {
          name: formData.name,
          email: formData.email,
          contact: formData.phone,
        },
        theme: {
          color: "#F37254",
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    });
  };

  // Update payment status in database
  const updatePaymentStatus = async (prebookingId, paymentId) => {
    try {
      let authToken = localStorage.getItem("authToken");

      if (!authToken) {
        const authResponse = await fetch(
          "https://marketplace.yuukke.com/api/v1/Auth/api_login",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              username: "admin",
              password: "Admin@123",
            }),
          }
        );

        const authData = await authResponse.json();
        if (authData.status === "success") {
          authToken = authData.token;
          localStorage.setItem("authToken", authToken);
        } else {
          throw new Error("Authentication failed");
        }
      }

      const response = await fetch("/api/prebook_gifts_payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          id: prebookingId,
          payment_status: 1,
          razorpay_payment_id: paymentId,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP Error! Status: ${response.status}`);
      }

      const result = await response.json();
      // console.log("✅ Payment status updated:", result);
      return result;
    } catch (error) {
      console.error("[Payment Update Error]:", error);
      throw error;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let authToken = localStorage.getItem("authToken");

      // 1. Get auth token if not available
      if (!authToken) {
        const authResponse = await fetch(
          "https://marketplace.yuukke.com/api/v1/Auth/api_login",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              username: "admin",
              password: "Admin@123",
            }),
          }
        );

        const authData = await authResponse.json();
        if (authData.status === "success") {
          authToken = authData.token;
          localStorage.setItem("authToken", authToken);
        } else {
          throw new Error("Authentication failed");
        }
      }

      // ✅ Only validate if NO apiAddress
      if (!apiAddress) {
        if (
          !formData.name ||
          !formData.phone ||
          !formData.email ||
          !formData.city ||
          !formData.state ||
          !formData.pincode
        ) {
          toast.error("Please fill in all required fields.");
          setLoading(false);
          return;
        }
      }

      // ✅ Always fetch from checkoutData first, fallback to localStorage
      const storedCheckout =
        JSON.parse(sessionStorage.getItem("checkoutData")) || {};

      const selectedVariants = storedCheckout?.selectedVariants || {};
      const selectedContents = storedCheckout?.selectedContents || [];

      // ✅ Handle special case for Signature Conscious hamper

      const isSignatureConscious =
        storedCheckout?.categoryContent?.name === "Signature Consicious";

      const emailToUse = useApiAddress
        ? sessionStorage.getItem("email") || ""
        : formData.email;

      // 2. Prepare request body
      const requestBody = {
        full_name: useApiAddress ? apiAddress.line1 : formData.name,
        phone_number: useApiAddress ? apiAddress.phone : formData.phone,
        email: emailToUse, // 👈 fallback
        city: useApiAddress ? apiAddress.city : formData.city,
        address: useApiAddress
          ? `${apiAddress.line1}, ${apiAddress.line2}`
          : formData.address,
        state: useApiAddress ? apiAddress.state : formData.state,
        pincode: useApiAddress ? apiAddress.postal_code : formData.pincode,
        landmark: useApiAddress ? apiAddress.landmark : formData.landmark,
        prebookingType: formData.prebookingType,
        catalogue: formData.catalogue,
        price: (categoryContent?.price / 100) * quantity,
        quantity_required: quantity,

        product_item: isSignatureConscious
          ? selectedContents
              .map((item) => selectedVariants[item] || item)
              .join(", ")
          : selectedContents.join(", "),
      };

      // console.log("Body", requestBody);

      // 3. Call our API proxy
      const response = await fetch("/api/save_prebook_gift", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify(requestBody),
      });

      // 4. Handle expired token → retry once
      if (response.status === 401) {
        localStorage.removeItem("authToken");
        return handleSubmit(e);
      }

      if (!response.ok) {
        throw new Error(`HTTP Error! Status: ${response.status}`);
      }

      const result = await response.json();
      // console.log("✅ Form submitted:", result);

      // Save the inserted ID for payment status update
      if (result.status && result.id) {
        setInsertedId(result.id);

        // 5. Initiate payment
        toast.loading("Redirecting to payment...");
        const paymentResponse = await initiatePayment(result.id);

        if (paymentResponse.razorpay_payment_id) {
          // Update payment status in database
          await updatePaymentStatus(
            result.id,
            paymentResponse.razorpay_payment_id
          );
          setPaymentSuccess(true);
          toast.success("Payment successful! Order confirmed.");
        } else {
          throw new Error("Payment failed");
        }
      } else {
        throw new Error("Failed to save order");
      }
    } catch (error) {
      console.error("[Form Error]:", error);
      toast.error(error.message || "Payment failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!inline && !isOpen) return null;

  return (
    <>
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 4000,
          style: {
            background: "#363636",
            color: "#fff",
          },
          success: {
            duration: 4000,
            iconTheme: {
              primary: "#10B981",
              secondary: "#fff",
            },
          },
          error: {
            duration: 4000,
            iconTheme: {
              primary: "#EF4444",
              secondary: "#fff",
            },
          },
        }}
      />

      <div
        className={
          inline
            ? ""
            : "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto"
        }
      >
        <div className={`overflow-y-auto ${inline ? "" : ""}`}>
          {/* Close Button */}
          {!inline && (
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-10 text-gray-500 hover:text-gray-700 transition bg-white rounded-full p-1 shadow-sm"
            >
              <X className="h-5 w-5" />
            </button>
          )}

          <div className="p-0">
            {paymentSuccess ? (
              <div className="text-center py-8">
                <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  Order Successful!
                </h3>
                <p className="text-gray-600 mb-6">
                  Thank you for your order. We'll contact you within 24 hours to
                  confirm your order details.
                </p>
                <button
                  onClick={() => {
                    localStorage.clear();
                    router.push("/");
                  }}
                  className="bg-red-600 text-white py-2 px-6 rounded-lg font-medium hover:bg-red-700 transition"
                >
                  Close
                </button>
              </div>
            ) : (
              <>
                {!inline && (
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2 text-center">
                      Order {product?.name || categoryContent?.name}
                    </h2>
                    <p className="text-gray-600 text-center mb-6">
                      Complete your order with a small deposit
                    </p>
                  </div>
                )}
                {!useApiAddress && (
                  <>
                    <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                      Delivery
                    </h2>
                  </>
                )}
                <form onSubmit={handleSubmit} className="space-y-4">
                  {!isLoggedIn && (
                    <>
                      {!useApiAddress && (
                        <>
                          {/* Full Name */}
                          <div>
                            <label
                              htmlFor="name"
                              className="block text-sm font-medium text-gray-700 mb-1"
                            >
                              Full Name
                            </label>
                            <input
                              type="text"
                              id="name"
                              name="name"
                              value={formData.name}
                              onChange={handleChange}
                              required
                              placeholder="Enter your full name"
                              className="input-field"
                            />
                          </div>

                          <div className="flex flex-col md:flex-row gap-4">
                            {/* Business Email */}
                            <div className="flex-1">
                              <label
                                htmlFor="email"
                                className="block text-sm font-medium text-gray-700 mb-1"
                              >
                                Email
                              </label>
                              <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                placeholder="Enter your business email"
                                className="input-field w-full"
                              />
                            </div>

                            {/* Phone Number */}
                            <div className="flex-1">
                              <label
                                htmlFor="phone"
                                className="block text-sm font-medium text-gray-700 mb-1"
                              >
                                Phone Number
                              </label>
                              <input
                                type="tel"
                                id="phone"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                maxLength={10}
                                required
                                placeholder="Enter your phone number"
                                className="input-field w-full"
                              />
                            </div>
                          </div>

                          {/* Address */}
                          <div>
                            <label
                              htmlFor="address"
                              className="block text-sm font-medium text-gray-700 mb-1"
                            >
                              Address
                            </label>
                            <input
                              type="text"
                              id="address"
                              name="address"
                              value={formData.address}
                              onChange={handleChange}
                              required
                              placeholder="Enter your full address"
                              className="input-field"
                            />
                          </div>

                          {/* City + Landmark in same row */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* City */}
                            <div>
                              <label
                                htmlFor="city"
                                className="block text-sm font-medium text-gray-700 mb-1"
                              >
                                City
                              </label>
                              <input
                                type="text"
                                id="city"
                                name="city"
                                value={formData.city}
                                onChange={handleChange}
                                required
                                placeholder="Enter your city"
                                className="input-field"
                              />
                            </div>

                            {/* Landmark */}
                            <div>
                              <label
                                htmlFor="landmark"
                                className="block text-sm font-medium text-gray-700 mb-1"
                              >
                                Landmark
                              </label>
                              <input
                                type="text"
                                id="landmark"
                                name="landmark"
                                value={formData.landmark}
                                onChange={handleChange}
                                placeholder="Nearby landmark (optional)"
                                className="input-field"
                              />
                            </div>
                          </div>

                          {/* State & Pincode in same row */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* State */}
                            <div>
                              <label
                                htmlFor="state"
                                className="block text-sm font-medium text-gray-700 mb-1"
                              >
                                State
                              </label>
                              <input
                                type="text"
                                id="state"
                                name="state"
                                value={formData.state}
                                onChange={handleChange}
                                required
                                placeholder="Enter your state"
                                className="input-field"
                              />
                            </div>

                            {/* Pincode */}
                            <div>
                              <label
                                htmlFor="pincode"
                                className="block text-sm font-medium text-gray-700 mb-1"
                              >
                                Pincode
                              </label>
                              <input
                                type="text"
                                id="pincode"
                                name="pincode"
                                value={formData.pincode}
                                onChange={handleChange}
                                maxLength={6}
                                required
                                placeholder="Enter your pincode"
                                className="input-field"
                              />
                            </div>
                          </div>

                          {/* Catalogue Selection (hidden, set to category ID) */}
                          <input
                            type="hidden"
                            name="catalogue"
                            value={formData.catalogue}
                          />

                          {/* Prebooking Type (hidden, set to "order") */}
                          <input
                            type="hidden"
                            name="prebookingType"
                            value="order"
                          />

                          {/* Payment Section */}
                          <div className="">
                            <h1 className="text-xl font-[800] tracking-tight">
                              Payment
                            </h1>
                            <p className="text-gray-400 text-xs">
                              All transactions are secure and encrypted.
                            </p>

                            <div className="mt-4 border border-gray-300 rounded-lg p-4 bg-white">
                              <label
                                className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between "
                                onClick={handleToggle}
                              >
                                <div className="flex items-start gap-2 sm:items-center">
                                  <input
                                    type="radio"
                                    name="payment"
                                    value="razorpay"
                                    checked={selectedMethod === "razorpay"}
                                    onChange={handleRadioChange}
                                    className="accent-black w-4 h-4 mt-1 sm:mt-0 cursor-pointer"
                                  />
                                  <span className="text-sm font-medium">
                                    Razorpay Secure
                                    <br className="block sm:hidden" />
                                    <br className="hidden lg:block" />
                                    <span className="text-xs text-gray-600">
                                      (UPI, Cards, Wallets, NetBanking)
                                    </span>
                                  </span>
                                </div>

                                <div className="flex items-center flex-wrap gap-2 justify-end sm:justify-normal">
                                  <img
                                    src="/upi.svg"
                                    alt="UPI"
                                    className="w-8 h-8 sm:w-10 sm:h-10 object-contain"
                                  />
                                  <img
                                    src="/visa.svg"
                                    alt="Visa"
                                    className="w-8 h-8 sm:w-10 sm:h-10 object-contain"
                                  />
                                  <img
                                    src="/master.svg"
                                    alt="Master"
                                    className="w-8 h-8 sm:w-10 sm:h-10 object-contain"
                                  />
                                  <img
                                    src="/rupay.svg"
                                    alt="Rupay"
                                    className="w-8 h-8 sm:w-10 sm:h-10 object-contain"
                                  />
                                  <div className="relative group">
                                    <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gray-100 rounded-md text-xs font-bold flex items-center justify-center cursor-pointer group-hover:bg-gray-200">
                                      +16
                                    </div>
                                    <div className="absolute bottom-12 right-0 hidden group-hover:grid grid-cols-4 gap-2 bg-black shadow-xl rounded-lg border p-2 z-20 w-[176px]">
                                      {Array.from({ length: 16 }).map(
                                        (_, i) => (
                                          <img
                                            key={i}
                                            src={`/${i + 1}.svg`}
                                            alt={`Payment ${i + 1}`}
                                            className="w-7 h-7 object-contain"
                                          />
                                        )
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </label>

                              <AnimatePresence initial={false}>
                                <motion.div
                                  key={showInfo ? "visible" : "hidden"}
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{
                                    opacity: 1,
                                    height: "auto",
                                    marginBottom: showInfo ? 16 : 0, // Prevents button jump
                                  }}
                                  exit={{ opacity: 0, height: 0 }}
                                  transition={{ duration: 0.3 }}
                                  className="overflow-hidden"
                                >
                                  {showInfo && (
                                    <div className="border-t pt-4 mt-6 text-center bg-gray-50">
                                      <div className="flex justify-center mb-3">
                                        <Wallet2 className="w-10 h-10 sm:w-12 sm:h-12" />
                                      </div>
                                      <p className="text-sm text-gray-700 font-medium max-w-md mx-auto">
                                        After clicking “Pay now”, you'll be
                                        redirected to Cashfree Payments to
                                        securely complete your purchase using
                                        UPI, Cards, Wallets or NetBanking.
                                      </p>
                                    </div>
                                  )}
                                </motion.div>
                              </AnimatePresence>
                            </div>
                          </div>
                        </>
                      )}
                    </>
                  )}
                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-black text-white py-3 rounded-lg font-semibold text-md hover:opacity-90 transition-all duration-300 disabled:opacity-50"
                  >
                    {loading
                      ? "Processing..."
                      : `Pay ₹${(
                          ((categoryContent?.price || 50000) * quantity) /
                          100
                        ).toFixed(2)} Deposit & Order`}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default PopupForm;
