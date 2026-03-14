import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box, Typography, Paper, Chip, Button, CircularProgress, Alert, Divider,
  Table, TableBody, TableCell, TableHead, TableRow, TableFooter,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DownloadIcon from '@mui/icons-material/Download';
import LockIcon from '@mui/icons-material/Lock';
import { CertificateStepper } from '../components/features/certificates/CertificateStepper';
import { useAppDispatch, useAppSelector } from '../store';
import { fetchCertificateSummary, finalizeCertificate, fetchCertificateById } from '../store/slices/certificateSlice';
import { certificateService } from '../services/certificateService';

// ── shared cell styles ──────────────────────────────────────────
const S = {
  label:    { border: '1px solid #ccc', p: '4px 8px', fontWeight: 600, bgcolor: '#f2f2f2', fontSize: '0.80rem', color: '#333', width: 180 },
  val:      { border: '1px solid #ccc', p: '4px 8px', fontSize: '0.80rem' },
  hdr:      { border: '1px solid #ccc', p: '4px 8px', fontWeight: 700, bgcolor: '#dce6f1', fontSize: '0.80rem' },
  hdrR:     { border: '1px solid #ccc', p: '4px 8px', fontWeight: 700, bgcolor: '#dce6f1', fontSize: '0.80rem', textAlign: 'right' as const },
  ref:      { border: '1px solid #ccc', p: '4px 8px', fontWeight: 700, bgcolor: '#dce6f1', fontSize: '0.80rem', textAlign: 'center' as const, width: 70 },
  num:      { border: '1px solid #ccc', p: '4px 8px', fontSize: '0.80rem', textAlign: 'right' as const },
  numBold:  { border: '1px solid #ccc', p: '4px 8px', fontWeight: 700, fontSize: '0.80rem', textAlign: 'right' as const },
  total:    { border: '1px solid #ccc', p: '4px 8px', fontWeight: 700, bgcolor: '#f2f2f2', fontSize: '0.80rem' },
  totalNum: { border: '1px solid #ccc', p: '4px 8px', fontWeight: 700, bgcolor: '#f2f2f2', fontSize: '0.80rem', textAlign: 'right' as const },
  nw:       { border: '2px solid #375623', p: '5px 8px', fontWeight: 700, bgcolor: '#e2efda', fontSize: '0.82rem' },
  nwNum:    { border: '2px solid #375623', p: '5px 8px', fontWeight: 700, bgcolor: '#e2efda', fontSize: '0.82rem', textAlign: 'right' as const, color: '#375623' },
};

const fmtN  = (v?: number) => (v ?? 0).toFixed(2);
const fmt   = (v?: number) => `₹ ${fmtN(v)} Lacs`;
const fmtDate = (d?: string) =>
  d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '—';
const fmtAddr = (a?: { line1?: string; line2?: string; city?: string; state?: string; pincode?: string }) =>
  a ? [a.line1, a.line2, a.city, a.state, a.pincode].filter(Boolean).join(', ') : '—';

export const SummaryPage = () => {
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
    if (!id || !confirm('Finalize this Net Worth Certificate? This will lock the certificate.')) return;
    await dispatch(finalizeCertificate(id));
    await dispatch(fetchCertificateSummary(id));
  };

  if (loading && !summary) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}><CircularProgress /></Box>;
  }

  const a1 = summary?.annexure1;
  const a2 = summary?.annexure2;
  const liabilities = summary?.liabilityItems ?? [];
  const guarantors  = summary?.guarantorItems ?? [];
  const totalAssets = (summary?.totalImmovableProperty ?? 0) + (summary?.totalMovableProperty ?? 0);
  const totalGuar   = guarantors.reduce((s, g) => s + g.amountGuaranteed, 0);

  // Movable property rows matching the Excel template order
  const movableRows: [string, number][] = [
    ['PPF',                           a2?.ppf ?? 0],
    ['Pension Scheme',                a2?.pensionScheme ?? 0],
    ['Investment in HUF',             a2?.huf ?? 0],
    ['Shares',                        a2?.shares ?? 0],
    ['Fixed Deposit',                 a2?.fixedDeposit ?? 0],
    ['Recurring Deposit',             a2?.recurringDeposit ?? 0],
    ['Other Deposit',                 a2?.otherDeposit ?? 0],
    ['Gold & Jewellery',              a2?.goldAndJewellery ?? 0],
    ['Insurance Policies',            a2?.insurancePolicies ?? 0],
    ['Vehicle',                       a2?.vehicles ?? 0],
    ['Investment in Firm / Companies',a2?.investmentInFirms ?? 0],
  ];

  return (
    <Box sx={{ p: 3 }}>
      <CertificateStepper certificateId={id!} activeStep={4} />

      {/* ── Page action bar ── */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Button startIcon={<ArrowBackIcon />} variant="text"
            onClick={() => navigate(`/certificates/${id}/guarantors`)}>Back</Button>
          <Box>
            <Typography variant="h5" fontWeight={700}>Summary &amp; Preview</Typography>
            <Typography variant="body2" color="text.secondary">{summary?.financialYear}</Typography>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          {cert?.status === 'finalized' && <Chip label="Finalized" color="success" size="small" />}
          <Button startIcon={<DownloadIcon />} variant="outlined"
            onClick={() => id && certificateService.downloadExcel(id).catch((e) => alert(e.message))}>
            Export Excel
          </Button>
          {cert?.status === 'draft' && (
            <Button startIcon={<LockIcon />} variant="contained" color="success" onClick={handleFinalize}>
              Finalize Certificate
            </Button>
          )}
        </Box>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {/* ── Excel-like Certificate Preview ── */}
      <Paper elevation={3} sx={{
        p: 4, mb: 3,
        fontFamily: '"Calibri", "Arial", sans-serif',
        border: '1px solid #ccc',
        maxWidth: 860, mx: 'auto',
      }}>
        {/* Title */}
        <Typography variant="h6" fontWeight={700} align="center"
          sx={{ letterSpacing: 1, textTransform: 'uppercase', mb: 0.5 }}>
          Net Worth Certificate
        </Typography>
        <Divider sx={{ mb: 2 }} />

        {/* Certification line */}
        <Typography variant="body2" sx={{ mb: 1, fontSize: '0.82rem' }}>
          We hereby certify below the position of Assets &amp; Liabilities of the person mentioned
          hereunder as on&nbsp;<strong>{fmtDate(summary?.asOnDate)}</strong>
        </Typography>
        <Typography variant="body2" sx={{ mb: 2.5, fontSize: '0.82rem', fontStyle: 'italic' }}>
          The same has been verified from the records &amp; other details produced before us:
        </Typography>

        {/* ── Client details ── */}
        <Table size="small" sx={{ mb: 3, tableLayout: 'fixed' }}>
          <TableBody>
            {([
              ['Name',               summary?.clientName ?? '—'],
              ['PAN',                summary?.pan        ?? '—'],
              ['Date of Birth',      fmtDate(summary?.dateOfBirth)],
              ['Permanent Address :', fmtAddr(summary?.permanentAddress)],
              ['Office Address',     fmtAddr(summary?.officeAddress)],
            ] as [string, string][]).map(([label, value]) => (
              <TableRow key={label}>
                <TableCell sx={S.label}>{label}</TableCell>
                <TableCell sx={S.val}>{value}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* ── Section A — Immovable Property ── */}
        <Typography variant="body2" fontWeight={700} sx={{ mb: 0.5, fontSize: '0.82rem' }}>
          (A) Total Value of Immoveable Property: (Annexure -1)
        </Typography>
        <Typography variant="body2" sx={{ mb: 1, fontSize: '0.75rem', fontStyle: 'italic', color: '#555' }}>
          (This includes <u>beneficial share</u> owned in Land, Building, Flat, Factory, Shop, House etc.)
        </Typography>
        <Table size="small" sx={{ mb: 3 }}>
          <TableHead>
            <TableRow>
              <TableCell sx={S.hdr}>Nature of Property</TableCell>
              <TableCell sx={S.hdr}>Location with Complete Address</TableCell>
              <TableCell sx={S.hdrR}>Value at Cost (₹ In Lacs)</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell sx={S.val}>By Self</TableCell>
              <TableCell sx={{ ...S.val, fontStyle: 'italic', color: '#555' }}>Refer Annexure - 1</TableCell>
              <TableCell sx={S.numBold}>{fmtN(a1?.totalBySelf)}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={S.val}>By Sharing</TableCell>
              <TableCell sx={S.val}></TableCell>
              <TableCell sx={S.numBold}>{fmtN(a1?.totalBySharing)}</TableCell>
            </TableRow>
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell colSpan={2} sx={S.total}>TOTAL (A)</TableCell>
              <TableCell sx={S.totalNum}>{fmtN(a1?.grandTotal)}</TableCell>
            </TableRow>
          </TableFooter>
        </Table>

        {/* ── Section B — Movable Property ── */}
        <Typography variant="body2" fontWeight={700} sx={{ mb: 0.5, fontSize: '0.82rem' }}>
          (B) Total Value of Other Assets:
        </Typography>
        <Typography variant="body2" sx={{ mb: 1, fontSize: '0.75rem', fontStyle: 'italic', color: '#555' }}>
          (This includes Cash, Bank balance, Gold, Other Jewellery, Investment in Shares/Mutual
          Funds/FD&apos;s/LIC etc, Vehicles, Capital in Business etc.)
        </Typography>
        <Table size="small" sx={{ mb: 3 }}>
          <TableHead>
            <TableRow>
              <TableCell sx={S.hdr}>Nature of Asset</TableCell>
              <TableCell sx={S.hdr}>Particulars of Asset / Complete Description</TableCell>
              <TableCell sx={S.hdrR}>Value at Cost (₹ In Lacs)</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {movableRows.map(([label, value], i) => (
              <TableRow key={i}>
                <TableCell sx={S.val}>{label}</TableCell>
                <TableCell sx={{ ...S.val, fontStyle: i === 0 ? 'italic' : 'normal', color: i === 0 ? '#555' : 'inherit' }}>
                  {i === 0 ? 'Refer Annexure - 2' : ''}
                </TableCell>
                <TableCell sx={S.num}>{fmtN(value)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell colSpan={2} sx={S.total}>TOTAL (B)</TableCell>
              <TableCell sx={S.totalNum}>{fmtN(a2?.grandTotal)}</TableCell>
            </TableRow>
          </TableFooter>
        </Table>

        {/* ── Section C — Liabilities ── */}
        <Typography variant="body2" fontWeight={700} sx={{ mb: 1, fontSize: '0.82rem' }}>
          (C) Total Liabilities:
        </Typography>
        <Table size="small" sx={{ mb: 3 }}>
          <TableHead>
            <TableRow>
              <TableCell sx={S.hdr}>Borrowed From</TableCell>
              <TableCell sx={S.hdr}>Amount &amp; Securities offered</TableCell>
              <TableCell sx={S.hdr}>Purpose</TableCell>
              <TableCell sx={S.hdrR}>O/s as on date (₹ In Lacs)</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {liabilities.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} sx={{ ...S.val, textAlign: 'center', color: '#999' }}>—</TableCell>
              </TableRow>
            ) : (
              liabilities.map((item, i) => (
                <TableRow key={i}>
                  <TableCell sx={S.val}>{item.borrowedFrom ?? '—'}</TableCell>
                  <TableCell sx={S.val}>{item.securitiesOffered ?? '—'}</TableCell>
                  <TableCell sx={S.val}>{item.purpose ?? '—'}</TableCell>
                  <TableCell sx={S.num}>{fmtN(item.outstandingAmount)}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell colSpan={3} sx={S.total}>TOTAL</TableCell>
              <TableCell sx={S.totalNum}>{fmtN(summary?.totalLiabilities)}</TableCell>
            </TableRow>
          </TableFooter>
        </Table>

        {/* ── Net Worth ── */}
        <Table size="small" sx={{ mb: 1 }}>
          <TableBody>
            <TableRow>
              <TableCell sx={S.nw}>
                (D) Net Worth: (A + B – C) = {fmt(summary?.netWorth)}
              </TableCell>
              <TableCell sx={S.nwNum}>{fmtN(summary?.netWorth)}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
        <Typography variant="body2" sx={{ mb: 3, fontSize: '0.80rem', fontWeight: 600 }}>
          (In words: {summary?.netWorthInWords ?? '—'})
        </Typography>

        {/* ── Section D — Guarantors ── */}
        <Typography variant="body2" sx={{ mb: 1, fontSize: '0.82rem' }}>
          He is the Guarantor for various Borrowings by his friends / relatives / firm(s) /
          company(s) as detailed below:
        </Typography>
        <Table size="small" sx={{ mb: 2 }}>
          <TableHead>
            <TableRow>
              <TableCell sx={S.hdr}>Guaranteed to</TableCell>
              <TableCell sx={S.hdr}>For the Borrowings by</TableCell>
              <TableCell sx={S.hdr}>Purpose</TableCell>
              <TableCell sx={S.hdrR}>Amount Guaranteed (₹ In Lacs)</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {guarantors.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} sx={{ ...S.val, textAlign: 'center', color: '#999' }}>—</TableCell>
              </TableRow>
            ) : (
              guarantors.map((item, i) => (
                <TableRow key={i}>
                  <TableCell sx={S.val}>{item.guaranteedTo ?? '—'}</TableCell>
                  <TableCell sx={S.val}>{item.borrowingsBy ?? '—'}</TableCell>
                  <TableCell sx={S.val}>{item.purpose ?? '—'}</TableCell>
                  <TableCell sx={S.num}>{fmtN(item.amountGuaranteed)}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell colSpan={3} sx={S.total}>TOTAL</TableCell>
              <TableCell sx={S.totalNum}>{fmtN(totalGuar)}</TableCell>
            </TableRow>
          </TableFooter>
        </Table>

        {/* Quick totals recap */}
        <Divider sx={{ my: 2 }} />
        <Table size="small">
          <TableBody>
            <TableRow>
              <TableCell sx={{ ...S.ref, width: 80 }}>A</TableCell>
              <TableCell sx={S.val}>Total Immovable Property (Annexure-1)</TableCell>
              <TableCell sx={S.numBold}>{fmt(summary?.totalImmovableProperty)}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={S.ref}>B</TableCell>
              <TableCell sx={S.val}>Total Movable Property (Annexure-2)</TableCell>
              <TableCell sx={S.numBold}>{fmt(summary?.totalMovableProperty)}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={S.total}>A+B</TableCell>
              <TableCell sx={S.total}>Total Assets</TableCell>
              <TableCell sx={S.totalNum}>{fmt(totalAssets)}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={S.ref}>C</TableCell>
              <TableCell sx={S.val}>Total Liabilities</TableCell>
              <TableCell sx={{ ...S.numBold, color: '#c62828' }}>{fmt(summary?.totalLiabilities)}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={S.nw}>A+B−C</TableCell>
              <TableCell sx={S.nw}>NET WORTH</TableCell>
              <TableCell sx={S.nwNum}>{fmt(summary?.netWorth)}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </Paper>

      <Box sx={{ display: 'flex', gap: 2 }}>
        <Button variant="outlined" onClick={() => navigate(`/certificates/${id}`)}>
          Certificate Overview
        </Button>
      </Box>
    </Box>
  );
};
