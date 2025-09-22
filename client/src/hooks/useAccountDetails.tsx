import { useEffect, useState } from "react";

import { fetchCurrentUser } from "./requests";
export interface AccountDetail {
  _id: string;
  company_name: string;
  company_id: string;
  email: string;
  firstName: string;
  lastName: string;
}
export default function useAccountDetails(){

    const [accountDetails, setAccountDetails] = useState<AccountDetail | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(()=>{
        setLoading(true);
        setError(null);
        fetchCurrentUser().then((data) => {
            if (data === null) {
                setAccountDetails(null);
            } else {
                setAccountDetails(data);
            }
        })
        .catch((err: Error) => {
            setError(err.message);
            setAccountDetails(null);
        })
        .finally(() => {
            setLoading(false);
        });
    }, [] );

    return { accountDetails, loading, error };
}
