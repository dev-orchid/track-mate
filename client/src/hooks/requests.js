const API_ENDPOINTS = 'http://localhost:8000';

async function getProfileData(){
	const profileData = await fetch(`${API_ENDPOINTS}/api/getData`);
	return await profileData.json();
}

export {
	getProfileData,
}