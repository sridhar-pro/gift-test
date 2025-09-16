/** @type {import('next').NextConfig} */

// 🟢 Toggle this to `false` to go LIVE
const IS_TEST = false;

// 👇 Define both base URLs
const TEST_BASE = "https://marketplace.betalearnings.com/api/v1/Marketv2";
const LIVE_BASE = "https://marketplace.yuukke.com/api/v1/Marketv2";

// ✅ Choose based on toggle
const BASE_API = IS_TEST ? TEST_BASE : LIVE_BASE;

const nextConfig = {
  images: {
    domains: ["marketplace.betalearnings.com", "marketplace.yuukke.com"],
  },

  async rewrites() {
    return [
      {
        source: "/api/giftBox",
        destination: `${BASE_API}/giftBox`,
      },
      {
        source: "/api/addGiftCard",
        destination: `${BASE_API}/addTOCart`,
      },
      {
        source: "/api/addGiftAddons",
        destination: `${BASE_API}/giftAddons`,
      },
      {
        source: "/api/homeCategory",
        destination: `${BASE_API}/homeCategory`,
      },
      {
        source: "/api/quantityCheck",
        destination: `${BASE_API}/getProductDetails/`,
      },
      {
        source: "/api/getProducts",
        destination: `${BASE_API}/getProducts`,
      },
      {
        source: "/api/giftCategory",
        destination: `${BASE_API}/giftCategory`,
      },
      {
        source: "/api/register",
        destination: `${BASE_API}/register`,
      },
      {
        source: "/api/mobile_login",
        destination: `${BASE_API}/mobile_login`,
      },
      {
        source: "/api/verify_otp",
        destination: `${BASE_API}/verify_otp`,
      },
      {
        source: "/api/resend_otp",
        destination: `${BASE_API}/resend_otp`,
      },
      {
        source: "/api/email_login",
        destination: `${BASE_API}/email_login`,
      },
      {
        source: "/api/forget_password",
        destination: `${BASE_API}/forgot_password`,
      },
      {
        source: "/api/customer_address",
        destination: `${BASE_API}/customer_address`,
      },
      {
        source: "/api/edit_address",
        destination: `${BASE_API}/add_and_edit_address`,
      },
      {
        source: "/api/delete_address",
        destination: `${BASE_API}/delete_address`,
      },
      {
        source: "/api/tokenLogin",
        destination: `${BASE_API}/tokenLogin`,
      },

      {
        source: "/api/save_prebook_gift",
        destination: `${BASE_API}/save_prebook_gifts`,
        // destination: `https://marketplace.betalearnings.com/api/v1/Marketv2/save_prebook_gifts`,
      },
      {
        source: "/api/prebook_gifts_payment",
        destination: `${BASE_API}/prebook_gifts_payment`,
        // destination: `https://marketplace.betalearnings.com/api/v1/Marketv2/prebook_gifts_payment`,
      },
      {
        source: "/api/login",
        destination: "https://marketplace.yuukke.com/api/v1/Auth/api_login",
      },
      {
        source: "/api/category_cr/:path*",
        destination: `${BASE_API}/giftCategory/:path*`,
      },
    ];
  },
};

export default nextConfig;
