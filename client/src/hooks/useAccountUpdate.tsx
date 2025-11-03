// src/hooks/useAccountUpdate.tsx
import { useState } from "react";
import axiosInstance from "../utils/axiosInstance";

export default function useAccountUpdate() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function updateAccount(data: any) {
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      const response = await axiosInstance.put("/auth/me", data);
      const res = response.data;
      if (!res.success) {
        throw new Error("Update failed");
      }
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000); // Hide success message after 3 seconds
      return res.user;
    } catch (err: any) {
      setError(err.response?.data?.message || err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }

  return { updateAccount, loading, error, success };
}
