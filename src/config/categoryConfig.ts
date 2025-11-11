import type { AssetCategory, LiabilityCategory } from '../types';

/**
 * Centralized category configuration
 * Single source of truth for all category definitions
 */

// ============= ASSET CATEGORIES =============

export const assetCategoryOptions: AssetCategory[] = [
  'savings',
  'fixed_deposit',
  'land',
  'gold',
  'gold_scheme',
  'lent_money',
  'investment',
  'property',
  'retirement',
  'other',
];

export const assetCategoryLabels: Record<AssetCategory, string> = {
  land: 'Land',
  gold: 'Gold',
  gold_scheme: 'Gold Scheme',
  lent_money: 'Lent Money',
  savings: 'Savings Account',
  fixed_deposit: 'Fixed Deposit',
  investment: 'Investment',
  property: 'Property',
  retirement: 'Retirement',
  other: 'Other',
  custom: 'Custom',
};

export const assetCategoryIcons: Record<AssetCategory, string> = {
  land: 'ri-landscape-line',
  gold: 'ri-copper-coin-line',
  gold_scheme: 'ri-vip-crown-line',
  lent_money: 'ri-hand-coin-line',
  savings: 'ri-bank-line',
  fixed_deposit: 'ri-safe-line',
  investment: 'ri-stock-line',
  property: 'ri-building-line',
  retirement: 'ri-shield-check-line',
  other: 'ri-more-line',
  custom: 'ri-settings-3-line',
};

// ============= LIABILITY CATEGORIES =============

export const liabilityCategoryOptions: LiabilityCategory[] = [
  'credit',
  'loan',
  'mortgage',
  'tax',
  'other',
];

export const liabilityCategoryLabels: Record<LiabilityCategory, string> = {
  credit: 'Credit Card',
  loan: 'Loan',
  mortgage: 'Mortgage',
  tax: 'Tax',
  other: 'Other',
  custom: 'Custom',
};

export const liabilityCategoryIcons: Record<LiabilityCategory, string> = {
  credit: 'ri-bank-card-line',
  loan: 'ri-money-dollar-circle-line',
  mortgage: 'ri-home-4-line',
  tax: 'ri-file-list-3-line',
  other: 'ri-more-line',
  custom: 'ri-settings-3-line',
};

// ============= HELPER FUNCTIONS =============

/**
 * Get label for asset category (handles custom categories)
 */
export const getAssetCategoryLabel = (
  category: AssetCategory,
  customCategoryName?: string
): string => {
  if (category === 'custom' && customCategoryName) {
    return customCategoryName;
  }
  return assetCategoryLabels[category];
};

/**
 * Get label for liability category (handles custom categories)
 */
export const getLiabilityCategoryLabel = (
  category: LiabilityCategory,
  customCategoryName?: string
): string => {
  if (category === 'custom' && customCategoryName) {
    return customCategoryName;
  }
  return liabilityCategoryLabels[category];
};

/**
 * Get icon for asset category
 */
export const getAssetCategoryIcon = (category: AssetCategory): string => {
  return assetCategoryIcons[category];
};

/**
 * Get icon for liability category
 */
export const getLiabilityCategoryIcon = (category: LiabilityCategory): string => {
  return liabilityCategoryIcons[category];
};

/**
 * Get all asset categories as options for dropdowns
 */
export const getAssetCategoryOptions = () => {
  return assetCategoryOptions.map((category) => ({
    value: category,
    label: assetCategoryLabels[category],
    icon: assetCategoryIcons[category],
  }));
};

/**
 * Get all liability categories as options for dropdowns
 */
export const getLiabilityCategoryOptions = () => {
  return liabilityCategoryOptions.map((category) => ({
    value: category,
    label: liabilityCategoryLabels[category],
    icon: liabilityCategoryIcons[category],
  }));
};

