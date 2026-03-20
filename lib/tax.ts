import type {
  TaxInput,
  TaxResult,
  TaxComparison,
  SlabDetail,
  AgeGroup,
  Regime,
} from '@/types'
import { roundTo, clamp } from '@/lib/formatters'

// ─── Constants ───────────────────────────────────────────────────────────────

const DEDUCTION_CAPS = {
  sec80C:   150_000,
  sec80D:   100_000,
  nps:       50_000,
  homeLoan: 200_000,
} as const

const STANDARD_DEDUCTION = {
  old: 50_000,
  new: 75_000,
} as const

// Old regime slabs keyed by age group
const OLD_SLABS: Record<AgeGroup, [number, number][]> = {
  below60: [
    [250_000,  0],
    [500_000,  0.05],
    [1_000_000, 0.20],
    [Infinity,  0.30],
  ],
  '60to80': [
    [300_000,  0],
    [500_000,  0.05],
    [1_000_000, 0.20],
    [Infinity,  0.30],
  ],
  above80: [
    [500_000,  0],
    [1_000_000, 0.20],
    [Infinity,  0.30],
  ],
}

// New regime slabs — AY 2025-26
const NEW_SLABS: [number, number][] = [
  [300_000,   0],
  [600_000,   0.05],
  [900_000,   0.10],
  [1_200_000, 0.15],
  [1_500_000, 0.20],
  [Infinity,  0.30],
]

// ─── Core helpers ─────────────────────────────────────────────────────────────

/**
 * Apply deduction caps and return the total allowable deduction
 * for the old regime. New regime ignores this entirely.
 */
function computeAllowableDeductions(input: TaxInput): number {
  const d = input.deductions
  return (
    clamp(d.sec80C,   0, DEDUCTION_CAPS.sec80C)   +
    clamp(d.sec80D,   0, DEDUCTION_CAPS.sec80D)   +
    clamp(d.nps,      0, DEDUCTION_CAPS.nps)      +
    clamp(d.homeLoan, 0, DEDUCTION_CAPS.homeLoan) +
    Math.max(0, d.hra)   +
    Math.max(0, d.sec80E) +
    Math.max(0, d.other)
  )
}

/**
 * Compute tax across slabs. Returns per-slab detail and total basic tax.
 */
function applySlabs(
  taxableIncome: number,
  slabs: [number, number][]
): { breakdown: SlabDetail[]; basicTax: number } {
  let prev = 0
  let basicTax = 0
  const breakdown: SlabDetail[] = []

  for (const [limit, rate] of slabs) {
    if (taxableIncome <= prev) break

    const taxable = Math.min(taxableIncome, limit) - prev
    const tax = roundTo(taxable * rate, 2)

    breakdown.push({
      from:    prev,
      to:      limit === Infinity ? null : limit,
      rate,
      taxable,
      tax,
    })

    basicTax += tax
    prev = limit
  }

  return { breakdown, basicTax: roundTo(basicTax, 2) }
}

/**
 * Section 87A rebate.
 * Old regime: full rebate if taxable income <= 5,00,000
 * New regime: full rebate if taxable income <= 7,00,000
 */
function computeRebate(
  basicTax: number,
  taxableIncome: number,
  regime: Regime
): number {
  const threshold = regime === 'new' ? 700_000 : 500_000
  if (taxableIncome <= threshold) return basicTax  // full rebate
  return 0
}

/**
 * Surcharge on income tax (before cess).
 * Marginal relief is not implemented — that's a future enhancement.
 */
function computeSurcharge(tax: number, grossIncome: number): number {
  if (grossIncome > 50_000_000) return roundTo(tax * 0.37, 2)
  if (grossIncome > 20_000_000) return roundTo(tax * 0.25, 2)
  if (grossIncome > 10_000_000) return roundTo(tax * 0.15, 2)
  if (grossIncome >  5_000_000) return roundTo(tax * 0.10, 2)
  return 0
}

// ─── Main computation ─────────────────────────────────────────────────────────

export function computeTaxForRegime(
  input: TaxInput,
  regime: Regime
): TaxResult {
  const { grossIncome, ageGroup } = input

  // Step 1 — taxable income
  const stdDeduction = STANDARD_DEDUCTION[regime]
  const otherDeductions =
    regime === 'old' ? computeAllowableDeductions(input) : 0
  const taxableIncome = Math.max(
    0,
    grossIncome - stdDeduction - otherDeductions
  )

  // Step 2 — slab tax
  const slabs = regime === 'old' ? OLD_SLABS[ageGroup] : NEW_SLABS
  const { breakdown, basicTax } = applySlabs(taxableIncome, slabs)

  // Step 3 — rebate
  const rebate = computeRebate(basicTax, taxableIncome, regime)
  const taxAfterRebate = Math.max(0, basicTax - rebate)

  // Step 4 — surcharge
  const surcharge = computeSurcharge(taxAfterRebate, grossIncome)

  // Step 5 — cess (4% on tax + surcharge)
  const cess = roundTo((taxAfterRebate + surcharge) * 0.04, 2)

  // Step 6 — totals
  const totalTax = roundTo(taxAfterRebate + surcharge + cess, 2)
  const effectiveRate = grossIncome > 0
    ? roundTo((totalTax / grossIncome) * 100, 2)
    : 0

  return {
    regime,
    taxableIncome,
    slabBreakdown: breakdown,
    basicTax,
    rebate,
    surcharge,
    cess,
    totalTax,
    effectiveRate,
    inHandIncome: roundTo(grossIncome - totalTax, 2),
  }
}

export function computeTaxComparison(input: TaxInput): TaxComparison {
  const oldResult = computeTaxForRegime(input, 'old')
  const newResult = computeTaxForRegime(input, 'new')

  const savings = roundTo(oldResult.totalTax - newResult.totalTax, 2)
  const recommendation =
    savings > 0 ? 'new'
    : savings < 0 ? 'old'
    : 'tie'

  return { old: oldResult, new: newResult, recommendation, savings }
}