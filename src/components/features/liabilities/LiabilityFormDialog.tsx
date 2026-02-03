import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Stack,
  Divider,
  Typography,
  Box,
  IconButton,
} from '@mui/material';
import type { 
  Liability, 
  LiabilityCreateInput, 
  LiabilityCategory,
  CustomFieldDefinition,
  CustomCategoryTemplate,
} from '../../../types';
import { Button, CustomFieldsRenderer } from '../../common';
import { customCategoryService } from '../../../services/customCategoryService';
import { liabilityCategoryOptions, liabilityCategoryLabels } from '../../../config/categoryConfig';
import { DefaultLiabilityForm } from './DefaultLiabilityForm';

type LiabilityFormValues = LiabilityCreateInput;

interface LiabilityFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: LiabilityCreateInput, files?: File[]) => void;
  initialLiability?: Liability | null;
}

const defaultValues: LiabilityFormValues = {
  name: '',
  category: 'loan',
  balance: 0,
  interestRate: undefined,
  dueDate: '',
  institution: '',
  owner: '',
  notes: '',
};

export const LiabilityFormDialog = ({
  open,
  onClose,
  onSubmit,
  initialLiability,
}: LiabilityFormDialogProps) => {
  const [formValues, setFormValues] = useState<LiabilityFormValues>(defaultValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [documents, setDocuments] = useState<Array<{ id: string; name: string; url: string; type: string; uploadedAt: string }>>([]);
  const [uploadingFiles, setUploadingFiles] = useState<File[]>([]);
  const [customCategoryTemplates, setCustomCategoryTemplates] = useState<CustomCategoryTemplate[]>([]);
  const [customFields, setCustomFields] = useState<CustomFieldDefinition[]>([]);
  const [selectedCustomCategoryId, setSelectedCustomCategoryId] = useState<string>('');

  // Load liability custom categories
  useEffect(() => {
    if (!open) return;

    let isMounted = true;

    const fetchTemplates = async () => {
      try {
        const templates = await customCategoryService.getTemplates('liability');
        if (!isMounted) return;
        setCustomCategoryTemplates(templates);
      } catch (error) {
        console.error('Failed to load custom liability categories', error);
      }
    };

    void fetchTemplates();

    return () => {
      isMounted = false;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;

    if (initialLiability) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { id: _id, updatedAt: _updatedAt, ...rest } = initialLiability;
      setFormValues({
        ...defaultValues,
        ...rest,
      });
      
      // Transform documents: if they're strings (URLs), convert to document objects
      const transformedDocuments = (initialLiability.documents || []).map((doc, index) => {
        if (typeof doc === 'string') {
          // It's a URL string, create a document object
          const url = doc;
          const fileName = url.split('/').pop() || `Document ${index + 1}`;
          const extension = fileName.split('.').pop()?.toLowerCase() || '';
          
          // Infer MIME type from extension
          let mimeType = 'application/octet-stream';
          if (extension === 'pdf') mimeType = 'application/pdf';
          else if (['jpg', 'jpeg'].includes(extension)) mimeType = 'image/jpeg';
          else if (extension === 'png') mimeType = 'image/png';
          else if (extension === 'gif') mimeType = 'image/gif';
          else if (extension === 'doc') mimeType = 'application/msword';
          else if (extension === 'docx') mimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
          
          return {
            id: `doc-${index}-${Date.now()}`,
            name: fileName,
            url: doc,
            type: mimeType,
            uploadedAt: initialLiability.updatedAt || new Date().toISOString(),
          };
        }
        // Already an object, return as-is
        return doc;
      });
      
      setDocuments(transformedDocuments);
      setCustomFields(initialLiability.customFields || []);
    } else {
      setFormValues(defaultValues);
      setDocuments([]);
      setUploadingFiles([]);
      setCustomFields([]);
      setSelectedCustomCategoryId('');
    }
    setErrors({});
  }, [initialLiability, open]);

  useEffect(() => {
    if (
      initialLiability &&
      initialLiability.category === 'custom' &&
      initialLiability.customCategoryName &&
      customCategoryTemplates.length > 0
    ) {
      const template = customCategoryTemplates.find(
        (t) => t.name.toLowerCase() === initialLiability.customCategoryName?.toLowerCase()
      );
      if (template) {
        setSelectedCustomCategoryId(template.id);
      }
    }
  }, [initialLiability, customCategoryTemplates]);

  const handleFieldChange = (fieldName: string, value: string | number | undefined) => {
    setFormValues((prev) => ({
      ...prev,
      [fieldName]: value,
    }));
  };

  const handleCategoryChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newCategory = event.target.value;
    
    // Check if it's a custom category template
    const template = customCategoryTemplates.find((t) => t.id === newCategory);
    
    if (template) {
      // Load custom fields from template
      const fields = customCategoryService.createFieldsFromTemplate(template);
      setCustomFields(fields);
      setSelectedCustomCategoryId(template.id);
      setFormValues((prev) => ({
        ...prev,
        category: 'custom' as LiabilityCategory,
        customCategoryName: template.name,
        customFields: fields,
      }));
    } else {
      // Standard category
      setCustomFields([]);
      setSelectedCustomCategoryId('');
      setFormValues((prev) => ({
        ...prev,
        category: newCategory as LiabilityCategory,
        customCategoryName: undefined,
        customFields: undefined,
      }));
    }
  };

  const handleCustomFieldChange = (fieldId: string, updates: Partial<CustomFieldDefinition>) => {
    setCustomFields((prev) => {
      const updatedFields = prev.map((field) =>
        field.id === fieldId ? { ...field, ...updates } : field
      );
      setFormValues((prevValues) => ({
        ...prevValues,
        customFields: updatedFields,
      }));
      return updatedFields;
    });
  };

  const validate = () => {
    const currentErrors: Record<string, string> = {};
    if (!formValues.name.trim()) {
      currentErrors.name = 'Name is required';
    }
    if (!formValues.owner.trim()) {
      currentErrors.owner = 'Owner is required';
    }
    if (!Number.isFinite(formValues.balance) || formValues.balance <= 0) {
      currentErrors.balance = 'Balance must be greater than 0';
    }
    if (formValues.interestRate !== undefined && formValues.interestRate < 0) {
      currentErrors.interestRate = 'Interest rate cannot be negative';
    }
    setErrors(currentErrors);
    return Object.keys(currentErrors).length === 0;
  };

  const getFileIcon = (type: string | undefined, url?: string) => {
    // If type is not provided, try to infer from URL extension
    if (!type && url) {
      const extension = url.split('.').pop()?.toLowerCase();
      if (extension === 'pdf') return 'ri-file-pdf-line';
      if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension || '')) return 'ri-image-line';
      if (['doc', 'docx'].includes(extension || '')) return 'ri-file-word-line';
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

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const fileArray = Array.from(files);
    
    // Store File objects for later upload
    setUploadingFiles((prev) => [...prev, ...fileArray]);
    
    // Create preview documents for UI using blob URLs
    fileArray.forEach((file) => {
      const blobUrl = URL.createObjectURL(file);
      const newDoc = {
        id: `doc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: file.name,
        url: blobUrl,
        type: file.type,
        uploadedAt: new Date().toISOString(),
      };
      setDocuments((prev) => [...prev, newDoc]);
    });

    // Reset input
    event.target.value = '';
  };

  const handleRemoveDocument = (docId: string) => {
    // Find the document to remove
    const docToRemove = documents.find((doc) => doc.id === docId);
    
    // If it's a blob URL (preview), revoke it and remove from uploadingFiles
    if (docToRemove && docToRemove.url.startsWith('blob:')) {
      URL.revokeObjectURL(docToRemove.url);
      
      // Find the corresponding file index and remove it
      const docIndex = documents.findIndex((doc) => doc.id === docId);
      if (docIndex !== -1) {
        setUploadingFiles((prev) => {
          const newFiles = [...prev];
          // Calculate which file to remove based on how many blob URLs come before this one
          const blobUrlsBefore = documents.slice(0, docIndex).filter(d => d.url.startsWith('blob:')).length;
          newFiles.splice(blobUrlsBefore, 1);
          return newFiles;
        });
      }
    }
    
    // Remove from documents
    setDocuments((prev) => prev.filter((doc) => doc.id !== docId));
  };

  const handleSubmit = () => {
    if (!validate()) return;

    const customCategoryName = selectedCustomCategoryId
      ? customCategoryTemplates.find((t) => t.id === selectedCustomCategoryId)?.name
      : (formValues.category === 'custom' ? formValues.customCategoryName : undefined);

    // Filter out blob URLs (previews) and keep only existing S3 URLs
    // These will be sent as string[] to backend, which will handle S3 deletion for removed ones
    const existingDocumentUrls = documents
      .filter((doc) => !doc.url.startsWith('blob:'))
      .map((doc) => doc.url);

    const payload: LiabilityCreateInput = {
      ...formValues,
      balance: Number(formValues.balance),
      interestRate:
        formValues.interestRate === undefined ? undefined : Number(formValues.interestRate),
      // Send as array of objects for frontend type, but liabilityService will convert to string[] for backend
      documents: existingDocumentUrls.length > 0 
        ? existingDocumentUrls.map((url, index) => ({
            id: `doc-${Date.now()}-${index}`,
            name: documents.find(d => d.url === url)?.name || `Document ${index + 1}`,
            url,
            type: documents.find(d => d.url === url)?.type || 'application/pdf',
            uploadedAt: new Date().toISOString(),
          }))
        : undefined,
      customFields: formValues.category === 'custom' ? customFields : undefined,
      customCategoryName,
    };

    // Pass payload and files to onSubmit
    onSubmit(payload, uploadingFiles.length > 0 ? uploadingFiles : undefined);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{initialLiability ? 'Edit Liability' : 'Add Liability'}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField
            label="Category"
            select
            value={selectedCustomCategoryId || formValues.category}
            onChange={handleCategoryChange}
            fullWidth
            required
          >
            {liabilityCategoryOptions.map((option) => (
              <MenuItem key={option} value={option}>
                {liabilityCategoryLabels[option]}
              </MenuItem>
            ))}
            {customCategoryTemplates.length > 0 && [
              <Divider key="custom-divider" sx={{ my: 1 }} />,
              <MenuItem key="custom-header" disabled>
                <Typography variant="caption" fontWeight={600} color="text.secondary">
                  Custom Categories
                </Typography>
              </MenuItem>,
              ...customCategoryTemplates.map((template) => (
                <MenuItem key={template.id} value={template.id}>
                  {template.name}
                </MenuItem>
              ))
            ]}
          </TextField>
          {/* Custom Fields */}
          <DefaultLiabilityForm
            category={formValues.category}
            formValues={formValues}
            errors={errors}
            onChange={handleFieldChange}
          />

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

          {formValues.category === 'custom' && customFields.length > 0 && (
            <CustomFieldsRenderer
              customFields={customFields}
              onFieldChange={handleCustomFieldChange}
              categoryName={formValues.customCategoryName}
            />
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button variant="text" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="contained" onClick={handleSubmit}>
          {initialLiability ? 'Save Changes' : 'Add Liability'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default LiabilityFormDialog;

