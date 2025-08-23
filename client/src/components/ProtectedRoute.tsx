import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/router";
import throttle from "lodash.throttle";
import axiosInstance from "../utils/axiosInstance";

const decodeToken = (token: string) => {
  try {
    return JSON.parse(atob(token.split(".")[1]));
  } catch {
    return null;
  }
};

const isTokenExpired = (token: string) => {
  const payload = decodeToken(token);
  if (!payload || !payload.exp) return true;
  const now = Math.floor(Date.now() / 1000);
  return payload.exp < now;
};

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const lastActivityRef = useRef(Date.now());

  const updateActivity = () => {
    lastActivityRef.current = Date.now();
  };

  const wasActiveRecently = () => Date.now() - lastActivityRef.current < 5 * 60 * 1000;

  const refreshAccessToken = async () => {
    try {
      const refreshToken = localStorage.getItem("refresh_token");
      if (!refreshToken) throw new Error("No refresh token found");

      const response = await axiosInstance.post("/refreshtoken", { refreshToken });
      const newAccessToken = response.data.accessToken;
      const newrefresh_token = response.data.refreshToken;

      localStorage.setItem("authToken", newAccessToken);
      localStorage.setItem("refresh_token", newrefresh_token);

      setIsLoggedIn(true);
    } catch (err) {
      console.error("Refresh token failed:", err);
      localStorage.removeItem("authToken");
      localStorage.removeItem("refresh_token");
      setIsLoggedIn(false);
      router.replace("/login");
    }
  };

  const checkLogin = useCallback(
    throttle(() => {
      const token = localStorage.getItem("authToken");
      const refreshToken = localStorage.getItem("refresh_token");

      if (!token || !refreshToken) {
        setIsLoggedIn(false);
        router.replace("/login");
        return;
      }

      if (isTokenExpired(token)) {
        if (wasActiveRecently()) {
          refreshAccessToken();
        } else {
          localStorage.removeItem("authToken");
          localStorage.removeItem("refresh_token");
          setIsLoggedIn(false);
          router.replace("/login");
        }
      } else {
        setIsLoggedIn(true);
      }
    }, 3000),
    []
  );

  useEffect(() => {
    checkLogin();
    const interval = setInterval(checkLogin, 5000);

    window.addEventListener("mousemove", updateActivity);
    window.addEventListener("keydown", updateActivity);

    return () => {
      clearInterval(interval);
      window.removeEventListener("mousemove", updateActivity);
      window.removeEventListener("keydown", updateActivity);
    };
  }, [checkLogin]);

  if (isLoggedIn === null) return <div>Checking login status...</div>;
  if (!isLoggedIn) return null; // Next.js will redirect with router.replace

  return <>{children}</>;
};

export default ProtectedRoute;
