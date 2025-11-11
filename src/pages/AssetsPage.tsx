import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Grid,
  Stack,
  Typography,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  alpha,
} from '@mui/material';
import { AssetList } from '../components/features';
import { MuiCard, Button } from '../components/common';
import { AssetFormDialog } from '../components/features/assets';
import { fetchAssets, createAsset, updateAsset, deleteAsset } from '../store/slices/assetSlice';
import { useAppDispatch, useAppSelector } from '../store';
import { formatCurrency } from '../utils';
import type { Asset, AssetCreateInput, AssetUpdateInput } from '../types';

export const AssetsPage = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { items, loading } = useAppSelector((state) => state.assets);

  const [assetDialogOpen, setAssetDialogOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [assetToDelete, setAssetToDelete] = useState<Asset | null>(null);

  useEffect(() => {
    dispatch(fetchAssets());
  }, [dispatch]);

  // Calculate detailed asset metrics
  const assetMetrics = useMemo(() => {
    const totalValue = items.reduce((sum, asset) => sum + asset.value, 0);
    const assetCount = items.length;
    
    // Calculate asset appreciation/depreciation
    let totalAppreciation = 0;
    let assetsWithInitialValue = 0;
    let totalInitialValue = 0;
    
    items.forEach(asset => {
      if (asset.initialValue && asset.initialValue > 0) {
        totalAppreciation += (asset.value - asset.initialValue);
        totalInitialValue += asset.initialValue;
        assetsWithInitialValue++;
      }
    });
    
    // Calculate highest value asset
    const highestAsset = items.length > 0 
      ? items.reduce((max, asset) => asset.value > max.value ? asset : max, items[0])
      : null;
    
    // Calculate average asset value
    const avgAssetValue = items.length > 0 ? totalValue / items.length : 0;
    
    // Calculate appreciation percentage
    const appreciationPercent = totalInitialValue > 0 
      ? (totalAppreciation / totalInitialValue) * 100 
      : 0;
    
    return { 
      totalValue,
      assetCount,
      totalAppreciation,
      assetsWithInitialValue,
      appreciationPercent,
      highestAsset,
      avgAssetValue,
    };
  }, [items]);

  const handleAddAsset = () => {
    setEditingAsset(null);
    setAssetDialogOpen(true);
  };

  const handleEditAsset = (asset: Asset) => {
    setEditingAsset(asset);
    setAssetDialogOpen(true);
  };

  const handleDeleteAsset = (asset: Asset) => {
    setAssetToDelete(asset);
    setDeleteDialogOpen(true);
  };

  const handleAssetSubmit = async (values: AssetCreateInput) => {
    if (editingAsset) {
      await dispatch(updateAsset({ id: editingAsset.id, changes: values as AssetUpdateInput }));
    } else {
      await dispatch(createAsset(values));
    }
    setAssetDialogOpen(false);
    setEditingAsset(null);
    // State is already updated by the slice - no need to refetch
  };

  const handleConfirmDelete = async () => {
    if (!assetToDelete) return;
    
    try {
      await dispatch(deleteAsset(assetToDelete.id));
      setDeleteDialogOpen(false);
      setAssetToDelete(null);
      // State is already updated by the slice - no need to refetch
    } catch (error) {
      console.error('Failed to delete asset:', error);
    }
  };

  return (
    <Stack spacing={3}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" fontWeight={700}>
          Assets
        </Typography>
        <Button
          variant="contained"
          startIcon={<i className="ri-add-line" style={{ fontSize: '18px' }} />}
          onClick={handleAddAsset}
          sx={{ textTransform: 'none' }}
        >
          Add Asset
        </Button>
      </Box>

      {/* Enhanced Asset Metrics Cards */}
      <Grid container spacing={3}>
        {/* Total Value Card */}
        <Grid size={{ xs: 12, md: 3 }}>
          <MuiCard 
            sx={{ 
              p: 3,
              background: (theme) => `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.primary.main, 0.05)} 100%)`,
              border: (theme) => `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
              height: '100%',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: 2,
                  bgcolor: (theme) => alpha(theme.palette.primary.main, 0.15),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <i className="ri-money-dollar-circle-line" style={{ fontSize: '24px', color: '#1976d2' }} />
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary" fontWeight={500}>
                  Total Value
                </Typography>
                <Typography variant="h4" color="primary.main" fontWeight={700}>
                  {formatCurrency(assetMetrics.totalValue)}
                </Typography>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <i className="ri-database-2-line" style={{ fontSize: '16px', color: '#666' }} />
              <Typography variant="body2" color="text.secondary">
                {assetMetrics.assetCount} {assetMetrics.assetCount !== 1 ? 'assets' : 'asset'} in portfolio
              </Typography>
            </Box>
          </MuiCard>
        </Grid>

        {/* Asset Count Card */}
        <Grid size={{ xs: 12, md: 3 }}>
          <MuiCard 
            sx={{ 
              p: 3,
              background: (theme) => `linear-gradient(135deg, ${alpha(theme.palette.info.main, 0.1)} 0%, ${alpha(theme.palette.info.main, 0.05)} 100%)`,
              border: (theme) => `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
              height: '100%',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: 2,
                  bgcolor: (theme) => alpha(theme.palette.info.main, 0.15),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <i className="ri-stack-line" style={{ fontSize: '24px', color: '#0288d1' }} />
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary" fontWeight={500}>
                  Total Items
                </Typography>
                <Typography variant="h4" color="info.main" fontWeight={700}>
                  {assetMetrics.assetCount}
                </Typography>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <i className="ri-bar-chart-line" style={{ fontSize: '16px', color: '#666' }} />
              <Typography variant="body2" color="text.secondary">
                Avg: {formatCurrency(assetMetrics.avgAssetValue)}
              </Typography>
            </Box>
          </MuiCard>
        </Grid>

        {/* Appreciation Card */}
        <Grid size={{ xs: 12, md: 3 }}>
          <MuiCard 
            sx={{ 
              p: 3,
              background: (theme) => assetMetrics.totalAppreciation >= 0
                ? `linear-gradient(135deg, ${alpha(theme.palette.success.main, 0.1)} 0%, ${alpha(theme.palette.success.main, 0.05)} 100%)`
                : `linear-gradient(135deg, ${alpha(theme.palette.error.main, 0.1)} 0%, ${alpha(theme.palette.error.main, 0.05)} 100%)`,
              border: (theme) => assetMetrics.totalAppreciation >= 0
                ? `1px solid ${alpha(theme.palette.success.main, 0.2)}`
                : `1px solid ${alpha(theme.palette.error.main, 0.2)}`,
              height: '100%',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: 2,
                  bgcolor: (theme) => assetMetrics.totalAppreciation >= 0
                    ? alpha(theme.palette.success.main, 0.15)
                    : alpha(theme.palette.error.main, 0.15),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <i 
                  className={assetMetrics.totalAppreciation >= 0 ? "ri-arrow-up-line" : "ri-arrow-down-line"} 
                  style={{ fontSize: '24px', color: assetMetrics.totalAppreciation >= 0 ? '#4caf50' : '#f44336' }} 
                />
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary" fontWeight={500}>
                  Appreciation
                </Typography>
                <Typography 
                  variant="h4" 
                  color={assetMetrics.totalAppreciation >= 0 ? 'success.main' : 'error.main'}
                  fontWeight={700}
                >
                  {assetMetrics.totalAppreciation >= 0 ? '+' : ''}{formatCurrency(assetMetrics.totalAppreciation)}
                </Typography>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <i className="ri-percent-line" style={{ fontSize: '16px', color: '#666' }} />
              <Typography variant="body2" color="text.secondary">
                {assetMetrics.assetsWithInitialValue > 0 
                  ? `${assetMetrics.appreciationPercent >= 0 ? '+' : ''}${assetMetrics.appreciationPercent.toFixed(1)}% change`
                  : 'No tracking data'
                }
              </Typography>
            </Box>
          </MuiCard>
        </Grid>

        {/* Top Asset Card */}
        <Grid size={{ xs: 12, md: 3 }}>
          <MuiCard 
            sx={{ 
              p: 3,
              background: (theme) => `linear-gradient(135deg, ${alpha(theme.palette.warning.main, 0.1)} 0%, ${alpha(theme.palette.warning.main, 0.05)} 100%)`,
              border: (theme) => `1px solid ${alpha(theme.palette.warning.main, 0.2)}`,
              height: '100%',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: 2,
                  bgcolor: (theme) => alpha(theme.palette.warning.main, 0.15),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <i className="ri-medal-line" style={{ fontSize: '24px', color: '#ff9800' }} />
              </Box>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="caption" color="text.secondary" fontWeight={500}>
                  Top Asset
                </Typography>
                <Typography variant="h6" fontWeight={700} color="warning.main" noWrap>
                  {assetMetrics.highestAsset ? assetMetrics.highestAsset.name : 'N/A'}
                </Typography>
              </Box>
            </Box>
            {assetMetrics.highestAsset && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <i className="ri-price-tag-3-line" style={{ fontSize: '16px', color: '#666' }} />
                <Typography variant="body2" color="text.secondary">
                  {formatCurrency(assetMetrics.highestAsset.value)}
                </Typography>
              </Box>
            )}
          </MuiCard>
        </Grid>
      </Grid>

      <AssetList
        assets={items}
        loading={loading}
        onSelectAsset={(id) => navigate(`/assets/${id}`)}
        onEditAsset={handleEditAsset}
        onDeleteAsset={handleDeleteAsset}
      />

      {/* Asset Form Dialog */}
      <AssetFormDialog
        open={assetDialogOpen}
        onClose={() => {
          setAssetDialogOpen(false);
          setEditingAsset(null);
        }}
        onSubmit={handleAssetSubmit}
        initialAsset={editingAsset}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete &quot;{assetToDelete?.name}&quot;? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button variant="text" onClick={() => setDeleteDialogOpen(false)}>
            Cancel
          </Button>
          <Button variant="contained" color="error" onClick={handleConfirmDelete}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
};

export default AssetsPage;

