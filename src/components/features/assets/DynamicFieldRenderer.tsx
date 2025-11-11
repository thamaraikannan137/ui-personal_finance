import { TextField, InputAdornment } from '@mui/material';
import type { FormFieldDefinition } from '../../../types/formField';

interface DynamicFieldRendererProps<TField extends FormFieldDefinition = FormFieldDefinition> {
  field: TField;
  value: unknown;
  onChange: (fieldName: string, value: string | number | undefined) => void;
  error?: string;
}

/**
 * Renders a single field based on its configuration
 * Automatically determines the correct input type and props
 */
export const DynamicFieldRenderer = <TField extends FormFieldDefinition = FormFieldDefinition>({
  field,
  value,
  onChange,
  error,
}: DynamicFieldRendererProps<TField>) => {
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let newValue: string | number | undefined = e.target.value;
    
    // Convert to appropriate type based on field type
    if (['number', 'currency', 'percentage'].includes(field.type)) {
      newValue = e.target.value === '' ? undefined : Number(e.target.value);
    }
    
    onChange(field.fieldName, newValue);
  };

  // Build input props based on field type
  const getInputProps = () => {
    const baseProps = {
      min: field.min,
      max: field.max,
      step: field.step,
    };

    switch (field.type) {
      case 'number':
      case 'currency':
      case 'percentage':
        return {
          type: 'number',
          ...baseProps,
        };
      
      case 'date':
        return { type: 'date' };
      
      case 'email':
        return { type: 'email' };
      
      case 'tel':
        return { type: 'tel' };
      
      case 'url':
        return { type: 'url' };
      
      default:
        return { type: 'text' };
    }
  };

  // Build InputProps for MUI TextField
  const getTextFieldProps = () => {
    const props: {
      startAdornment?: React.ReactNode;
      endAdornment?: React.ReactNode;
    } = {};

    // Add adornments for currency and percentage
    if (field.type === 'currency') {
      props.startAdornment = <InputAdornment position="start">₹</InputAdornment>;
    } else if (field.type === 'percentage') {
      props.endAdornment = <InputAdornment position="end">%</InputAdornment>;
    }

    return Object.keys(props).length > 0 ? props : undefined;
  };

  // Determine if field should be multiline
  const isMultiline = field.type === 'textarea';

  // Handle date input label shrinking
  const shouldShrinkLabel = field.type === 'date';

  return (
    <TextField
      label={field.label}
      value={value || ''}
      onChange={handleChange}
      placeholder={field.placeholder}
      helperText={error || field.helperText}
      error={Boolean(error)}
      required={field.required}
      fullWidth
      multiline={isMultiline}
      minRows={isMultiline ? field.minRows || 3 : undefined}
      inputProps={getInputProps()}
      InputProps={getTextFieldProps()}
      InputLabelProps={shouldShrinkLabel ? { shrink: true } : undefined}
    />
  );
};

export default DynamicFieldRenderer;

