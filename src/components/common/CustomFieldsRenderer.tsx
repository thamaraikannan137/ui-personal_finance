import { TextField, InputAdornment } from '@mui/material';
import type { CustomFieldDefinition } from '../../types';

interface CustomFieldsRendererProps {
  customFields: CustomFieldDefinition[];
  onFieldChange: (fieldId: string, updates: Partial<CustomFieldDefinition>) => void;
  categoryName?: string;
  showSectionHeader?: boolean;
}

export const CustomFieldsRenderer = ({
  customFields,
  onFieldChange,
}: CustomFieldsRendererProps) => {

  if (customFields.length === 0) {
    return null;
  }

  return (
    <>
      {customFields.map((field) => (
        <TextField
          key={field.id}
          label={field.name}
          value={field.value || ''}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            let value: string | number | null = e.target.value;
            if (['number', 'currency', 'percentage'].includes(field.type)) {
              value = e.target.value === '' ? null : Number(e.target.value);
            }
            onFieldChange(field.id, { value });
          }}
          fullWidth
          required={field.required}
          placeholder={field.placeholder || `Enter ${field.name}`}
          type={field.type === 'date' ? 'date' : field.type === 'email' ? 'email' : field.type === 'phone' ? 'tel' : field.type === 'url' ? 'url' : ['number', 'currency', 'percentage'].includes(field.type) ? 'number' : 'text'}
          multiline={field.type === 'textarea'}
          minRows={field.type === 'textarea' ? 3 : undefined}
          inputProps={
            field.type === 'number' ? { step: 'any' } :
            field.type === 'currency' ? { min: 0, step: 0.01 } :
            field.type === 'percentage' ? { min: 0, max: 100, step: 0.1 } :
            undefined
          }
          InputProps={
            field.type === 'currency' ? { startAdornment: <InputAdornment position="start">₹</InputAdornment> } :
            field.type === 'percentage' ? { endAdornment: <InputAdornment position="end">%</InputAdornment> } :
            undefined
          }
          InputLabelProps={field.type === 'date' ? { shrink: true } : undefined}
        />
      ))}
    </>
  );
};

export default CustomFieldsRenderer;

