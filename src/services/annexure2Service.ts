import type { Annexure2 } from '../types/networth';
import { apiClient } from './api';
import { API_ENDPOINTS } from '../config/constants';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const transform = (d: any): Annexure2 => ({ ...d, id: d._id || d.id });

export const annexure2Service = {
  async getAnnexure2(certificateId: string): Promise<Annexure2> {
    const response = await apiClient.get<ApiResponse<{ annexure2: Annexure2 }>>(
      API_ENDPOINTS.CERTIFICATE_ANNEXURE2(certificateId)
    );
    return transform(response.data.annexure2);
  },

  async saveAll(certificateId: string, data: Partial<Annexure2>): Promise<Annexure2> {
    const response = await apiClient.put<ApiResponse<{ annexure2: Annexure2 }>>(
      API_ENDPOINTS.CERTIFICATE_ANNEXURE2(certificateId),
      data
    );
    return transform(response.data.annexure2);
  },

  async updateSection(certificateId: string, section: string, data: unknown): Promise<Annexure2> {
    const response = await apiClient.put<ApiResponse<{ annexure2: Annexure2 }>>(
      API_ENDPOINTS.CERTIFICATE_ANNEXURE2_SECTION(certificateId, section),
      data
    );
    return transform(response.data.annexure2);
  },
};
