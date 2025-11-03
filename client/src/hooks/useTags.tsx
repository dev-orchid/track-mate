// client/src/hooks/useTags.tsx
import { useState, useEffect } from 'react';
import axiosInstance from '../utils/axiosInstance';

interface Tag {
  _id: string;
  name: string;
  company_id: string;
  color: string;
  description: string;
  profile_count: number;
  created_by: string;
  created_at: string;
  updated_at: string;
}

interface UseTagsResult {
  tags: Tag[];
  loading: boolean;
  error: string | null;
  total: number;
  page: number;
  totalPages: number;
  refetch: () => void;
}

export const useTags = (limit: number = 100, skip: number = 0, search: string = ''): UseTagsResult => {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  const fetchTags = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        limit: limit.toString(),
        skip: skip.toString()
      });

      if (search) {
        params.append('search', search);
      }

      const response = await axiosInstance.get(`/api/tags?${params.toString()}`);

      if (response.data.success) {
        setTags(response.data.tags);
        setTotal(response.data.total);
        setPage(response.data.page);
        setTotalPages(response.data.totalPages);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch tags');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTags();
  }, [limit, skip, search]);

  return { tags, loading, error, total, page, totalPages, refetch: fetchTags };
};

export const createTag = async (tagData: { name: string; color?: string; description?: string }) => {
  const response = await axiosInstance.post('/api/tags', tagData);
  return response.data;
};

export const updateTag = async (tagId: string, tagData: { name?: string; color?: string; description?: string }) => {
  const response = await axiosInstance.put(`/api/tags/${tagId}`, tagData);
  return response.data;
};

export const deleteTag = async (tagId: string) => {
  const response = await axiosInstance.delete(`/api/tags/${tagId}`);
  return response.data;
};

export const addTagToProfiles = async (tagId: string, profileIds: string[]) => {
  const response = await axiosInstance.post(`/api/tags/${tagId}/profiles`, { profile_ids: profileIds });
  return response.data;
};

export const removeTagFromProfile = async (tagId: string, profileId: string) => {
  const response = await axiosInstance.delete(`/api/tags/${tagId}/profiles/${profileId}`);
  return response.data;
};
