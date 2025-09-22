// src/hooks/useAccountUpdate.js
import { useState } from "react";
import axiosInstance from "../utils/axiosInstance";

export default function useAccountUpdate() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function updateAccount(data) {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.put("/auth/me", data);
      const res = response.data;
      if (!res.success) {
        throw new Error("Update failed");
      }
      return res.user;
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }

  return { updateAccount, loading, error };
}
