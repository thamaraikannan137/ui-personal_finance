import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Box, Typography, Tabs, Tab, Paper, Button, Alert, CircularProgress } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { useAppDispatch, useAppSelector } from '../store';
import { fetchAnnexure1, addAnnexure1Row, updateAnnexure1Row, deleteAnnexure1Row } from '../store/slices/annexure1Slice';
import { PropertyTable } from '../components/features/annexure1/PropertyTable';
import { PropertyDrawerForm } from '../components/features/annexure1/PropertyDrawerForm';
import { CertificateStepper } from '../components/features/certificates/CertificateStepper';
import type { PropertyRow } from '../types/networth';

export const Annexure1Page = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { data, loading, error } = useAppSelector((s) => s.annexure1);
  const [tab, setTab] = useState<'bySelf' | 'bySharing'>('bySelf');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingRow, setEditingRow] = useState<PropertyRow | null>(null);

  useEffect(() => {
    if (id) dispatch(fetchAnnexure1(id));
  }, [dispatch, id]);

  const handleAdd = () => { setEditingRow(null); setDrawerOpen(true); };
  const handleEdit = (row: PropertyRow) => { setEditingRow(row); setDrawerOpen(true); };

  const handleSubmit = async (rowData: PropertyRow) => {
    if (!id) return;
    if (editingRow?._id) {
      await dispatch(updateAnnexure1Row({ certificateId: id, section: tab, rowId: editingRow._id, data: rowData }));
    } else {
      await dispatch(addAnnexure1Row({ certificateId: id, section: tab, row: rowData }));
    }
    setDrawerOpen(false);
  };

  const handleDelete = async (rowId: string) => {
    if (!id) return;
    if (confirm('Delete this property row?')) {
      await dispatch(deleteAnnexure1Row({ certificateId: id, section: tab, rowId }));
    }
  };

  if (loading && !data) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}><CircularProgress /></Box>;
  }

  return (
    <Box sx={{ p: 3 }}>
      <CertificateStepper certificateId={id!} activeStep={0} />
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Button startIcon={<ArrowBackIcon />} variant="text" onClick={() => navigate(`/certificates/${id}`)}>
            Back
          </Button>
          <Typography variant="h5" fontWeight={700}>Annexure-1 — Immovable Property</Typography>
        </Box>
        <Button endIcon={<ArrowForwardIcon />} variant="contained" onClick={() => navigate(`/certificates/${id}/annexure2`)}>
          Next: Annexure-2
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <Paper sx={{ p: 1.5, textAlign: 'center', flex: 1, bgcolor: 'primary.50' }}>
          <Typography variant="caption" color="text.secondary">Total By Self</Typography>
          <Typography fontWeight={700}>₹ {(data?.totalBySelf ?? 0).toFixed(2)} Lacs</Typography>
        </Paper>
        <Paper sx={{ p: 1.5, textAlign: 'center', flex: 1 }}>
          <Typography variant="caption" color="text.secondary">Total By Sharing</Typography>
          <Typography fontWeight={700}>₹ {(data?.totalBySharing ?? 0).toFixed(2)} Lacs</Typography>
        </Paper>
        <Paper sx={{ p: 1.5, textAlign: 'center', flex: 1, bgcolor: 'success.50' }}>
          <Typography variant="caption" color="text.secondary">Grand Total (A)</Typography>
          <Typography fontWeight={700} color="success.main">₹ {(data?.grandTotal ?? 0).toFixed(2)} Lacs</Typography>
        </Paper>
      </Box>

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
        <Tab label={`By Self (${data?.bySelf?.length ?? 0})`} value="bySelf" />
        <Tab label={`By Sharing (${data?.bySharing?.length ?? 0})`} value="bySharing" />
      </Tabs>

      <PropertyTable
        rows={data?.[tab] ?? []}
        section={tab}
        total={tab === 'bySelf' ? (data?.totalBySelf ?? 0) : (data?.totalBySharing ?? 0)}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <PropertyDrawerForm
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onSubmit={handleSubmit}
        initialData={editingRow}
        section={tab}
        loading={loading}
      />
    </Box>
  );
};
