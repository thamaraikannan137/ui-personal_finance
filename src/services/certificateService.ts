import type { NetWorthCertificate, NetWorthSummary } from '../types/networth';
import { apiClient } from './api';
import { API_ENDPOINTS } from '../config/constants';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const transformCert = (c: any): NetWorthCertificate => ({ ...c, id: c._id || c.id });

export const certificateService = {
  async getCertificatesByClient(clientId: string, status?: string): Promise<NetWorthCertificate[]> {
    const qs = status ? `?status=${status}` : '';
    const response = await apiClient.get<ApiResponse<{ certificates: NetWorthCertificate[] }>>(
      `${API_ENDPOINTS.CLIENT_CERTIFICATES(clientId)}${qs}`
    );
    return response.data.certificates.map(transformCert);
  },

  async getCertificateById(id: string): Promise<NetWorthCertificate> {
    const response = await apiClient.get<ApiResponse<{ certificate: NetWorthCertificate }>>(
      API_ENDPOINTS.CERTIFICATE_BY_ID(id)
    );
    return transformCert(response.data.certificate);
  },

  async createCertificate(data: { clientId: string; financialYear: string; asOnDate: string }): Promise<NetWorthCertificate> {
    const response = await apiClient.post<ApiResponse<{ certificate: NetWorthCertificate }>>(
      API_ENDPOINTS.CERTIFICATES,
      data
    );
    return transformCert(response.data.certificate);
  },

  async getSummary(id: string): Promise<NetWorthSummary> {
    const response = await apiClient.get<ApiResponse<{ summary: NetWorthSummary }>>(
      API_ENDPOINTS.CERTIFICATE_SUMMARY(id)
    );
    return response.data.summary;
  },

  async finalizeCertificate(id: string): Promise<NetWorthCertificate> {
    const response = await apiClient.patch<ApiResponse<{ certificate: NetWorthCertificate }>>(
      API_ENDPOINTS.CERTIFICATE_FINALIZE(id)
    );
    return transformCert(response.data.certificate);
  },

  async reopenCertificate(id: string): Promise<NetWorthCertificate> {
    const response = await apiClient.patch<ApiResponse<{ certificate: NetWorthCertificate }>>(
      API_ENDPOINTS.CERTIFICATE_REOPEN(id)
    );
    return transformCert(response.data.certificate);
  },

  async deleteCertificate(id: string): Promise<void> {
    await apiClient.delete(API_ENDPOINTS.CERTIFICATE_BY_ID(id));
  },

  async downloadExcel(id: string): Promise<void> {
    const axiosInstance = apiClient.getAxiosInstance();
    const response = await axiosInstance.get(API_ENDPOINTS.CERTIFICATE_EXPORT_EXCEL(id), {
      responseType: 'blob',
    });

    const blob = new Blob([response.data], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    const objectUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = objectUrl;
    a.download = `net-worth-${id}.xlsx`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(objectUrl);
  },
};
