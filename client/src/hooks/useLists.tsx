// client/src/hooks/useLists.tsx
import { useState, useEffect } from 'react';
import axiosInstance from '../utils/axiosInstance';

interface List {
  _id: string;
  list_id: string;
  company_id: string;
  name: string;
  description: string;
  tags: any[];
  tag_logic: 'any' | 'all';
  profile_count: number;
  status: 'active' | 'archived';
  created_by: string;
  created_at: string;
  updated_at: string;
}

interface UseListsResult {
  lists: List[];
  loading: boolean;
  error: string | null;
  total: number;
  page: number;
  totalPages: number;
  refetch: () => void;
}

export const useLists = (limit: number = 50, skip: number = 0, search: string = '', status: string = 'active'): UseListsResult => {
  const [lists, setLists] = useState<List[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  const fetchLists = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        limit: limit.toString(),
        skip: skip.toString(),
        status
      });

      if (search) {
        params.append('search', search);
      }

      const response = await axiosInstance.get(`/api/lists?${params.toString()}`);

      if (response.data.success) {
        setLists(response.data.lists);
        setTotal(response.data.total);
        setPage(response.data.page);
        setTotalPages(response.data.totalPages);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch lists');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLists();
  }, [limit, skip, search, status]);

  return { lists, loading, error, total, page, totalPages, refetch: fetchLists };
};

export const createList = async (listData: {
  name: string;
  description?: string;
  tags?: string[];
  tag_logic?: 'any' | 'all'
}) => {
  const response = await axiosInstance.post('/api/lists', listData);
  return response.data;
};

export const updateList = async (listId: string, listData: {
  name?: string;
  description?: string;
  tag_logic?: 'any' | 'all';
  status?: 'active' | 'archived';
}) => {
  const response = await axiosInstance.put(`/api/lists/${listId}`, listData);
  return response.data;
};

export const deleteList = async (listId: string) => {
  const response = await axiosInstance.delete(`/api/lists/${listId}`);
  return response.data;
};

export const addTagsToList = async (listId: string, tagIds: string[]) => {
  const response = await axiosInstance.post(`/api/lists/${listId}/tags`, { tag_ids: tagIds });
  return response.data;
};

export const removeTagsFromList = async (listId: string, tagIds: string[]) => {
  const response = await axiosInstance.delete(`/api/lists/${listId}/tags`, { data: { tag_ids: tagIds } });
  return response.data;
};

export const getListProfiles = async (listId: string, limit: number = 50, skip: number = 0) => {
  const response = await axiosInstance.get(`/api/lists/${listId}/profiles?limit=${limit}&skip=${skip}`);
  return response.data;
};

export const refreshListCount = async (listId: string) => {
  const response = await axiosInstance.post(`/api/lists/${listId}/refresh-count`);
  return response.data;
};
