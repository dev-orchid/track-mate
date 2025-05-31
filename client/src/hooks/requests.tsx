const API_ENDPOINTS = 'http://localhost:8000';

async function geEventData(){
	const eventData = await fetch(`${API_ENDPOINTS}/api/getData`);
	return await eventData.json();
}
async function getProfileData(){
	const profileData = await fetch(`${API_ENDPOINTS}/api/profile`);
	return await profileData.json();
}
export {
	geEventData,
	getProfileData,
}