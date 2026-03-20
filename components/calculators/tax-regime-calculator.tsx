'use client'

import { useState, useMemo, useEffect } from 'react'
import { ChevronDown, ChevronUp, Download, Copy, Check } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Slider } from '@/components/ui/slider'
import { Separator } from '@/components/ui/separator'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { computeTaxComparison } from '@/lib/tax'
import { formatINR, formatCompact, formatPct } from '@/lib/formatters'
import { useFinanceStore } from '@/store/use-finance-store'
import type { TaxInput, TaxResult, AgeGroup } from '@/types'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import { cn } from '@/lib/utils'

// ─── Types ───────────────────────────────────────────────────────────────────

interface SliderFieldProps {
  label: string
  value: number
  min: number
  max: number
  step: number
  onChange: (v: number) => void
  format?: (v: number) => string
  tooltip?: string
}

interface DeductionRowProps {
  label: string
  fieldKey: keyof TaxInput['deductions']
  max: number
  value: number
  onChange: (key: keyof TaxInput['deductions'], value: number) => void
  tooltip?: string
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SliderField({
  label,
  value,
  min,
  max,
  step,
  onChange,
  format,
  tooltip,
}: SliderFieldProps) {
  const display = format ? format(value) : formatINR(value)

  return (
    <TooltipProvider>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <label className="text-sm font-medium text-foreground">{label}</label>
            {tooltip && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="text-xs text-muted-foreground cursor-help border border-border rounded-full w-4 h-4 inline-flex items-center justify-center">
                    ?
                  </span>
                </TooltipTrigger>
                <TooltipContent className="max-w-56 text-xs">
                  {tooltip}
                </TooltipContent>
              </Tooltip>
            )}
          </div>
          <input
            type="number"
            value={value}
            min={min}
            max={max}
            step={step}
            data-testid={`input-${label.toLowerCase().replace(/\s+/g, '-')}`}
            onChange={(e) => {
              const v = parseFloat(e.target.value)
              if (!isNaN(v)) onChange(Math.min(max, Math.max(min, v)))
            }}
            className="w-32 h-8 text-right text-sm border border-input rounded-md px-2 bg-background focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>
        <Slider
          min={min}
          max={max}
          step={step}
          value={[value]}
          onValueChange={([v]) => onChange(v)}
          data-testid={`slider-${label.toLowerCase().replace(/\s+/g, '-')}`}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{format ? format(min) : formatCompact(min)}</span>
          <span>{format ? format(max) : formatCompact(max)}</span>
        </div>
      </div>
    </TooltipProvider>
  )
}

function DeductionRow({
  label,
  fieldKey,
  max,
  value,
  onChange,
  tooltip,
}: DeductionRowProps) {
  return (
    <TooltipProvider>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 w-52 shrink-0">
          <span className="text-sm text-muted-foreground">{label}</span>
          {tooltip && (
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="text-xs text-muted-foreground cursor-help border border-border rounded-full w-4 h-4 inline-flex items-center justify-center">
                  ?
                </span>
              </TooltipTrigger>
              <TooltipContent className="max-w-56 text-xs">{tooltip}</TooltipContent>
            </Tooltip>
          )}
        </div>
        <Slider
          min={0}
          max={max}
          step={1000}
          value={[value]}
          onValueChange={([v]) => onChange(fieldKey, v)}
          className="flex-1"
        />
        <input
          type="number"
          value={value}
          min={0}
          max={max}
          step={1000}
          data-testid={`deduction-${fieldKey}`}
          onChange={(e) => {
            const v = parseFloat(e.target.value)
            if (!isNaN(v)) onChange(fieldKey, Math.min(max, Math.max(0, v)))
          }}
          className="w-28 h-8 text-right text-sm border border-input rounded-md px-2 bg-background focus:outline-none focus:ring-1 focus:ring-ring shrink-0"
        />
      </div>
    </TooltipProvider>
  )
}

function SlabTable({ result }: { result: TaxResult }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div>
      <button
        onClick={() => setExpanded(!expanded)}
        data-testid="slab-breakdown-toggle"
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors w-full text-left py-2"
      >
        {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        {expanded ? 'Hide' : 'Show'} slab breakdown
      </button>

      {expanded && (
        <Table className="mt-2 text-sm">
          <TableHeader>
            <TableRow>
              <TableHead>Slab</TableHead>
              <TableHead className="text-right">Rate</TableHead>
              <TableHead className="text-right">Taxable amount</TableHead>
              <TableHead className="text-right">Tax</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {result.slabBreakdown
              .filter((s) => s.taxable > 0)
              .map((slab, i) => (
                <TableRow key={i}>
                  <TableCell className="text-muted-foreground">
                    {formatINR(slab.from)} –{' '}
                    {slab.to === null ? 'Above' : formatINR(slab.to)}
                  </TableCell>
                  <TableCell className="text-right">{formatPct(slab.rate * 100)}</TableCell>
                  <TableCell className="text-right">{formatINR(slab.taxable)}</TableCell>
                  <TableCell className="text-right font-medium">{formatINR(slab.tax)}</TableCell>
                </TableRow>
              ))}

            {result.rebate > 0 && (
              <TableRow>
                <TableCell colSpan={3} className="text-muted-foreground">
                  Rebate u/s 87A
                </TableCell>
                <TableCell className="text-right text-green-600">
                  -{formatINR(result.rebate)}
                </TableCell>
              </TableRow>
            )}

            {result.surcharge > 0 && (
              <TableRow>
                <TableCell colSpan={3} className="text-muted-foreground">
                  Surcharge
                </TableCell>
                <TableCell className="text-right">{formatINR(result.surcharge)}</TableCell>
              </TableRow>
            )}

            <TableRow>
              <TableCell colSpan={3} className="text-muted-foreground">
                Health & Education Cess (4%)
              </TableCell>
              <TableCell className="text-right">{formatINR(result.cess)}</TableCell>
            </TableRow>

            <TableRow className="font-semibold bg-muted/40">
              <TableCell colSpan={3}>Total Tax</TableCell>
              <TableCell
                className="text-right"
                data-testid="total-tax"
              >
                {formatINR(result.totalTax)}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      )}
    </div>
  )
}

function RegimeResultPanel({ result, isWinner }: { result: TaxResult; isWinner: boolean }) {
  return (
    <div className="space-y-5">
      {/* Summary metrics */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: 'Total tax',        value: formatINR(result.totalTax),         testId: 'metric-total-tax' },
          { label: 'Effective rate',   value: formatPct(result.effectiveRate),    testId: 'metric-effective-rate' },
          { label: 'Taxable income',   value: formatCompact(result.taxableIncome), testId: 'metric-taxable-income' },
          { label: 'In-hand income',   value: formatCompact(result.inHandIncome),  testId: 'metric-in-hand' },
        ].map(({ label, value, testId }) => (
          <div
            key={label}
            className="bg-muted/50 rounded-lg p-3"
            data-testid={testId}
          >
            <p className="text-xs text-muted-foreground mb-1">{label}</p>
            <p className="text-lg font-semibold text-foreground">{value}</p>
          </div>
        ))}
      </div>

      <Separator />

      {/* Tax breakdown rows */}
      <div className="space-y-2 text-sm">
        {[
          { label: 'Standard deduction', value: result.regime === 'new' ? '₹75,000' : '₹50,000' },
          { label: 'Basic tax',          value: formatINR(result.basicTax) },
          ...(result.rebate > 0     ? [{ label: 'Rebate u/s 87A',     value: `-${formatINR(result.rebate)}`     }] : []),
          ...(result.surcharge > 0  ? [{ label: 'Surcharge',          value: formatINR(result.surcharge)        }] : []),
          { label: 'Cess (4%)',          value: formatINR(result.cess) },
        ].map(({ label, value }) => (
          <div key={label} className="flex justify-between text-muted-foreground">
            <span>{label}</span>
            <span className={cn(value.startsWith('-') && 'text-green-600')}>{value}</span>
          </div>
        ))}
      </div>

      <Separator />

      <SlabTable result={result} />
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

const DEFAULT_INPUT: TaxInput = {
  grossIncome: 1_200_000,
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
}

export function TaxRegimeCalculator() {
  const [input, setInput] = useState<TaxInput>(DEFAULT_INPUT)
  const [copied, setCopied] = useState(false)

  const { setGrossIncome, setAgeGroup, setTaxComparison } = useFinanceStore()

  const comparison = useMemo(() => computeTaxComparison(input), [input])

  useEffect(() => {
    setTaxComparison(comparison)
  }, [comparison, setTaxComparison])

  function updateIncome(value: number) {
    setInput((prev) => ({ ...prev, grossIncome: value }))
    setGrossIncome(value)
  }

  function updateAgeGroup(value: AgeGroup) {
    setInput((prev) => ({ ...prev, ageGroup: value }))
    setAgeGroup(value)
  }

  function updateDeduction(key: keyof TaxInput['deductions'], value: number) {
    setInput((prev) => ({
      ...prev,
      deductions: { ...prev.deductions, [key]: value },
    }))
  }

  function handleExportCSV() {
    const { old: o, new: n, recommendation, savings } = comparison
    const rows = [
      ['Field', 'Old Regime', 'New Regime'],
      ['Gross Income', input.grossIncome, input.grossIncome],
      ['Taxable Income', o.taxableIncome, n.taxableIncome],
      ['Basic Tax', o.basicTax, n.basicTax],
      ['Rebate', o.rebate, n.rebate],
      ['Surcharge', o.surcharge, n.surcharge],
      ['Cess', o.cess, n.cess],
      ['Total Tax', o.totalTax, n.totalTax],
      ['Effective Rate (%)', o.effectiveRate, n.effectiveRate],
      ['In-Hand Income', o.inHandIncome, n.inHandIncome],
      ['Recommendation', recommendation, ''],
      ['Savings', Math.abs(savings), ''],
    ]
    const csv = rows.map((r) => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `tax_comparison_fy2025.csv`
    a.click()
  }

  function handleCopy() {
    const { old: o, new: n, recommendation, savings } = comparison
    const text = [
      `FinCalc — Tax Comparison FY 2024-25`,
      `Gross Income: ${formatINR(input.grossIncome)}`,
      ``,
      `Old Regime: ${formatINR(o.totalTax)} (${formatPct(o.effectiveRate)} effective)`,
      `New Regime: ${formatINR(n.totalTax)} (${formatPct(n.effectiveRate)} effective)`,
      ``,
      `Recommendation: ${recommendation === 'tie' ? 'Equal' : recommendation.toUpperCase()} Regime`,
      `Savings: ${formatINR(Math.abs(savings))}`,
    ].join('\n')

    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const chartData = [
    {
      name: 'Basic Tax',
      Old: comparison.old.basicTax,
      New: comparison.new.basicTax,
    },
    {
      name: 'Surcharge',
      Old: comparison.old.surcharge,
      New: comparison.new.surcharge,
    },
    {
      name: 'Cess',
      Old: comparison.old.cess,
      New: comparison.new.cess,
    },
  ]

  const winner = comparison.recommendation
  const savings = Math.abs(comparison.savings)

  return (
    <div className="space-y-8">

      {/* ── Inputs ── */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Income details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">

          <SliderField
            label="Gross annual income"
            value={input.grossIncome}
            min={0}
            max={10_000_000}
            step={10_000}
            onChange={updateIncome}
          />

          {/* Age group */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Age group</label>
            <div
              className="flex rounded-md border border-input overflow-hidden"
              data-testid="age-group-selector"
            >
              {(
                [
                  { value: 'below60',  label: 'Below 60' },
                  { value: '60to80',   label: '60 – 80'  },
                  { value: 'above80',  label: 'Above 80' },
                ] as { value: AgeGroup; label: string }[]
              ).map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => updateAgeGroup(value)}
                  data-testid={`age-${value}`}
                  className={cn(
                    'flex-1 py-2 text-sm transition-colors',
                    input.ageGroup === value
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-muted'
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Deductions */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium text-foreground">
                Deductions & exemptions
              </p>
              <Badge variant="outline" className="text-xs font-normal">
                Old Regime only
              </Badge>
            </div>

            <div className="space-y-4">
              {(
                [
                  { key: 'sec80C',   label: '80C (PF, ELSS, PPF, LIC…)', max: 150_000, tooltip: 'Maximum deduction under Section 80C is ₹1,50,000' },
                  { key: 'sec80D',   label: '80D (Medical insurance)',     max: 100_000, tooltip: 'Self + family: ₹25,000. Senior citizen parents add ₹50,000 more.' },
                  { key: 'hra',      label: 'HRA exemption',               max: 600_000, tooltip: 'Use the HRA calculator to compute your exact exemption.' },
                  { key: 'nps',      label: '80CCD(1B) NPS',               max:  50_000, tooltip: 'Additional NPS contribution beyond 80C, capped at ₹50,000.' },
                  { key: 'homeLoan', label: 'Sec 24 (Home loan interest)',  max: 200_000, tooltip: 'Interest on self-occupied property, capped at ₹2,00,000.' },
                  { key: 'sec80E',   label: '80E (Education loan)',         max: 500_000, tooltip: 'No upper limit legally, capped here at ₹5L for the slider.' },
                  { key: 'other',    label: 'Other deductions',             max: 500_000, tooltip: '80G donations, 80TTA interest, etc.' },
                ] as {
                  key: keyof TaxInput['deductions']
                  label: string
                  max: number
                  tooltip: string
                }[]
              ).map(({ key, label, max, tooltip }) => (
                <DeductionRow
                  key={key}
                  label={label}
                  fieldKey={key}
                  max={max}
                  value={input.deductions[key]}
                  onChange={updateDeduction}
                  tooltip={tooltip}
                />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Winner banner ── */}
      {winner !== 'tie' ? (
        <div
          className={cn(
            'rounded-lg px-5 py-4 flex items-center justify-between',
            winner === 'new'
              ? 'bg-green-50 border border-green-200'
              : 'bg-blue-50 border border-blue-200'
          )}
          data-testid="regime-winner"
        >
          <div>
            <p className="text-sm font-semibold text-foreground">
              {winner === 'new' ? 'New Regime' : 'Old Regime'} is better for you
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              You save {formatINR(savings)} in tax
            </p>
          </div>
          <Badge
            className={cn(
              winner === 'new'
                ? 'bg-green-100 text-green-800 border-green-200'
                : 'bg-blue-100 text-blue-800 border-blue-200'
            )}
          >
            Save {formatCompact(savings)}
          </Badge>
        </div>
      ) : (
        <div className="rounded-lg px-5 py-4 bg-muted border border-border">
          <p className="text-sm font-medium">Both regimes result in equal tax</p>
        </div>
      )}

      {/* ── Results tabs ── */}
      <Tabs defaultValue="new" data-testid="regime-tabs">
        <TabsList className="w-full">
          <TabsTrigger value="new" className="flex-1" data-testid="tab-new">
            New Regime
            {winner === 'new' && (
              <Badge className="ml-2 bg-green-100 text-green-800 text-xs py-0">
                Recommended
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="old" className="flex-1" data-testid="tab-old">
            Old Regime
            {winner === 'old' && (
              <Badge className="ml-2 bg-blue-100 text-blue-800 text-xs py-0">
                Recommended
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="new" className="mt-4">
          <Card>
            <CardContent className="pt-5">
              <RegimeResultPanel
                result={comparison.new}
                isWinner={winner === 'new'}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="old" className="mt-4">
          <Card>
            <CardContent className="pt-5">
              <RegimeResultPanel
                result={comparison.old}
                isWinner={winner === 'old'}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* ── Chart ── */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Tax breakdown comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartData} barCategoryGap="30%">
              <XAxis
                dataKey="name"
                tick={{ fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tickFormatter={(v) => formatCompact(v).replace('₹', '')}
                tick={{ fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                width={48}
              />
              <RechartsTooltip
                formatter={(value) => {
                  if (value == null || Array.isArray(value)) return ''
                  const n = typeof value === 'number' ? value : Number(value)
                  return Number.isFinite(n) ? formatINR(n) : ''
                }}
                contentStyle={{ fontSize: 12 }}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="Old" fill="#93C5FD" radius={[4, 4, 0, 0]} name="Old Regime" />
              <Bar dataKey="New" fill="#3B82F6" radius={[4, 4, 0, 0]} name="New Regime" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* ── Export bar ── */}
      <div
        className="flex flex-wrap gap-2"
        data-testid="export-bar"
      >
        <button
          onClick={handleExportCSV}
          data-testid="export-csv"
          className="inline-flex items-center gap-2 px-4 py-2 text-sm border border-input rounded-md hover:bg-muted transition-colors"
        >
          <Download className="h-4 w-4" />
          Export CSV
        </button>
        <button
          onClick={handleCopy}
          data-testid="copy-summary"
          className="inline-flex items-center gap-2 px-4 py-2 text-sm border border-input rounded-md hover:bg-muted transition-colors"
        >
          {copied ? (
            <><Check className="h-4 w-4 text-green-600" /> Copied</>
          ) : (
            <><Copy className="h-4 w-4" /> Copy summary</>
          )}
        </button>
      </div>

      <p className="text-xs text-muted-foreground">
        Calculations are based on FY 2024–25 (AY 2025–26) tax slabs.
        For informational purposes only — consult a CA for tax filing advice.
      </p>
    </div>
  )
}