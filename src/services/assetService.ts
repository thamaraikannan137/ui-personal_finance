import type { Asset, AssetCreateInput, AssetUpdateInput } from '../types';
import { apiClient } from './api';
import { API_ENDPOINTS } from '../config/constants';

// API Response types matching backend
interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

interface AssetsResponse {
  assets: Asset[];
  total: number;
  pages: number;
}

interface AssetResponse {
  asset: Asset;
}

interface CategorySummary {
  category: string;
  total: number;
  count: number;
}

interface AssetSummaryResponse {
  totalValue: number;
  byCategory: CategorySummary[];
}

// Transform backend _id to frontend id
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const transformAsset = (asset: any): Asset => {
  return {
    ...asset,
    id: asset._id || asset.id,
  };
};

export const assetService = {
  async getAssets(page: number = 1, limit: number = 50, category?: string): Promise<Asset[]> {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });
      
      if (category) {
        params.append('category', category);
      }

      const response = await apiClient.get<ApiResponse<AssetsResponse>>(
        `${API_ENDPOINTS.ASSETS}?${params.toString()}`
      );
      
      return response.data.assets.map(transformAsset);
    } catch (error) {
      console.error('Error fetching assets:', error);
      throw error;
    }
  },

  async getAssetById(id: string): Promise<Asset | undefined> {
    try {
      const response = await apiClient.get<ApiResponse<AssetResponse>>(API_ENDPOINTS.ASSET_BY_ID(id));
      return transformAsset(response.data.asset);
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'response' in error) {
        const err = error as { response?: { status?: number } };
        if (err.response?.status === 404) {
          return undefined;
        }
      }
      console.error('Error fetching asset:', error);
      throw error;
    }
  },

  async createAsset(payload: AssetCreateInput, files?: File[]): Promise<Asset> {
    try {
      // Transform documents from objects to string[] if needed
      const transformedPayload = {
        ...payload,
        documents: payload.documents 
          ? payload.documents.map((doc) => typeof doc === 'string' ? doc : doc.url)
          : undefined,
      };

      // If files are provided, send as multipart/form-data
      if (files && files.length > 0) {
        const formData = new FormData();
        
        // Add payload as JSON string
        formData.append('payload', JSON.stringify(transformedPayload));
        
        // Add files
        files.forEach((file) => {
          formData.append('files', file);
        });

        const axiosInstance = apiClient.getAxiosInstance();
        const response = await axiosInstance.post<ApiResponse<AssetResponse>>(
          API_ENDPOINTS.ASSETS,
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          }
        );
        
        return transformAsset(response.data.data.asset);
      } else {
        // No files, send as JSON (backward compatible)
        const response = await apiClient.post<ApiResponse<AssetResponse>>(API_ENDPOINTS.ASSETS, transformedPayload);
        return transformAsset(response.data.asset);
      }
    } catch (error) {
      console.error('Error creating asset:', error);
      throw error;
    }
  },

  async updateAsset(id: string, payload: AssetUpdateInput, files?: File[]): Promise<Asset> {
    try {
      // Transform documents from objects to string[] if needed
      const transformedPayload = {
        ...payload,
        documents: payload.documents 
          ? payload.documents.map((doc) => typeof doc === 'string' ? doc : doc.url)
          : undefined,
      };

      // If files are provided, send as multipart/form-data
      if (files && files.length > 0) {
        const formData = new FormData();
        
        // Add payload as JSON string
        formData.append('payload', JSON.stringify(transformedPayload));
        
        // Add files
        files.forEach((file) => {
          formData.append('files', file);
        });

        const axiosInstance = apiClient.getAxiosInstance();
        const response = await axiosInstance.put<ApiResponse<AssetResponse>>(
          API_ENDPOINTS.ASSET_BY_ID(id),
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          }
        );
        
        return transformAsset(response.data.data.asset);
      } else {
        // No files, send as JSON (backward compatible)
        const response = await apiClient.put<ApiResponse<AssetResponse>>(API_ENDPOINTS.ASSET_BY_ID(id), transformedPayload);
        return transformAsset(response.data.asset);
      }
    } catch (error) {
      console.error('Error updating asset:', error);
      throw error;
    }
  },

  async deleteAsset(id: string): Promise<string> {
    try {
      await apiClient.delete(API_ENDPOINTS.ASSET_BY_ID(id));
      return id;
    } catch (error) {
      console.error('Error deleting asset:', error);
      throw error;
    }
  },

  async getAssetSummary(): Promise<AssetSummaryResponse> {
    try {
      const response = await apiClient.get<ApiResponse<AssetSummaryResponse>>(
        API_ENDPOINTS.ASSET_SUMMARY
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching asset summary:', error);
      throw error;
    }
  },

  async deleteDocument(assetId: string, documentUrl: string): Promise<void> {
    try {
      await apiClient.delete(API_ENDPOINTS.ASSET_DELETE_DOCUMENT, {
        data: { assetId, documentUrl },
      });
    } catch (error) {
      console.error('Error deleting document:', error);
      throw error;
    }
  },
};
