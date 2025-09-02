"use client";
import { useState, useEffect } from "react";
import { X, FileText, Gift, CreditCard, CheckCircle } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

const PopupForm = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    city: "",
    giftingFor: "",
    budget: "",
    quantity: "",
    prebookingType: "quotation", // "quotation" or "prebooking"
    catalogue: "",
  });

  const [loading, setLoading] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [insertedId, setInsertedId] = useState(null);

  // Load Razorpay script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      // Reset form when opened
      setFormData({
        name: "",
        phone: "",
        email: "",
        city: "",
        giftingFor: "",
        budget: "",
        quantity: "",
        prebookingType: "quotation",
        catalogue: "",
      });
      setPaymentSuccess(false);
      setInsertedId(null);
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Initialize Razorpay payment
  const initiatePayment = async (prebookingId) => {
    return new Promise((resolve, reject) => {
      const options = {
        key: "rzp_live_lclCyKLWqjYCIJ", // Your Razorpay key
        amount: "50000", // ₹500 in paise
        currency: "INR",
        name: "Corporate Gifting",
        description: "Pre-booking Deposit",
        image: "https://marketplace.yuukke.com/themes/default/admin/assets/images/fav.ico", // Your logo
        order_id: null, // You would get this from your backend
        handler: function(response) {
          resolve(response);
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

      // For demo, we'll simulate payment success
      // In a real implementation, you would create an order on your backend
      if (formData.prebookingType === "prebooking") {
        // setTimeout(() => {
        //   resolve({ 
        //     razorpay_payment_id: "pay_" + Math.random().toString(36).substr(2, 9),
        //     razorpay_order_id: "order_" + Math.random().toString(36).substr(2, 9),
        //     razorpay_signature: "signature_" + Math.random().toString(36).substr(2, 9)
        //   });
        // }, 2000);
        
        // In real implementation, use:
        const rzp = new window.Razorpay(options);
        rzp.open();
      } else {
        resolve({ free: true });
      }
    });
  };

  // Update payment status in database
  const updatePaymentStatus = async (prebookingId, paymentId) => {
    try {
      let authToken = localStorage.getItem("authToken");
      
      if (!authToken) {
        // Re-authenticate if needed
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
          razorpay_payment_id: paymentId
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP Error! Status: ${response.status}`);
      }

      const result = await response.json();
      console.log("✅ Payment status updated:", result);
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

      // 2. Prepare request body
      const requestBody = {
        full_name: formData.name,
        phone_number: formData.phone,
        email: formData.email,
        city: formData.city,
        gifting_for: formData.giftingFor,
        budget_per_gift: formData.budget,
        quantity_required: formData.quantity,
        prebookingType: formData.prebookingType,
        catalogue: formData.catalogue,
      };

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
      console.log("✅ Form submitted:", result);

      // Save the inserted ID for payment status update
      if (result.status && result.id) {
        setInsertedId(result.id);
        
        // 5. Initiate payment if it's a paid pre-booking
        if (formData.prebookingType === "prebooking") {
          toast.loading("Redirecting to payment...");
          const paymentResponse = await initiatePayment(result.id);
          
          if (paymentResponse.razorpay_payment_id) {
            // Update payment status in database
            await updatePaymentStatus(result.id, paymentResponse.razorpay_payment_id);
            setPaymentSuccess(true);
            toast.success("Payment successful! Prebooking confirmed.");
          } else {
            throw new Error("Payment failed");
          }
        } else {
          // For quotation requests
          toast.success("Request submitted successfully! Our team will contact you soon.");
          
          // Close popup after a short delay to allow toast to be seen
          setTimeout(() => {
            onClose();
          }, 2000);
        }
      } else {
        throw new Error("Failed to save prebooking");
      }
    } catch (error) {
      console.error("[Form Error]:", error);
      // Show error toast
      toast.error(
        formData.prebookingType === "prebooking" 
          ? "Payment failed. Please try again." 
          : "Failed to submit request. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <Toaster 
        position="top-center"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 4000,
            iconTheme: {
              primary: '#10B981',
              secondary: '#fff',
            },
          },
          error: {
            duration: 4000,
            iconTheme: {
              primary: '#EF4444',
              secondary: '#fff',
            },
          },
        }}
      />
      
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
        <div className="bg-white rounded-xl shadow-lg w-full max-w-lg relative my-8 mx-auto max-h-[90vh] overflow-y-auto">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 text-gray-500 hover:text-gray-700 transition bg-white rounded-full p-1 shadow-sm"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="p-6">
            {paymentSuccess ? (
              <div className="text-center py-8">
                <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-800 mb-2">Payment Successful!</h3>
                <p className="text-gray-600 mb-6">Thank you for your pre-booking. We'll contact you within 24 hours to confirm your order details.</p>
                <button
                  onClick={onClose}
                  className="bg-red-600 text-white py-2 px-6 rounded-lg font-medium hover:bg-red-700 transition"
                >
                  Close
                </button>
              </div>
            ) : (
              <>
                <h2 className="text-2xl font-bold text-gray-800 mb-2 text-center">
                  Talk to Our Gifting Experts

                </h2>
                <p className="text-gray-600 text-center mb-6">
                  Gifts that Create Lasting Impressions
                </p>

                {/* Request Type Selection */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    I would like to:
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <label className={`flex flex-col items-center p-4 border rounded-lg cursor-pointer transition ${formData.prebookingType === "quotation" ? "border-red-500 bg-red-50" : "border-gray-300 hover:border-gray-400"}`}>
                      <FileText className={`h-6 w-6 mb-2 ${formData.prebookingType === "quotation" ? "text-red-600" : "text-gray-500"}`} />
                      <span className="text-sm font-medium">Get a Quotation</span>
                      <input
                        type="radio"
                        name="prebookingType"
                        value="quotation"
                        checked={formData.prebookingType === "quotation"}
                        onChange={handleChange}
                        className="sr-only"
                      />
                    </label>
                    
                    <label className={`flex flex-col items-center p-4 border rounded-lg cursor-pointer transition ${formData.prebookingType === "prebooking" ? "border-red-500 bg-red-50" : "border-gray-300 hover:border-gray-400"}`}>
                      <Gift className={`h-6 w-6 mb-2 ${formData.prebookingType === "prebooking" ? "text-red-600" : "text-gray-500"}`} />
                      <span className="text-sm font-medium">Pre-book Now</span>
                      <input
                        type="radio"
                        name="prebookingType"
                        value="prebooking"
                        checked={formData.prebookingType === "prebooking"}
                        onChange={handleChange}
                        className="sr-only"
                      />
                    </label>
                  </div>
                  
                  {formData.prebookingType === "prebooking" && (
                    <div className="mt-3 bg-blue-50 p-3 rounded-lg border border-blue-200">
                      <p className="text-sm text-blue-700 flex items-center">
                        <CreditCard className="h-4 w-4 mr-2" />
                        ₹500 deposit required to secure your pre-booking
                      </p>
                    </div>
                  )}
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
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
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 outline-none transition"
                    />
                  </div>

                  {/* Phone Number */}
                  <div>
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
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 outline-none transition"
                    />
                  </div>

                  {/* Business Email */}
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Business Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      placeholder="Enter your business email"
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 outline-none transition"
                    />
                  </div>

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
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 outline-none transition"
                    />
                  </div>

                  {/* Gifting For */}
                  <div>
                    <label
                      htmlFor="giftingFor"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Gifting For
                    </label>
                    <select
                      id="giftingFor"
                      name="giftingFor"
                      value={formData.giftingFor}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 outline-none transition bg-white"
                    >
                      <option value="">Select an option</option>
                      <option value="internal-employees">Internal Employees</option>
                      <option value="clients-customers">Clients / Customers</option>
                      <option value="cxos-executives">
                        CXOs / Executives / Elite Partners
                      </option>
                      <option value="others">Others</option>
                    </select>
                  </div>

                  {/* Budget */}
                  <div>
                    <label
                      htmlFor="budget"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Budget per Gift (₹)
                    </label>
                    <input
                      type="number"
                      id="budget"
                      name="budget"
                      value={formData.budget}
                      onChange={handleChange}
                      required
                      placeholder="Enter your budget per gift"
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 outline-none transition"
                    />
                  </div>

                  {/* Quantity */}
                  <div>
                    <label
                      htmlFor="quantity"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Quantity Required
                    </label>
                    <input
                      type="number"
                      id="quantity"
                      name="quantity"
                      value={formData.quantity}
                      onChange={handleChange}
                      required
                      placeholder="Enter quantity required"
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 outline-none transition"
                    />
                  </div>

                  {/* Catalogue Selection */}
                  

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-red-700 via-pink-600 to-red-600 text-white py-3 rounded-lg font-semibold text-md hover:opacity-90 transition-all duration-300 disabled:opacity-50"
                  >
                    {loading 
                      ? "Processing..." 
                      : formData.prebookingType === "prebooking" 
                        ? "Proceed to Payment" 
                        : "Request Quotation"
                    }
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