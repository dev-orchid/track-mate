import axiosInstance from "../utils/axiosInstance";
const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

//Get Event Data
async function getEventData() {
  try {
    const response = await axiosInstance.get("/api/getData");
    return response.data;
  } catch (error) {
    console.error("Error fetching event data:", error);
    throw error;
  }
}
//Get Profile Data
async function getProfileData() {
  try {
    const response = await axiosInstance.get("/api/profile");
    return response.data;
  } catch (error) {
    console.error("Error fetching profile data:", error);
    throw error;
  }
}
//Get Account Details By Login  Session
export async function fetchCurrentUser() {
  const token = localStorage.getItem("accessToken");
  const response = await axiosInstance.get("/auth/me", {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.data) {
    if (response.status === 404) return null;
    throw new Error(`Error fetching account (${response.status})`);
  }
  return response.data.user;
}
//get profile by id
export async function getProfileById(id: string) {
  const response = await axiosInstance.get(`/api/profile/${id}`);
  //console.log(response);
  if (!response.data) {
    if (response.status === 404) return null;
    throw new Error(`Error fetching profile ${id} (${response.status})`);
  }
  return response.data;
}
// Get anonymous visitor stats
export async function getAnonymousStats() {
  try {
    const response = await axiosInstance.get("/api/anonymous/stats");
    return response.data;
  } catch (error) {
    console.error("Error fetching anonymous stats:", error);
    throw error;
  }
}

// Get anonymous sessions
export async function getAnonymousSessions() {
  try {
    const response = await axiosInstance.get("/api/anonymous/sessions");
    return response.data;
  } catch (error) {
    console.error("Error fetching anonymous sessions:", error);
    throw error;
  }
}

export { getEventData, getProfileData };
