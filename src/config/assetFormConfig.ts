import type { AssetFieldDefinition } from './assetFieldsConfig';

/**
 * Common fields that appear for ALL asset categories
 * These are the required/standard fields shown at the top of the form
 */
export const commonAssetFields: AssetFieldDefinition[] = [
  {
    fieldName: 'name',
    type: 'text',
    label: 'Asset Name',
    placeholder: 'Enter asset name',
    required: true,
    helperText: 'A descriptive name for this asset',
  },
  // Category is handled separately in the form (dropdown with custom categories)
];

/**
 * Value field - shown after custom fields for better UX
 */
export const assetValueField: AssetFieldDefinition = {
  fieldName: 'value',
  type: 'currency',
  label: 'Current Value',
  placeholder: 'Enter current value',
  required: true,
  helperText: 'Current market value or balance',
  min: 0,
  step: 0.01,
};

/**
 * Fields shown at the bottom of the form (after dynamic category fields)
 */
export const bottomAssetFields: AssetFieldDefinition[] = [
  {
    fieldName: 'owner',
    type: 'text',
    label: 'Owner',
    placeholder: 'Enter owner name',
    required: true,
    helperText: 'Who owns this asset',
  },
  {
    fieldName: 'notes',
    type: 'textarea',
    label: 'Additional Notes',
    placeholder: 'Enter any additional notes',
    required: false,
    helperText: 'Any other relevant information',
    minRows: 2,
  },
];

/**
 * Complete form structure for rendering
 */
export interface AssetFormStructure {
  topFields: AssetFieldDefinition[];
  categorySpecificFields: AssetFieldDefinition[];
  valueField: AssetFieldDefinition;
  bottomFields: AssetFieldDefinition[];
}

/**
 * Get the complete form structure for a given category
 */
export const getAssetFormStructure = (
  categoryFields: AssetFieldDefinition[]
): AssetFormStructure => {
  return {
    topFields: commonAssetFields,
    valueField: assetValueField,
    bottomFields: bottomAssetFields,
    categorySpecificFields: categoryFields,
    
  };
};

