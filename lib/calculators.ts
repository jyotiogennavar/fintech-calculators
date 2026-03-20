import type { CalculatorMeta } from '@/types'

export const CALCULATORS: CalculatorMeta[] = [
  // ─── Tax ───
  {
    id: 'tax-regime',
    title: 'Old vs New Tax Regime',
    description: 'Compare tax liability under both regimes with full slab breakdown.',
    href: '/calculators/tax-regime',
    category: 'Tax',
    icon: 'landmark',
    featured: true,
    badge: 'Popular',
  },
  {
    id: 'hra',
    title: 'HRA Exemption',
    description: 'Calculate your HRA exemption based on salary, rent, and city.',
    href: '/calculators/hra',
    category: 'Tax',
    icon: 'home',
    featured: false,
  },
  {
    id: 'capital-gains',
    title: 'Capital Gains Tax',
    description: 'Compute STCG and LTCG tax on equity, debt, property, and gold.',
    href: '/calculators/capital-gains',
    category: 'Tax',
    icon: 'trending-up',
    featured: false,
  },

  // ─── Loans ───
  {
    id: 'emi',
    title: 'EMI Calculator',
    description: 'Calculate EMI, total interest, and full amortization schedule.',
    href: '/calculators/emi',
    category: 'Loans',
    icon: 'banknote',
    featured: true,
    badge: 'Popular',
  },
  {
    id: 'prepayment',
    title: 'Prepayment Impact',
    description: 'See how a lump-sum prepayment reduces tenure or EMI.',
    href: '/calculators/emi',   // handled as a tab within EMI calculator
    category: 'Loans',
    icon: 'circle-dollar-sign',
    featured: false,
  },

  // ─── Investments ───
  {
    id: 'sip',
    title: 'SIP Calculator',
    description: 'Project returns on monthly SIP investments with step-up support.',
    href: '/calculators/sip',
    category: 'Investments',
    icon: 'bar-chart-2',
    featured: true,
  },
  {
    id: 'lumpsum',
    title: 'Lumpsum / FV Calculator',
    description: 'Calculate future value of a one-time investment.',
    href: '/calculators/lumpsum',
    category: 'Investments',
    icon: 'wallet',
    featured: false,
  },
  {
    id: 'cagr',
    title: 'CAGR Calculator',
    description: 'Find the compounded annual growth rate between two values.',
    href: '/calculators/cagr',
    category: 'Investments',
    icon: 'percent',
    featured: false,
  },
  {
    id: 'fd-rd',
    title: 'FD / RD Calculator',
    description: 'Maturity value for fixed and recurring deposits with TDS.',
    href: '/calculators/fd-rd',
    category: 'Investments',
    icon: 'piggy-bank',
    featured: false,
  },

  // ─── Retirement ───
  {
    id: 'fire',
    title: 'FIRE Calculator',
    description: 'Find your retirement corpus and monthly investment needed.',
    href: '/calculators/fire',
    category: 'Retirement',
    icon: 'flame',
    featured: true,
  },
  {
    id: 'corpus',
    title: 'Corpus Estimator',
    description: 'Estimate the corpus you will build over time given monthly contributions.',
    href: '/calculators/corpus',
    category: 'Retirement',
    icon: 'piggy-bank',
    featured: false,
  },

  // ─── Insurance ───
  {
    id: 'term-cover',
    title: 'Term Cover Estimator',
    description: 'Calculate the right life cover using income replacement and HLV methods.',
    href: '/calculators/term-cover',
    category: 'Insurance',
    icon: 'shield',
    featured: false,
  },

  // ─── Credit ───
  {
    id: 'credit-payoff',
    title: 'Credit Card Payoff',
    description: 'See how long it takes to clear your card balance and total interest paid.',
    href: '/calculators/credit-payoff',
    category: 'Credit',
    icon: 'credit-card',
    featured: false,
  },
  {
    id: 'debt-strategy',
    title: 'Debt Snowball / Avalanche',
    description: 'Build an optimised payoff plan across multiple debts.',
    href: '/calculators/debt-strategy',
    category: 'Credit',
    icon: 'layers',
    featured: false,
  },
]

export const CATEGORIES = [
  'Tax',
  'Loans',
  'Investments',
  'Retirement',
  'Insurance',
  'Credit',
] as const

export function getByCategory(category: string): CalculatorMeta[] {
  return CALCULATORS.filter((c) => c.category === category)
}

export function getFeatured(): CalculatorMeta[] {
  return CALCULATORS.filter((c) => c.featured)
}