import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Chip, IconButton, Tooltip, Button, Box,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import DownloadIcon from '@mui/icons-material/Download';
import type { NetWorthCertificate } from '../../../types/networth';

interface CertificateHistoryTableProps {
  certificates: NetWorthCertificate[];
  onOpen: (cert: NetWorthCertificate) => void;
  onDelete: (cert: NetWorthCertificate) => void;
  onDownload: (cert: NetWorthCertificate) => void;
  onNew: () => void;
}

export const CertificateHistoryTable = ({
  certificates, onOpen, onDelete, onDownload, onNew,
}: CertificateHistoryTableProps) => {
  const statusColor = (status: string) =>
    status === 'finalized' ? 'success' : 'warning';

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
        <Button variant="contained" size="small" onClick={onNew}>
          + New Certificate
        </Button>
      </Box>
      <TableContainer component={Paper} variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell><strong>Financial Year</strong></TableCell>
              <TableCell><strong>As On Date</strong></TableCell>
              <TableCell><strong>Net Worth (₹ Lacs)</strong></TableCell>
              <TableCell><strong>Status</strong></TableCell>
              <TableCell align="right"><strong>Actions</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {certificates.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 3, color: 'text.secondary' }}>
                  No certificates yet. Create the first one!
                </TableCell>
              </TableRow>
            ) : (
              certificates.map((cert) => (
                <TableRow
                  key={cert.id}
                  hover
                  onClick={() => onOpen(cert)}
                  sx={{ cursor: 'pointer' }}
                >
                  <TableCell>{cert.financialYear}</TableCell>
                  <TableCell>
                    {cert.asOnDate ? new Date(cert.asOnDate).toLocaleDateString('en-IN') : '—'}
                  </TableCell>
                  <TableCell>
                    {cert.netWorth !== undefined ? `₹ ${cert.netWorth.toFixed(2)}` : '—'}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={cert.status === 'finalized' ? 'Finalized' : 'Draft'}
                      color={statusColor(cert.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="right" onClick={(e) => e.stopPropagation()}>
                    <Tooltip title="Download Excel">
                      <IconButton size="small" onClick={() => onDownload(cert)}>
                        <DownloadIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    {cert.status === 'draft' && (
                      <Tooltip title="Delete">
                        <IconButton size="small" color="error" onClick={() => onDelete(cert)}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};
