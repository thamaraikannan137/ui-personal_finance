import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Stack,
  Typography,
  Chip,
  Divider,
  alpha,
  Link,
  IconButton,
  Tooltip,
} from '@mui/material';
import { MuiCard, Button } from '../components/common';
import { formatCurrency, formatDate } from '../utils';
import { useAppDispatch, useAppSelector } from '../store';
import { fetchAssetById } from '../store/slices/assetSlice';
import { getAssetCategoryLabel } from '../config/categoryConfig';

export const AssetDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { selectedAsset, loading } = useAppSelector((state) => state.assets);

  useEffect(() => {
    if (id) {
      dispatch(fetchAssetById(id));
    }
  }, [id, dispatch]);

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>Loading...</Typography>
      </Box>
    );
  }

  if (!selectedAsset) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>Asset not found</Typography>
        <Button onClick={() => navigate('/assets')}>Back to Assets</Button>
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
            {selectedAsset.name}
          </Typography>
          <Chip 
            label={getAssetCategoryLabel(selectedAsset.category, selectedAsset.customCategoryName)}
            size="small"
            color="primary"
            variant="outlined"
          />
        </Box>
        <Button onClick={() => navigate('/assets')}>
          Back to Assets
        </Button>
      </Box>

      {/* Main Info Card */}
      <MuiCard sx={{ p: 3 }}>
        <Typography variant="h6" fontWeight={600} gutterBottom>
          Asset Information
              </Typography>
        <Divider sx={{ my: 2 }} />
        
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
          {/* Current Value */}
          <Box 
            sx={{ 
              flex: 1,
              p: 3, 
              bgcolor: (theme) => alpha(theme.palette.success.main, 0.1),
              borderRadius: 2,
              border: (theme) => `1px solid ${alpha(theme.palette.success.main, 0.3)}`
            }}
          >
            <Typography variant="caption" color="text.secondary" gutterBottom>
              Current Value
            </Typography>
            <Typography variant="h4" fontWeight={700} color="success.main">
              {formatCurrency(selectedAsset.value)}
            </Typography>
          </Box>

          {/* Initial Value */}
          {selectedAsset.initialValue && selectedAsset.initialValue > 0 && (
            <Box 
              sx={{ 
                flex: 1,
                p: 3, 
                bgcolor: (theme) => alpha(theme.palette.info.main, 0.1),
                borderRadius: 2,
                border: (theme) => `1px solid ${alpha(theme.palette.info.main, 0.3)}`
              }}
            >
              <Typography variant="caption" color="text.secondary" gutterBottom>
                Initial Value
              </Typography>
              <Typography variant="h5" fontWeight={600} color="info.main">
                {formatCurrency(selectedAsset.initialValue)}
              </Typography>
              {selectedAsset.initialValue > 0 && (
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                  Change: {formatCurrency(selectedAsset.value - selectedAsset.initialValue)} 
                  {' '}({((selectedAsset.value - selectedAsset.initialValue) / selectedAsset.initialValue * 100).toFixed(2)}%)
                </Typography>
              )}
            </Box>
          )}
        </Stack>

        <Divider sx={{ my: 3 }} />

        {/* Details */}
                <Stack spacing={1}>
          <InfoRow label="Owner" value={selectedAsset.owner} />
          <InfoRow label="Category" value={getAssetCategoryLabel(selectedAsset.category, selectedAsset.customCategoryName)} />
          
          {/* Category-specific fields */}
          {selectedAsset.location && <InfoRow label="Location" value={selectedAsset.location} />}
          {selectedAsset.purchaseDate && <InfoRow label="Purchase Date" value={formatDate(selectedAsset.purchaseDate)} />}
          {selectedAsset.endDate && <InfoRow label="Maturity/End Date" value={formatDate(selectedAsset.endDate)} />}
          {selectedAsset.rateOfReturn && <InfoRow label="Rate of Return" value={`${selectedAsset.rateOfReturn}%`} />}
          {selectedAsset.monthlyPayment && <InfoRow label="Monthly Payment" value={formatCurrency(selectedAsset.monthlyPayment)} />}
          {selectedAsset.institution && <InfoRow label="Institution" value={selectedAsset.institution} />}
          {selectedAsset.accountNumber && <InfoRow label="Account Number" value={selectedAsset.accountNumber} />}
          
          {selectedAsset.notes && (
            <>
              <Divider sx={{ my: 2 }} />
              <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Notes
                </Typography>
                <Typography variant="body2">
                  {selectedAsset.notes}
                </Typography>
              </Box>
            </>
          )}

          {/* Custom Fields */}
          {selectedAsset.customFields && selectedAsset.customFields.length > 0 && (
            <>
              <Divider sx={{ my: 2 }} />
              <Typography variant="body2" color="text.secondary" fontWeight={600} gutterBottom>
                Custom Fields
              </Typography>
              {selectedAsset.customFields.map((field) => (
                <InfoRow 
                  key={field.id} 
                  label={field.name} 
                  value={field.value?.toString()} 
                />
              ))}
            </>
          )}

          {/* Documents */}
          {selectedAsset.documents && selectedAsset.documents.length > 0 && (
            <>
              <Divider sx={{ my: 2 }} />
              <Typography variant="body2" color="text.secondary" fontWeight={600} gutterBottom>
                Documents
              </Typography>
              <Stack spacing={1}>
                {selectedAsset.documents.map((doc, index) => {
                  // Handle both string URLs and document objects
                  const docUrl = typeof doc === 'string' ? doc : doc.url;
                  const docName = typeof doc === 'string' 
                    ? docUrl.split('/').pop() || `Document ${index + 1}`
                    : doc.name || docUrl.split('/').pop() || `Document ${index + 1}`;
                  const extension = docUrl.split('.').pop()?.toLowerCase() || '';
                  const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension);
                  
                  return (
                    <Box
                      key={typeof doc === 'string' ? index : doc.id}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        p: 1.5,
                        borderRadius: 1,
                        bgcolor: (theme) => alpha(theme.palette.primary.main, 0.05),
                        border: (theme) => `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flex: 1 }}>
                        <Box
                          sx={{
                            width: 40,
                            height: 40,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: 1,
                            bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
                          }}
                        >
                          {isImage ? (
                            <i className="ri-image-line" style={{ fontSize: 20, color: '#1976d2' }} />
                          ) : extension === 'pdf' ? (
                            <i className="ri-file-pdf-line" style={{ fontSize: 20, color: '#d32f2f' }} />
                          ) : ['doc', 'docx'].includes(extension) ? (
                            <i className="ri-file-word-line" style={{ fontSize: 20, color: '#1976d2' }} />
                          ) : (
                            <i className="ri-file-line" style={{ fontSize: 20, color: '#666' }} />
                          )}
                        </Box>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography variant="body2" fontWeight={500} noWrap>
                            {docName}
                          </Typography>
                          {typeof doc === 'object' && doc.uploadedAt && (
                            <Typography variant="caption" color="text.secondary">
                              {formatDate(doc.uploadedAt)}
                            </Typography>
                          )}
                        </Box>
                      </Box>
                      <Tooltip title="Open in new tab">
                        <IconButton
                          size="small"
                          component="a"
                          href={docUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          sx={{ ml: 1 }}
                        >
                          <i className="ri-external-link-line" style={{ fontSize: 18 }} />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  );
                })}
              </Stack>
            </>
          )}
        </Stack>

        <Divider sx={{ my: 3 }} />

        {/* Metadata */}
      <Box>
          <Typography variant="caption" color="text.secondary">
            Last Updated: {formatDate(selectedAsset.updatedAt)}
          </Typography>
        </Box>
                </MuiCard>
    </Stack>
  );
};

export default AssetDetailPage;
