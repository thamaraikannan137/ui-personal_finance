import { Grid, Paper, Typography, Box } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';

interface NetWorthSummaryCardsProps {
  totalImmovable: number;
  totalMovable: number;
  totalLiabilities: number;
  netWorth: number;
}

interface SummaryCardProps {
  label: string;
  value: number;
  icon: React.ReactNode;
  color: string;
  isTotal?: boolean;
}

const SummaryCard = ({ label, value, icon, color, isTotal }: SummaryCardProps) => (
  <Paper
    variant="outlined"
    sx={{
      p: 2,
      borderRadius: 2,
      borderColor: isTotal ? color : undefined,
      borderWidth: isTotal ? 2 : 1,
      bgcolor: isTotal ? `${color}08` : undefined,
    }}
  >
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
      <Box sx={{ color }}>{icon}</Box>
      <Typography variant="body2" color="text.secondary">{label}</Typography>
    </Box>
    <Typography variant="h6" fontWeight={isTotal ? 700 : 500} sx={{ color: isTotal ? color : undefined }}>
      ₹ {value.toFixed(2)} Lacs
    </Typography>
  </Paper>
);

export const NetWorthSummaryCards = ({
  totalImmovable, totalMovable, totalLiabilities, netWorth,
}: NetWorthSummaryCardsProps) => (
  <Grid container spacing={2}>
    <Grid size={3}>
      <SummaryCard
        label="(A) Immovable Property"
        value={totalImmovable}
        icon={<HomeIcon />}
        color="#1976d2"
      />
    </Grid>
    <Grid size={3}>
      <SummaryCard
        label="(B) Movable Assets"
        value={totalMovable}
        icon={<AccountBalanceWalletIcon />}
        color="#388e3c"
      />
    </Grid>
    <Grid size={3}>
      <SummaryCard
        label="(C) Liabilities"
        value={totalLiabilities}
        icon={<CreditCardIcon />}
        color="#d32f2f"
      />
    </Grid>
    <Grid size={3}>
      <SummaryCard
        label="Net Worth (A+B−C)"
        value={netWorth}
        icon={<TrendingUpIcon />}
        color={netWorth >= 0 ? '#388e3c' : '#d32f2f'}
        isTotal
      />
    </Grid>
  </Grid>
);
