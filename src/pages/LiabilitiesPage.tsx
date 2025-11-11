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
import { LiabilityList } from '../components/features';
import { MuiCard, Button } from '../components/common';
import { LiabilityFormDialog } from '../components/features/liabilities';
import { fetchLiabilities, createLiability, updateLiability, deleteLiability } from '../store/slices/liabilitySlice';
import { useAppDispatch, useAppSelector } from '../store';
import { formatCurrency, formatDate } from '../utils';
import type { Liability, LiabilityCreateInput, LiabilityUpdateInput } from '../types';

export const LiabilitiesPage = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { items, loading } = useAppSelector((state) => state.liabilities);

  const [liabilityDialogOpen, setLiabilityDialogOpen] = useState(false);
  const [editingLiability, setEditingLiability] = useState<Liability | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [liabilityToDelete, setLiabilityToDelete] = useState<Liability | null>(null);

  useEffect(() => {
    dispatch(fetchLiabilities());
  }, [dispatch]);

  // Calculate detailed liability metrics
  const liabilityMetrics = useMemo(() => {
    const totalBalance = items.reduce((sum, item) => sum + item.balance, 0);
    const liabilityCount = items.length;
    
    // Calculate average interest rate
    const itemsWithRate = items.filter((item) => typeof item.interestRate === 'number' && item.interestRate > 0);
    const averageRate =
      itemsWithRate.length > 0
        ? itemsWithRate.reduce((sum, item) => sum + (item.interestRate ?? 0), 0) / itemsWithRate.length
        : 0;
    
    // Find next due date
    const nextDueDate = items
      .map((item) => item.dueDate)
      .filter((date): date is string => Boolean(date))
      .sort()[0];
    
    // Calculate highest liability
    const highestLiability = items.length > 0 
      ? items.reduce((max, liability) => liability.balance > max.balance ? liability : max, items[0])
      : null;
    
    // Calculate average liability
    const avgLiability = items.length > 0 ? totalBalance / items.length : 0;
    
    return {
      totalBalance,
      liabilityCount,
      averageRate,
      nextDueDate,
      highestLiability,
      avgLiability,
      itemsWithRate: itemsWithRate.length,
    };
  }, [items]);

  const handleAddLiability = () => {
    setEditingLiability(null);
    setLiabilityDialogOpen(true);
  };

  const handleEditLiability = (liability: Liability) => {
    setEditingLiability(liability);
    setLiabilityDialogOpen(true);
  };

  const handleDeleteLiability = (liability: Liability) => {
    setLiabilityToDelete(liability);
    setDeleteDialogOpen(true);
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

  const handleConfirmDelete = async () => {
    if (!liabilityToDelete) return;
    
    try {
      await dispatch(deleteLiability(liabilityToDelete.id));
      setDeleteDialogOpen(false);
      setLiabilityToDelete(null);
      dispatch(fetchLiabilities());
    } catch (error) {
      console.error('Failed to delete liability:', error);
    }
  };

  return (
    <Stack spacing={3}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" fontWeight={700}>
          Liabilities
        </Typography>
        <Button
          variant="contained"
          color="error"
          startIcon={<i className="ri-add-line" style={{ fontSize: '18px' }} />}
          onClick={handleAddLiability}
          sx={{ textTransform: 'none' }}
        >
          Add Liability
        </Button>
      </Box>

      {/* Enhanced Liability Metrics Cards */}
      <Grid container spacing={3}>
        {/* Total Balance Card */}
        <Grid size={{ xs: 12, md: 3 }}>
          <MuiCard 
            sx={{ 
              p: 3,
              background: (theme) => `linear-gradient(135deg, ${alpha(theme.palette.error.main, 0.1)} 0%, ${alpha(theme.palette.error.main, 0.05)} 100%)`,
              border: (theme) => `1px solid ${alpha(theme.palette.error.main, 0.2)}`,
              height: '100%',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: 2,
                  bgcolor: (theme) => alpha(theme.palette.error.main, 0.15),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <i className="ri-bank-card-line" style={{ fontSize: '24px', color: '#f44336' }} />
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary" fontWeight={500}>
                  Total Balance
                </Typography>
                <Typography variant="h4" color="error.main" fontWeight={700}>
                  {formatCurrency(liabilityMetrics.totalBalance)}
                </Typography>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <i className="ri-file-list-line" style={{ fontSize: '16px', color: '#666' }} />
              <Typography variant="body2" color="text.secondary">
                {liabilityMetrics.liabilityCount} {liabilityMetrics.liabilityCount !== 1 ? 'liabilities' : 'liability'} outstanding
              </Typography>
            </Box>
          </MuiCard>
        </Grid>

        {/* Liability Count Card */}
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
                <i className="ri-list-check" style={{ fontSize: '24px', color: '#ff9800' }} />
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary" fontWeight={500}>
                  Total Items
                </Typography>
                <Typography variant="h4" color="warning.main" fontWeight={700}>
                  {liabilityMetrics.liabilityCount}
                </Typography>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <i className="ri-calculator-line" style={{ fontSize: '16px', color: '#666' }} />
              <Typography variant="body2" color="text.secondary">
                Avg: {formatCurrency(liabilityMetrics.avgLiability)}
              </Typography>
            </Box>
          </MuiCard>
        </Grid>

        {/* Interest Rate Card */}
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
                <i className="ri-percent-line" style={{ fontSize: '24px', color: '#0288d1' }} />
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary" fontWeight={500}>
                  Avg Interest
                </Typography>
                <Typography variant="h4" color="info.main" fontWeight={700}>
                  {liabilityMetrics.averageRate > 0 ? `${liabilityMetrics.averageRate.toFixed(2)}%` : '—'}
                </Typography>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <i className="ri-scales-line" style={{ fontSize: '16px', color: '#666' }} />
              <Typography variant="body2" color="text.secondary">
                {liabilityMetrics.itemsWithRate > 0 
                  ? `${liabilityMetrics.itemsWithRate} with interest`
                  : 'No interest rates'
                }
              </Typography>
            </Box>
          </MuiCard>
        </Grid>

        {/* Highest Liability / Next Due Card */}
        <Grid size={{ xs: 12, md: 3 }}>
          <MuiCard 
            sx={{ 
              p: 3,
              background: (theme) => `linear-gradient(135deg, ${alpha(theme.palette.secondary.main, 0.1)} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`,
              border: (theme) => `1px solid ${alpha(theme.palette.secondary.main, 0.2)}`,
              height: '100%',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: 2,
                  bgcolor: (theme) => alpha(theme.palette.secondary.main, 0.15),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <i className="ri-alert-line" style={{ fontSize: '24px', color: '#9c27b0' }} />
              </Box>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="caption" color="text.secondary" fontWeight={500}>
                  Highest Debt
                </Typography>
                <Typography variant="h6" fontWeight={700} color="secondary.main" noWrap>
                  {liabilityMetrics.highestLiability ? liabilityMetrics.highestLiability.name : 'N/A'}
                </Typography>
              </Box>
            </Box>
            {liabilityMetrics.highestLiability ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <i className="ri-price-tag-3-line" style={{ fontSize: '16px', color: '#666' }} />
                <Typography variant="body2" color="text.secondary">
                  {formatCurrency(liabilityMetrics.highestLiability.balance)}
                </Typography>
              </Box>
            ) : liabilityMetrics.nextDueDate ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <i className="ri-calendar-line" style={{ fontSize: '16px', color: '#666' }} />
                <Typography variant="body2" color="text.secondary">
                  Next due: {formatDate(liabilityMetrics.nextDueDate)}
                </Typography>
              </Box>
            ) : null}
          </MuiCard>
        </Grid>
      </Grid>

      <LiabilityList
        liabilities={items}
        loading={loading}
        onSelectLiability={(id) => navigate(`/liabilities/${id}`)}
        onEditLiability={handleEditLiability}
        onDeleteLiability={handleDeleteLiability}
      />

      {/* Liability Form Dialog */}
      <LiabilityFormDialog
        open={liabilityDialogOpen}
        onClose={() => {
          setLiabilityDialogOpen(false);
          setEditingLiability(null);
        }}
        onSubmit={handleLiabilitySubmit}
        initialLiability={editingLiability}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete &quot;{liabilityToDelete?.name}&quot;? This action cannot be undone.
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

export default LiabilitiesPage;

