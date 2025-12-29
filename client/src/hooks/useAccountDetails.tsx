import { useEffect, useState } from "react";

import { fetchCurrentUser } from "./requests";
export interface AccountDetail {
  _id: string;
  company_name: string;
  company_id: string;
  email: string;
  firstName: string;
  lastName: string;
  api_key?: string;
  api_key_created_at?: string;
}

const CACHE_KEY = 'userAccountDetails';

export default function useAccountDetails(){

    // Initialize with cached data if available
    const [accountDetails, setAccountDetails] = useState<AccountDetail | null>(() => {
        if (typeof window !== 'undefined') {
            const cached = localStorage.getItem(CACHE_KEY);
            if (cached) {
                try {
                    return JSON.parse(cached);
                } catch {
                    return null;
                }
            }
        }
        return null;
    });
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(()=>{
        setLoading(true);
        setError(null);
        fetchCurrentUser().then((data) => {
            if (data === null) {
                setAccountDetails(null);
                localStorage.removeItem(CACHE_KEY);
            } else {
                setAccountDetails(data);
                // Cache the user data
                localStorage.setItem(CACHE_KEY, JSON.stringify(data));
            }
        })
        .catch((err: Error) => {
            setError(err.message);
            // Keep cached data on error
            if (!accountDetails) {
                setAccountDetails(null);
            }
        })
        .finally(() => {
            setLoading(false);
        });
    }, [] );

    return { accountDetails, loading, error };
}
