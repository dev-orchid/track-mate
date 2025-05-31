import { useCallback, useEffect, useState } from "react";

import { getProfileData, geEventData } from "./requests";

function getEvents(){

    const [events, setEventData] = useState([]);

    const getEventData= useCallback(async ()=>{

        const eventData = await geEventData();

        setEventData(eventData.data.flat());

    }, []);

    useEffect(()=>{

        getEventData();

    }, [getEventData] );

    return events;
}

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