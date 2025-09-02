"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import ButtonSecondary from "../Button/ButtonSecondary";
import ButtonPrimary from "../Button/ButtonPrimary";
import { ArrowRight } from "lucide-react";

export default function Step2({
  onNext,
  onBack,
  selectedBoxes = {},
  setSelectedBoxes,
}) {
  const [boxes, setBoxes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedBoxId, setSelectedBoxId] = useState(null);

  const getImageSrc = (image) => {
    if (!image) return "/fallback.png";
    if (image.startsWith("http") || image.startsWith("/")) return image;
    return `https://marketplace.yuukke.com/assets/uploads/${image}`;
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        // 1. Get authentication token
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

        // 2. Fetch boxes with authentication
        const res = await fetch("/api/giftBox", {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        });

        if (!res.ok) {
          if (res.status === 401) {
            // Token expired, clear and retry
            localStorage.removeItem("authToken");
            return loadData();
          }
          throw new Error(`Failed to fetch gift boxes: ${res.status}`);
        }

        const data = await res.json();
        const fetchedBoxes = data?.data || [];
        setBoxes(fetchedBoxes);

        // 3. Check for existing selection
        const savedBoxes = localStorage.getItem("selectedBoxes");
        if (savedBoxes) {
          const parsed = JSON.parse(savedBoxes);
          const savedBoxId = Object.keys(parsed)[0];
          if (savedBoxId) {
            const boxExists = fetchedBoxes.some(
              (box) => box.id === parseInt(savedBoxId)
            );
            if (boxExists) {
              setSelectedBoxId(parseInt(savedBoxId));
            } else {
              // Clear invalid selection
              localStorage.removeItem("selectedBoxes");
              setSelectedBoxes({});
            }
          }
        }
      } catch (err) {
        console.error("Failed to load data:", err);
        setError(err.message || "Failed to load gift boxes. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [setSelectedBoxes]);

  // Sync selection changes
  useEffect(() => {
    if (selectedBoxId) {
      const selectedBox = boxes.find((box) => box.id === selectedBoxId);
      if (selectedBox) {
        const updated = {
          [selectedBoxId]: {
            id: selectedBox.id,
            name: selectedBox.name,
            price: selectedBox.price,
            image: selectedBox.image,
            size: selectedBox.size,
          },
        };
        setSelectedBoxes(updated);
        localStorage.setItem("selectedBoxes", JSON.stringify(updated));
      }
    } else {
      setSelectedBoxes({});
      localStorage.removeItem("selectedBoxes");
    }
  }, [selectedBoxId, boxes, setSelectedBoxes]);

  // Rest of the component remains the same...
  const handleBoxClick = (id) => {
    setSelectedBoxId((prevId) => (prevId === id ? null : id));
    setError("");
  };

  const handleNextClick = () => {
    if (!selectedBoxId) {
      setError("Please select a gift box before proceeding.");
      return;
    }
    setError("");
    window.scrollTo({ top: 300, behavior: "smooth" });
    onNext();
  };

  return (
    <div className="w-full flex flex-col justify-between gap-10 px-0 md:px-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Mobile Heading */}
        <div className="block md:hidden sticky top-0 z-50 bg-white border-b border-gray-300 px-4 py-3">
          <h3 className="text-[1.7rem] text-center font-semibold text-black uppercase">
            {/* <span className="uppercase">Step 2 -</span>
            <br /> */}
            Choose Gift Box
          </h3>
          <p className="text-gray-700 mt-1 text-sm text-center">
            Choose your preferred gift box style (only one)
          </p>
        </div>

        {/* Desktop Heading */}
        <div className="hidden md:flex md:flex-col">
          <h3 className="text-3xl font-semibold text-black uppercase">
            Choose Gift Box
          </h3>
          <p className="text-gray-700 mt-1 text-sm">
            Choose your preferred gift box style (only one)
          </p>
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-4 mt-2 md:mt-0">
          <ButtonPrimary
            onClick={onBack}
            className="border border-black text-black px-4 py-2 rounded hover:bg-black hover:text-white transition"
          >
            Previous
          </ButtonPrimary>
          <ButtonSecondary
            onClick={handleNextClick}
            className={`px-5 py-2 rounded transition ${
              selectedBoxId
                ? "bg-black text-white hover:opacity-90"
                : "bg-gray-400 text-white cursor-not-allowed"
            }`}
            disabled={!selectedBoxId}
          >
            Next
          </ButtonSecondary>
        </div>
      </div>

      {error && (
        <p className="text-red-600 font-medium text-sm mt-[-20px]">{error}</p>
      )}

      {/* Gift Boxes */}
      <div>
        <div className="flex justify-between items-center mb-4 px-2">
          <h2 className="text-3xl font-semibold text-black">Top Gift Boxes!</h2>
        </div>

        {loading ? (
          <p className="text-center text-gray-600">Loading gift boxes...</p>
        ) : (
          <div className="flex">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 w-full">
              {boxes.map((box) => {
                const isSelected = selectedBoxId === box.id;
                return (
                  <div
                    key={box.id}
                    onClick={() => handleBoxClick(box.id)}
                    className={`cursor-pointer bg-white ${
                      isSelected ? "ring-2 ring-[#747474] rounded-md" : ""
                    }`}
                  >
                    <div
                      className="w-full relative rounded-md overflow-hidden bg-gray-200"
                      style={{ aspectRatio: "4 / 3.3", maxHeight: "500px" }}
                    >
                      <Image
                        src={getImageSrc(box.image)}
                        alt={box.name}
                        layout="fill"
                        objectFit="cover"
                        className="transition duration-300 group-hover:scale-105 rounded-md"
                      />
                    </div>
                    <div className="py-2 px-1">
                      <h3 className="text-lg font-semibold text-black">
                        {box.name}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1 font-sans">
                        {box.size
                          ? `${box.size} – holds up to ${box.minimum_value} items`
                          : `Holds up to ${box.minimum_value || "N/A"} items`}
                      </p>

                      <p className="text-[#911439] font-bold text-md mt-1 font-sans">
                        ₹{box.price}
                      </p>
                      <p
                        className={`mt-3 text-sm ${
                          isSelected
                            ? "text-black font-semibold"
                            : "text-gray-600"
                        }`}
                      >
                        {isSelected ? "Selected" : "Click to select"}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-end gap-4">
        <ButtonSecondary
          onClick={handleNextClick}
          className="bg-black text-white px-5 py-2 rounded hover:opacity-90 transition flex items-center gap-2 "
        >
          Next
          <ArrowRight className="w-5 h-5" />
        </ButtonSecondary>
      </div>
    </div>
  );
}
