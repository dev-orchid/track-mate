import axiosInstance from '../utils/axiosInstance';
const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";



//  Get Event Data
async function getEventData() {
    try {
        const response = await axiosInstance.get('/api/getData');
        return response.data;
    } catch (error) {
        console.error('Error fetching event data:', error);
        throw error;
    }
}

//  Get Profile Data
async function getProfileData() {
    try {
        const response = await axiosInstance.get('/api/profile');
        return response.data;
    } catch (error) {
        console.error('Error fetching profile data:', error);
        throw error;
    }
}
export async function getProfileById(id: string) {
    const res = await axiosInstance.get(`/api/profile/${id}`);
    if (!res.data) {
        if (res.status === 404) return null;
        throw new Error(`Error fetching profile ${id} (${res.status})`);
    }
  return res.data;
}
export {
    getEventData,
    getProfileData
};
