import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Stepper, Step, StepLabel, Box, Typography, Alert,
  Table, TableHead, TableRow, TableCell, TableBody, TableContainer, Paper,
} from '@mui/material';
import { useState, useRef } from 'react';
import * as XLSX from 'xlsx';

interface ImportRow {
  name: string;
  pan: string;
  email?: string;
  phone?: string;
  dateOfBirth?: string;
}

interface ClientImportModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (file: File) => Promise<void>;
  importStatus?: { imported: number; errors: string[] } | null;
}

const SAMPLE_CSV = `name,pan,dateOfBirth,email,phone,permanentAddress.line1,permanentAddress.city,permanentAddress.state,permanentAddress.pincode
John Doe,ABCDE1234F,1985-06-15,john@example.com,9876543210,123 Main St,Chennai,Tamil Nadu,600001`;

const steps = ['Download Template', 'Upload File', 'Preview & Confirm'];

export const ClientImportModal = ({ open, onClose, onConfirm, importStatus }: ClientImportModalProps) => {
  const [activeStep, setActiveStep] = useState(0);
  const [previewRows, setPreviewRows] = useState<ImportRow[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleDownloadTemplate = () => {
    const blob = new Blob([SAMPLE_CSV], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'client_import_template.csv';
    a.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);

    const reader = new FileReader();
    reader.onload = (ev) => {
      const data = ev.target?.result;
      const wb = XLSX.read(data, { type: 'binary' });
      const ws = wb.Sheets[wb.SheetNames[0]!];
      const rows = XLSX.utils.sheet_to_json<ImportRow>(ws as XLSX.WorkSheet);
      setPreviewRows(rows.slice(0, 10));
      setActiveStep(2);
    };
    reader.readAsBinaryString(file);
  };

  const handleConfirm = async () => {
    if (!selectedFile) return;
    setLoading(true);
    await onConfirm(selectedFile);
    setLoading(false);
    setActiveStep(0);
    setPreviewRows([]);
    setSelectedFile(null);
  };

  const handleClose = () => {
    setActiveStep(0);
    setPreviewRows([]);
    setSelectedFile(null);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>Import Clients</DialogTitle>
      <DialogContent>
        <Stepper activeStep={activeStep} sx={{ mb: 3 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {activeStep === 0 && (
          <Box sx={{ textAlign: 'center', py: 3 }}>
            <Typography mb={2}>Download the sample CSV template, fill in client details, and upload.</Typography>
            <Button variant="outlined" onClick={handleDownloadTemplate}>
              Download Sample CSV
            </Button>
            <Box mt={3}>
              <Button variant="contained" onClick={() => setActiveStep(1)}>
                Next: Upload File
              </Button>
            </Box>
          </Box>
        )}

        {activeStep === 1 && (
          <Box sx={{ textAlign: 'center', py: 3 }}>
            <Typography mb={2}>Select your filled CSV or Excel file to import.</Typography>
            <input
              ref={fileRef}
              type="file"
              accept=".csv,.xlsx,.xls"
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />
            <Button variant="contained" onClick={() => fileRef.current?.click()}>
              Choose File
            </Button>
          </Box>
        )}

        {activeStep === 2 && (
          <Box>
            <Typography variant="body2" mb={1}>
              Preview (first 10 rows):
            </Typography>
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>PAN</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Phone</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {previewRows.map((row, i) => (
                    <TableRow key={i}>
                      <TableCell>{row.name}</TableCell>
                      <TableCell>{row.pan}</TableCell>
                      <TableCell>{row.email || '—'}</TableCell>
                      <TableCell>{row.phone || '—'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}

        {importStatus && (
          <Box mt={2}>
            <Alert severity={importStatus.errors.length ? 'warning' : 'success'}>
              Imported {importStatus.imported} clients.
              {importStatus.errors.length > 0 && (
                <ul style={{ margin: '8px 0 0', paddingLeft: 16 }}>
                  {importStatus.errors.map((e, i) => <li key={i}>{e}</li>)}
                </ul>
              )}
            </Alert>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Close</Button>
        {activeStep === 2 && (
          <Button variant="contained" onClick={handleConfirm} disabled={loading}>
            {loading ? 'Importing...' : 'Confirm Import'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};
