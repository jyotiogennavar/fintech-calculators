import type { Metadata } from 'next'
import { CalculatorShell } from '@/components/calculator-shell'
import { TaxRegimeCalculator } from '@/components/calculators/tax-regime-calculator'

export const metadata: Metadata = {
  title: 'Old vs New Tax Regime Calculator',
  description:
    'Compare your tax liability under the old and new income tax regimes for FY 2024-25. Full slab breakdown, surcharge, cess, and 87A rebate included.',
}

export default function TaxRegimePage() {
  return (
    <CalculatorShell
      title="Old vs New Tax Regime"
      description="Compare tax liability under both regimes for FY 2024–25. Includes slab breakdown, 87A rebate, surcharge, and cess."
      category="Tax"
    >
      <TaxRegimeCalculator />
    </CalculatorShell>
  )
}