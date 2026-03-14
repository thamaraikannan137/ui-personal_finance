import type { GuarantorDetail, GuarantorItem } from '../types/networth';
import { apiClient } from './api';
import { API_ENDPOINTS } from '../config/constants';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const transform = (d: any): GuarantorDetail => ({ ...d, id: d._id || d.id });

export const guarantorService = {
  async getGuarantors(certificateId: string): Promise<GuarantorDetail> {
    const response = await apiClient.get<ApiResponse<{ guarantors: GuarantorDetail }>>(
      API_ENDPOINTS.CERTIFICATE_GUARANTORS(certificateId)
    );
    return transform(response.data.guarantors);
  },

  async saveAll(certificateId: string, items: GuarantorItem[]): Promise<GuarantorDetail> {
    const response = await apiClient.put<ApiResponse<{ guarantors: GuarantorDetail }>>(
      API_ENDPOINTS.CERTIFICATE_GUARANTORS(certificateId),
      { items }
    );
    return transform(response.data.guarantors);
  },

  async addItem(certificateId: string, item: GuarantorItem): Promise<GuarantorDetail> {
    const response = await apiClient.post<ApiResponse<{ guarantors: GuarantorDetail }>>(
      API_ENDPOINTS.CERTIFICATE_GUARANTOR_ITEM(certificateId),
      item
    );
    return transform(response.data.guarantors);
  },

  async updateItem(certificateId: string, itemId: string, data: Partial<GuarantorItem>): Promise<GuarantorDetail> {
    const response = await apiClient.put<ApiResponse<{ guarantors: GuarantorDetail }>>(
      API_ENDPOINTS.CERTIFICATE_GUARANTOR_ITEM_ID(certificateId, itemId),
      data
    );
    return transform(response.data.guarantors);
  },

  async deleteItem(certificateId: string, itemId: string): Promise<GuarantorDetail> {
    const response = await apiClient.delete<ApiResponse<{ guarantors: GuarantorDetail }>>(
      API_ENDPOINTS.CERTIFICATE_GUARANTOR_ITEM_ID(certificateId, itemId)
    );
    return transform(response.data.guarantors);
  },
};
