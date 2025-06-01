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


export default getEvents;