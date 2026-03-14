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
import type { GuarantorItem } from '../../../types/networth';

const PURPOSE_OPTIONS = ['Term Loan', 'Vehicles', 'Cash Credit', 'Other'];

interface GuarantorTableProps {
  items: GuarantorItem[];
  onAdd: (item: GuarantorItem) => void;
  onUpdate: (itemId: string, data: Partial<GuarantorItem>) => void;
  onDelete: (itemId: string) => void;
}

export const GuarantorTable = ({ items, onAdd, onUpdate, onDelete }: GuarantorTableProps) => {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<GuarantorItem | null>(null);
  const { register, handleSubmit, reset } = useForm<GuarantorItem>();

  const openAdd = () => { setEditing(null); reset({}); setOpen(true); };
  const openEdit = (item: GuarantorItem) => { setEditing(item); reset(item); setOpen(true); };

  const handleFormSubmit = (data: GuarantorItem) => {
    if (editing?._id) onUpdate(editing._id, data);
    else onAdd(data);
    setOpen(false);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
        <Button size="small" startIcon={<AddIcon />} variant="outlined" onClick={openAdd}>
          Add Guarantor
        </Button>
      </Box>

      <TableContainer component={Paper} variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Guaranteed To</TableCell>
              <TableCell>Borrowings By</TableCell>
              <TableCell>Purpose</TableCell>
              <TableCell align="right">Amount (₹ Lacs)</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 3, color: 'text.secondary' }}>
                  No guarantor details added
                </TableCell>
              </TableRow>
            ) : (
              items.map((item, idx) => (
                <TableRow key={item._id ?? idx} hover>
                  <TableCell>{item.guaranteedTo ?? '—'}</TableCell>
                  <TableCell>{item.borrowingsBy ?? '—'}</TableCell>
                  <TableCell>{item.purpose ?? '—'}</TableCell>
                  <TableCell align="right">{(item.amountGuaranteed ?? 0).toFixed(2)}</TableCell>
                  <TableCell align="right">
                    <Tooltip title="Edit"><IconButton size="small" onClick={() => openEdit(item)}><EditIcon fontSize="small" /></IconButton></Tooltip>
                    <Tooltip title="Delete"><IconButton size="small" color="error" onClick={() => onDelete(item._id!)}><DeleteIcon fontSize="small" /></IconButton></Tooltip>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editing?._id ? 'Edit Guarantor' : 'Add Guarantor'}</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <Grid container spacing={2}>
              <Grid size={12}><TextField label="Guaranteed To" fullWidth size="small" {...register('guaranteedTo')} /></Grid>
              <Grid size={12}><TextField label="Borrowings By" fullWidth size="small" {...register('borrowingsBy')} /></Grid>
              <Grid size={6}>
                <TextField select label="Purpose" fullWidth size="small" {...register('purpose')} defaultValue={editing?.purpose ?? ''}>
                  {PURPOSE_OPTIONS.map((o) => <MenuItem key={o} value={o}>{o}</MenuItem>)}
                </TextField>
              </Grid>
              <Grid size={6}><TextField label="Amount Guaranteed (₹ Lacs)" type="number" fullWidth size="small" inputProps={{ step: '0.01' }} {...register('amountGuaranteed', { valueAsNumber: true })} /></Grid>
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
