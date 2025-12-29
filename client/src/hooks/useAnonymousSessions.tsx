import { useCallback, useEffect, useState } from "react";
import { getAnonymousSessions } from "./requests";

interface Event {
    _id: string;
    eventType: string;
    eventData: {
        address?: string;
        title?: string;
        properties?: Record<string, any>;
    };
    timestamp: string;
}

interface AnonymousSession {
    _id: string;
    sessionId: string;
    company_id: string;
    list_id: string | null;
    createdAt: string;
    events: Event[];
}

function useAnonymousSessions() {
    const [sessions, setSessions] = useState<AnonymousSession[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchSessions = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await getAnonymousSessions();
            setSessions(response.data || []);
        } catch (err: any) {
            setError(err.message || 'Failed to load anonymous sessions');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchSessions();
    }, [fetchSessions]);

    return { sessions, loading, error, refetch: fetchSessions };
}

export default useAnonymousSessions;
