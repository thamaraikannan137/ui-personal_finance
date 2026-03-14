import type { Annexure1, PropertyRow } from '../types/networth';
import { apiClient } from './api';
import { API_ENDPOINTS } from '../config/constants';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const transform = (d: any): Annexure1 => ({ ...d, id: d._id || d.id });

export const annexure1Service = {
  async getAnnexure1(certificateId: string): Promise<Annexure1> {
    const response = await apiClient.get<ApiResponse<{ annexure1: Annexure1 }>>(
      API_ENDPOINTS.CERTIFICATE_ANNEXURE1(certificateId)
    );
    return transform(response.data.annexure1);
  },

  async saveAll(certificateId: string, data: { bySelf?: PropertyRow[]; bySharing?: PropertyRow[] }): Promise<Annexure1> {
    const response = await apiClient.put<ApiResponse<{ annexure1: Annexure1 }>>(
      API_ENDPOINTS.CERTIFICATE_ANNEXURE1(certificateId),
      data
    );
    return transform(response.data.annexure1);
  },

  async addRow(certificateId: string, section: 'bySelf' | 'bySharing', row: PropertyRow): Promise<Annexure1> {
    const response = await apiClient.post<ApiResponse<{ annexure1: Annexure1 }>>(
      API_ENDPOINTS.CERTIFICATE_ANNEXURE1_ROW(certificateId, section),
      row
    );
    return transform(response.data.annexure1);
  },

  async updateRow(certificateId: string, section: 'bySelf' | 'bySharing', rowId: string, data: Partial<PropertyRow>): Promise<Annexure1> {
    const response = await apiClient.put<ApiResponse<{ annexure1: Annexure1 }>>(
      API_ENDPOINTS.CERTIFICATE_ANNEXURE1_ROW_ID(certificateId, section, rowId),
      data
    );
    return transform(response.data.annexure1);
  },

  async deleteRow(certificateId: string, section: 'bySelf' | 'bySharing', rowId: string): Promise<Annexure1> {
    const response = await apiClient.delete<ApiResponse<{ annexure1: Annexure1 }>>(
      API_ENDPOINTS.CERTIFICATE_ANNEXURE1_ROW_ID(certificateId, section, rowId)
    );
    return transform(response.data.annexure1);
  },
};
