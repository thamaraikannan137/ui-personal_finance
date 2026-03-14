import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box, Typography, Paper, Chip, Button, CircularProgress, Alert,
  Table, TableBody, TableCell, TableRow, TableHead, Divider, Grid,
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import LockIcon from '@mui/icons-material/Lock';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import EditIcon from '@mui/icons-material/Edit';
import { useAppDispatch, useAppSelector } from '../store';
import {
  fetchCertificateById, fetchCertificateSummary,
  finalizeCertificate, reopenCertificate,
} from '../store/slices/certificateSlice';
import { certificateService } from '../services/certificateService';

const SectionButton = ({ label, path, certId, navigate }: {
  label: string; path: string; certId: string;
  navigate: (p: string) => void;
}) => (
  <Button
    variant="outlined"
    size="small"
    startIcon={<EditIcon fontSize="small" />}
    onClick={() => navigate(`/certificates/${certId}/${path}`)}
    sx={{ textTransform: 'none' }}
  >
    {label}
  </Button>
);

export const CertificateOverviewPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { selectedCertificate: cert, summary, loading, error } = useAppSelector((s) => s.certificates);

  useEffect(() => {
    if (id) {
      dispatch(fetchCertificateById(id));
      dispatch(fetchCertificateSummary(id));
    }
  }, [dispatch, id]);

  const handleFinalize = async () => {
    if (!id || !confirm('Finalize this certificate? This cannot be easily undone.')) return;
    await dispatch(finalizeCertificate(id));
    await dispatch(fetchCertificateSummary(id));
  };

  const handleReopen = async () => {
    if (!id) return;
    await dispatch(reopenCertificate(id));
  };

  if (loading && !cert) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}><CircularProgress /></Box>;
  }

  const clientName = typeof cert?.clientId === 'object'
    ? (cert.clientId as { name?: string }).name
    : summary?.clientName;

  const addr = summary?.permanentAddress;
  const addressStr = addr
    ? [addr.line1, addr.line2, addr.city, addr.state, addr.pincode].filter(Boolean).join(', ')
    : '—';

  const fmt = (n?: number) => `₹ ${(n ?? 0).toFixed(2)} Lacs`;

  const totalAssets = (summary?.totalImmovableProperty ?? 0) + (summary?.totalMovableProperty ?? 0);

  return (
    <Box sx={{ p: 3 }}>
      {/* Top action bar */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Button variant="text" size="small" onClick={() => navigate(-1)}>← Back</Button>
          <Typography variant="h5" fontWeight={700}>Net Worth Certificate</Typography>
          <Chip label={cert?.financialYear} size="small" color="primary" variant="outlined" />
          <Chip
            label={cert?.status === 'finalized' ? 'Finalized' : 'Draft'}
            size="small"
            color={cert?.status === 'finalized' ? 'success' : 'warning'}
          />
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button startIcon={<DownloadIcon />} variant="outlined" size="small"
            onClick={() => id && certificateService.downloadExcel(id).catch((e) => alert(e.message))}>
            Export Excel
          </Button>
          {cert?.status === 'draft' ? (
            <Button startIcon={<LockIcon />} variant="contained" color="success" size="small" onClick={handleFinalize}>
              Finalize
            </Button>
          ) : (
            <Button startIcon={<LockOpenIcon />} variant="outlined" color="warning" size="small" onClick={handleReopen}>
              Reopen
            </Button>
          )}
        </Box>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {/* Certificate Paper — mimics Excel layout */}
      <Paper elevation={2} sx={{ p: 4, mb: 3 }}>

        {/* Certificate Title */}
        <Typography variant="h5" fontWeight={700} align="center" gutterBottom>
          NET WORTH CERTIFICATE
        </Typography>
        <Typography variant="subtitle2" align="center" color="text.secondary" gutterBottom>
          As on {summary?.asOnDate ? new Date(summary.asOnDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' }) : '—'}
        </Typography>

        <Divider sx={{ my: 2 }} />

        {/* Client Info Block */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid size={6}>
            <Table size="small">
              <TableBody>
                {[
                  ['Name', clientName ?? '—'],
                  ['PAN', summary?.pan ?? '—'],
                  ['Date of Birth', summary?.dateOfBirth ? new Date(summary.dateOfBirth).toLocaleDateString('en-IN') : '—'],
                  ['Financial Year', cert?.financialYear ?? '—'],
                ].map(([label, value]) => (
                  <TableRow key={label}>
                    <TableCell sx={{ border: 0, pl: 0, py: 0.5, fontWeight: 600, width: 140, color: 'text.secondary', fontSize: '0.85rem' }}>
                      {label}
                    </TableCell>
                    <TableCell sx={{ border: 0, py: 0.5, fontSize: '0.85rem' }}>
                      : &nbsp;{value}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Grid>
          <Grid size={6}>
            <Typography variant="caption" fontWeight={600} color="text.secondary">PERMANENT ADDRESS</Typography>
            <Typography variant="body2" sx={{ mt: 0.5 }}>{addressStr}</Typography>
          </Grid>
        </Grid>

        <Divider sx={{ my: 2 }} />

        {/* Net Worth Statement Table */}
        <Typography variant="subtitle1" fontWeight={700} gutterBottom>
          Statement of Net Worth
        </Typography>

        <Table size="small" sx={{ mb: 2 }}>
          <TableHead>
            <TableRow sx={{ bgcolor: 'grey.100' }}>
              <TableCell sx={{ fontWeight: 700, width: 60 }}>Ref</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Particulars</TableCell>
              <TableCell sx={{ fontWeight: 700 }} align="right">Amount (₹ Lacs)</TableCell>
              <TableCell sx={{ fontWeight: 700, width: 120 }} align="center">Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {/* Annexure 1 */}
            <TableRow sx={{ bgcolor: 'primary.50' }}>
              <TableCell sx={{ fontWeight: 700, color: 'primary.main' }}>A</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Total Immovable Property (Annexure-1)</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700, color: 'primary.main' }}>
                {fmt(summary?.totalImmovableProperty)}
              </TableCell>
              <TableCell align="center">
                <SectionButton label="Edit" path="annexure1" certId={id!} navigate={navigate} />
              </TableCell>
            </TableRow>

            {/* Annexure 2 */}
            <TableRow sx={{ bgcolor: 'primary.50' }}>
              <TableCell sx={{ fontWeight: 700, color: 'primary.main' }}>B</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Total Movable Property (Annexure-2)</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700, color: 'primary.main' }}>
                {fmt(summary?.totalMovableProperty)}
              </TableCell>
              <TableCell align="center">
                <SectionButton label="Edit" path="annexure2" certId={id!} navigate={navigate} />
              </TableCell>
            </TableRow>

            {/* Total Assets A+B */}
            <TableRow sx={{ bgcolor: 'grey.50' }}>
              <TableCell sx={{ fontWeight: 700 }}>A+B</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Total Assets</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700 }}>{fmt(totalAssets)}</TableCell>
              <TableCell />
            </TableRow>

            {/* Liabilities */}
            <TableRow sx={{ bgcolor: 'error.50' }}>
              <TableCell sx={{ fontWeight: 700, color: 'error.main' }}>C</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Total Liabilities</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700, color: 'error.main' }}>
                {fmt(summary?.totalLiabilities)}
              </TableCell>
              <TableCell align="center">
                <SectionButton label="Edit" path="liabilities" certId={id!} navigate={navigate} />
              </TableCell>
            </TableRow>

            {/* Guarantors */}
            <TableRow>
              <TableCell sx={{ fontWeight: 700 }}>D</TableCell>
              <TableCell>Guarantor Details</TableCell>
              <TableCell align="right">—</TableCell>
              <TableCell align="center">
                <SectionButton label="Edit" path="guarantors" certId={id!} navigate={navigate} />
              </TableCell>
            </TableRow>

            {/* Net Worth */}
            <TableRow sx={{ bgcolor: 'success.50' }}>
              <TableCell sx={{ fontWeight: 700, color: 'success.main' }}>A+B–C</TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: '1rem' }}>Net Worth</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700, color: 'success.main', fontSize: '1rem' }}>
                {fmt(summary?.netWorth)}
              </TableCell>
              <TableCell align="center">
                <SectionButton label="Summary" path="summary" certId={id!} navigate={navigate} />
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>

        {/* Net Worth in Words */}
        <Box sx={{ p: 1.5, bgcolor: 'grey.50', borderRadius: 1, border: '1px solid', borderColor: 'grey.200' }}>
          <Typography variant="body2">
            <strong>Net Worth in Words:</strong>&nbsp;
            {summary?.netWorthInWords ?? '—'}
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};
