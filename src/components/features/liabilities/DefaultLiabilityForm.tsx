import { Stack } from '@mui/material';
import type { LiabilityCategory, LiabilityCreateInput } from '../../../types';
import { getLiabilityFormStructure } from '../../../config/liabilityFormConfig';
import { DynamicFieldRenderer } from '../assets/DynamicFieldRenderer';
import { LiabilityDynamicFields } from './LiabilityDynamicFields';

interface DefaultLiabilityFormProps {
  category: LiabilityCategory;
  formValues: LiabilityCreateInput;
  errors: Record<string, string>;
  onChange: (fieldName: string, value: string | number | undefined) => void;
}

export const DefaultLiabilityForm = ({
  category,
  formValues,
  errors,
  onChange,
}: DefaultLiabilityFormProps) => {
  const formStructure = getLiabilityFormStructure();

  const getFieldValue = (fieldName: string) => {
    return (formValues as Record<string, unknown>)[fieldName];
  };

  const getFieldError = (fieldName: string) => errors[fieldName];

  return (
    <Stack spacing={2}>
      {formStructure.topFields.map((field) => (
        <DynamicFieldRenderer
          key={field.fieldName}
          field={field}
          value={getFieldValue(field.fieldName)}
          onChange={onChange}
          error={getFieldError(field.fieldName)}
        />
      ))}

      {category !== 'custom' && (
        <LiabilityDynamicFields
          category={category}
          formValues={formValues}
          errors={errors}
          onChange={onChange}
        />
      )}

      <DynamicFieldRenderer
        field={formStructure.valueField}
        value={getFieldValue(formStructure.valueField.fieldName)}
        onChange={onChange}
        error={getFieldError(formStructure.valueField.fieldName)}
      />

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

export default DefaultLiabilityForm;



