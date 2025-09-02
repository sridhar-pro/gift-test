"use client";
import { useEffect, useState } from "react";
import { FaFacebookF, FaInstagram, FaLinkedinIn } from "react-icons/fa";

export default function Footer() {
  const [apiCategories, setApiCategories] = useState([]);

  const staticSection = {
    title: "Quick Links",
    links: [
      {
        name: "ODOP Registration",
        slug: "https://marketplace.yuukke.com/odop_register",
      },
      {
        name: "Seller Registration",
        slug: "https://marketplace.yuukke.com/seller_register",
      },
      {
        name: "Empowering Community",
        slug: "https://marketplace.yuukke.com/empowering-community",
      },
      {
        name: "How To Gain YuukkeMints",
        slug: "https://marketplace.yuukke.com/gain-yuukkemints",
      },
    ],
  };

  useEffect(() => {
    const fetchFooterData = async () => {
      try {
        let cachedData = localStorage.getItem("footer_categories_cache");

        // 1. Use cached data immediately if available
        if (cachedData) {
          try {
            setApiCategories(JSON.parse(cachedData));
          } catch {
            localStorage.removeItem("footer_categories_cache");
          }
        }

        // 2. Get auth token
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

        // 3. Fetch fresh data in the background
        const res = await fetch("/api/homeCategory", {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        });

        if (!res.ok) {
          if (res.status === 401) {
            localStorage.removeItem("authToken");
            return fetchFooterData(); // 🔁 Retry
          }
          throw new Error(`Failed to fetch footer data: ${res.status}`);
        }

        const data = await res.json();

        const formattedData = (data?.data || data)?.map((category) => ({
          title: category.name,
          parentSlug: category.slug,
          links: (category.subcategories || []).map((sub) => ({
            name: sub.name,
            slug: sub.slug,
            parentSlug: category.slug,
          })),
        }));

        // 4. Update state + cache
        setApiCategories(formattedData || []);
        localStorage.setItem(
          "footer_categories_cache",
          JSON.stringify(formattedData)
        );
      } catch (error) {
        console.error("⚠️ Failed to fetch footer data:", error);
      }
    };

    fetchFooterData();
  }, []);

  const footerData = [staticSection, ...apiCategories];

  return (
    <footer className="bg-white text-sm text-[#911439]">
      {/* Subscribe Section */}
      <div className="w-full py-6 bg-white p-4">
        <div className="flex flex-col md:flex-row items-center md:justify-between gap-6 md:gap-10 px-4 max-w-[105rem] mx-auto">
          <div className="flex flex-col md:flex-row items-center gap-6 md:gap-40 ml-0 md:ml-6 text-center md:text-left">
            <img
              src="/subscribe.png"
              alt="Logo"
              className="w-20 h-20 object-contain mx-auto md:mx-0"
            />
            <p className="text-[#911439] font-semibold text-2xl md:text-[2rem]">
              Get offers in your inbox
            </p>
          </div>
          <div className="flex flex-col md:flex-row gap-4 md:gap-2 w-full md:w-auto mt-4 md:mt-0">
            <div className="p-[2px] rounded bg-gradient-to-r from-red-700 to-red-800 flex-1">
              <input
                type="email"
                placeholder="Enter your mail here"
                className="w-full md:w-[28rem] px-3 py-2 rounded outline-none bg-white text-black"
              />
            </div>
            <button className="bg-gradient-to-r from-blue-950 to-red-900 text-white px-4 py-2 rounded-sm hover:from-blue-800 hover:to-blue-950 transition w-full md:w-56">
              Subscribe Me!
            </button>
          </div>
        </div>
      </div>

      {/* Footer Links Section */}
      <div className="w-full px-4">
        <div className="w-full mx-auto px-0 md:px-6 py-6">
          {footerData.map((section, index) => {
            const isQuickLinks = section.title === "Quick Links";

            const content = (
              <div className="py-2 text-xs">
                {isQuickLinks ? (
                  <h4 className="font-bold underline">{section.title}</h4>
                ) : (
                  <a
                    href={`https://marketplace.yuukke.com/category/${section.parentSlug}`}
                    className="font-bold underline hover:text-[#6e0e2d]"
                  >
                    {section.title}
                  </a>
                )}

                <div className="flex flex-wrap gap-2 text-[#911439]">
                  {section.links.map((link, idx) => (
                    <span key={idx}>
                      {idx > 0 && <span className="mx-0 md:mx-1">|</span>}
                      <a
                        href={
                          link?.slug?.startsWith("http")
                            ? link.slug
                            : `https://marketplace.yuukke.com/category/${link.parentSlug}/${link.slug}`
                        }
                        className="hover:underline"
                      >
                        {link.name}
                      </a>
                    </span>
                  ))}
                </div>
              </div>
            );

            return isQuickLinks ? (
              <div key={index} className="border-y border-gray-300 w-full py-6">
                {content}
              </div>
            ) : (
              <div key={index}>{content}</div>
            );
          })}
        </div>
      </div>

      {/* Footer Bottom Section */}
      <div className="border-t border-gray-300 mt-0 pt-0">
        <div className="max-w-[105rem] mx-auto px-6 py-4">
          <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-6">
            {/* Logo on the far left (or center on mobile) */}
            <div className="md:w-1/4 w-full flex justify-center md:justify-start">
              <img
                src="/logo.png"
                alt="Logo"
                className="w-40 h-16 md:h-40 object-contain"
              />
            </div>

            {/* Text & Payment icons */}
            <div className="md:w-3/4 w-full flex flex-col items-center md:items-end text-center md:text-left text-gray-400 text-xs md:text-base font-medium">
              <p className="max-w-7xl">
                Your one-stop destination for an unparalleled shopping
                experience. We pride ourselves on offering a diverse and
                carefully curated selection of high-quality products across
                various categories. From fashion and accessories to home
                essentials and beyond, Yuukke is committed to bringing you items
                that enrich your life while prioritizing sustainability.
              </p>

              {/* Payment Icons below */}
              <div className="mt-4 flex flex-wrap justify-center md:justify-end gap-2">
                <img
                  src="/mastercard.png"
                  alt="Mastercard"
                  className="w-12 h-12 object-contain"
                />
                <img
                  src="/american_express.png"
                  alt="Amex"
                  className="w-12 h-12 object-contain"
                />
                <img
                  src="/paypal.png"
                  alt="PayPal"
                  className="w-12 h-12 object-contain"
                />
                <img
                  src="/visa.jpg"
                  alt="Visa"
                  className="w-12 h-12 object-contain"
                />
                <img
                  src="/maestro.png"
                  alt="Maestro"
                  className="w-12 h-12 object-contain"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Footer Bar */}
      <div className="bg-gradient-to-r from-blue-950 to-[#911439] text-white text-sm py-4 px-20 tracking-wider">
        <div className="flex flex-col md:flex-row justify-between items-center px-6 gap-4 text-center md:text-left">
          <div className="flex-shrink-0">
            ©2025 Yuukke Global Ventures Private Limited.
          </div>
          <div className="flex flex-wrap justify-center gap-2 text-xs md:text-sm">
            <a href="#" className="hover:underline">
              Privacy
            </a>{" "}
            |
            <a href="#" className="hover:underline">
              Shipping
            </a>{" "}
            |
            <a href="#" className="hover:underline">
              Returns & Refund
            </a>{" "}
            |
            <a href="#" className="hover:underline">
              T&C
            </a>{" "}
            |
            <a href="#" className="hover:underline">
              Contact
            </a>
          </div>
          <div className="flex-shrink-0 flex flex-wrap items-center justify-center gap-3 text-white mr-0 md:mr-52 mt-4 md:mt-0">
            <span className="text-base">Follow us |</span>
            <a href="#">
              <FaFacebookF className="w-5 h-5 text-white hover:text-gray-300 cursor-pointer" />
            </a>
            <a href="#">
              <FaInstagram className="w-5 h-5 text-white hover:text-gray-300 cursor-pointer" />
            </a>
            <a href="#">
              <FaLinkedinIn className="w-5 h-5 text-white hover:text-gray-300 cursor-pointer" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
