"use client";
import { useState, useEffect, useCallback, useRef } from "react";

const languages = [
  { code: "en", name: "English", flag: "/flags/en.png" },
  { code: "ta", name: "Tamil", flag: "/flags/ta.png" },
  { code: "hi", name: "Hindi", flag: "/flags/hi.png" },
];

// Singleton to track Google Translate script state
const googleTranslateState = {
  isLoaded: false,
  isInitialized: false,
  initCallbacks: [],
};

const GoogleTranslate = ({ onLanguageChange }) => {
  const [translateReady, setTranslateReady] = useState(false);
  const [scriptError, setScriptError] = useState(null);
  const initRef = useRef(false);

  useEffect(() => {
    if (initRef.current) return;

    initRef.current = true;

    const initGoogleTranslate = () => {
      if (googleTranslateState.isInitialized) {
        console.log("Google Translate already initialized, setting ready...");
        setTranslateReady(true);
        return;
      }

      window.googleTranslateElementInit = () => {
        try {
          new window.google.translate.TranslateElement(
            {
              pageLanguage: "en",
              autoDisplay: false,
            },
            "google_translate_element"
          );
          googleTranslateState.isInitialized = true;
          setTranslateReady(true);
          console.log("Google Translate initialized successfully");
          setTimeout(() => {
            const select = document.querySelector(".goog-te-combo");
            console.log(".goog-te-combo available:", !!select);
            if (!select) {
              console.warn("Dropdown not created, inspecting DOM...");
              console.log(
                "google_translate_element content:",
                document.getElementById("google_translate_element")?.innerHTML
              );
            }
          }, 1000);
        } catch (error) {
          console.error("Google Translate initialization error:", error);
          setScriptError("Failed to initialize Google Translate");
        }
      };

      if (!googleTranslateState.isLoaded && !window.google?.translate) {
        console.log("Loading Google Translate script...");
        const script = document.createElement("script");
        script.src =
          "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
        script.async = true;
        script.onload = () => {
          console.log("Google Translate script loaded successfully");
          googleTranslateState.isLoaded = true;
        };
        script.onerror = () => {
          console.error("Google Translate script failed to load");
          setScriptError("Unable to load Google Translate script");
        };
        document.body.appendChild(script);
      } else if (window.google?.translate) {
        console.log("Google Translate already loaded, initializing...");
        window.googleTranslateElementInit();
      }
    };

    initGoogleTranslate();

    return () => {
      console.log("Cleaning up Google Translate callback...");
      delete window.googleTranslateElementInit;
    };
  }, []);

  useEffect(() => {
    if (translateReady) {
      const select = document.querySelector(".goog-te-combo");
      if (select) {
        console.log("Attaching change listener to .goog-te-combo");
        const handler = () => {
          const selectedLang = select.value;
          console.log("Google Translate dropdown changed to:", selectedLang);
          onLanguageChange(selectedLang);
          // Force re-translation
          if (window.google?.translate?.TranslateElement?.getInstance()) {
            try {
              const instance =
                window.google.translate.TranslateElement.getInstance();
              instance.showBanner(false);
              instance.translate();
              console.log("Forced Google Translate re-translation");
            } catch (error) {
              console.error("Error forcing re-translation:", error);
            }
          }
        };
        select.addEventListener("change", handler);
        return () => select.removeEventListener("change", handler);
      } else {
        console.warn(
          "Google Translate dropdown (.goog-te-combo) not found after initialization"
        );
      }
    }
  }, [translateReady, onLanguageChange]);

  if (scriptError) {
    return (
      <div className="text-red-500 text-xs">
        {scriptError}. Please try again later.
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => {
          const dropdown = document.querySelector(".goog-te-combo");
          if (dropdown) {
            dropdown.click();
            console.log("Google Translate dropdown triggered");
          } else {
            console.warn("Google Translate dropdown not available for trigger");
          }
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
      <div
        id="google_translate_element"
        className="absolute opacity-0 w-px h-px overflow-hidden"
      ></div>
    </div>
  );
};

const LanguageSelector = () => {
  const [language, setLanguage] = useState(languages[0]);
  const [renderKey, setRenderKey] = useState(0);

  const handleLanguageChange = useCallback((langCode) => {
    const selectedLang = languages.find((lang) => lang.code === langCode);
    if (!selectedLang) {
      console.warn(`Language code ${langCode} not found in languages array`);
      return;
    }

    setLanguage(selectedLang);
    setRenderKey((prev) => prev + 1);

    const attemptTranslation = () => {
      const select = document.querySelector(".goog-te-combo");
      if (select) {
        select.value = langCode;
        select.dispatchEvent(new Event("change"));
        console.log(`Language changed to ${langCode} (${selectedLang.name})`);
        return true;
      } else {
        console.warn("Google Translate dropdown not ready, retrying...");
        return false;
      }
    };

    if (!attemptTranslation()) {
      const maxAttempts = 20;
      let attemptCount = 0;
      const retry = setInterval(() => {
        attemptCount++;
        if (attemptTranslation() || attemptCount >= maxAttempts) {
          clearInterval(retry);
          if (attemptCount >= maxAttempts) {
            console.error(
              `Failed to change language to ${langCode} after ${maxAttempts} retries`
            );
          }
        }
      }, 500);
    }
  }, []);

  return (
    <div key={renderKey} className="relative group mt-3">
      <button className="flex items-center space-x-3 text-gray-700">
        <img
          src={language.flag || "/flag.png"}
          alt={language.name}
          className="w-4 h-2.5 object-fill"
        />
        <span className="text-xs">{language.name}</span>
      </button>
      <div className="absolute hidden group-hover:block right-0 mt-2 bg-white border rounded shadow-md z-10">
        {languages.map((lang) => (
          <button
            key={lang.code}
            onClick={() => handleLanguageChange(lang.code)}
            className="block px-4 py-2 text-xs w-full text-left hover:bg-gray-100"
            aria-label={`Select ${lang.name} language`}
          >
            {lang.name}
          </button>
        ))}
      </div>
      <GoogleTranslate onLanguageChange={handleLanguageChange} />
    </div>
  );
};

export default LanguageSelector;
