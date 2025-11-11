import type { LiabilityCategory } from '../types';
import type { FormFieldDefinition, FormFieldType } from '../types/formField';

export type LiabilityFieldType = FormFieldType;
export type LiabilityFieldDefinition = FormFieldDefinition;

export type LiabilityFieldName =
  | 'interestRate'
  | 'dueDate'
  | 'institution';

const liabilityFieldDefinitions: Record<LiabilityFieldName, LiabilityFieldDefinition> = {
  interestRate: {
    fieldName: 'interestRate',
    type: 'percentage',
    label: 'Interest Rate (%)',
    placeholder: 'Enter interest rate',
    helperText: 'Annual interest rate (optional)',
    min: 0,
    max: 100,
    step: 0.1,
  },
  dueDate: {
    fieldName: 'dueDate',
    type: 'date',
    label: 'Due Date',
    helperText: 'Next payment due date',
  },
  institution: {
    fieldName: 'institution',
    type: 'text',
    label: 'Institution',
    helperText: 'Bank or financial institution name',
    placeholder: 'Enter institution name',
  },
};

/**
 * Configuration for which fields are visible for each liability category
 */
export const liabilityFieldsConfig: Record<LiabilityCategory, LiabilityFieldName[]> = {
  credit: ['institution', 'dueDate', 'interestRate'],
  loan: ['institution', 'dueDate', 'interestRate'],
  mortgage: ['institution', 'dueDate', 'interestRate'],
  tax: ['dueDate'],
  other: ['dueDate'],
  custom: [],
};

export const getLiabilityFieldDefinition = (fieldName: LiabilityFieldName): LiabilityFieldDefinition =>
  liabilityFieldDefinitions[fieldName];

export const getLiabilityFieldDefinitionsForCategory = (
  category: LiabilityCategory
): LiabilityFieldDefinition[] => {
  return (liabilityFieldsConfig[category] || []).map((fieldName) => liabilityFieldDefinitions[fieldName]);
};


