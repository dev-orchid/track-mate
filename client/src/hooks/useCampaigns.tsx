// client/src/hooks/useCampaigns.tsx
import { useState, useEffect } from 'react';
import axiosInstance from '../utils/axiosInstance';

interface Campaign {
  _id: string;
  company_id: string;
  name: string;
  description: string;
  subject: string;
  preview_text: string;
  from_name: string;
  from_email: string;
  reply_to: string;
  html_content: string;
  text_content: string;
  list_id: any;
  status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'failed' | 'paused';
  scheduled_at: string | null;
  sent_at: string | null;
  total_recipients: number;
  sent_count: number;
  delivered_count: number;
  opened_count: number;
  clicked_count: number;
  bounced_count: number;
  failed_count: number;
  last_error: string | null;
  created_by: any;
  created_at: string;
  updated_at: string;
}

interface CampaignStats {
  total: number;
  sent: number;
  drafts: number;
  scheduled: number;
}

interface UseCampaignsResult {
  campaigns: Campaign[];
  loading: boolean;
  error: string | null;
  total: number;
  page: number;
  totalPages: number;
  stats: CampaignStats | null;
  refetch: () => void;
}

export const useCampaigns = (limit: number = 50, status: string = ''): UseCampaignsResult => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [stats, setStats] = useState<CampaignStats | null>(null);

  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        limit: limit.toString()
      });

      if (status) {
        params.append('status', status);
      }

      const response = await axiosInstance.get(`/api/campaigns?${params.toString()}`);

      if (response.data.success) {
        setCampaigns(response.data.campaigns);
        setTotal(response.data.total);
        setPage(response.data.page);
        setTotalPages(response.data.totalPages);

        // Calculate stats from campaigns
        const allCampaigns = response.data.campaigns;
        setStats({
          total: allCampaigns.length,
          sent: allCampaigns.filter((c: Campaign) => c.status === 'sent').length,
          drafts: allCampaigns.filter((c: Campaign) => c.status === 'draft').length,
          scheduled: allCampaigns.filter((c: Campaign) => c.status === 'scheduled').length
        });
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch campaigns');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, [limit, status]);

  return { campaigns, loading, error, total, page, totalPages, stats, refetch: fetchCampaigns };
};

export const createCampaign = async (campaignData: {
  name: string;
  description?: string;
  subject: string;
  preview_text?: string;
  from_name: string;
  from_email: string;
  reply_to?: string;
  html_content: string;
  text_content?: string;
  list_id: string;
}) => {
  const response = await axiosInstance.post('/api/campaigns', campaignData);
  return response.data;
};

export const updateCampaign = async (campaignId: string, campaignData: any) => {
  const response = await axiosInstance.put(`/api/campaigns/${campaignId}`, campaignData);
  return response.data;
};

export const deleteCampaign = async (campaignId: string) => {
  const response = await axiosInstance.delete(`/api/campaigns/${campaignId}`);
  return response.data;
};

export const sendCampaign = async (campaignId: string, scheduledAt: string | 'now') => {
  const response = await axiosInstance.post(`/api/campaigns/${campaignId}/send`, {
    scheduled_at: scheduledAt
  });
  return response.data;
};

export const getCampaignStats = async (campaignId: string) => {
  const response = await axiosInstance.get(`/api/campaigns/${campaignId}/stats`);
  return response.data;
};
