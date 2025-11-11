import { useEffect, useMemo } from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Grid,
  Stack,
  Typography,
  Box,
  Chip,
  alpha,
} from '@mui/material';
import { MuiCard, ChartCard, Button } from '../components/common';
import { AssetFormDialog } from '../components/features/assets';
import { LiabilityFormDialog } from '../components/features/liabilities';
import { formatCurrency } from '../utils';
import { useAppDispatch, useAppSelector } from '../store';
import {
  fetchAssets,
  createAsset,
  updateAsset,
} from '../store/slices/assetSlice';
import {
  fetchLiabilities,
  createLiability,
  updateLiability,
} from '../store/slices/liabilitySlice';
import type { Asset, AssetCreateInput, AssetUpdateInput, AssetCategory } from '../types';
import type { Liability, LiabilityCreateInput, LiabilityUpdateInput, LiabilityCategory } from '../types';
import { getAssetCategoryLabel, getLiabilityCategoryLabel } from '../config/categoryConfig';

export const HomePage = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  
  const { items: assets } = useAppSelector((state) => state.assets);
  const { items: liabilities } = useAppSelector((state) => state.liabilities);
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  
  // Dialog states
  const [assetDialogOpen, setAssetDialogOpen] = useState(false);
  const [liabilityDialogOpen, setLiabilityDialogOpen] = useState(false);
  
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
  const [editingLiability, setEditingLiability] = useState<Liability | null>(null);

  // Load data only if authenticated
  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchAssets());
      dispatch(fetchLiabilities());
    }
  }, [dispatch, isAuthenticated]);

  // Calculate summary with detailed metrics
  const summary = useMemo(() => {
    const totalAssets = assets.reduce((sum, asset) => sum + asset.value, 0);
    const totalLiabilities = liabilities.reduce((sum, liability) => sum + liability.balance, 0);
    const netWorth = totalAssets - totalLiabilities;
    
    // Calculate asset appreciation/depreciation
    let totalAppreciation = 0;
    let assetsWithInitialValue = 0;
    assets.forEach(asset => {
      if (asset.initialValue && asset.initialValue > 0) {
        totalAppreciation += (asset.value - asset.initialValue);
        assetsWithInitialValue++;
      }
    });
    
    // Calculate highest value asset
    const highestAsset = assets.length > 0 
      ? assets.reduce((max, asset) => asset.value > max.value ? asset : max, assets[0])
      : null;
    
    // Calculate average asset value
    const avgAssetValue = assets.length > 0 ? totalAssets / assets.length : 0;
    
    return { 
      totalAssets, 
      totalLiabilities, 
      netWorth,
      assetCount: assets.length,
      liabilityCount: liabilities.length,
      totalAppreciation,
      assetsWithInitialValue,
      appreciationPercent: assetsWithInitialValue > 0 
        ? (totalAppreciation / assets.filter(a => a.initialValue).reduce((sum, a) => sum + (a.initialValue || 0), 0)) * 100 
        : 0,
      highestAsset,
      avgAssetValue,
    };
  }, [assets, liabilities]);

  // Asset CRUD handlers
  const handleAddAsset = () => {
    setEditingAsset(null);
    setAssetDialogOpen(true);
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

  // Liability CRUD handlers
  const handleAddLiability = () => {
    setEditingLiability(null);
    setLiabilityDialogOpen(true);
  };

  const handleLiabilitySubmit = async (values: LiabilityCreateInput) => {
    if (editingLiability) {
      await dispatch(updateLiability({ id: editingLiability.id, changes: values as LiabilityUpdateInput }));
    } else {
      await dispatch(createLiability(values));
    }
    setLiabilityDialogOpen(false);
    setEditingLiability(null);
    dispatch(fetchLiabilities());
  };


  // Chart data for asset distribution
  const assetChartData = useMemo(() => {
    const categoryTotals: Record<string, { value: number; customName?: string }> = {};
    assets.forEach((asset) => {
      const key = asset.category === 'custom' && asset.customCategoryName 
        ? asset.customCategoryName 
        : asset.category;
      
      if (!categoryTotals[key]) {
        categoryTotals[key] = { 
          value: 0, 
          customName: asset.category === 'custom' ? asset.customCategoryName : undefined 
        };
      }
      categoryTotals[key].value += asset.value;
    });

    return {
      categories: Object.keys(categoryTotals),
      values: Object.values(categoryTotals).map(item => item.value),
      customNames: categoryTotals,
    };
  }, [assets]);

  // Chart data for liability distribution
  const liabilityChartData = useMemo(() => {
    const categoryTotals: Record<string, { value: number; customName?: string }> = {};
    liabilities.forEach((liability) => {
      const key = liability.category === 'custom' && liability.customCategoryName 
        ? liability.customCategoryName 
        : liability.category;
      
      if (!categoryTotals[key]) {
        categoryTotals[key] = { 
          value: 0, 
          customName: liability.category === 'custom' ? liability.customCategoryName : undefined 
        };
      }
      categoryTotals[key].value += liability.balance;
    });

    return {
      categories: Object.keys(categoryTotals),
      values: Object.values(categoryTotals).map(item => item.value),
      customNames: categoryTotals,
    };
  }, [liabilities]);

  const getCategoryLabel = (category: string, isAsset: boolean = true): string => {
    // For custom categories, the category string is the custom category name itself
    // Try to get label from centralized config
    try {
      if (isAsset) {
        const assetLabel = getAssetCategoryLabel(category as AssetCategory);
        // If it's not 'Custom', it's a standard category
        if (assetLabel !== 'Custom') return assetLabel;
      } else {
        const liabilityLabel = getLiabilityCategoryLabel(category as LiabilityCategory);
        // If it's not 'Custom', it's a standard category
        if (liabilityLabel !== 'Custom') return liabilityLabel;
      }
    } catch {
      // If category is not in the enum, it's a custom category name
    }
    
    // For custom categories, the category string is already the display name
    return category.charAt(0).toUpperCase() + category.slice(1);
  };


  return (
    <Stack spacing={4}>
      {/* Header */}
      <Box 
        sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between', 
          alignItems: { xs: 'flex-start', sm: 'center' },
          gap: 2,
        }}
      >
        <Typography 
          variant="h4" 
          fontWeight={700}
        >
          Dashboard
        </Typography>
        <Stack 
          direction={{ xs: 'column', sm: 'row' }} 
          spacing={2}
          sx={{ width: { xs: '100%', sm: 'auto' } }}
        >
          <Button
            variant="contained"
            startIcon={
              <Box component="i" className="ri-add-line" />
            }
            onClick={handleAddAsset}
            sx={{ 
              textTransform: 'none',
              width: { xs: '100%', sm: 'auto' },
            }}
          >
            Add Asset
          </Button>
          <Button
            variant="contained"
            color="error"
            startIcon={
              <Box component="i" className="ri-add-line" />
            }
            onClick={handleAddLiability}
            sx={{ 
              textTransform: 'none',
              width: { xs: '100%', sm: 'auto' },
            }}
          >
            Add Liability
          </Button>
        </Stack>
      </Box>

      {/* Summary Cards - Enhanced Design */}
      <Grid container spacing={3}>
        {/* Total Assets Card */}
        <Grid size={{ xs: 12, md: 4 }}>
          <MuiCard 
            sx={{ 
              p: 3,
              background: (theme) => `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.primary.main, 0.05)} 100%)`,
              border: (theme) => `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: (theme) => `0 8px 24px ${alpha(theme.palette.primary.main, 0.15)}`,
              },
            }}
            onClick={() => navigate('/assets')}
          >
            <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
              <Box>
                <Typography 
                  variant="subtitle2" 
                  color="text.secondary" 
                  fontWeight={500}
                >
                  Total Assets
                </Typography>
                <Typography 
                  variant="h3" 
                  color="primary.main" 
                  fontWeight={700} 
                  sx={{ 
                    mt: 1, 
                    mb: 1,
                  }}
                >
                  {formatCurrency(summary.totalAssets)}
                </Typography>
              </Box>
              <Box
                sx={{
                  width: 56,
                  height: 56,
                  borderRadius: 2,
                  bgcolor: (theme) => alpha(theme.palette.primary.main, 0.15),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Box 
                  component="i" 
                  className="ri-money-dollar-circle-line" 
                  sx={{ fontSize: '28px', color: '#1976d2' }} 
                />
              </Box>
            </Box>
            
            <Stack spacing={1.5}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box component="i" className="ri-database-2-line" sx={{ fontSize: '16px', color: '#666' }} />
                  <Typography 
                    variant="body2" 
                    color="text.secondary"
                  >
                    Total Items
                  </Typography>
                </Box>
                <Chip 
                  label={`${summary.assetCount} ${summary.assetCount !== 1 ? 'assets' : 'asset'}`}
                  size="small"
                  color="primary"
                  variant="outlined"
                />
              </Box>
              

              
              {summary.avgAssetValue > 0 && (
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box component="i" className="ri-bar-chart-line" sx={{ fontSize: '16px', color: '#666' }} />
                    <Typography 
                      variant="body2" 
                      color="text.secondary"
                    >
                      Average Value
                    </Typography>
                  </Box>
                  <Typography 
                    variant="body2" 
                    fontWeight={500}
                  >
                    {formatCurrency(summary.avgAssetValue)}
                  </Typography>
                </Box>
              )}
            </Stack>
          </MuiCard>
        </Grid>

        {/* Total Liabilities Card */}
        <Grid size={{ xs: 12, md: 4 }}>
          <MuiCard 
            sx={{ 
              p: 3,
              background: (theme) => `linear-gradient(135deg, ${alpha(theme.palette.error.main, 0.1)} 0%, ${alpha(theme.palette.error.main, 0.05)} 100%)`,
              border: (theme) => `1px solid ${alpha(theme.palette.error.main, 0.2)}`,
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: (theme) => `0 8px 24px ${alpha(theme.palette.error.main, 0.15)}`,
              },
            }}
            onClick={() => navigate('/liabilities')}
          >
            <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
              <Box>
                <Typography 
                  variant="subtitle2" 
                  color="text.secondary" 
                  fontWeight={500}
                >
                  Total Liabilities
                </Typography>
                <Typography 
                  variant="h3" 
                  color="error.main" 
                  fontWeight={700} 
                  sx={{ 
                    mt: 1, 
                    mb: 1,
                  }}
                >
                  {formatCurrency(summary.totalLiabilities)}
                </Typography>
              </Box>
              <Box
                sx={{
                  width: 56,
                  height: 56,
                  borderRadius: 2,
                  bgcolor: (theme) => alpha(theme.palette.error.main, 0.15),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Box component="i" className="ri-bank-card-line" sx={{ fontSize: '28px', color: '#f44336' }} />
              </Box>
            </Box>
            
            <Stack spacing={1.5}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box component="i" className="ri-file-list-line" sx={{ fontSize: '16px', color: '#666' }} />
                  <Typography 
                    variant="body2" 
                    color="text.secondary"
                  >
                    Total Items
                  </Typography>
                </Box>
                <Chip 
                  label={`${summary.liabilityCount} ${summary.liabilityCount !== 1 ? 'liabilities' : 'liability'}`}
                  size="small"
                  color="error"
                  variant="outlined"
                />
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box component="i" className="ri-scales-line" sx={{ fontSize: '16px', color: '#666' }} />
                  <Typography 
                    variant="body2" 
                    color="text.secondary"
                  >
                    Debt Ratio
                  </Typography>
                </Box>
                <Typography 
                  variant="body2" 
                  fontWeight={500}
                >
                  {summary.totalAssets > 0 
                    ? ((summary.totalLiabilities / summary.totalAssets) * 100).toFixed(1)
                    : 0}%
                </Typography>
              </Box>
            </Stack>
          </MuiCard>
        </Grid>

        {/* Net Worth Card */}
        <Grid size={{ xs: 12, md: 4 }}>
          <MuiCard 
            sx={{ 
              p: 3,
              background: (theme) => summary.netWorth >= 0
                ? `linear-gradient(135deg, ${alpha(theme.palette.success.main, 0.1)} 0%, ${alpha(theme.palette.success.main, 0.05)} 100%)`
                : `linear-gradient(135deg, ${alpha(theme.palette.warning.main, 0.1)} 0%, ${alpha(theme.palette.warning.main, 0.05)} 100%)`,
              border: (theme) => summary.netWorth >= 0
                ? `1px solid ${alpha(theme.palette.success.main, 0.2)}`
                : `1px solid ${alpha(theme.palette.warning.main, 0.2)}`,
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: (theme) => summary.netWorth >= 0
                  ? `0 8px 24px ${alpha(theme.palette.success.main, 0.15)}`
                  : `0 8px 24px ${alpha(theme.palette.warning.main, 0.15)}`,
              },
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
              <Box>
                <Typography 
                  variant="subtitle2" 
                  color="text.secondary" 
                  fontWeight={500}
                >
                  Net Worth
                </Typography>
                <Typography
                  variant="h3"
                  color={summary.netWorth >= 0 ? 'success.main' : 'warning.main'}
                  fontWeight={700}
                  sx={{ 
                    mt: 1, 
                    mb: 1,
                  }}
                >
                  {formatCurrency(summary.netWorth)}
                </Typography>
              </Box>
              <Box
                sx={{
                  width: 56,
                  height: 56,
                  borderRadius: 2,
                  bgcolor: (theme) => summary.netWorth >= 0
                    ? alpha(theme.palette.success.main, 0.15)
                    : alpha(theme.palette.warning.main, 0.15),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Box 
                  component="i"
                  className={summary.netWorth >= 0 ? "ri-line-chart-line" : "ri-arrow-down-circle-line"} 
                  sx={{ fontSize: '28px', color: summary.netWorth >= 0 ? '#4caf50' : '#ff9800' }} 
                />
              </Box>
            </Box>
            
            <Stack spacing={1.5}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box component="i" className="ri-pie-chart-line" sx={{ fontSize: '16px', color: '#666' }} />
                  <Typography 
                    variant="body2" 
                    color="text.secondary"
                  >
                    Status
                  </Typography>
                </Box>
                <Chip 
                  label={summary.netWorth >= 0 ? 'Positive' : 'Needs Attention'}
                  size="small"
                  color={summary.netWorth >= 0 ? 'success' : 'warning'}
                  icon={<i className={summary.netWorth >= 0 ? "ri-checkbox-circle-line" : "ri-alert-line"} />}
                />
              </Box>
              
              {summary.highestAsset && (
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box component="i" className="ri-medal-line" sx={{ fontSize: '16px', color: '#666' }} />
                    <Typography 
                      variant="body2" 
                      color="text.secondary"
                    >
                      Top Asset
                    </Typography>
                  </Box>
                  <Typography 
                    variant="body2" 
                    fontWeight={500} 
                    noWrap 
                    sx={{ 
                      maxWidth: '150px',
                    }}
                  >
                    {summary.highestAsset.name}
                  </Typography>
                </Box>
              )}
            </Stack>
          </MuiCard>
        </Grid>
      </Grid>

      {/* Charts Row */}
      {(assetChartData.categories.length > 0 || liabilityChartData.categories.length > 0) && (
        <Grid container spacing={3}>
          {assetChartData.categories.length > 0 && (
            <Grid size={{ xs: 12, md: 6 }}>
              <MuiCard sx={{ p: 3 }}>
                <ChartCard
                  title="Asset Distribution"
                  type="donut"
                  height={300}
                  series={assetChartData.values}
                  options={{
                    labels: assetChartData.categories.map((cat) => getCategoryLabel(cat, true)),
                    legend: {
                      position: 'bottom',
                    },
                    colors: ['#4caf50', '#2196f3', '#ff9800', '#9c27b0', '#f44336', '#00bcd4', '#8bc34a', '#ffc107', '#e91e63', '#607d8b'],
                    tooltip: {
                      y: {
                        formatter: (val: number) => {
                          const total = assetChartData.values.reduce((a, b) => a + b, 0);
                          const percentage = ((val / total) * 100).toFixed(2);
                          return `${formatCurrency(val)} (${percentage}%)`;
                        },
                      },
                    },
                    plotOptions: {
                      pie: {
                        donut: {
                          labels: {
                            show: true,
                            total: {
                              show: true,
                              label: 'Total Assets',
                              formatter: () => formatCurrency(summary.totalAssets),
                            },
                          },
                        },
                      },
                    },
                  }}
                />
              </MuiCard>
            </Grid>
          )}
          {liabilityChartData.categories.length > 0 && (
            <Grid size={{ xs: 12, md: 6 }}>
              <MuiCard sx={{ p: 3 }}>
                <ChartCard
                  title="Liabilities Distribution"
                  type="donut"
                  height={300}
                  series={liabilityChartData.values}
                  options={{
                    labels: liabilityChartData.categories.map((cat) => getCategoryLabel(cat, false)),
                    legend: {
                      position: 'bottom',
                    },
                    colors: ['#f44336', '#e91e63', '#ff5722', '#ff9800', '#ffc107'],
                    tooltip: {
                      y: {
                        formatter: (val: number) => {
                          const total = liabilityChartData.values.reduce((a, b) => a + b, 0);
                          const percentage = ((val / total) * 100).toFixed(2);
                          return `${formatCurrency(val)} (${percentage}%)`;
                        },
                      },
                    },
                    plotOptions: {
                      pie: {
                        donut: {
                          labels: {
                            show: true,
                            total: {
                              show: true,
                              label: 'Total Liabilities',
                              formatter: () => formatCurrency(summary.totalLiabilities),
                            },
                          },
                        },
                      },
                    },
                  }}
                />
      </MuiCard>
            </Grid>
          )}
        </Grid>
      )}

      {/* Dialogs */}
      <AssetFormDialog
        open={assetDialogOpen}
        onClose={() => {
          setAssetDialogOpen(false);
          setEditingAsset(null);
        }}
        onSubmit={handleAssetSubmit}
        initialAsset={editingAsset}
      />

      <LiabilityFormDialog
        open={liabilityDialogOpen}
        onClose={() => {
          setLiabilityDialogOpen(false);
          setEditingLiability(null);
        }}
        onSubmit={handleLiabilitySubmit}
        initialLiability={editingLiability}
      />
    </Stack>
  );
};

export default HomePage;
