import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Box, Typography, Button, Alert, CircularProgress } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { CertificateStepper } from '../components/features/certificates/CertificateStepper';
import { useAppDispatch, useAppSelector } from '../store';
import { fetchCertificateById } from '../store/slices/certificateSlice';
import { CertificateLiabilityTable } from '../components/features/liabilities/CertificateLiabilityTable';
import type { LiabilityItem } from '../types/networth';
import { useState } from 'react';
import { apiClient } from '../services/api';
import { API_ENDPOINTS } from '../config/constants';

interface ApiResponse<T> { success: boolean; message: string; data: T; }

export const CertificateLiabilityPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  useAppSelector((s) => s.certificates);
  const [liabilities, setLiabilities] = useState<{ items: LiabilityItem[]; total: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await apiClient.get<ApiResponse<{ liabilities: { items: LiabilityItem[]; total: number } }>>(
        API_ENDPOINTS.CERTIFICATE_LIABILITIES(id)
      );
      setLiabilities(res.data.liabilities);
    } catch { setError('Failed to load liabilities'); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    if (id) { dispatch(fetchCertificateById(id)); load(); }
  }, [id]);

  const handleAdd = async (item: LiabilityItem) => {
    if (!id) return;
    await apiClient.post(API_ENDPOINTS.CERTIFICATE_LIABILITY_ITEM(id), item);
    await load();
  };

  const handleUpdate = async (itemId: string, data: Partial<LiabilityItem>) => {
    if (!id) return;
    await apiClient.put(API_ENDPOINTS.CERTIFICATE_LIABILITY_ITEM_ID(id, itemId), data);
    await load();
  };

  const handleDelete = async (itemId: string) => {
    if (!id || !confirm('Delete this liability?')) return;
    await apiClient.delete(API_ENDPOINTS.CERTIFICATE_LIABILITY_ITEM_ID(id, itemId));
    await load();
  };

  if (loading && !liabilities) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}><CircularProgress /></Box>;
  }

  return (
    <Box sx={{ p: 3 }}>
      <CertificateStepper certificateId={id!} activeStep={2} />
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Button startIcon={<ArrowBackIcon />} variant="text" onClick={() => navigate(`/certificates/${id}/annexure2`)}>
            Back
          </Button>
          <Typography variant="h5" fontWeight={700}>Liabilities — Section C</Typography>
        </Box>
        <Button endIcon={<ArrowForwardIcon />} variant="contained" onClick={() => navigate(`/certificates/${id}/guarantors`)}>
          Next: Guarantors
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Box sx={{ mb: 2, p: 1.5, bgcolor: 'error.50', borderRadius: 1 }}>
        <Typography fontWeight={700} color="error.main">
          Total Liabilities (C): ₹ {(liabilities?.total ?? 0).toFixed(2)} Lacs
        </Typography>
      </Box>

      <CertificateLiabilityTable
        items={liabilities?.items ?? []}
        total={liabilities?.total ?? 0}
        onAdd={handleAdd}
        onUpdate={handleUpdate}
        onDelete={handleDelete}
      />
    </Box>
  );
};
