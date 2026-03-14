import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box, Typography, Paper, Grid, Chip, CircularProgress, Alert, Button,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import { useAppDispatch, useAppSelector } from '../store';
import { fetchClientById } from '../store/slices/clientSlice';
import { fetchCertificatesByClient, createCertificate, deleteCertificate } from '../store/slices/certificateSlice';
import { CertificateHistoryTable } from '../components/features/clients/CertificateHistoryTable';
import { certificateService } from '../services/certificateService';
import type { NetWorthCertificate } from '../types/networth';

const FY_OPTIONS = Array.from({ length: 5 }, (_, i) => {
  const year = new Date().getFullYear() - i;
  return `FY ${year}-${String(year + 1).slice(2)}`;
});

export const ClientDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { selectedClient, loading: clientLoading } = useAppSelector((s) => s.clients);
  const { items: certificates, loading: certLoading } = useAppSelector((s) => s.certificates);
  const [newCertOpen, setNewCertOpen] = useState(false);
  const [financialYear, setFinancialYear] = useState(FY_OPTIONS[0] ?? '');
  const [asOnDate, setAsOnDate] = useState(new Date().toISOString().split('T')[0] ?? '');
  const [certError, setCertError] = useState('');

  useEffect(() => {
    if (id) {
      dispatch(fetchClientById(id));
      dispatch(fetchCertificatesByClient({ clientId: id }));
    }
  }, [dispatch, id]);

  const handleNewCert = async () => {
    if (!id) return;
    setCertError('');
    const result = await dispatch(createCertificate({ clientId: id, financialYear, asOnDate }));
    if (createCertificate.fulfilled.match(result)) {
      setNewCertOpen(false);
      navigate(`/certificates/${result.payload.id}/annexure1`);
    } else {
      const msg = (result.payload as string) ?? result.error?.message ?? 'Failed to create certificate';
      setCertError(msg);
    }
  };

  const handleDelete = (cert: NetWorthCertificate) => {
    if (confirm(`Delete certificate for ${cert.financialYear}?`)) {
      dispatch(deleteCertificate(cert.id)).then(() => {
        if (id) dispatch(fetchCertificatesByClient({ clientId: id }));
      });
    }
  };

  if (clientLoading && !selectedClient) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}><CircularProgress /></Box>;
  }

  const client = selectedClient;
  const addr = client?.permanentAddress;

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" fontWeight={700}>{client?.name}</Typography>
        <Button startIcon={<EditIcon />} onClick={() => navigate(`/clients/${id}/edit`)}>
          Edit Client
        </Button>
      </Box>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={3}>
          <Grid size={3}>
            <Typography variant="caption" color="text.secondary">PAN</Typography>
            <Typography fontFamily="monospace">{client?.pan}</Typography>
          </Grid>
          <Grid size={3}>
            <Typography variant="caption" color="text.secondary">Date of Birth</Typography>
            <Typography>{client?.dateOfBirth ? new Date(client.dateOfBirth).toLocaleDateString('en-IN') : '—'}</Typography>
          </Grid>
          <Grid size={3}>
            <Typography variant="caption" color="text.secondary">Phone</Typography>
            <Typography>{client?.phone || '—'}</Typography>
          </Grid>
          <Grid size={3}>
            <Typography variant="caption" color="text.secondary">Email</Typography>
            <Typography>{client?.email || '—'}</Typography>
          </Grid>
          {addr && (
            <Grid size={6}>
              <Typography variant="caption" color="text.secondary">Permanent Address</Typography>
              <Typography>
                {[addr.line1, addr.city, addr.state, addr.pincode].filter(Boolean).join(', ')}
              </Typography>
            </Grid>
          )}
          <Grid size={2}>
            <Typography variant="caption" color="text.secondary">Status</Typography>
            <Box mt={0.5}>
              <Chip label={client?.isActive ? 'Active' : 'Inactive'} color={client?.isActive ? 'success' : 'default'} size="small" />
            </Box>
          </Grid>
        </Grid>
      </Paper>

      <Typography variant="h6" fontWeight={600} mb={2}>Net Worth Certificates</Typography>
      {certLoading ? (
        <CircularProgress size={24} />
      ) : (
        <CertificateHistoryTable
          certificates={certificates}
          onOpen={(cert) => navigate(`/certificates/${cert.id}`)}
          onDelete={handleDelete}
          onDownload={(cert) => certificateService.downloadExcel(cert.id).catch((e) => alert(e.message))}
          onNew={() => setNewCertOpen(true)}
        />
      )}

      <Dialog open={newCertOpen} onClose={() => setNewCertOpen(false)}>
        <DialogTitle>New Net Worth Certificate</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1, minWidth: 320 }}>
            {certError && <Alert severity="error">{certError}</Alert>}
            <TextField
              select
              label="Financial Year"
              value={financialYear}
              onChange={(e) => setFinancialYear(e.target.value)}
              size="small"
            >
              {FY_OPTIONS.map((fy) => <MenuItem key={fy} value={fy}>{fy}</MenuItem>)}
            </TextField>
            <TextField
              label="As On Date"
              type="date"
              value={asOnDate}
              onChange={(e) => setAsOnDate(e.target.value)}
              size="small"
              InputLabelProps={{ shrink: true }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNewCertOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleNewCert}>Create</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
