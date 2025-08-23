import axiosInstance from '../utils/axiosInstance';

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

export {
    getEventData,
    getProfileData
};
