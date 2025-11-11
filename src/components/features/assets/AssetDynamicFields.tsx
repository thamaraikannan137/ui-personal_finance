import {
  Box,
  Typography,
  Stack,
  IconButton,
} from '@mui/material';
import { Button } from '../../common';
import type { AssetCreateInput, AssetCategory } from '../../../types';
import { getFieldsForCategory } from '../../../config/assetFieldsConfig';
import { DynamicFieldRenderer } from './DynamicFieldRenderer';

interface Document {
  id: string;
  name: string;
  url: string;
  type: string;
  uploadedAt: string;
}

interface AssetDynamicFieldsProps {
  category: AssetCategory;
  formValues: AssetCreateInput;
  onChange: (fieldName: string, value: string | number | undefined) => void;
  documents: Document[];
  handleFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleRemoveDocument: (docId: string) => void;
}

export const AssetDynamicFields = ({
  category,
  formValues,
  onChange,
  documents,
  handleFileUpload,
  handleRemoveDocument,
}: AssetDynamicFieldsProps) => {
  
  // Get field definitions for the current category
  const fields = getFieldsForCategory(category);
  
  const getFileIcon = (type: string) => {
    if (type.includes('pdf')) return 'ri-file-pdf-line';
    if (type.includes('image')) return 'ri-image-line';
    if (type.includes('word') || type.includes('document')) return 'ri-file-word-line';
    return 'ri-file-line';
  };

  // Check if category has documentURL field
  const hasDocumentField = fields.some(f => f.fieldName === 'documentURL');

  return (
    <>
      {/* Render all dynamic fields based on category configuration */}
      {fields
        .filter(field => field.fieldName !== 'documentURL') // Handle documentURL separately
        .map((field) => (
          <DynamicFieldRenderer
            key={field.fieldName}
            field={field}
            value={(formValues as Record<string, unknown>)[field.fieldName]}
            onChange={onChange}
          />
        ))}

      {/* Document Upload Section - Special handling */}
      {hasDocumentField && (
        <>
          <DynamicFieldRenderer
            field={fields.find(f => f.fieldName === 'documentURL')!}
            value={formValues.documentURL}
            onChange={onChange}
          />
          
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Upload Documents
            </Typography>
            <Button
              variant="outlined"
              component="label"
              startIcon={<i className="ri-upload-cloud-line" style={{ fontSize: '18px' }} />}
              sx={{ textTransform: 'none' }}
            >
              Upload Files
              <input
                type="file"
                hidden
                multiple
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif"
                onChange={handleFileUpload}
              />
            </Button>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
              Supported: PDF, DOC, DOCX, JPG, PNG (Max 5MB each)
            </Typography>
          </Box>

          {documents.length > 0 && (
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Uploaded Documents ({documents.length})
              </Typography>
              <Stack spacing={1}>
                {documents.map((doc) => (
                  <Box
                    key={doc.id}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      p: 1.5,
                      border: 1,
                      borderColor: 'divider',
                      borderRadius: 1,
                      bgcolor: 'background.paper',
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
                      <i className={getFileIcon(doc.type)} style={{ fontSize: '24px', color: '#2196f3' }} />
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography variant="body2" noWrap>
                          {doc.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {new Date(doc.uploadedAt).toLocaleDateString()}
                        </Typography>
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      <IconButton
                        size="small"
                        onClick={() => window.open(doc.url, '_blank')}
                        sx={{ color: 'primary.main' }}
                      >
                        <i className="ri-eye-line" style={{ fontSize: '18px' }} />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleRemoveDocument(doc.id)}
                        sx={{ color: 'error.main' }}
                      >
                        <i className="ri-delete-bin-line" style={{ fontSize: '18px' }} />
                      </IconButton>
                    </Box>
                  </Box>
                ))}
              </Stack>
            </Box>
          )}
        </>
      )}
    </>
  );
};

export default AssetDynamicFields;
