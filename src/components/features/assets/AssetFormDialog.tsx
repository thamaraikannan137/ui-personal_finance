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
import { DefaultAssetForm } from './DefaultAssetForm';
import { assetCategoryOptions, assetCategoryLabels } from '../../../config/categoryConfig';

type AssetFormValues = AssetCreateInput;

interface AssetFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: AssetCreateInput) => void;
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
      setDocuments(initialAsset.documents || []);
      setCustomFields(initialAsset.customFields || []);
    } else {
      setFormValues(defaultValues);
      setDocuments([]);
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

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const newDoc = {
          id: `doc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          name: file.name,
          url: e.target?.result as string,
          type: file.type,
          uploadedAt: new Date().toISOString(),
        };
        setDocuments((prev) => [...prev, newDoc]);
      };
      reader.readAsDataURL(file);
    });

    // Reset input
    event.target.value = '';
  };

  const handleRemoveDocument = (docId: string) => {
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

    onSubmit({
      ...formValues,
      value: Number(formValues.value),
      documents: documents.length > 0 ? documents : undefined,
      customFields: formValues.category === 'custom' && customFields.length > 0 ? customFields : undefined,
      customCategoryName: customCategoryName,
    });
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
          <DefaultAssetForm
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

