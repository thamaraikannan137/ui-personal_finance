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
  onSubmit: (values: LiabilityCreateInput) => void;
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
      setCustomFields(initialLiability.customFields || []);
    } else {
      setFormValues(defaultValues);
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

  const handleSubmit = () => {
    if (!validate()) return;

    const customCategoryName = selectedCustomCategoryId
      ? customCategoryTemplates.find((t) => t.id === selectedCustomCategoryId)?.name
      : (formValues.category === 'custom' ? formValues.customCategoryName : undefined);

    onSubmit({
      ...formValues,
      balance: Number(formValues.balance),
      interestRate:
        formValues.interestRate === undefined ? undefined : Number(formValues.interestRate),
      customFields: formValues.category === 'custom' ? customFields : undefined,
      customCategoryName,
    });
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

