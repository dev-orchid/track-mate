import { useCallback, useEffect, useState } from "react";

import { getProfileData } from "./requests";

function useProfiles(){

    const [profiles, setProfiledata] = useState([]);

    const getProfiles = useCallback(async ()=>{

        const profileData = await getProfileData();

        setProfiledata(profileData.data.flat());

    }, []);

    useEffect(()=>{

        getProfiles();

    }, [getProfiles] );

    return profiles;
}

export default useProfiles;