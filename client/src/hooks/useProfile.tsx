import { useCallback, useEffect, useState } from "react";

import { getProfileData } from "./requests";

function useProfiles() {
    const [profiles, setProfiledata] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchProfiles = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const profileData = await getProfileData();
            setProfiledata(profileData.data.flat());
        } catch (err: any) {
            setError(err.message || 'Failed to load profiles');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchProfiles();
    }, [fetchProfiles]);

    return { profiles, loading, error, refetch: fetchProfiles };
}

export default useProfiles;