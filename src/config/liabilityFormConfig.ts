import type { LiabilityFieldDefinition } from './liabilityFieldsConfig';

export const commonLiabilityFields: LiabilityFieldDefinition[] = [
  {
    fieldName: 'name',
    type: 'text',
    label: 'Liability Name',
    placeholder: 'Enter liability name',
    required: true,
    helperText: 'A descriptive name for this liability',
  },
];

export const liabilityValueField: LiabilityFieldDefinition = {
  fieldName: 'balance',
  type: 'currency',
  label: 'Outstanding Balance',
  placeholder: 'Enter current balance',
  required: true,
  helperText: 'Current outstanding amount',
  min: 0,
  step: 0.01,
};

export const bottomLiabilityFields: LiabilityFieldDefinition[] = [
  {
    fieldName: 'owner',
    type: 'text',
    label: 'Owner',
    placeholder: 'Enter owner name',
    required: true,
    helperText: 'Who is responsible for this liability',
  },
  {
    fieldName: 'notes',
    type: 'textarea',
    label: 'Additional Notes',
    placeholder: 'Enter any additional details',
    helperText: 'Payment schedule, terms, reminders, etc.',
    minRows: 2,
  },
];

export interface LiabilityFormStructure {
  topFields: LiabilityFieldDefinition[];
  valueField: LiabilityFieldDefinition;
  bottomFields: LiabilityFieldDefinition[];
}

export const getLiabilityFormStructure = (): LiabilityFormStructure => ({
  topFields: commonLiabilityFields,
  valueField: liabilityValueField,
  bottomFields: bottomLiabilityFields,
});



