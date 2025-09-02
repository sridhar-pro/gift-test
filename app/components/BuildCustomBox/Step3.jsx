import { useEffect, useState } from "react";
import Image from "next/image";
import ButtonSecondary from "../Button/ButtonSecondary";
import ButtonPrimary from "../Button/ButtonPrimary";
import { ArrowRight } from "lucide-react";

export default function Step3({
  onNext,
  onBack,
  selectedAddons = [],
  setSelectedAddons,
}) {
  const [addons, setAddons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showMessageForm, setShowMessageForm] = useState(false);
  const [message, setMessage] = useState("");
  const [showErrors, setShowErrors] = useState(false);

  const maxChars = 120;
  const canContinue = selectedAddons.length > 0;

  const getImageSrc = (image) => {
    if (!image) return "/fallback.png"; // Optional fallback image path
    if (image.startsWith("http") || image.startsWith("/")) return image;
    return `https://marketplace.yuukke.com/assets/uploads/${image}`;
  };

  const handleMessageChange = (e) => {
    const value = e.target.value;
    setMessage(value);
    localStorage.setItem("giftMessage", value);
  };

  useEffect(() => {
    localStorage.setItem("selectedAddons", JSON.stringify(selectedAddons));
    // console.log("Saved selectedAddons:", selectedAddons);
  }, [selectedAddons]);

  useEffect(() => {
    const savedMessage = localStorage.getItem("giftMessage");
    if (savedMessage) {
      setMessage(savedMessage);
      console.log("Loaded message from localStorage:", savedMessage);
    }
  }, []);

  useEffect(() => {
    const fetchAddons = async () => {
      try {
        setLoading(true);

        // 1. Get or refresh authentication token
        let authToken = localStorage.getItem("authToken");
        if (!authToken) {
          const authResponse = await fetch("/api/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              username: "admin",
              password: "Admin@123",
            }),
          });

          const authData = await authResponse.json();
          if (authData.status === "success") {
            authToken = authData.token;
            localStorage.setItem("authToken", authToken);
          } else {
            throw new Error("Authentication failed");
          }
        }

        // 2. Fetch add-ons with authentication
        const res = await fetch("/api/addGiftAddons", {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        });

        // 3. Handle unauthorized (401) responses
        if (!res.ok) {
          if (res.status === 401) {
            // Token expired, clear and retry
            localStorage.removeItem("authToken");
            return fetchAddons();
          }
          throw new Error(`Failed to fetch add-ons: ${res.status}`);
        }

        const data = await res.json();
        setAddons(data?.data || []);
      } catch (err) {
        console.error("Add-ons fetch error:", err);
        setError(err.message || "Failed to load add-ons.");
      } finally {
        setLoading(false);
      }
    };

    fetchAddons();
  }, []);

  const toggleAddon = (id) => {
    const addon = addons.find((a) => a.id === id);
    if (!addon) return;

    const exists = selectedAddons.some((item) => item.id === id);

    const updated = exists
      ? selectedAddons.filter((item) => item.id !== id)
      : [
          ...selectedAddons,
          {
            id: addon.id,
            title: addon.title,
            price: addon.price,
            image: addon.image,
          },
        ];

    setSelectedAddons(updated);
    localStorage.setItem("selectedAddons", JSON.stringify(updated));
  };

  useEffect(() => {
    const saved = localStorage.getItem("selectedAddons");
    if (saved) {
      const parsed = JSON.parse(saved);
      setSelectedAddons(parsed);
      // console.log("Loaded selectedAddons from localStorage:", parsed);
    }
  }, []);

  const handleNextClick = () => {
    // Scroll to top before proceeding
    window.scrollTo({ top: 300, behavior: "smooth" });

    onNext({ selectedAddons, message });
  };

  return (
    <div className="p-0 md:p-4">
      {!showMessageForm ? (
        <>
          <div className="flex items-center justify-between flex-wrap gap-4">
            {/* Mobile: Fixed Header */}
            <div className="block md:hidden sticky top-0 z-50 bg-white border-b border-gray-300 px-4 py-3">
              <h3 className="text-[1.7rem] text-center font-semibold text-black uppercase">
                {/* <span className="uppercase">Step 3 -</span>
                <br /> */}
                Add-on Gifts
              </h3>
              <p className="text-gray-700 mt-1 text-sm text-center">
                Choose any extras to make your box even more special.
              </p>
            </div>

            {/* Desktop: Normal Header */}
            <div className="hidden md:block">
              <h3 className="text-3xl font-semibold text-black uppercase">
                Add-on Gifts
              </h3>
              <p className="text-gray-700 mt-1 text-sm ">
                Choose any extras to make your box even more special.
              </p>
            </div>

            <div className="flex justify-center md:justify-start gap-3 md:gap-3 mt-6">
              <ButtonPrimary
                onClick={onBack}
                className="border border-black text-black px-4 py-2 rounded hover:bg-black hover:text-white transition"
              >
                Previous
              </ButtonPrimary>
              <ButtonPrimary
                onClick={() => onNext({ selectedAddons, message: "" })}
                className="border border-black text-black px-8  py-2 rounded hover:bg-black hover:text-white transition"
              >
                Skip
              </ButtonPrimary>
              <ButtonSecondary
                className={
                  canContinue
                    ? "bg-black text-white hover:opacity-90"
                    : "bg-gray-400 cursor-not-allowed"
                }
                onClick={() => canContinue && setShowMessageForm(true)}
                disabled={!canContinue}
              >
                Continue
              </ButtonSecondary>
            </div>
          </div>

          {loading ? (
            <p className="text-center mt-6">Loading add-ons...</p>
          ) : error ? (
            <p className="text-center text-red-500 mt-6">{error}</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
              {addons.map((addon) => {
                const isSelected = selectedAddons.some(
                  (item) => item.id === addon.id
                );

                return (
                  <div
                    key={addon.id}
                    onClick={() => toggleAddon(addon.id)}
                    className={`cursor-pointer bg-white  ${
                      isSelected ? "ring-2 ring-[#747474] rounded-md" : ""
                    }`}
                  >
                    <div
                      className="w-full relative rounded-md overflow-hidden bg-gray-200"
                      style={{ aspectRatio: "4 / 3.3", maxHeight: "500px" }}
                    >
                      <Image
                        src={getImageSrc(addon.image)}
                        alt={addon.name || "Gift add-on"}
                        fill
                        className="object-cover rounded-md"
                      />
                    </div>
                    <div className="py-2 px-1">
                      <h3 className="text-lg font-semibold text-black">
                        {addon.title}
                      </h3>
                      <p className="mt-1 font-bold text-[#911439] font-sans">
                        ₹{addon.price}
                      </p>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleAddon(addon.id);
                        }}
                        className={`mt-4 px-4 py-1 rounded text-white text-sm ${
                          isSelected
                            ? "bg-gray-700 cursor-default"
                            : "bg-black hover:bg-[#7a1030]"
                        }`}
                        disabled={isSelected}
                      >
                        {isSelected ? "Added" : "Add"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="flex justify-end gap-4 mt-6">
            <ButtonSecondary
              className={`px-6 py-2 rounded transition ${
                canContinue
                  ? "bg-black text-white hover:opacity-90"
                  : "bg-gray-400 cursor-not-allowed text-white"
              }`}
              onClick={() => {
                if (canContinue) {
                  window.scrollTo({ top: 0, behavior: "smooth" });
                  setShowMessageForm(true);
                }
              }}
              disabled={!canContinue}
            >
              Next
              <ArrowRight className="w-5 h-5" />
            </ButtonSecondary>
          </div>
        </>
      ) : (
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-extrabold text-center mb-2">
            WRITE YOUR MESSAGE
          </h1>
          <p className="text-center text-sm text-gray-600 max-w-xl mx-auto mb-8">
            Send a message that fits your gift. Angela pays attention to the
            smallest details when curating your gift box, including the
            handwriting.
          </p>

          <div className="mb-2">
            <label className="block text-sm font-medium mb-1">
              Message on Card
            </label>
            <textarea
              className={`w-full max-w-6xl border p-3 rounded ${
                showErrors && !message.trim()
                  ? "border-red-500"
                  : "border-gray-300"
              }`}
              rows={3}
              maxLength={maxChars}
              placeholder="Enter your card message here. 120 characters max."
              value={message}
              onChange={handleMessageChange}
            />

            <p className="text-xs text-gray-500 mt-1">
              {maxChars - message.length} characters remaining
            </p>
          </div>

          <div className="flex flex-col sm:flex-row justify-between mt-6 gap-4 pb-4 md:pb-0">
            <button
              className="border border-black text-black px-4 py-2 rounded hover:bg-gray-100 transition"
              onClick={() => setShowMessageForm(false)}
            >
              Back to Add-ons
            </button>
            <button
              className="px-6 py-3 rounded font-semibold text-white bg-[#111] hover:bg-black"
              onClick={handleNextClick}
            >
              Add to Cart
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
