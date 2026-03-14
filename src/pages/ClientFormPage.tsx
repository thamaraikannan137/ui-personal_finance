import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Box, Typography, Paper, Alert, CircularProgress } from '@mui/material';
import { useAppDispatch, useAppSelector } from '../store';
import { createClient, updateClient, fetchClientById } from '../store/slices/clientSlice';
import { ClientForm } from '../components/features/clients/ClientForm';
import type { Client } from '../types/networth';

export const ClientFormPage = () => {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { selectedClient, loading, error } = useAppSelector((s) => s.clients);
  const isEditing = !!id && id !== 'new';

  useEffect(() => {
    if (isEditing && id) {
      dispatch(fetchClientById(id));
    }
  }, [dispatch, id, isEditing]);

  const handleSubmit = async (data: Partial<Client>) => {
    if (isEditing && id) {
      await dispatch(updateClient({ id, data }));
    } else {
      await dispatch(createClient(data));
    }
    navigate('/clients');
  };

  if (isEditing && loading && !selectedClient) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}><CircularProgress /></Box>;
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" fontWeight={700} mb={3}>
        {isEditing ? 'Edit Client' : 'New Client'}
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Paper sx={{ p: 3 }}>
        <ClientForm
          initialData={isEditing ? selectedClient ?? undefined : undefined}
          onSubmit={handleSubmit}
          onCancel={() => navigate('/clients')}
          loading={loading}
        />
      </Paper>
    </Box>
  );
};
