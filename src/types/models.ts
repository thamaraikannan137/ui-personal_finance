// Domain models and entities

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl?: string;
  category: string;
  inStock: boolean;
}

export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderItem {
  productId: string;
  quantity: number;
  price: number;
}

export const OrderStatus = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
} as const;

export type OrderStatus = typeof OrderStatus[keyof typeof OrderStatus];

// Personal finance domain models

export const AssetCategory = {
  LAND: 'land',
  GOLD: 'gold',
  GOLD_SCHEME: 'gold_scheme',
  LENT_MONEY: 'lent_money',
  SAVINGS: 'savings',
  FIXED_DEPOSIT: 'fixed_deposit',
  INVESTMENT: 'investment',
  PROPERTY: 'property',
  RETIREMENT: 'retirement',
  OTHER: 'other',
  CUSTOM: 'custom',
} as const;

export type AssetCategory = typeof AssetCategory[keyof typeof AssetCategory];

// Custom Field Types for Custom Assets
export const CustomFieldType = {
  TEXT: 'text',
  NUMBER: 'number',
  CURRENCY: 'currency',
  DATE: 'date',
  URL: 'url',
  EMAIL: 'email',
  PHONE: 'phone',
  TEXTAREA: 'textarea',
  PERCENTAGE: 'percentage',
} as const;

export type CustomFieldType = typeof CustomFieldType[keyof typeof CustomFieldType];

export interface CustomFieldDefinition {
  id: string;
  name: string; // Display name of the field
  type: CustomFieldType; // Type of the field
  value: string | number | null; // Actual value
  required: boolean; // Whether field is required
  placeholder?: string; // Placeholder text
}

// Custom Category Template - Reusable category with predefined fields
export const CategoryTemplateType = {
  ASSET: 'asset',
  LIABILITY: 'liability',
} as const;

export type CategoryTemplateType = typeof CategoryTemplateType[keyof typeof CategoryTemplateType];

export interface CustomCategoryTemplate {
  id: string;
  name: string; // Category name (e.g., "Vehicle", "Collectible", "Jewelry")
  categoryType: CategoryTemplateType; // Whether this is for assets or liabilities
  description?: string; // Optional description
  icon?: string; // Optional icon class
  fields: Omit<CustomFieldDefinition, 'value'>[]; // Field definitions without values
  createdAt: string;
  updatedAt: string;
}

export interface Asset {
  id: string;
  userId?: string; // Reference to user (optional for now, for multi-user support)
  name: string;
  category: AssetCategory; // Type of asset (Land, Gold, LentMoney, etc.)
  description?: string; // Detailed notes about the asset
  
  // Financial details
  value: number; // Current estimated value
  initialValue?: number; // Original purchase price (to track gain/loss)
  
  // Dates
  purchaseDate?: string; // When asset was acquired
  endDate?: string; // Maturity/end date (for FD, lending, schemes)
  createdAt?: string; // Record creation timestamp
  updatedAt: string; // Last update timestamp
  
  // Asset-specific fields
  rateOfReturn?: number; // Interest rate / ROI percentage
  monthlyPayment?: number; // For monthly investment schemes
  
  // Document management
  documentURL?: string; // Link to deed, contract, receipt, certificate
  documents?: Array<{
    id: string;
    name: string;
    url: string;
    type: string;
    uploadedAt: string;
  }>; // Multiple documents support
  
  // Location (for land/property)
  location?: string; // Physical location
  
  // Owner details
  owner: string; // Primary owner name
  
  // Legacy fields (keeping for backward compatibility)
  institution?: string; // Bank/institution name
  accountNumber?: string; // Account number
  notes?: string; // Additional notes
  
  // Custom fields (for Custom category assets)
  customFields?: CustomFieldDefinition[];
  customCategoryName?: string; // Name of custom category template (e.g., "Vehicle", "Collectible")
}

export const LiabilityCategory = {
  CREDIT: 'credit',
  LOAN: 'loan',
  MORTGAGE: 'mortgage',
  TAX: 'tax',
  OTHER: 'other',
  CUSTOM: 'custom',
} as const;

export type LiabilityCategory = typeof LiabilityCategory[keyof typeof LiabilityCategory];

export interface Liability {
  id: string;
  name: string;
  category: LiabilityCategory;
  balance: number;
  interestRate?: number;
  dueDate?: string;
  institution?: string;
  owner: string;
  updatedAt: string;
  notes?: string;
  
  // Custom fields (for Custom category liabilities)
  customFields?: CustomFieldDefinition[];
  customCategoryName?: string; // Name of custom category template
}

export interface FinancialSummary {
  totalAssets: number;
  totalLiabilities: number;
  netWorth: number;
  assetChangePercent?: number;
  liabilityChangePercent?: number;
}

export type AssetCreateInput = Omit<Asset, 'id' | 'updatedAt'> & { updatedAt?: string };
export type AssetUpdateInput = Partial<Omit<Asset, 'id'>>;

export type LiabilityCreateInput = Omit<Liability, 'id' | 'updatedAt'> & { updatedAt?: string };
export type LiabilityUpdateInput = Partial<Omit<Liability, 'id'>>;

