import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Stack,
  Typography,
  Chip,
  Divider,
  alpha,
} from '@mui/material';
import { MuiCard, Button } from '../components/common';
import { formatCurrency, formatDate } from '../utils';
import { useAppDispatch, useAppSelector } from '../store';
import { fetchLiabilityById } from '../store/slices/liabilitySlice';
import { getLiabilityCategoryLabel } from '../config/categoryConfig';

export const LiabilityDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { selectedLiability, loading } = useAppSelector((state) => state.liabilities);

  useEffect(() => {
    if (id) {
      dispatch(fetchLiabilityById(id));
    }
  }, [id, dispatch]);

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>Loading...</Typography>
      </Box>
    );
  }

  if (!selectedLiability) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>Liability not found</Typography>
        <Button onClick={() => navigate('/liabilities')}>Back to Liabilities</Button>
      </Box>
    );
  }

  const InfoRow = ({ label, value }: { label: string; value: string | number | undefined }) => {
    if (!value && value !== 0) return null;
    return (
      <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1 }}>
        <Typography variant="body2" color="text.secondary">{label}</Typography>
        <Typography variant="body2" fontWeight={500}>{value}</Typography>
      </Box>
    );
  };

  return (
    <Stack spacing={3} sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            {selectedLiability.name}
          </Typography>
          <Chip 
            label={getLiabilityCategoryLabel(selectedLiability.category, selectedLiability.customCategoryName)}
            size="small"
            color="error"
            variant="outlined"
          />
        </Box>
        <Button onClick={() => navigate('/liabilities')}>
          Back to Liabilities
        </Button>
      </Box>

      {/* Main Info Card */}
      <MuiCard sx={{ p: 3 }}>
        <Typography variant="h6" fontWeight={600} gutterBottom>
          Liability Information
        </Typography>
        <Divider sx={{ my: 2 }} />
        
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
          {/* Outstanding Balance */}
          <Box 
            sx={{ 
              flex: 1,
              p: 3, 
              bgcolor: (theme) => alpha(theme.palette.error.main, 0.1),
              borderRadius: 2,
              border: (theme) => `1px solid ${alpha(theme.palette.error.main, 0.3)}`
            }}
          >
            <Typography variant="caption" color="text.secondary" gutterBottom>
              Outstanding Balance
            </Typography>
            <Typography variant="h4" fontWeight={700} color="error.main">
              {formatCurrency(selectedLiability.balance)}
            </Typography>
          </Box>

          {/* Interest Rate */}
          {selectedLiability.interestRate !== undefined && selectedLiability.interestRate !== null && (
            <Box 
              sx={{ 
                flex: 1,
                p: 3, 
                bgcolor: (theme) => alpha(theme.palette.warning.main, 0.1),
                borderRadius: 2,
                border: (theme) => `1px solid ${alpha(theme.palette.warning.main, 0.3)}`
              }}
            >
              <Typography variant="caption" color="text.secondary" gutterBottom>
                Interest Rate
              </Typography>
              <Typography variant="h5" fontWeight={600} color="warning.main">
                {selectedLiability.interestRate}%
              </Typography>
            </Box>
          )}
        </Stack>

        <Divider sx={{ my: 3 }} />

        {/* Details */}
        <Stack spacing={1}>
          <InfoRow label="Owner" value={selectedLiability.owner} />
          <InfoRow label="Category" value={getLiabilityCategoryLabel(selectedLiability.category, selectedLiability.customCategoryName)} />
          <InfoRow label="Institution" value={selectedLiability.institution} />
          
          {selectedLiability.interestRate !== undefined && selectedLiability.interestRate !== null && (
            <InfoRow label="Interest Rate" value={`${selectedLiability.interestRate}%`} />
          )}
          {selectedLiability.dueDate && <InfoRow label="Due Date" value={formatDate(selectedLiability.dueDate)} />}
          
          {selectedLiability.notes && (
            <>
              <Divider sx={{ my: 2 }} />
              <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Notes
                </Typography>
                <Typography variant="body2">
                  {selectedLiability.notes}
                </Typography>
              </Box>
            </>
          )}

          {/* Custom Fields */}
          {selectedLiability.customFields && selectedLiability.customFields.length > 0 && (
            <>
              <Divider sx={{ my: 2 }} />
              <Typography variant="body2" color="text.secondary" fontWeight={600} gutterBottom>
                Custom Fields
              </Typography>
              {selectedLiability.customFields.map((field) => (
                <InfoRow 
                  key={field.id} 
                  label={field.name} 
                  value={field.value?.toString()} 
                />
              ))}
            </>
          )}
        </Stack>

        <Divider sx={{ my: 3 }} />

        {/* Metadata */}
        <Box>
          <Typography variant="caption" color="text.secondary">
            Last Updated: {formatDate(selectedLiability.updatedAt)}
          </Typography>
        </Box>
      </MuiCard>
    </Stack>
  );
};

export default LiabilityDetailPage;
