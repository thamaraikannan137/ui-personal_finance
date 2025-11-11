import type { Liability, LiabilityCreateInput, LiabilityUpdateInput } from '../types';
import { apiClient } from './api';
import { API_ENDPOINTS } from '../config/constants';

// API Response types matching backend
interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

interface LiabilitiesResponse {
  liabilities: Liability[];
  total: number;
  pages: number;
}

interface LiabilityResponse {
  liability: Liability;
}

interface CategorySummary {
  category: string;
  total: number;
  count: number;
}

interface LiabilitySummaryResponse {
  totalBalance: number;
  byCategory: CategorySummary[];
}

// Transform backend _id to frontend id
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const transformLiability = (liability: any): Liability => {
  return {
    ...liability,
    id: liability._id || liability.id,
  };
};

export const liabilityService = {
  async getLiabilities(page: number = 1, limit: number = 50, category?: string): Promise<Liability[]> {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });
      
      if (category) {
        params.append('category', category);
      }

      const response = await apiClient.get<ApiResponse<LiabilitiesResponse>>(
        `${API_ENDPOINTS.LIABILITIES}?${params.toString()}`
      );
      
      return response.data.liabilities.map(transformLiability);
    } catch (error) {
      console.error('Error fetching liabilities:', error);
      throw error;
    }
  },

  async getLiabilityById(id: string): Promise<Liability | undefined> {
    try {
      const response = await apiClient.get<ApiResponse<LiabilityResponse>>(API_ENDPOINTS.LIABILITY_BY_ID(id));
      return transformLiability(response.data.liability);
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'response' in error) {
        const err = error as { response?: { status?: number } };
        if (err.response?.status === 404) {
          return undefined;
        }
      }
      console.error('Error fetching liability:', error);
      throw error;
    }
  },

  async createLiability(payload: LiabilityCreateInput): Promise<Liability> {
    try {
      const response = await apiClient.post<ApiResponse<LiabilityResponse>>(API_ENDPOINTS.LIABILITIES, payload);
      return transformLiability(response.data.liability);
    } catch (error) {
      console.error('Error creating liability:', error);
      throw error;
    }
  },

  async updateLiability(id: string, payload: LiabilityUpdateInput): Promise<Liability> {
    try {
      const response = await apiClient.put<ApiResponse<LiabilityResponse>>(API_ENDPOINTS.LIABILITY_BY_ID(id), payload);
      return transformLiability(response.data.liability);
    } catch (error) {
      console.error('Error updating liability:', error);
      throw error;
    }
  },

  async deleteLiability(id: string): Promise<string> {
    try {
      await apiClient.delete(API_ENDPOINTS.LIABILITY_BY_ID(id));
      return id;
    } catch (error) {
      console.error('Error deleting liability:', error);
      throw error;
    }
  },

  async getLiabilitySummary(): Promise<LiabilitySummaryResponse> {
    try {
      const response = await apiClient.get<ApiResponse<LiabilitySummaryResponse>>(
        API_ENDPOINTS.LIABILITY_SUMMARY
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching liability summary:', error);
      throw error;
    }
  },
};
