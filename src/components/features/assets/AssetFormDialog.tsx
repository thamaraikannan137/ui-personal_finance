import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Stack,
  Typography,
  Divider,
} from '@mui/material';
import type { Asset, AssetCreateInput, AssetCategory, CustomFieldDefinition, CustomCategoryTemplate } from '../../../types';
import { Button, CustomFieldsRenderer } from '../../common';
import { customCategoryService } from '../../../services/customCategoryService';
import { AssetFormFields } from './AssetFormFields';
import { assetCategoryOptions, assetCategoryLabels } from '../../../config/categoryConfig';

type AssetFormValues = AssetCreateInput;

interface AssetFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: AssetCreateInput, files?: File[]) => void;
  initialAsset?: Asset | null;
}

const defaultValues: AssetFormValues = {
  name: '',
  category: 'savings',
  value: 0,
  institution: '',
  accountNumber: '',
  owner: '',
  notes: '',
};

export const AssetFormDialog = ({ open, onClose, onSubmit, initialAsset }: AssetFormDialogProps) => {
  const [formValues, setFormValues] = useState<AssetFormValues>(defaultValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [documents, setDocuments] = useState<Array<{ id: string; name: string; url: string; type: string; uploadedAt: string }>>([]);
  const [uploadingFiles, setUploadingFiles] = useState<File[]>([]);
  const [customFields, setCustomFields] = useState<CustomFieldDefinition[]>([]);
  
  // Custom category state
  const [customCategoryTemplates, setCustomCategoryTemplates] = useState<CustomCategoryTemplate[]>([]);
  const [selectedCustomCategoryId, setSelectedCustomCategoryId] = useState<string>('');

  useEffect(() => {
    if (!open) return;

    let isMounted = true;

    const fetchTemplates = async () => {
      try {
        const templates = await customCategoryService.getTemplates('asset');
        if (!isMounted) return;
        setCustomCategoryTemplates(templates);
      } catch (error) {
        console.error('Failed to load custom asset categories', error);
      }
    };

    void fetchTemplates();

    return () => {
      isMounted = false;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;

    if (initialAsset) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { id: _id, updatedAt: _updatedAt, createdAt: _createdAt, ...rest } = initialAsset;
      setFormValues({
        ...defaultValues,
        ...rest,
      });
      
      // Transform documents: if they're strings (URLs), convert to document objects
      const transformedDocuments = (initialAsset.documents || []).map((doc, index) => {
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
            uploadedAt: initialAsset.updatedAt || initialAsset.createdAt || new Date().toISOString(),
          };
        }
        // Already an object, return as-is
        return doc;
      });
      
      setDocuments(transformedDocuments);
      setCustomFields(initialAsset.customFields || []);
    } else {
      setFormValues(defaultValues);
      setDocuments([]);
      setUploadingFiles([]);
      setCustomFields([]);
      setSelectedCustomCategoryId('');
    }
    setErrors({});
  }, [initialAsset, open]);

  useEffect(() => {
    if (
      initialAsset &&
      initialAsset.category === 'custom' &&
      initialAsset.customCategoryName &&
      customCategoryTemplates.length > 0
    ) {
      const template = customCategoryTemplates.find(
        (t) => t.name.toLowerCase() === initialAsset.customCategoryName?.toLowerCase()
      );
      if (template) {
        setSelectedCustomCategoryId(template.id);
      }
    }
  }, [initialAsset, customCategoryTemplates]);

  // Handle dynamic field changes
  const handleFieldChange = (fieldName: string, value: string | number | undefined) => {
    setFormValues((prev) => ({
      ...prev,
      [fieldName]: value,
    }));
  };

  // Handle custom category selection
  const handleCategoryChange = (categoryValue: string) => {
    // Check if it's a custom category (template ID)
    const template = customCategoryTemplates.find((t) => t.id === categoryValue);
    
    if (template) {
      // It's a custom category - load fields from template
      const fields = customCategoryService.createFieldsFromTemplate(template);
      setFormValues((prev) => ({
        ...prev,
        category: 'custom',
        customCategoryName: template.name,
        customFields: fields,
      }));
      setSelectedCustomCategoryId(template.id);
      setCustomFields(fields);
    } else {
      // It's a standard category
      setFormValues((prev) => ({
        ...prev,
        category: categoryValue as AssetCategory,
        customCategoryName: undefined,
        customFields: undefined,
      }));
      setSelectedCustomCategoryId('');
      setCustomFields([]);
    }
  };

  const validate = () => {
    const currentErrors: Record<string, string> = {};
    if (!formValues.name.trim()) {
      currentErrors.name = 'Name is required';
    }
    if (!formValues.owner.trim()) {
      currentErrors.owner = 'Owner is required';
    }
    if (!Number.isFinite(formValues.value) || formValues.value <= 0) {
      currentErrors.value = 'Value must be greater than 0';
    }
    setErrors(currentErrors);
    return Object.keys(currentErrors).length === 0;
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

  // Custom field handlers
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

  const handleSubmit = () => {
    if (!validate()) return;

    // Get custom category name if applicable
    const customCategoryName = selectedCustomCategoryId 
      ? customCategoryTemplates.find(t => t.id === selectedCustomCategoryId)?.name 
      : (formValues.category === 'custom' ? (formValues.customCategoryName ?? initialAsset?.customCategoryName) : undefined);

    // Filter out blob URLs (previews) and keep only existing S3 URLs
    // These will be sent as string[] to backend, which will handle S3 deletion for removed ones
    const existingDocumentUrls = documents
      .filter((doc) => !doc.url.startsWith('blob:'))
      .map((doc) => doc.url);

    const payload: AssetCreateInput = {
      ...formValues,
      value: Number(formValues.value),
      // Send as array of objects for frontend type, but assetService will convert to string[] for backend
      documents: existingDocumentUrls.length > 0 
        ? existingDocumentUrls.map((url, index) => ({
            id: `doc-${Date.now()}-${index}`,
            name: documents.find(d => d.url === url)?.name || `Document ${index + 1}`,
            url,
            type: documents.find(d => d.url === url)?.type || 'application/pdf',
            uploadedAt: new Date().toISOString(),
          }))
        : undefined,
      customFields: formValues.category === 'custom' && customFields.length > 0 ? customFields : undefined,
      customCategoryName: customCategoryName,
    };

    // Pass payload and files to onSubmit
    onSubmit(payload, uploadingFiles.length > 0 ? uploadingFiles : undefined);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{initialAsset ? 'Edit Asset' : 'Add Asset'}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          {/* Category Selector - Special handling for custom categories */}
          <TextField
            label="Category"
            select
            value={selectedCustomCategoryId || formValues.category}
            onChange={(e) => handleCategoryChange(e.target.value)}
            fullWidth
            required
          >
            {assetCategoryOptions.map((option) => (
              <MenuItem key={option} value={option}>
                {assetCategoryLabels[option]}
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
          <AssetFormFields
            category={formValues.category}
            formValues={formValues}
            errors={errors}
            onChange={handleFieldChange}
            documents={documents}
            handleFileUpload={handleFileUpload}
            handleRemoveDocument={handleRemoveDocument}
          />
          {/* Custom Fields - Only shown for custom category */}
          {formValues.category === 'custom' && customFields.length > 0 && (
            <CustomFieldsRenderer
              customFields={customFields}
              onFieldChange={handleCustomFieldChange}
              categoryName={customCategoryTemplates.find(t => t.id === selectedCustomCategoryId)?.name}
            />
          )}

          {/* Fully Dynamic Form - All fields rendered from configuration */}
         
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button variant="text" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="contained" onClick={handleSubmit}>
          {initialAsset ? 'Save Changes' : 'Add Asset'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AssetFormDialog;

