import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Box, Typography, Button, Alert, CircularProgress, Paper } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { CertificateStepper } from '../components/features/certificates/CertificateStepper';
import { useAppDispatch, useAppSelector } from '../store';
import { fetchGuarantors, addGuarantorItem, updateGuarantorItem, deleteGuarantorItem } from '../store/slices/guarantorSlice';
import { GuarantorTable } from '../components/features/guarantors/GuarantorTable';
import type { GuarantorItem } from '../types/networth';

export const GuarantorsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { data, loading, error } = useAppSelector((s) => s.guarantors);

  useEffect(() => {
    if (id) dispatch(fetchGuarantors(id));
  }, [dispatch, id]);

  const handleAdd = (item: GuarantorItem) => {
    if (id) dispatch(addGuarantorItem({ certificateId: id, item }));
  };

  const handleUpdate = (itemId: string, data: Partial<GuarantorItem>) => {
    if (id) dispatch(updateGuarantorItem({ certificateId: id, itemId, data }));
  };

  const handleDelete = (itemId: string) => {
    if (!id || !confirm('Delete this guarantor entry?')) return;
    dispatch(deleteGuarantorItem({ certificateId: id, itemId }));
  };

  if (loading && !data) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}><CircularProgress /></Box>;
  }

  return (
    <Box sx={{ p: 3 }}>
      <CertificateStepper certificateId={id!} activeStep={3} />
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Button startIcon={<ArrowBackIcon />} variant="text" onClick={() => navigate(`/certificates/${id}/liabilities`)}>
            Back
          </Button>
          <Typography variant="h5" fontWeight={700}>Guarantor Details</Typography>
        </Box>
        <Button endIcon={<ArrowForwardIcon />} variant="contained" onClick={() => navigate(`/certificates/${id}/summary`)}>
          Next: Summary
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Paper variant="outlined" sx={{ p: 2, mb: 2, bgcolor: 'info.50', borderColor: 'info.200' }}>
        <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
          He is the Guarantor for various Borrowings by his friends / relatives / firm(s) / company(s) as detailed below:
        </Typography>
      </Paper>

      <GuarantorTable
        items={data?.items ?? []}
        onAdd={handleAdd}
        onUpdate={handleUpdate}
        onDelete={handleDelete}
      />
    </Box>
  );
};
