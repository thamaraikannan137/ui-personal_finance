export type FormFieldType =
  | 'text'
  | 'number'
  | 'date'
  | 'currency'
  | 'percentage'
  | 'textarea'
  | 'email'
  | 'url'
  | 'tel';

export interface FormFieldDefinition {
  fieldName: string;
  type: FormFieldType;
  label: string;
  placeholder?: string;
  required?: boolean;
  helperText?: string;
  min?: number;
  max?: number;
  step?: number;
  minRows?: number;
}



