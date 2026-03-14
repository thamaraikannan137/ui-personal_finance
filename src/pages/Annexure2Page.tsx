import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box, Typography, Button, Alert, CircularProgress, Accordion,
  AccordionSummary, AccordionDetails, TextField, Grid, Divider,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { CertificateStepper } from '../components/features/certificates/CertificateStepper';
import SaveIcon from '@mui/icons-material/Save';
import { useAppDispatch, useAppSelector } from '../store';
import { fetchAnnexure2, saveAnnexure2 } from '../store/slices/annexure2Slice';
import type { Annexure2 } from '../types/networth';
import { useForm } from 'react-hook-form';

const FamilySubForm = ({ prefix, register }: { prefix: string; register: ReturnType<typeof useForm>['register'] }) => (
  <Grid container spacing={2}>
    {(['self', 'spouse', 'children'] as const).map((member) => (
      <Grid size={4} key={member}>
        <Typography variant="caption" textTransform="capitalize" fontWeight={600}>{member}</Typography>
        <TextField label="Held With" size="small" fullWidth sx={{ mt: 0.5 }} {...register(`${prefix}.${member}.heldWith`)} />
        <TextField label="Date of Investment" type="date" size="small" fullWidth sx={{ mt: 1 }} InputLabelProps={{ shrink: true }} {...register(`${prefix}.${member}.dateOfInvestment`)} />
        <TextField label="Value at Cost (₹ Lacs)" type="number" size="small" fullWidth sx={{ mt: 1 }} inputProps={{ step: '0.01' }} {...register(`${prefix}.${member}.valueAtCost`, { valueAsNumber: true })} />
        <TextField label="Present Value (₹ Lacs)" type="number" size="small" fullWidth sx={{ mt: 1 }} inputProps={{ step: '0.01' }} {...register(`${prefix}.${member}.presentValue`, { valueAsNumber: true })} />
      </Grid>
    ))}
  </Grid>
);

export const Annexure2Page = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { data, loading, error } = useAppSelector((s) => s.annexure2);
  const [saving, setSaving] = useState(false);

  const { register, handleSubmit, reset } = useForm<Partial<Annexure2>>({
    defaultValues: data ?? {},
  });

  useEffect(() => {
    if (id) dispatch(fetchAnnexure2(id));
  }, [dispatch, id]);

  useEffect(() => {
    if (data) reset(data);
  }, [data, reset]);

  const onSubmit = async (formData: Partial<Annexure2>) => {
    if (!id) return;
    setSaving(true);
    await dispatch(saveAnnexure2({ certificateId: id, data: formData }));
    setSaving(false);
  };

  if (loading && !data) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}><CircularProgress /></Box>;
  }

  const sections = [
    { label: 'PPF', prefix: 'ppf', total: data?.ppf?.total ?? 0, component: 'family' },
    { label: 'Pension Scheme', prefix: 'pensionScheme', total: data?.pensionScheme?.total ?? 0, component: 'family' },
    { label: 'Fixed Deposit', prefix: 'fixedDeposit', total: data?.fixedDeposit?.total ?? 0, component: 'family' },
    { label: 'Recurring Deposit', prefix: 'recurringDeposit', total: data?.recurringDeposit?.total ?? 0, component: 'family' },
    { label: 'Other Deposit', prefix: 'otherDeposit', total: data?.otherDeposit?.total ?? 0, component: 'family' },
  ];

  return (
    <Box sx={{ p: 3 }}>
      <CertificateStepper certificateId={id!} activeStep={1} />
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Button startIcon={<ArrowBackIcon />} variant="text" onClick={() => navigate(`/certificates/${id}/annexure1`)}>
            Back
          </Button>
          <Typography variant="h5" fontWeight={700}>Annexure-2 — Movable Property</Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button startIcon={<SaveIcon />} variant="outlined" onClick={handleSubmit(onSubmit)} disabled={saving}>
            {saving ? 'Saving...' : 'Save All'}
          </Button>
          <Button endIcon={<ArrowForwardIcon />} variant="contained" onClick={() => navigate(`/certificates/${id}/liabilities`)}>
            Next: Liabilities
          </Button>
        </Box>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Box sx={{ mb: 2, p: 1.5, bgcolor: 'success.50', borderRadius: 1 }}>
        <Typography fontWeight={700} color="success.main">
          Grand Total (B): ₹ {(data?.grandTotal ?? 0).toFixed(2)} Lacs
        </Typography>
      </Box>

      <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        {sections.map((sec) => (
          <Accordion key={sec.prefix}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', pr: 2 }}>
                <Typography fontWeight={600}>{sec.label}</Typography>
                <Typography color="text.secondary">₹ {sec.total.toFixed(2)} Lacs</Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <FamilySubForm prefix={sec.prefix} register={register} />
            </AccordionDetails>
          </Accordion>
        ))}

        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', pr: 2 }}>
              <Typography fontWeight={600}>HUF Investment</Typography>
              <Typography color="text.secondary">₹ {(data?.huf?.total ?? 0).toFixed(2)} Lacs</Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={2}>
              <Grid size={4}><TextField label="HUF Name" size="small" fullWidth {...register('huf.hufName')} /></Grid>
              <Grid size={4}><TextField label="Value at Cost (₹ Lacs)" type="number" size="small" fullWidth inputProps={{ step: '0.01' }} {...register('huf.valueAtCost', { valueAsNumber: true })} /></Grid>
              <Grid size={4}><TextField label="Present Value (₹ Lacs)" type="number" size="small" fullWidth inputProps={{ step: '0.01' }} {...register('huf.presentValue', { valueAsNumber: true })} /></Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>

        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', pr: 2 }}>
              <Typography fontWeight={600}>Gold & Jewellery</Typography>
              <Typography color="text.secondary">₹ {(data?.goldAndJewelleryTotal ?? 0).toFixed(2)} Lacs</Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="caption" color="text.secondary">
              Use "Save All" after editing. Gold rows are managed via bulk save.
            </Typography>
            {(data?.goldAndJewellery ?? []).map((_, i) => (
              <Grid container spacing={2} key={i} sx={{ mt: 1 }}>
                <Grid size={4}><TextField label="Description" size="small" fullWidth {...register(`goldAndJewellery.${i}.description`)} /></Grid>
                <Grid size={3}><TextField label="Weight (grams)" type="number" size="small" fullWidth {...register(`goldAndJewellery.${i}.weightGrams`, { valueAsNumber: true })} /></Grid>
                <Grid size={2.5}><TextField label="Value at Cost" type="number" size="small" fullWidth inputProps={{ step: '0.01' }} {...register(`goldAndJewellery.${i}.valueAtCost`, { valueAsNumber: true })} /></Grid>
                <Grid size={2.5}><TextField label="Present Value" type="number" size="small" fullWidth inputProps={{ step: '0.01' }} {...register(`goldAndJewellery.${i}.presentValue`, { valueAsNumber: true })} /></Grid>
              </Grid>
            ))}
          </AccordionDetails>
        </Accordion>

        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', pr: 2 }}>
              <Typography fontWeight={600}>Vehicles</Typography>
              <Typography color="text.secondary">₹ {(data?.vehicles?.total ?? 0).toFixed(2)} Lacs</Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="subtitle2" mb={1}>Two-Wheelers</Typography>
            {[0, 1].map((i) => (
              <Grid container spacing={2} key={i} sx={{ mb: 1 }}>
                <Grid size={3}><TextField label="Vehicle No." size="small" fullWidth {...register(`vehicles.twoWheelers.${i}.vehicleNo`)} /></Grid>
                <Grid size={3}><TextField label="Make" size="small" fullWidth {...register(`vehicles.twoWheelers.${i}.make`)} /></Grid>
                <Grid size={3}><TextField label="Model" size="small" fullWidth {...register(`vehicles.twoWheelers.${i}.model`)} /></Grid>
                <Grid size={3}><TextField label="Present Value" type="number" size="small" fullWidth inputProps={{ step: '0.01' }} {...register(`vehicles.twoWheelers.${i}.presentValue`, { valueAsNumber: true })} /></Grid>
              </Grid>
            ))}
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle2" mb={1}>Four-Wheelers</Typography>
            {[0, 1].map((i) => (
              <Grid container spacing={2} key={i} sx={{ mb: 1 }}>
                <Grid size={3}><TextField label="Vehicle No." size="small" fullWidth {...register(`vehicles.fourWheelers.${i}.vehicleNo`)} /></Grid>
                <Grid size={3}><TextField label="Make" size="small" fullWidth {...register(`vehicles.fourWheelers.${i}.make`)} /></Grid>
                <Grid size={3}><TextField label="Model" size="small" fullWidth {...register(`vehicles.fourWheelers.${i}.model`)} /></Grid>
                <Grid size={3}><TextField label="Present Value" type="number" size="small" fullWidth inputProps={{ step: '0.01' }} {...register(`vehicles.fourWheelers.${i}.presentValue`, { valueAsNumber: true })} /></Grid>
              </Grid>
            ))}
          </AccordionDetails>
        </Accordion>
      </Box>
    </Box>
  );
};
