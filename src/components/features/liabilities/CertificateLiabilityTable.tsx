import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, IconButton, Tooltip, Button, Box, MenuItem, TextField, Grid,
  Dialog, DialogTitle, DialogContent, DialogActions,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import type { LiabilityItem } from '../../../types/networth';

const PURPOSE_OPTIONS = ['Housing', 'Vehicle', 'Business', 'Personal', 'Other'];

interface CertificateLiabilityTableProps {
  items: LiabilityItem[];
  total: number;
  onAdd: (item: LiabilityItem) => void;
  onUpdate: (itemId: string, data: Partial<LiabilityItem>) => void;
  onDelete: (itemId: string) => void;
}

export const CertificateLiabilityTable = ({ items, total, onAdd, onUpdate, onDelete }: CertificateLiabilityTableProps) => {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<LiabilityItem | null>(null);
  const { register, handleSubmit, reset } = useForm<LiabilityItem>();

  const openAdd = () => { setEditing(null); reset({}); setOpen(true); };
  const openEdit = (item: LiabilityItem) => { setEditing(item); reset(item); setOpen(true); };

  const handleFormSubmit = (data: LiabilityItem) => {
    if (editing?._id) onUpdate(editing._id, data);
    else onAdd(data);
    setOpen(false);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
        <Button size="small" startIcon={<AddIcon />} variant="outlined" onClick={openAdd}>
          Add Liability
        </Button>
      </Box>

      <TableContainer component={Paper} variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Borrowed From</TableCell>
              <TableCell>Purpose</TableCell>
              <TableCell>Securities</TableCell>
              <TableCell align="right">Amount (₹ Lacs)</TableCell>
              <TableCell align="right">Outstanding (₹ Lacs)</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 3, color: 'text.secondary' }}>
                  No liabilities added
                </TableCell>
              </TableRow>
            ) : (
              items.map((item, idx) => (
                <TableRow key={item._id ?? idx} hover>
                  <TableCell>{item.borrowedFrom ?? '—'}</TableCell>
                  <TableCell>{item.purpose ?? '—'}</TableCell>
                  <TableCell>{item.securitiesOffered ?? '—'}</TableCell>
                  <TableCell align="right">{(item.amountBorrowed ?? 0).toFixed(2)}</TableCell>
                  <TableCell align="right">{(item.outstandingAmount ?? 0).toFixed(2)}</TableCell>
                  <TableCell align="right">
                    <Tooltip title="Edit"><IconButton size="small" onClick={() => openEdit(item)}><EditIcon fontSize="small" /></IconButton></Tooltip>
                    <Tooltip title="Delete"><IconButton size="small" color="error" onClick={() => onDelete(item._id!)}><DeleteIcon fontSize="small" /></IconButton></Tooltip>
                  </TableCell>
                </TableRow>
              ))
            )}
            {items.length > 0 && (
              <TableRow>
                <TableCell colSpan={4} />
                <TableCell align="right" sx={{ fontWeight: 700 }}>Total: ₹ {total.toFixed(2)}</TableCell>
                <TableCell />
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editing?._id ? 'Edit Liability' : 'Add Liability'}</DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ pt: 1 }}>
            <Grid container spacing={2}>
              <Grid size={12}><TextField label="Borrowed From" fullWidth size="small" {...register('borrowedFrom')} /></Grid>
              <Grid size={6}>
                <TextField select label="Purpose" fullWidth size="small" {...register('purpose')} defaultValue={editing?.purpose ?? ''}>
                  {PURPOSE_OPTIONS.map((o) => <MenuItem key={o} value={o}>{o}</MenuItem>)}
                </TextField>
              </Grid>
              <Grid size={6}><TextField label="Securities Offered" fullWidth size="small" {...register('securitiesOffered')} /></Grid>
              <Grid size={6}><TextField label="Amount Borrowed (₹ Lacs)" type="number" fullWidth size="small" inputProps={{ step: '0.01' }} {...register('amountBorrowed', { valueAsNumber: true })} /></Grid>
              <Grid size={6}><TextField label="Outstanding Amount (₹ Lacs)" type="number" fullWidth size="small" inputProps={{ step: '0.01' }} {...register('outstandingAmount', { valueAsNumber: true })} /></Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit(handleFormSubmit)}>Save</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
