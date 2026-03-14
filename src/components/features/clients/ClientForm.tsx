import { useForm } from 'react-hook-form';
import {
  Box, Grid, TextField, Button, Typography, Divider, Checkbox, FormControlLabel,
} from '@mui/material';
import type { Client } from '../../../types/networth';
import { useState } from 'react';

type ClientFormData = Omit<Client, 'id' | 'auditorId' | 'isActive' | 'createdAt' | 'updatedAt'>;

interface ClientFormProps {
  initialData?: Partial<Client>;
  onSubmit: (data: ClientFormData) => void;
  onCancel: () => void;
  loading?: boolean;
}

interface AddressFieldsProps {
  prefix: 'permanentAddress' | 'officeAddress';
  register: ReturnType<typeof useForm<ClientFormData>>['register'];
  errors: ReturnType<typeof useForm<ClientFormData>>['formState']['errors'];
}

const AddressFields = ({ prefix, register, errors }: AddressFieldsProps) => (
  <Grid container spacing={2}>
    <Grid size={6}>
      <TextField
        label="Address Line 1"
        fullWidth
        size="small"
        {...register(`${prefix}.line1`)}
      />
    </Grid>
    <Grid size={6}>
      <TextField
        label="Address Line 2"
        fullWidth
        size="small"
        {...register(`${prefix}.line2`)}
      />
    </Grid>
    <Grid size={4}>
      <TextField
        label="City"
        fullWidth
        size="small"
        {...register(`${prefix}.city`)}
      />
    </Grid>
    <Grid size={4}>
      <TextField
        label="State"
        fullWidth
        size="small"
        {...register(`${prefix}.state`)}
      />
    </Grid>
    <Grid size={4}>
      <TextField
        label="Pincode"
        fullWidth
        size="small"
        inputProps={{ maxLength: 6 }}
        {...register(`${prefix}.pincode`, {
          pattern: { value: /^\d{6}$/, message: 'Must be 6 digits' },
        })}
        error={!!errors?.[prefix]?.pincode}
        helperText={errors?.[prefix]?.pincode?.message}
      />
    </Grid>
  </Grid>
);

export const ClientForm = ({ initialData, onSubmit, onCancel, loading }: ClientFormProps) => {
  const [sameAddress, setSameAddress] = useState(false);

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<ClientFormData>({
    defaultValues: {
      name: initialData?.name ?? '',
      pan: initialData?.pan ?? '',
      dateOfBirth: initialData?.dateOfBirth?.split('T')[0] ?? '',
      email: initialData?.email ?? '',
      phone: initialData?.phone ?? '',
      permanentAddress: initialData?.permanentAddress ?? {},
      officeAddress: initialData?.officeAddress ?? {},
    },
  });

  const permanentAddress = watch('permanentAddress');

  const handleSameAddress = (checked: boolean) => {
    setSameAddress(checked);
    if (checked && permanentAddress) {
      setValue('officeAddress', { ...permanentAddress });
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ pt: 1 }}>
      <Typography variant="subtitle1" fontWeight={600} mb={2}>Personal Details</Typography>
      <Grid container spacing={2}>
        <Grid size={4}>
          <TextField
            label="Full Name *"
            fullWidth
            size="small"
            {...register('name', { required: 'Name is required' })}
            error={!!errors.name}
            helperText={errors.name?.message}
          />
        </Grid>
        <Grid size={4}>
          <TextField
            label="PAN"
            fullWidth
            size="small"
            inputProps={{ maxLength: 10, style: { textTransform: 'uppercase' } }}
            {...register('pan', {
              pattern: { value: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, message: 'Invalid PAN format (e.g. ABCDE1234F)' },
            })}
            error={!!errors.pan}
            helperText={errors.pan?.message}
          />
        </Grid>
        <Grid size={4}>
          <TextField
            label="Date of Birth"
            type="date"
            fullWidth
            size="small"
            InputLabelProps={{ shrink: true }}
            {...register('dateOfBirth')}
          />
        </Grid>
        <Grid size={6}>
          <TextField
            label="Email"
            type="email"
            fullWidth
            size="small"
            {...register('email', {
              pattern: { value: /^\S+@\S+\.\S+$/, message: 'Invalid email' },
            })}
            error={!!errors.email}
            helperText={errors.email?.message}
          />
        </Grid>
        <Grid size={6}>
          <TextField
            label="Phone"
            fullWidth
            size="small"
            inputProps={{ maxLength: 10 }}
            {...register('phone', {
              pattern: { value: /^[0-9]{10}$/, message: 'Must be 10 digits' },
            })}
            error={!!errors.phone}
            helperText={errors.phone?.message}
          />
        </Grid>
      </Grid>

      <Divider sx={{ my: 3 }} />
      <Typography variant="subtitle1" fontWeight={600} mb={2}>Permanent Address</Typography>
      <AddressFields prefix="permanentAddress" register={register} errors={errors} />

      <Divider sx={{ my: 3 }} />
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 1 }}>
        <Typography variant="subtitle1" fontWeight={600}>Office Address</Typography>
        <FormControlLabel
          control={
            <Checkbox
              size="small"
              checked={sameAddress}
              onChange={(e) => handleSameAddress(e.target.checked)}
            />
          }
          label="Same as Permanent Address"
          sx={{ ml: 2 }}
        />
      </Box>
      <AddressFields prefix="officeAddress" register={register} errors={errors} />

      <Box sx={{ display: 'flex', gap: 2, mt: 4, justifyContent: 'flex-end' }}>
        <Button variant="outlined" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
        <Button type="submit" variant="contained" disabled={loading}>
          {loading ? 'Saving...' : 'Save Client'}
        </Button>
      </Box>
    </Box>
  );
};
