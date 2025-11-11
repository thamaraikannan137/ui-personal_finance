import { Stack } from '@mui/material';
import type { AssetCategory, AssetCreateInput } from '../../../types';
import { getFieldsForCategory } from '../../../config/assetFieldsConfig';
import { getAssetFormStructure } from '../../../config/assetFormConfig';
import { DynamicFieldRenderer } from './DynamicFieldRenderer';
import { AssetDynamicFields } from './AssetDynamicFields';

interface DefaultAssetFormProps {
  category: AssetCategory;
  formValues: AssetCreateInput;
  errors: Record<string, string>;
  onChange: (fieldName: string, value: string | number | undefined) => void;
  documents: Array<{ id: string; name: string; url: string; type: string; uploadedAt: string }>;
  handleFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleRemoveDocument: (docId: string) => void;
}

/**
 * Fully dynamic form that renders all fields based on configuration
 * No hardcoded fields - everything comes from config
 */
export const DefaultAssetForm = ({
  category,
  formValues,
  errors,
  onChange,
  documents,
  handleFileUpload,
  handleRemoveDocument,
}: DefaultAssetFormProps) => {
  
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
        <AssetDynamicFields
          category={category}
          formValues={formValues}
          onChange={onChange}
          documents={documents}
          handleFileUpload={handleFileUpload}
          handleRemoveDocument={handleRemoveDocument}
        />
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

export default DefaultAssetForm;

