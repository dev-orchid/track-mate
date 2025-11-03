// src/hooks/useNotifications.tsx
import { useState, useEffect, useCallback } from 'react';
import axiosInstance from '../utils/axiosInstance';

interface NewProfile {
  _id: string;
  name: string;
  email: string;
  phone?: number;
  createdAt: string;
  lastActive: string;
}

interface NotificationsData {
  newProfiles: NewProfile[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
  markAsRead: () => void;
  refetch: () => void;
}

const LAST_CHECK_KEY = 'trackmate_last_notification_check';
const POLLING_INTERVAL = 30000; // Poll every 30 seconds

export default function useNotifications(): NotificationsData {
  const [newProfiles, setNewProfiles] = useState<NewProfile[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get last check timestamp from localStorage
  const getLastCheck = (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(LAST_CHECK_KEY);
  };

  // Set last check timestamp in localStorage
  const setLastCheck = (timestamp: string) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(LAST_CHECK_KEY, timestamp);
  };

  // Fetch new profiles from API
  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const lastCheck = getLastCheck();
      const url = lastCheck
        ? `/api/notifications/new-profiles?since=${lastCheck}`
        : '/api/notifications/new-profiles'; // Default to last 24 hours

      const response = await axiosInstance.get(url);

      if (response.data.status === 'success') {
        const profiles = response.data.data || [];
        setNewProfiles(profiles);
        setUnreadCount(profiles.length);
      }
    } catch (err: any) {
      console.error('Error fetching notifications:', err);
      setError(err.message || 'Failed to fetch notifications');
    } finally {
      setLoading(false);
    }
  }, []);

  // Mark notifications as read
  const markAsRead = useCallback(() => {
    const now = new Date().toISOString();
    setLastCheck(now);
    setUnreadCount(0);
    setNewProfiles([]);
  }, []);

  // Refetch notifications manually
  const refetch = useCallback(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Initial fetch on mount
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Poll for new notifications every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchNotifications();
    }, POLLING_INTERVAL);

    return () => clearInterval(interval);
  }, [fetchNotifications]);

  return {
    newProfiles,
    unreadCount,
    loading,
    error,
    markAsRead,
    refetch,
  };
}
