// src/hooks/useProfileDetails.tsx

import { useState, useEffect } from "react";
import { getProfileById } from "./requests";

export interface ProductInfo {
  _id: string;
  productName: string;
  price: number;
  productId: string;
}

export interface EventType {
  _id: string;
  eventType: string;
  timestamp: string;
  eventData: {
    address?: string;
    productInfos?: ProductInfo[];
  };
}

export interface SessionWithEvents {
  userId: string;
  sessionId: string;
  events: EventType[];
}

export interface ProfileDetail {
  _id: string;
  name: string;
  email: string;
  phone: number;
  company_id: string;
  lastActive: string;
  events: SessionWithEvents[];
}

export default function useProfileDetails(id?: string) {
  const [profile, setProfile] = useState<ProfileDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    setLoading(true);
    setError(null);

    getProfileById(id)
      .then((data) => {
        if (data === null) {
          setProfile(null);
        } else {
          //data is expected to be { _id, name, email, phone, lastActive, events }
          setProfile(data);
        }
      })
      .catch((err: Error) => {
        setError(err.message);
        setProfile(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id]);

  return { profile, loading, error };
}