import type { AssetCategory } from '../types';
import type { FormFieldDefinition, FormFieldType } from '../types/formField';

export type AssetFieldType = FormFieldType;
export type AssetFieldDefinition = FormFieldDefinition;

/**
 * Configuration for each asset category with complete field definitions
 * Each category has an array of field objects that define how to render each field
 */
export const assetFieldsConfig: Record<AssetCategory, AssetFieldDefinition[]> = {
  // Land - Physical property tracking
  land: [
    {
      fieldName: 'location',
      type: 'text',
      label: 'Location',
      placeholder: 'Enter location (e.g., Salem, Tamil Nadu)',
      required: false,
      helperText: 'Physical location of the land',
    },
    {
      fieldName: 'purchaseDate',
      type: 'date',
      label: 'Purchase Date',
      required: false,
      helperText: 'When the land was purchased',
    },
    {
      fieldName: 'initialValue',
      type: 'currency',
      label: 'Purchase Price',
      placeholder: 'Enter purchase price',
      required: false,
      helperText: 'Original purchase price to track gains/losses',
      min: 0,
      step: 0.01,
    },
    {
      fieldName: 'description',
      type: 'textarea',
      label: 'Description',
      placeholder: 'Enter details about the land',
      required: false,
      helperText: 'Survey number, dimensions, or other details',
      minRows: 3,
    },
    {
      fieldName: 'documentURL',
      type: 'url',
      label: 'Document URL',
      placeholder: 'https://',
      required: false,
      helperText: 'Link to property documents or deeds',
    },
  ],

  // Property - Real estate tracking
  property: [
    {
      fieldName: 'location',
      type: 'text',
      label: 'Location',
      placeholder: 'Enter property address',
      required: false,
      helperText: 'Full address of the property',
    },
    {
      fieldName: 'purchaseDate',
      type: 'date',
      label: 'Purchase Date',
      required: false,
      helperText: 'When the property was purchased',
    },
    {
      fieldName: 'initialValue',
      type: 'currency',
      label: 'Purchase Price',
      placeholder: 'Enter purchase price',
      required: false,
      helperText: 'Original purchase price',
      min: 0,
      step: 0.01,
    },
    {
      fieldName: 'description',
      type: 'textarea',
      label: 'Description',
      placeholder: 'Enter property details',
      required: false,
      helperText: 'Property type, size, features, etc.',
      minRows: 3,
    },
    {
      fieldName: 'documentURL',
      type: 'url',
      label: 'Document URL',
      placeholder: 'https://',
      required: false,
      helperText: 'Link to property documents',
    },
  ],

  // Gold - Physical gold tracking
  gold: [
    {
      fieldName: 'documentURL',
      type: 'url',
      label: 'Document URL',
      placeholder: 'https://',
      required: false,
      helperText: 'Link to purchase receipts or certificates',
    },
  ],

  // Gold Scheme - Monthly investment schemes
  gold_scheme: [
    {
      fieldName: 'institution',
      type: 'text',
      label: 'Jeweler/Institution',
      placeholder: 'Enter jeweler or bank name',
      required: false,
      helperText: 'Name of the jeweler or institution',
    },
    {
      fieldName: 'purchaseDate',
      type: 'date',
      label: 'Scheme Start Date',
      required: false,
      helperText: 'When the scheme started',
    },
    {
      fieldName: 'endDate',
      type: 'date',
      label: 'Maturity Date',
      required: false,
      helperText: 'When the scheme matures',
    },
    {
      fieldName: 'initialValue',
      type: 'currency',
      label: 'Down Payment',
      placeholder: 'Enter initial payment',
      required: false,
      helperText: 'Initial amount paid',
      min: 0,
      step: 0.01,
    },
    {
      fieldName: 'monthlyPayment',
      type: 'currency',
      label: 'Monthly Payment',
      placeholder: 'Enter monthly amount',
      required: false,
      helperText: 'Monthly installment amount',
      min: 0,
      step: 0.01,
    },
    {
      fieldName: 'documentURL',
      type: 'url',
      label: 'Document URL',
      placeholder: 'https://',
      required: false,
      helperText: 'Link to scheme documents',
    },
  ],

  // Lent Money - Money lent to others
  lent_money: [
    {
      fieldName: 'purchaseDate',
      type: 'date',
      label: 'Loan Date',
      required: false,
      helperText: 'When the money was lent',
    },
    {
      fieldName: 'endDate',
      type: 'date',
      label: 'Return Date',
      required: false,
      helperText: 'Expected return date',
    },
    {
      fieldName: 'initialValue',
      type: 'currency',
      label: 'Loan Amount',
      placeholder: 'Enter loan amount',
      required: false,
      helperText: 'Principal amount lent',
      min: 0,
      step: 0.01,
    },
    {
      fieldName: 'rateOfReturn',
      type: 'percentage',
      label: 'Interest Rate',
      placeholder: 'Enter interest rate',
      required: false,
      helperText: 'Annual interest rate (if any)',
      min: 0,
      max: 100,
      step: 0.1,
    },
    {
      fieldName: 'description',
      type: 'textarea',
      label: 'Borrower Details',
      placeholder: 'Enter borrower name and details',
      required: false,
      helperText: 'Name and contact of the borrower',
      minRows: 2,
    },
    {
      fieldName: 'documentURL',
      type: 'url',
      label: 'Document URL',
      placeholder: 'https://',
      required: false,
      helperText: 'Link to loan agreement or promissory note',
    },
  ],

  // Savings Account - Bank savings
  savings: [
    {
      fieldName: 'institution',
      type: 'text',
      label: 'Bank Name',
      placeholder: 'Enter bank name',
      required: false,
      helperText: 'Name of the bank',
    },
    {
      fieldName: 'accountNumber',
      type: 'text',
      label: 'Account Number',
      placeholder: 'Enter account number',
      required: false,
      helperText: 'Bank account number',
    },
    {
      fieldName: 'documentURL',
      type: 'url',
      label: 'Document URL',
      placeholder: 'https://',
      required: false,
      helperText: 'Link to bank statements',
    },
  ],

  // Fixed Deposit - Term deposits
  fixed_deposit: [
    {
      fieldName: 'institution',
      type: 'text',
      label: 'Bank/Institution',
      placeholder: 'Enter bank name',
      required: false,
      helperText: 'Name of the bank or financial institution',
    },
    {
      fieldName: 'accountNumber',
      type: 'text',
      label: 'FD Number',
      placeholder: 'Enter FD account number',
      required: false,
      helperText: 'Fixed deposit account number',
    },
    {
      fieldName: 'purchaseDate',
      type: 'date',
      label: 'Start Date',
      required: false,
      helperText: 'FD start date',
    },
    {
      fieldName: 'endDate',
      type: 'date',
      label: 'Maturity Date',
      required: false,
      helperText: 'FD maturity date',
    },
    {
      fieldName: 'initialValue',
      type: 'currency',
      label: 'Principal Amount',
      placeholder: 'Enter deposit amount',
      required: false,
      helperText: 'Amount deposited',
      min: 0,
      step: 0.01,
    },
    {
      fieldName: 'rateOfReturn',
      type: 'percentage',
      label: 'Interest Rate',
      placeholder: 'Enter interest rate',
      required: false,
      helperText: 'Annual interest rate',
      min: 0,
      max: 100,
      step: 0.1,
    },
    {
      fieldName: 'documentURL',
      type: 'url',
      label: 'Document URL',
      placeholder: 'https://',
      required: false,
      helperText: 'Link to FD certificate',
    },
  ],

  // Investment - Stocks, mutual funds, etc.
  investment: [
    {
      fieldName: 'institution',
      type: 'text',
      label: 'Broker/Platform',
      placeholder: 'Enter broker or platform name',
      required: false,
      helperText: 'Trading platform or broker name',
    },
    {
      fieldName: 'accountNumber',
      type: 'text',
      label: 'Account Number',
      placeholder: 'Enter account or folio number',
      required: false,
      helperText: 'Demat account or folio number',
    },
    {
      fieldName: 'initialValue',
      type: 'currency',
      label: 'Investment Amount',
      placeholder: 'Enter initial investment',
      required: false,
      helperText: 'Initial amount invested',
      min: 0,
      step: 0.01,
    },
    {
      fieldName: 'rateOfReturn',
      type: 'percentage',
      label: 'Expected Return',
      placeholder: 'Enter expected return %',
      required: false,
      helperText: 'Expected annual return',
      min: 0,
      max: 100,
      step: 0.1,
    },
    {
      fieldName: 'documentURL',
      type: 'url',
      label: 'Document URL',
      placeholder: 'https://',
      required: false,
      helperText: 'Link to investment statements',
    },
  ],

  // Retirement - Retirement accounts
  retirement: [
    {
      fieldName: 'institution',
      type: 'text',
      label: 'Institution',
      placeholder: 'Enter institution name',
      required: false,
      helperText: 'EPF, PPF, NPS provider name',
    },
    {
      fieldName: 'accountNumber',
      type: 'text',
      label: 'Account Number',
      placeholder: 'Enter account number',
      required: false,
      helperText: 'Retirement account number',
    },
    {
      fieldName: 'documentURL',
      type: 'url',
      label: 'Document URL',
      placeholder: 'https://',
      required: false,
      helperText: 'Link to statements',
    },
  ],

  // Other - Miscellaneous assets
  other: [
    {
      fieldName: 'documentURL',
      type: 'url',
      label: 'Document URL',
      placeholder: 'https://',
      required: false,
      helperText: 'Link to related documents',
    },
  ],

  // Custom - User-defined categories (uses custom fields instead)
  custom: [],
};

/**
 * Get field definitions for a specific category
 */
export const getFieldsForCategory = (category: AssetCategory): AssetFieldDefinition[] => {
  return assetFieldsConfig[category] || [];
};
