import {
  Box,
  Typography,
  Stack,
  IconButton,
} from '@mui/material';
import { Button } from '../../common';
import type { AssetCategory, AssetCreateInput } from '../../../types';
import { getFieldsForCategory } from '../../../config/assetFieldsConfig';
import { getAssetFormStructure } from '../../../config/assetFormConfig';
import { DynamicFieldRenderer } from './DynamicFieldRenderer';

interface Document {
  id: string;
  name: string;
  url: string;
  type: string;
  uploadedAt: string;
}

interface AssetFormFieldsProps {
  category: AssetCategory;
  formValues: AssetCreateInput;
  errors: Record<string, string>;
  onChange: (fieldName: string, value: string | number | undefined) => void;
  documents: Document[];
  handleFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleRemoveDocument: (docId: string) => void;
}

/**
 * Unified form component that renders all asset fields
 * Combines top fields, category-specific fields, value field, and bottom fields
 */
export const AssetFormFields = ({
  category,
  formValues,
  errors,
  onChange,
  documents,
  handleFileUpload,
  handleRemoveDocument,
}: AssetFormFieldsProps) => {
  
  // Get category-specific fields (skip for custom categories - they use CustomFieldsRenderer)
  const categoryFields = category === 'custom' ? [] : getFieldsForCategory(category);
  
  // Get complete form structure
  const formStructure = getAssetFormStructure(categoryFields);

  const getFieldValue = (fieldName: string) => {
    return (formValues as Record<string, unknown>)[fieldName];
  };

  const getFieldError = (fieldName: string) => {
    return errors[fieldName];
  };

  const getFileIcon = (type: string | undefined, url?: string) => {
    // If type is not provided, try to infer from URL extension
    if (!type && url) {
      const extension = url.split('.').pop()?.toLowerCase();
      if (!extension) return 'ri-file-line';
      if (extension === 'pdf') return 'ri-file-pdf-line';
      if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension)) return 'ri-image-line';
      if (['doc', 'docx'].includes(extension)) return 'ri-file-word-line';
      return 'ri-file-line';
    }
    
    // Use type if available
    if (type) {
      if (type.includes('pdf')) return 'ri-file-pdf-line';
      if (type.includes('image')) return 'ri-image-line';
      if (type.includes('word') || type.includes('document')) return 'ri-file-word-line';
    }
    
    return 'ri-file-line';
  };

  return (
    <Stack spacing={2}>
      {/* Top Fields (Name, etc.) */}
      {formStructure.topFields.map((field) => (
        <DynamicFieldRenderer
          key={field.fieldName}
          field={field}
          value={getFieldValue(field.fieldName)}
          onChange={onChange}
          error={getFieldError(field.fieldName)}
        />
      ))}

      {/* Category-Specific Dynamic Fields - Skip for custom categories */}
      {category !== 'custom' && (
        <>
          {/* Render all dynamic fields based on category configuration */}
          {categoryFields.map((field) => (
            <DynamicFieldRenderer
              key={field.fieldName}
              field={field}
              value={getFieldValue(field.fieldName)}
              onChange={onChange}
              error={getFieldError(field.fieldName)}
            />
          ))}

          {/* Document Upload Section */}
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
                      <i className={getFileIcon(doc.type, doc.url)} style={{ fontSize: '24px', color: '#2196f3' }} />
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography variant="body2" noWrap>
                          {doc.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {doc.uploadedAt ? new Date(doc.uploadedAt).toLocaleDateString() : 'Unknown date'}
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

      {/* Value Field */}
      <DynamicFieldRenderer
        field={formStructure.valueField}
        value={getFieldValue(formStructure.valueField.fieldName)}
        onChange={onChange}
        error={getFieldError(formStructure.valueField.fieldName)}
      />

      {/* Bottom Fields (Owner, Notes) */}
      {formStructure.bottomFields.map((field) => (
        <DynamicFieldRenderer
          key={field.fieldName}
          field={field}
          value={getFieldValue(field.fieldName)}
          onChange={onChange}
          error={getFieldError(field.fieldName)}
        />
      ))}
    </Stack>
  );
};

export default AssetFormFields;
