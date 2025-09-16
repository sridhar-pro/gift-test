"use client";
import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { XCircle } from "lucide-react";
import { useAuth } from "../utills/AuthContext";

const SessionContext = createContext();

export const SessionProvider = ({ children }) => {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [companyId, setCompanyId] = useState(null);
  const [userId, setUserId] = useState(null);
  const [groupId, setGroupId] = useState(null);
  const [email, setEmail] = useState(null); // ✅ store email

  const { getValidToken } = useAuth();

  // 🔄 Load session from storage
  const loadSession = () => {
    const storedCompanyId = sessionStorage.getItem("company_id");
    const storedUserId = sessionStorage.getItem("user_id");
    const storedGroupId = sessionStorage.getItem("group_id");
    const storedEmail = sessionStorage.getItem("email"); // ✅ load email
    setIsLoggedIn(!!storedCompanyId);
    setCompanyId(storedCompanyId);
    setUserId(storedUserId);
    setGroupId(storedGroupId);
    setEmail(storedEmail);
  };

  // On mount, and listen for manual storage wipes
  useEffect(() => {
    loadSession();

    const handleStorageChange = () => {
      const storedCompanyId = sessionStorage.getItem("company_id");
      if (!storedCompanyId) handleLogout();
      else loadSession();
    };

    window.addEventListener("storage", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  // ✅ Login function
  const handleLogin = async ({
    company_id,
    user_id,
    access_token,
    refresh_token,
    group_id,
  }) => {
    sessionStorage.setItem("company_id", company_id);
    sessionStorage.setItem("user_id", user_id);
    sessionStorage.setItem("access_token", access_token);
    sessionStorage.setItem("refresh_token", refresh_token);
    if (group_id) {
      sessionStorage.setItem("group_id", group_id);
      setGroupId(group_id);
    }

    setIsLoggedIn(true);
    setCompanyId(company_id);
    setUserId(user_id);

    // ✅ Show login toast
    toast(
      <div className="flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-green-400"></span>
        <span>Successfully logged in</span>
      </div>,
      {
        position: "top-right",
        duration: 2000,
        icon: false,
        style: {
          background: "#000",
          color: "#fff",
          borderRadius: "8px",
          padding: "12px 16px",
          fontSize: "14px",
        },
      }
    );

    // ✅ Token login to get email
    // ✅ Token login to get email
    try {
      const token = await getValidToken();
      const res = await fetch("/api/tokenLogin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          token: access_token,
          re_token: refresh_token || "",
        }),
      });

      const data = await res.json();
      if (res.ok && data.data?.email) {
        sessionStorage.setItem("email", data.data.email);
        setEmail(data.data.email);

        // ✅ Log the email
        // console.log("Logged-in user email:", data.data.email);
      } else {
        console.warn("Token login did not return email");
      }
    } catch (err) {
      console.error("Token login failed:", err);
    }
  };

  // ✅ Logout function
  const handleLogout = () => {
    sessionStorage.removeItem("company_id");
    sessionStorage.removeItem("user_id");
    sessionStorage.removeItem("access_token");
    sessionStorage.removeItem("refresh_token");
    sessionStorage.removeItem("group_id");
    sessionStorage.removeItem("email");

    setIsLoggedIn(false);
    setCompanyId(null);
    setUserId(null);
    setGroupId(null);
    setEmail(null);

    toast(
      <div className="flex items-center gap-2">
        <XCircle className="w-5 h-5 text-red-400" />
        <span>You have been logged out</span>
      </div>,
      {
        position: "top-right",
        duration: 2000,
        icon: false,
        style: {
          background: "#000",
          color: "#fff",
          borderRadius: "8px",
          padding: "12px 16px",
          fontSize: "14px",
        },
      }
    );

    setTimeout(() => {
      router.push("/");
      router.refresh?.(); // 👈 force refresh in Next.js 13+
    }, 500);
  };

  return (
    <SessionContext.Provider
      value={{
        isLoggedIn,
        companyId,
        userId,
        groupId,
        email, // ✅ provide email in context
        handleLogin,
        handleLogout,
      }}
    >
      {children}
    </SessionContext.Provider>
  );
};

export const useSession = () => useContext(SessionContext);
