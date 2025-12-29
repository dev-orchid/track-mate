import { useCallback, useEffect, useState } from "react";
import { getAnonymousStats } from "./requests";

interface AnonymousStats {
    totalAnonymous: number;
    recentAnonymous: number;
    anonymousPageViews: number;
}

function useAnonymousStats() {
    const [stats, setStats] = useState<AnonymousStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchStats = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await getAnonymousStats();
            setStats(response.data);
        } catch (err: any) {
            setError(err.message || 'Failed to load anonymous stats');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchStats();
    }, [fetchStats]);

    return { stats, loading, error, refetch: fetchStats };
}

export default useAnonymousStats;
