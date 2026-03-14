import type { Client } from '../types/networth';
import { apiClient } from './api';
import { API_ENDPOINTS } from '../config/constants';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const transformClient = (c: any): Client => ({ ...c, id: c._id || c.id });

export const clientService = {
  async getClients(params?: { page?: number; limit?: number; search?: string; isActive?: boolean }) {
    const qs = new URLSearchParams();
    if (params?.page) qs.set('page', String(params.page));
    if (params?.limit) qs.set('limit', String(params.limit));
    if (params?.search) qs.set('search', params.search);
    if (params?.isActive !== undefined) qs.set('isActive', String(params.isActive));
    const response = await apiClient.get<ApiResponse<{ clients: Client[]; total: number; pages: number }>>(
      `${API_ENDPOINTS.CLIENTS}?${qs.toString()}`
    );
    return {
      clients: response.data.clients.map(transformClient),
      total: response.data.total,
      pages: response.data.pages,
    };
  },

  async getClientById(id: string): Promise<Client> {
    const response = await apiClient.get<ApiResponse<{ client: Client }>>(API_ENDPOINTS.CLIENT_BY_ID(id));
    return transformClient(response.data.client);
  },

  async createClient(data: Partial<Client>): Promise<Client> {
    const response = await apiClient.post<ApiResponse<{ client: Client }>>(API_ENDPOINTS.CLIENTS, data);
    return transformClient(response.data.client);
  },

  async updateClient(id: string, data: Partial<Client>): Promise<Client> {
    const response = await apiClient.put<ApiResponse<{ client: Client }>>(API_ENDPOINTS.CLIENT_BY_ID(id), data);
    return transformClient(response.data.client);
  },

  async deleteClient(id: string): Promise<void> {
    await apiClient.delete(API_ENDPOINTS.CLIENT_BY_ID(id));
  },

  async importClients(file: File): Promise<{ imported: number; errors: string[] }> {
    const formData = new FormData();
    formData.append('file', file);
    const response = await apiClient.post<ApiResponse<{ imported: number; errors: string[] }>>(
      API_ENDPOINTS.CLIENT_IMPORT,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
    return response.data;
  },
};
