import "./globals.css";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import FloatingQueryButton from "./components/FloatingQueryButton";
import Script from "next/script";

export const metadata = {
  title: "Premium Festive & Corporate Hampers | Yuukke Gifting",
  description:
    "Celebrate every occasion with Yuukke’s festive & corporate hampers. Unique, handcrafted & thoughtful gifts for Diwali, Christmas, New Year & business gifting. Delight clients, teams & family with curated hampers. Shop online today!",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* ✅ Google Tag Manager */}
        <Script id="gtm-init" strategy="afterInteractive">
          {`
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','GTM-N99S599S');
          `}
        </Script>

        {/* ✅ Google Analytics 4 (via gtag.js) */}
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=G-YPC42W6LH8`}
          strategy="afterInteractive"
        />
        <Script id="ga-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-YPC42W6LH8');
          `}
        </Script>
      </head>

      <body className="antialiased">
        {/* ✅ Google Tag Manager (noscript) */}
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-N99S599S"
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          ></iframe>
        </noscript>

        <Navbar />
        {children}
        <FloatingQueryButton />
        <Footer />
      </body>
    </html>
  );
}
