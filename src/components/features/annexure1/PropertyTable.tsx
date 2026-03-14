import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, IconButton, Tooltip, Button, Box, Typography, Chip,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import type { PropertyRow } from '../../../types/networth';

interface PropertyTableProps {
  rows: PropertyRow[];
  section: 'bySelf' | 'bySharing';
  total: number;
  onAdd: () => void;
  onEdit: (row: PropertyRow) => void;
  onDelete: (rowId: string) => void;
}

export const PropertyTable = ({ rows, section, total, onAdd, onEdit, onDelete }: PropertyTableProps) => (
  <Box>
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
      <Typography variant="subtitle2" color="text.secondary">
        {section === 'bySelf' ? 'By Self' : 'By Sharing'} — {rows.length} properties
      </Typography>
      <Button size="small" startIcon={<AddIcon />} variant="outlined" onClick={onAdd}>
        Add Property
      </Button>
    </Box>

    <TableContainer component={Paper} variant="outlined">
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Nature</TableCell>
            <TableCell>Location</TableCell>
            <TableCell>Date of Purchase</TableCell>
            <TableCell align="right">Value at Cost (₹ Lacs)</TableCell>
            {section === 'bySharing' && <TableCell>Share %</TableCell>}
            <TableCell align="right">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} align="center" sx={{ py: 3, color: 'text.secondary' }}>
                No properties added yet
              </TableCell>
            </TableRow>
          ) : (
            rows.map((row, idx) => (
              <TableRow key={row._id ?? idx} hover>
                <TableCell>
                  <Chip label={row.natureOfProperty ?? '—'} size="small" variant="outlined" />
                </TableCell>
                <TableCell sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {row.locationAddress ?? '—'}
                </TableCell>
                <TableCell>
                  {row.dateOfPurchase ? new Date(row.dateOfPurchase).toLocaleDateString('en-IN') : '—'}
                </TableCell>
                <TableCell align="right">{(row.valueAtCost ?? 0).toFixed(2)}</TableCell>
                {section === 'bySharing' && (
                  <TableCell>{row.sharePercentage ?? '—'}%</TableCell>
                )}
                <TableCell align="right">
                  <Tooltip title="Edit">
                    <IconButton size="small" onClick={() => onEdit(row)}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete">
                    <IconButton size="small" color="error" onClick={() => onDelete(row._id!)}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))
          )}
          {rows.length > 0 && (
            <TableRow>
              <TableCell colSpan={section === 'bySharing' ? 3 : 3} />
              <TableCell align="right" sx={{ fontWeight: 700 }}>
                Total: ₹ {total.toFixed(2)}
              </TableCell>
              <TableCell />
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  </Box>
);
