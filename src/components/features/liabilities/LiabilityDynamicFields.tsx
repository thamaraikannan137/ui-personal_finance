import { Stack } from '@mui/material';
import type { LiabilityCategory, LiabilityCreateInput } from '../../../types';
import { getLiabilityFieldDefinitionsForCategory } from '../../../config/liabilityFieldsConfig';
import { DynamicFieldRenderer } from '../assets/DynamicFieldRenderer';

interface LiabilityDynamicFieldsProps {
  category: LiabilityCategory;
  formValues: LiabilityCreateInput;
  errors: Record<string, string>;
  onChange: (fieldName: string, value: string | number | undefined) => void;
}

export const LiabilityDynamicFields = ({
  category,
  formValues,
  errors,
  onChange,
}: LiabilityDynamicFieldsProps) => {
  const fields = getLiabilityFieldDefinitionsForCategory(category);

  if (fields.length === 0) {
    return null;
  }

  return (
    <Stack spacing={2}>
      {fields.map((field) => (
        <DynamicFieldRenderer
          key={field.fieldName}
          field={field}
          value={(formValues as Record<string, unknown>)[field.fieldName]}
          onChange={onChange}
          error={errors[field.fieldName]}
        />
      ))}
    </Stack>
  );
};

export default LiabilityDynamicFields;



