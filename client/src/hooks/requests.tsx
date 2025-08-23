// src/hooks/requests.tsx

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function geEventData() {
  const res = await fetch(`${API_BASE}/api/getData`);
  if (!res.ok) throw new Error(`Error fetching events (${res.status})`);
  return res.json();
}

export async function getProfileData() {
  const res = await fetch(`${API_BASE}/api/profile`);
  if (!res.ok) throw new Error(`Error fetching profiles (${res.status})`);
  return res.json();
}

export async function getProfileById(id: string) {
  const res = await fetch(`${API_BASE}/api/profile/${id}`);
  if (!res.ok) {
    if (res.status === 404) return null;
    throw new Error(`Error fetching profile ${id} (${res.status})`);
  }
  return res.json();
}