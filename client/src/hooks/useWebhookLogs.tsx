import { useEffect, useState, useCallback } from 'react';
import axiosInstance from '../utils/axiosInstance';

export interface WebhookLog {
  _id: string;
  company_id: string;
  account_id: string;
  endpoint: string;
  method: string;
  status_code: number;
  request_payload?: any;
  response_payload?: any;
  error_message?: string;
  ip_address?: string;
  user_agent?: string;
  processing_time_ms?: number;
  created_at: string;
}

export interface WebhookLogStats {
  total_requests: number;
  successful_requests: number;
  failed_requests: number;
  avg_processing_time: number;
}

export interface WebhookLogFilters {
  page?: number;
  limit?: number;
  status_code?: number | null;
  startDate?: string | null;
  endDate?: string | null;
}

export interface WebhookLogsPagination {
  total: number;
  page: number;
  totalPages: number;
  limit: number;
}

export default function useWebhookLogs(filters: WebhookLogFilters = {}) {
  const [logs, setLogs] = useState<WebhookLog[]>([]);
  const [stats, setStats] = useState<WebhookLogStats | null>(null);
  const [pagination, setPagination] = useState<WebhookLogsPagination | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (filters.page) params.append('page', filters.page.toString());
      if (filters.limit) params.append('limit', filters.limit.toString());
      if (filters.status_code) params.append('status_code', filters.status_code.toString());
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);

      const response = await axiosInstance.get(`/api/webhooks/logs?${params.toString()}`);

      if (response.data.success) {
        setLogs(response.data.data);
        setPagination(response.data.pagination);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch webhook logs');
    } finally {
      setLoading(false);
    }
  }, [filters.page, filters.limit, filters.status_code, filters.startDate, filters.endDate]);

  const fetchStats = useCallback(async (days: number = 7) => {
    try {
      const response = await axiosInstance.get(`/api/webhooks/logs/stats?days=${days}`);

      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (err: any) {
      console.error('Failed to fetch webhook stats:', err);
    }
  }, []);

  useEffect(() => {
    fetchLogs();
    fetchStats();
  }, [fetchLogs, fetchStats]);

  const refetch = useCallback(() => {
    fetchLogs();
    fetchStats();
  }, [fetchLogs, fetchStats]);

  return {
    logs,
    stats,
    pagination,
    loading,
    error,
    refetch
  };
}
