import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AgeGroup, TaxComparison } from '@/types'

interface FinanceStore {
  // Shared user profile — populated as user fills calculators
  // Persisted to localStorage so values carry across pages
  grossIncome: number | null
  ageGroup: AgeGroup | null

  // Last results cache — lets calculators cross-reference each other
  // e.g. FIRE calculator can pre-fill income from tax calculator session
  lastTaxComparison: TaxComparison | null

  // Actions
  setGrossIncome: (value: number) => void
  setAgeGroup: (value: AgeGroup) => void
  setTaxComparison: (result: TaxComparison) => void
  resetProfile: () => void
}

export const useFinanceStore = create<FinanceStore>()(
  persist(
    (set) => ({
      grossIncome: null,
      ageGroup: null,
      lastTaxComparison: null,

      setGrossIncome: (value) => set({ grossIncome: value }),
      setAgeGroup: (value) => set({ ageGroup: value }),
      setTaxComparison: (result) => set({ lastTaxComparison: result }),
      resetProfile: () => set({
        grossIncome: null,
        ageGroup: null,
        lastTaxComparison: null,
      }),
    }),
    {
      name: 'fincalc-store',        // localStorage key
      partialize: (state) => ({     // only persist profile, not results
        grossIncome: state.grossIncome,
        ageGroup: state.ageGroup,
      }),
    }
  )
)