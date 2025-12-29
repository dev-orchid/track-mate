import { useCallback, useEffect, useState } from "react";
import { getEventData as fetchEventData } from "./requests";

function useEvents() {
    const [events, setEvents] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const loadEvents = useCallback(async () => {
        try {
            setLoading(true);
            const eventData = await fetchEventData();
            setEvents(eventData.data.flat());
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'An error occurred';
            setError(errorMessage);
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
