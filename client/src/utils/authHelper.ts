// src/utils/authHelper.ts
import {jwtDecode} from "jwt-decode";

interface DecodedToken {
  exp?: number;
  iat?: number;
  [key: string]: any;
}

/**
 * Checks if a JWT token is expired or invalid
 * @param token JWT token string
 * @returns true if token is expired or invalid
 */
export function isTokenExpired(token: string): boolean {
  if (!token || token.split(".").length !== 3) {
    console.warn("Invalid or missing token");
    return true;
  }

  try {
    const decoded: DecodedToken = jwtDecode(token);
    if (!decoded.exp) {
      console.warn("exp not found in token");
      return true;
    }

    // exp is in seconds; convert to milliseconds
    return decoded.exp * 1000 < Date.now();
  } catch (error) {
    console.error("Invalid token:", error);
    return true;
  }
}

/**
 * Returns a valid token if available, otherwise null
 */
export function getValidToken(): string | null {
  const token = localStorage.getItem("authToken");
  if (!token) return null;
  //alert(token);
  return isTokenExpired(token) ? null : token;
}
