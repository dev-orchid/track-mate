import { useCallback, useEffect, useState } from "react";
import { getEventData as fetchEventData } from "./requests";

function useEvents() {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const loadEvents = useCallback(async () => {
        try {
            setLoading(true);
            const eventData = await fetchEventData();
            setEvents(eventData.data.flat());
        } catch (err) {
            setError(err);
            console.error("Error fetching events:", err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        let isMounted = true;
        if (isMounted) loadEvents();
        return () => { isMounted = false; };
    }, [loadEvents]);

    return { events, loading, error };
}

export default useEvents;
