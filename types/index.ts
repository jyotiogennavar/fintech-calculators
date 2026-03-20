// ─── Shared Enums & Primitives ───────────────────────────────────────────────

export type AgeGroup = 'below60' | '60to80' | 'above80'
export type Regime = 'old' | 'new'
export type GainType = 'STCG' | 'LTCG'
export type DebtStrategy = 'avalanche' | 'snowball'
export type PrepaymentReduces = 'tenure' | 'emi'
export type CompoundingFrequency = 'annually' | 'quarterly' | 'monthly'

// ─── Tax ─────────────────────────────────────────────────────────────────────

export interface TaxDeductions {
  sec80C: number       // max 150000
  sec80D: number       // max 100000
  hra: number
  nps: number          // max 50000
  homeLoan: number     // max 200000
  sec80E: number
  other: number
}

export interface TaxInput {
  grossIncome: number
  ageGroup: AgeGroup
  assessmentYear: number
  deductions: TaxDeductions
}

export interface SlabDetail {
  from: number
  to: number | null    // null = infinity slab
  rate: number
  taxable: number
  tax: number
}

export interface TaxResult {
  regime: Regime
  taxableIncome: number
  slabBreakdown: SlabDetail[]
  basicTax: number
  rebate: number
  surcharge: number
  cess: number
  totalTax: number
  effectiveRate: number
  inHandIncome: number
}

export interface TaxComparison {
  old: TaxResult
  new: TaxResult
  recommendation: Regime | 'tie'
  savings: number      // positive = new is better, negative = old is better
}

// ─── EMI / Loans ─────────────────────────────────────────────────────────────

export interface PrepaymentConfig {
  amount: number
  atMonth: number
  reduces: PrepaymentReduces
}

export interface EMIInput {
  principal: number
  annualRate: number
  tenureMonths: number
  prepayment?: PrepaymentConfig
}

export interface AmortizationRow {
  month: number
  emi: number
  principal: number
  interest: number
  balance: number
  prepayment?: number
}

export interface EMIResult {
  emi: number
  totalPayable: number
  totalInterest: number
  schedule: AmortizationRow[]
  prepaymentSaving: number | null
  effectiveTenureMonths: number
}

// ─── Investments ─────────────────────────────────────────────────────────────

export interface SIPInput {
  monthlyAmount: number
  annualReturn: number
  tenureYears: number
  stepUpPercent?: number      // annual step-up %
}

export interface SIPResult {
  invested: number
  estimatedReturns: number
  maturityValue: number
  yearlyBreakdown: { year: number; invested: number; value: number }[]
}

export interface LumpsumInput {
  principal: number
  annualReturn: number
  tenureYears: number
  compounding: CompoundingFrequency
}

export interface LumpsumResult {
  invested: number
  estimatedReturns: number
  maturityValue: number
  cagr: number
}

export interface CAGRInput {
  initialValue: number
  finalValue: number
  tenureYears: number
}

export interface CAGRResult {
  cagr: number
  absoluteReturn: number
  absoluteReturnPct: number
}

export interface FDInput {
  principal: number
  annualRate: number
  tenureYears: number
  compounding: CompoundingFrequency
  tdsRate?: number
}

export interface FDResult {
  maturityValue: number
  totalInterest: number
  afterTaxInterest: number
  effectiveRate: number
}

// ─── Tax Extras ───────────────────────────────────────────────────────────────

export interface HRAInput {
  basicSalary: number
  hraReceived: number
  rentPaid: number
  isMetroCity: boolean
}

export interface HRAResult {
  exemption: number
  taxable: number
  breakdown: {
    hraReceived: number
    fiftyPctBasic: number   // metro: 50%, non-metro: 40%
    rentMinusTenPct: number
  }
}

export interface CapitalGainsInput {
  assetType: 'equity' | 'debt' | 'property' | 'gold'
  buyPrice: number
  sellPrice: number
  holdingMonths: number
  indexedCostIfApplicable?: number
}

export interface CapitalGainsResult {
  gainType: GainType
  gain: number
  tax: number
  effectiveRate: number
  indexationBenefit?: number
}

// ─── Retirement ───────────────────────────────────────────────────────────────

export interface FIREInput {
  currentAge: number
  retirementAge: number
  monthlyExpenses: number
  inflationRate: number
  expectedReturn: number
  existingCorpus: number
  lifeExpectancy: number
}

export interface FIREResult {
  corpusRequired: number
  monthlyInvestmentNeeded: number
  yearsToRetirement: number
  inflationAdjustedExpenses: number
  withdrawalRate: number
  yearlyProjection: { age: number; corpus: number }[]
}

// ─── Insurance ───────────────────────────────────────────────────────────────

export interface TermCoverInput {
  annualIncome: number
  age: number
  liabilities: number
  dependents: number
  existingCover: number
}

export interface TermCoverResult {
  recommendedCover: number
  incomeReplacementCover: number
  hlvCover: number             // Human Life Value method
  gap: number
}

// ─── Credit ───────────────────────────────────────────────────────────────────

export interface CreditCardInput {
  balance: number
  annualRate: number
  monthlyPayment: number
  promoPeriodMonths?: number
  promoRate?: number
}

export interface CreditCardResult {
  monthsToPayoff: number
  totalInterest: number
  totalPaid: number
  schedule: { month: number; payment: number; interest: number; balance: number }[]
}

export interface Debt {
  id: string
  name: string
  balance: number
  annualRate: number
  minimumPayment: number
}

export interface DebtStrategyInput {
  debts: Debt[]
  extraMonthlyPayment: number
  strategy: DebtStrategy
}

export interface DebtStrategyResult {
  orderedDebts: Debt[]
  totalMonths: number
  totalInterest: number
  totalPaid: number
  payoffSchedule: {
    debtId: string
    debtName: string
    payoffMonth: number
    totalInterest: number
  }[]
}

// ─── Calculator Registry (for landing page) ──────────────────────────────────

export type CalculatorCategory =
  | 'Tax'
  | 'Loans'
  | 'Investments'
  | 'Retirement'
  | 'Insurance'
  | 'Credit'

export interface CalculatorMeta {
  id: string
  title: string
  description: string
  href: string
  category: CalculatorCategory
  icon: string             // lucide icon name
  featured: boolean
  badge?: string           // e.g. "Popular", "New"
}