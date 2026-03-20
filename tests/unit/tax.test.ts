import { describe, it, expect } from 'vitest'
import { computeTaxForRegime, computeTaxComparison } from '@/lib/tax'
import type { TaxInput } from '@/types'

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const baseInput = (grossIncome: number, overrides?: Partial<TaxInput>): TaxInput => ({
  grossIncome,
  ageGroup: 'below60',
  assessmentYear: 2025,
  deductions: {
    sec80C: 0,
    sec80D: 0,
    hra: 0,
    nps: 0,
    homeLoan: 0,
    sec80E: 0,
    other: 0,
  },
  ...overrides,
})

const withFullDeductions = (grossIncome: number): TaxInput =>
  baseInput(grossIncome, {
    deductions: {
      sec80C:   150_000,
      sec80D:    25_000,
      hra:       60_000,
      nps:       50_000,
      homeLoan: 200_000,
      sec80E:        0,
      other:         0,
    },
  })

// ─── New Regime ───────────────────────────────────────────────────────────────

describe('New Regime — 87A rebate', () => {
  it('zero tax at exactly ₹7,00,000 taxable (rebate threshold)', () => {
    // taxable = 700000 - 75000 std = 625000 → rebate applies → 0
    const result = computeTaxForRegime(baseInput(700_000), 'new')
    expect(result.totalTax).toBe(0)
    expect(result.rebate).toBeGreaterThan(0)
  })

  it('tax > 0 just above rebate threshold', () => {
    const result = computeTaxForRegime(baseInput(775_001), 'new')
    expect(result.totalTax).toBeGreaterThan(0)
  })
})

describe('New Regime — slab correctness', () => {
  it('0% slab: income below ₹3,75,000 (taxable ≤ 3L after std deduction)', () => {
    const result = computeTaxForRegime(baseInput(375_000), 'new')
    expect(result.basicTax).toBe(0)
  })

  it('5% slab: taxable between 3L and 6L', () => {
    // gross 750000, std 75000, taxable 675000
    // 0-3L = 0, 3L-6L: 375000 * 5% = 18750
    const result = computeTaxForRegime(baseInput(750_000), 'new')
    const slab5 = result.slabBreakdown.find((s) => s.rate === 0.05)
    expect(slab5?.tax).toBe(18_750)
  })

  it('30% slab applies above ₹15L taxable', () => {
    const result = computeTaxForRegime(baseInput(2_000_000), 'new')
    const slab30 = result.slabBreakdown.find((s) => s.rate === 0.30)
    expect(slab30).toBeDefined()
    expect(slab30!.tax).toBeGreaterThan(0)
  })
})

describe('New Regime — surcharge', () => {
  it('no surcharge below ₹50L gross', () => {
    const result = computeTaxForRegime(baseInput(4_999_999), 'new')
    expect(result.surcharge).toBe(0)
  })

  it('10% surcharge between ₹50L and ₹1Cr', () => {
    const result = computeTaxForRegime(baseInput(7_500_000), 'new')
    expect(result.surcharge).toBeGreaterThan(0)
    expect(result.surcharge).toBe(
      Math.round(result.basicTax * 0.10 * 100) / 100
    )
  })
})

describe('New Regime — cess', () => {
  it('cess is exactly 4% of (tax after rebate + surcharge)', () => {
    const result = computeTaxForRegime(baseInput(1_500_000), 'new')
    const expectedCess =
      Math.round((result.basicTax - result.rebate + result.surcharge) * 0.04 * 100) / 100
    expect(result.cess).toBe(expectedCess)
  })
})

// ─── Old Regime ───────────────────────────────────────────────────────────────

describe('Old Regime — deduction caps', () => {
  it('caps 80C at ₹1,50,000 even if more is entered', () => {
    const input = baseInput(1_200_000, {
      deductions: { sec80C: 200_000, sec80D: 0, hra: 0, nps: 0, homeLoan: 0, sec80E: 0, other: 0 },
    })
    const uncapped = computeTaxForRegime(
      { ...input, deductions: { ...input.deductions, sec80C: 150_000 } },
      'old'
    )
    const capped = computeTaxForRegime(input, 'old')
    expect(capped.totalTax).toBe(uncapped.totalTax)
  })

  it('zero tax at ₹5L taxable under old regime (87A rebate)', () => {
    // gross 550000, std 50000, taxable 500000 → rebate → 0
    const result = computeTaxForRegime(baseInput(550_000), 'old')
    expect(result.totalTax).toBe(0)
  })
})

describe('Old Regime — senior citizen slabs', () => {
  it('no tax on first ₹3L for 60-80 age group', () => {
    const input = baseInput(350_000, { ageGroup: '60to80' })
    const result = computeTaxForRegime(input, 'old')
    // taxable = 350000 - 50000 std = 300000 → all in 0% slab
    expect(result.basicTax).toBe(0)
  })

  it('no tax on first ₹5L for super senior (above 80)', () => {
    const input = baseInput(550_000, { ageGroup: 'above80' })
    const result = computeTaxForRegime(input, 'old')
    // taxable = 550000 - 50000 = 500000 → all in 0% slab
    expect(result.basicTax).toBe(0)
  })
})

// ─── Comparison ───────────────────────────────────────────────────────────────

describe('computeTaxComparison', () => {
  it('recommends new regime at ₹12L with no deductions', () => {
    const result = computeTaxComparison(baseInput(1_200_000))
    expect(result.recommendation).toBe('new')
    expect(result.savings).toBeGreaterThan(0)
  })

  it('recommends old regime at ₹12L with full deductions', () => {
    const result = computeTaxComparison(withFullDeductions(1_200_000))
    expect(result.recommendation).toBe('old')
    expect(result.savings).toBeLessThan(0)
  })

  it('savings = old.totalTax - new.totalTax', () => {
    const result = computeTaxComparison(baseInput(1_500_000))
    expect(result.savings).toBe(
      Math.round((result.old.totalTax - result.new.totalTax) * 100) / 100
    )
  })

  it('handles zero income without throwing', () => {
    expect(() => computeTaxComparison(baseInput(0))).not.toThrow()
  })

  it('handles very large income (₹5Cr) without throwing', () => {
    expect(() => computeTaxComparison(baseInput(50_000_000))).not.toThrow()
  })
})