import { Stack, Typography, Box, Divider } from '@mui/material';
import { MuiCard } from '../components/common';
import { ThemeToggle } from '../components/common/ThemeToggle';

export const SettingsPage = () => {
  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h4" fontWeight={700} sx={{ mb: 0.5 }}>
          Settings
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Manage your application preferences
        </Typography>
      </Box>

      <MuiCard sx={{ p: 3 }}>
        <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
          Appearance
        </Typography>
        <Stack spacing={2}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="body1" fontWeight={500}>
                Theme Mode
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Switch between light and dark mode
              </Typography>
            </Box>
            <ThemeToggle />
          </Box>
        </Stack>
      </MuiCard>

      <MuiCard sx={{ p: 3 }}>
        <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
          Preferences
        </Typography>
        <Stack spacing={2}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="body1" fontWeight={500}>
                Currency Format
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Display amounts in Indian Rupees (INR)
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary">
              ₹ INR
            </Typography>
          </Box>
          <Divider />
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="body1" fontWeight={500}>
                Date Format
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Display dates in Indian format
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary">
              DD MMM YYYY
            </Typography>
          </Box>
        </Stack>
      </MuiCard>
    </Stack>
  );
};

export default SettingsPage;

