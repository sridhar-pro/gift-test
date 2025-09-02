"use client";
import { useEffect } from "react";

const GoogleTranslate = () => {
  useEffect(() => {
    const initGoogleTranslate = () => {
      window.googleTranslateElementInit = () => {
        new window.google.translate.TranslateElement(
          {
            pageLanguage: "en",
            includedLanguages: "en,ta,hi",
            layout:
              window.google.translate.TranslateElement.InlineLayout.SIMPLE,
            autoDisplay: false, // Prevents auto-display of banner
          },
          "google_translate_element"
        );
      };

      if (!window.google?.translate) {
        const script = document.createElement("script");
        script.src =
          "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
        script.async = true;
        document.body.appendChild(script);
      }
    };

    initGoogleTranslate();

    return () => {
      // Cleanup function
      delete window.googleTranslateElementInit;
    };
  }, []);

  return (
    <div className="relative">
      {/* Custom trigger button */}
      <button
        onClick={() => {
          const dropdown = document.querySelector(".goog-te-combo");
          if (dropdown) dropdown.click();
        }}
        className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-gray-100 transition-colors"
        aria-label="Change language"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="w-5 h-5 text-gray-600"
        >
          <path d="M12.87 15.07l-2.54-2.51.03-.03c1.74-1.94 2.98-4.17 3.71-6.53H17V4h-7V2H8v2H1v1.99h11.17C11.5 7.92 10.44 9.75 9 11.35 8.07 10.32 7.3 9.19 6.69 8h-2c.73 1.63 1.73 3.17 2.98 4.56l-5.09 5.02L4 19l5-5 3.11 3.11.76-2.04zM18.5 10h-2L12 22h2l1.12-3h4.75L21 22h2l-4.5-12zm-2.62 7l1.62-4.33L19.12 17h-3.24z" />
        </svg>
      </button>

      {/* Google Translate element (hidden by default) */}
      <div
        id="google_translate_element"
        className="absolute opacity-0 w-px h-px overflow-hidden"
      ></div>
    </div>
  );
};

export default GoogleTranslate;
