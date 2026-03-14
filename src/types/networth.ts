export interface Address {
  line1?: string;
  line2?: string;
  city?: string;
  state?: string;
  pincode?: string;
}

export interface Client {
  id: string;
  auditorId: string;
  name: string;
  pan?: string;
  dateOfBirth?: string;
  permanentAddress?: Address;
  officeAddress?: Address;
  email?: string;
  phone?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type CertificateStatus = "draft" | "finalized";

export interface NetWorthCertificate {
  id: string;
  clientId: string | Client;
  auditorId: string;
  financialYear: string;
  asOnDate: string;
  status: CertificateStatus;
  totalImmovableProperty: number;
  totalMovableProperty: number;
  totalLiabilities: number;
  netWorth: number;
  netWorthInWords?: string;
  createdAt: string;
  updatedAt: string;
  finalizedAt?: string;
}

export interface LiabilitySummaryItem {
  borrowedFrom?: string;
  securitiesOffered?: string;
  purpose?: string;
  outstandingAmount: number;
}

export interface GuarantorSummaryItem {
  guaranteedTo?: string;
  borrowingsBy?: string;
  purpose?: string;
  amountGuaranteed: number;
}

export interface Annexure1Summary {
  totalBySelf: number;
  totalBySharing: number;
  grandTotal: number;
}

export interface Annexure2Summary {
  ppf: number;
  pensionScheme: number;
  huf: number;
  shares: number;
  fixedDeposit: number;
  recurringDeposit: number;
  otherDeposit: number;
  goldAndJewellery: number;
  insurancePolicies: number;
  vehicles: number;
  investmentInFirms: number;
  grandTotal: number;
}

export interface NetWorthSummary {
  clientName?: string;
  pan?: string;
  dateOfBirth?: string;
  permanentAddress?: Address;
  officeAddress?: Address;
  financialYear: string;
  asOnDate: string;
  totalImmovableProperty: number;
  totalMovableProperty: number;
  totalLiabilities: number;
  netWorth: number;
  netWorthInWords?: string;
  status: CertificateStatus;
  annexure1?: Annexure1Summary;
  annexure2?: Annexure2Summary;
  liabilityItems?: LiabilitySummaryItem[];
  guarantorItems?: GuarantorSummaryItem[];
}

// Annexure-1
export interface LoanSource {
  bankName?: string;
  loanAmountReceived?: number;
  sanctionLetterRef?: string;
  dateOfLoanReceived?: string;
  outstandingLoanAmount?: number;
}

export interface OtherSources {
  salary?: number;
  withdrawalFromSB?: number;
  withdrawalFromFD?: number;
  otherSource?: number;
  totalOtherSources?: number;
}

export interface PropertyRow {
  _id?: string;
  natureOfProperty?: "Flat" | "Land" | "Shop" | "Factory" | "House" | "Other";
  locationAddress?: string;
  dateOfPurchase?: string;
  propertyCost?: number;
  registrationCharges?: number;
  stampCharges?: number;
  vendorName?: string;
  vendorPan?: string;
  valueAtCost?: number;
  loanSource?: LoanSource;
  otherSources?: OtherSources;
  totalSourceOfFund?: number;
  sharingPersonName?: string;
  sharingPersonPan?: string;
  sharePercentage?: number;
}

export interface Annexure1 {
  id: string;
  certificateId: string;
  bySelf: PropertyRow[];
  bySharing: PropertyRow[];
  totalBySelf: number;
  totalBySharing: number;
  grandTotal: number;
}

// Annexure-2
export interface PersonAsset {
  refNo?: string;
  heldWith?: string;
  dateOfInvestment?: string;
  valueAtCost?: number;
  soldAmount?: number;
  presentValue?: number;
  maturityValue?: number;
}

export interface FamilySection {
  self?: PersonAsset;
  spouse?: PersonAsset;
  children?: PersonAsset;
  total?: number;
}

export interface ShareRow {
  _id?: string;
  companyName?: string;
  refNo?: string;
  heldWith?: string;
  dateOfInvestment?: string;
  quantity?: number;
  valueAtCost?: number;
  soldAmount?: number;
  presentValue?: number;
}

export interface GoldRow {
  _id?: string;
  description?: string;
  heldBy?: "self" | "spouse" | "children";
  weightGrams?: number;
  valueAtCost?: number;
  presentValue?: number;
}

export interface InsurancePolicy {
  policyName?: string;
  policyNo?: string;
  heldWith?: string;
  sumAssured?: number;
  premiumPaid?: number;
  surrenderValue?: number;
}

export interface InsuranceSection {
  self?: InsurancePolicy[];
  spouse?: InsurancePolicy[];
  children?: InsurancePolicy[];
  total?: number;
}

export interface VehicleRow {
  vehicleNo?: string;
  make?: string;
  model?: string;
  yearOfPurchase?: number;
  valueAtCost?: number;
  presentValue?: number;
}

export interface VehiclesSection {
  twoWheelers?: VehicleRow[];
  fourWheelers?: VehicleRow[];
  total?: number;
}

export interface FirmRow {
  _id?: string;
  firmName?: string;
  natureOfBusiness?: string;
  dateOfInvestment?: string;
  capitalInvested?: number;
  presentValue?: number;
}

export interface HufSection {
  hufName?: string;
  valueAtCost?: number;
  presentValue?: number;
  total?: number;
}

export interface Annexure2 {
  id: string;
  certificateId: string;
  ppf: FamilySection;
  pensionScheme: FamilySection;
  huf: HufSection;
  shares: ShareRow[];
  sharesTotal: number;
  fixedDeposit: FamilySection;
  recurringDeposit: FamilySection;
  otherDeposit: FamilySection;
  goldAndJewellery: GoldRow[];
  goldAndJewelleryTotal: number;
  insurancePolicies: InsuranceSection;
  vehicles: VehiclesSection;
  investmentInFirms: FirmRow[];
  investmentInFirmsTotal: number;
  grandTotal: number;
}

// Liabilities
export interface LiabilityItem {
  _id?: string;
  borrowedFrom?: string;
  amountBorrowed?: number;
  securitiesOffered?: string;
  purpose?: "Housing" | "Vehicle" | "Business" | "Personal" | "Other";
  outstandingAmount?: number;
}

export interface CertificateLiability {
  id: string;
  certificateId: string;
  items: LiabilityItem[];
  total: number;
}

// Guarantors
export interface GuarantorItem {
  _id?: string;
  guaranteedTo?: string;
  borrowingsBy?: string;
  purpose?: "Term Loan" | "Vehicles" | "Cash Credit" | "Other";
  amountGuaranteed?: number;
}

export interface GuarantorDetail {
  id: string;
  certificateId: string;
  items: GuarantorItem[];
}

// Pagination
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  pages: number;
}
