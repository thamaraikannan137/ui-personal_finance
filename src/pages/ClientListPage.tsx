import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Button, Alert } from '@mui/material';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import { useAppDispatch, useAppSelector } from '../store';
import { fetchClients, deleteClient, importClients, clearImportStatus } from '../store/slices/clientSlice';
import { ClientTable } from '../components/features/clients/ClientTable';
import { ClientImportModal } from '../components/features/clients/ClientImportModal';
import type { Client } from '../types/networth';

export const ClientListPage = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { items, total, pages, error, importStatus } = useAppSelector((s) => s.clients);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [importOpen, setImportOpen] = useState(false);

  const load = useCallback(() => {
    dispatch(fetchClients({ page, limit: 20, search: search || undefined }));
  }, [dispatch, page, search]);

  useEffect(() => { load(); }, [load]);

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleDelete = (client: Client) => {
    if (confirm(`Delete client "${client.name}"?`)) {
      dispatch(deleteClient(client.id)).then(() => load());
    }
  };

  const handleImport = async (file: File) => {
    await dispatch(importClients(file));
    load();
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" fontWeight={700}>Clients</Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<UploadFileIcon />}
            onClick={() => setImportOpen(true)}
          >
            Import
          </Button>
          <Button
            variant="contained"
            startIcon={<PersonAddIcon />}
            onClick={() => navigate('/clients/new')}
          >
            New Client
          </Button>
        </Box>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <ClientTable
        clients={items}
        total={total}
        pages={pages}
        page={page}
        onPageChange={setPage}
        onSearch={handleSearch}
        onView={(c) => navigate(`/clients/${c.id}`)}
        onEdit={(c) => navigate(`/clients/${c.id}/edit`)}
        onDelete={handleDelete}
      />

      <ClientImportModal
        open={importOpen}
        onClose={() => { setImportOpen(false); dispatch(clearImportStatus()); }}
        onConfirm={handleImport}
        importStatus={importStatus}
      />
    </Box>
  );
};
