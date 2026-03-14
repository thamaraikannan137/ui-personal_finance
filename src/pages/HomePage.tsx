import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Grid, Paper, Button, Stack, Chip,
} from '@mui/material';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import ArticleIcon from '@mui/icons-material/Article';
import AddIcon from '@mui/icons-material/Add';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { useAppDispatch, useAppSelector } from '../store';
import { fetchClients } from '../store/slices/clientSlice';

export const HomePage = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { items: clients, total } = useAppSelector((s) => s.clients);

  useEffect(() => {
    dispatch(fetchClients({ page: 1, limit: 5 }));
  }, [dispatch]);

  const totalCertificates = clients.reduce(
    (sum, c) => sum + (c.certificates?.length ?? 0), 0
  );

  return (
    <Stack spacing={4} sx={{ p: 1 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" fontWeight={700}>Dashboard</Typography>
          <Typography variant="body2" color="text.secondary">
            Net Worth Certificate Management
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/clients/new')}
        >
          New Client
        </Button>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <Paper
            sx={{
              p: 3, cursor: 'pointer', transition: 'all 0.2s',
              '&:hover': { transform: 'translateY(-3px)', boxShadow: 4 },
            }}
            onClick={() => navigate('/clients')}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
              <Box sx={{ bgcolor: 'primary.100', p: 1.5, borderRadius: 2 }}>
                <PeopleAltIcon color="primary" />
              </Box>
              <Typography variant="subtitle2" color="text.secondary">Total Clients</Typography>
            </Box>
            <Typography variant="h3" fontWeight={700} color="primary.main">{total}</Typography>
            <Typography variant="caption" color="text.secondary">Registered clients</Typography>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
              <Box sx={{ bgcolor: 'success.100', p: 1.5, borderRadius: 2 }}>
                <ArticleIcon color="success" />
              </Box>
              <Typography variant="subtitle2" color="text.secondary">Certificates</Typography>
            </Box>
            <Typography variant="h3" fontWeight={700} color="success.main">{totalCertificates}</Typography>
            <Typography variant="caption" color="text.secondary">Across recent clients</Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Recent Clients */}
      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" fontWeight={600}>Recent Clients</Typography>
          <Button
            size="small"
            endIcon={<ArrowForwardIcon />}
            onClick={() => navigate('/clients')}
          >
            View All
          </Button>
        </Box>

        {clients.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>
            <PeopleAltIcon sx={{ fontSize: 48, mb: 1, opacity: 0.3 }} />
            <Typography>No clients yet. Add your first client to get started.</Typography>
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              sx={{ mt: 2 }}
              onClick={() => navigate('/clients/new')}
            >
              Add Client
            </Button>
          </Box>
        ) : (
          <Stack spacing={1}>
            {clients.map((client) => (
              <Box
                key={client.id}
                onClick={() => navigate(`/clients/${client.id}`)}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  p: 1.5,
                  borderRadius: 1,
                  cursor: 'pointer',
                  '&:hover': { bgcolor: 'action.hover' },
                }}
              >
                <Box>
                  <Typography fontWeight={600}>{client.name}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {client.pan || 'No PAN'} · {client.permanentAddress?.city || 'No city'}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Chip
                    label={client.isActive ? 'Active' : 'Inactive'}
                    color={client.isActive ? 'success' : 'default'}
                    size="small"
                  />
                  <ArrowForwardIcon fontSize="small" sx={{ color: 'text.disabled' }} />
                </Box>
              </Box>
            ))}
          </Stack>
        )}
      </Paper>
    </Stack>
  );
};

export default HomePage;
