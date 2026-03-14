import {
  Drawer, Box, Typography, TextField, MenuItem, Button, Divider, Grid,
} from '@mui/material';
import { useForm, useWatch } from 'react-hook-form';
import { useEffect } from 'react';
import type { PropertyRow } from '../../../types/networth';

interface PropertyDrawerFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: PropertyRow) => void;
  initialData?: PropertyRow | null;
  section: 'bySelf' | 'bySharing';
  loading?: boolean;
}

const NATURE_OPTIONS = ['Flat', 'Land', 'Shop', 'Factory', 'House', 'Other'];

export const PropertyDrawerForm = ({
  open, onClose, onSubmit, initialData, section, loading,
}: PropertyDrawerFormProps) => {
  const { register, handleSubmit, reset, control } = useForm<PropertyRow>({
    defaultValues: initialData ?? {},
  });

  useEffect(() => {
    if (open) {
      reset(initialData ?? {});
    }
  }, [open, initialData, reset]);

  const watched = useWatch({ control, name: ['otherSources', 'loanSource'] });
  const otherSources = watched[0];
  const loanSource = watched[1];

  const totalOtherSources = Number(
    ((otherSources?.salary ?? 0) +
     (otherSources?.withdrawalFromSB ?? 0) +
     (otherSources?.withdrawalFromFD ?? 0) +
     (otherSources?.otherSource ?? 0)).toFixed(2)
  );
  const totalSourceOfFund = Number(
    ((loanSource?.loanAmountReceived ?? 0) + totalOtherSources).toFixed(2)
  );

  const handleFormSubmit = (data: PropertyRow) => {
    const enriched: PropertyRow = {
      ...data,
      otherSources: {
        ...data.otherSources,
        totalOtherSources,
      },
      totalSourceOfFund,
    };
    onSubmit(enriched);
  };

  return (
    <Drawer anchor="right" open={open} onClose={onClose}>
      <Box
        component="form"
        onSubmit={handleSubmit(handleFormSubmit)}
        sx={{ width: 480, p: 3, height: '100%', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 2 }}
      >
        <Typography variant="h6">
          {initialData?._id ? 'Edit Property' : 'Add Property'} ({section === 'bySelf' ? 'By Self' : 'By Sharing'})
        </Typography>

        <TextField select label="Nature of Property" size="small" {...register('natureOfProperty')} defaultValue={initialData?.natureOfProperty ?? ''}>
          {NATURE_OPTIONS.map((o) => <MenuItem key={o} value={o}>{o}</MenuItem>)}
        </TextField>
        <TextField label="Location / Address" multiline rows={2} size="small" {...register('locationAddress')} />
        <TextField label="Date of Purchase" type="date" size="small" InputLabelProps={{ shrink: true }} {...register('dateOfPurchase')} />

        <Divider>Property Cost</Divider>
        <Grid container spacing={2}>
          <Grid size={4}><TextField label="Property Cost (₹ Lacs)" type="number" size="small" fullWidth inputProps={{ step: '0.01' }} {...register('propertyCost', { valueAsNumber: true })} /></Grid>
          <Grid size={4}><TextField label="Registration Charges" type="number" size="small" fullWidth inputProps={{ step: '0.01' }} {...register('registrationCharges', { valueAsNumber: true })} /></Grid>
          <Grid size={4}><TextField label="Stamp Charges" type="number" size="small" fullWidth inputProps={{ step: '0.01' }} {...register('stampCharges', { valueAsNumber: true })} /></Grid>
        </Grid>
        <TextField label="Value at Cost (₹ Lacs)" type="number" size="small" inputProps={{ step: '0.01' }} {...register('valueAtCost', { valueAsNumber: true })} />
        <TextField label="Vendor Name" size="small" {...register('vendorName')} />
        <TextField label="Vendor PAN" size="small" inputProps={{ style: { textTransform: 'uppercase' } }} {...register('vendorPan')} />

        <Divider>Source of Funds — Loan</Divider>
        <TextField label="Bank Name" size="small" {...register('loanSource.bankName')} />
        <Grid container spacing={2}>
          <Grid size={6}><TextField label="Loan Amount (₹ Lacs)" type="number" size="small" fullWidth inputProps={{ step: '0.01' }} {...register('loanSource.loanAmountReceived', { valueAsNumber: true })} /></Grid>
          <Grid size={6}><TextField label="Outstanding Loan (₹ Lacs)" type="number" size="small" fullWidth inputProps={{ step: '0.01' }} {...register('loanSource.outstandingLoanAmount', { valueAsNumber: true })} /></Grid>
        </Grid>
        <TextField label="Sanction Letter Ref." size="small" {...register('loanSource.sanctionLetterRef')} />
        <TextField label="Date of Loan Received" type="date" size="small" InputLabelProps={{ shrink: true }} {...register('loanSource.dateOfLoanReceived')} />

        <Divider>Source of Funds — Others</Divider>
        <Grid container spacing={2}>
          <Grid size={6}><TextField label="Salary (₹ Lacs)" type="number" size="small" fullWidth inputProps={{ step: '0.01' }} {...register('otherSources.salary', { valueAsNumber: true })} /></Grid>
          <Grid size={6}><TextField label="SB Withdrawal (₹ Lacs)" type="number" size="small" fullWidth inputProps={{ step: '0.01' }} {...register('otherSources.withdrawalFromSB', { valueAsNumber: true })} /></Grid>
          <Grid size={6}><TextField label="FD Withdrawal (₹ Lacs)" type="number" size="small" fullWidth inputProps={{ step: '0.01' }} {...register('otherSources.withdrawalFromFD', { valueAsNumber: true })} /></Grid>
          <Grid size={6}><TextField label="Other Source (₹ Lacs)" type="number" size="small" fullWidth inputProps={{ step: '0.01' }} {...register('otherSources.otherSource', { valueAsNumber: true })} /></Grid>
          <Grid size={12}>
            <TextField
              label="Total of Other Sources (₹ Lacs)"
              size="small"
              fullWidth
              value={totalOtherSources.toFixed(2)}
              InputProps={{ readOnly: true }}
              sx={{ bgcolor: 'action.hover' }}
            />
          </Grid>
        </Grid>

        <TextField
          label="Total Source of Fund (Loan + Others) (₹ Lacs)"
          size="small"
          fullWidth
          value={totalSourceOfFund.toFixed(2)}
          InputProps={{ readOnly: true }}
          sx={{ bgcolor: 'primary.50', fontWeight: 700 }}
        />

        {section === 'bySharing' && (
          <>
            <Divider>Sharing Details</Divider>
            <TextField label="Co-owner Name" size="small" {...register('sharingPersonName')} />
            <TextField label="Co-owner PAN" size="small" {...register('sharingPersonPan')} />
            <TextField label="Share %" type="number" size="small" inputProps={{ min: 0, max: 100 }} {...register('sharePercentage', { valueAsNumber: true })} />
          </>
        )}

        <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
          <Button variant="outlined" onClick={onClose} fullWidth disabled={loading}>Cancel</Button>
          <Button type="submit" variant="contained" fullWidth disabled={loading}>
            {loading ? 'Saving...' : 'Save Property'}
          </Button>
        </Box>
      </Box>
    </Drawer>
  );
};
