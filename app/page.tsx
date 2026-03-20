import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import * as LucideIcons from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { CALCULATORS, CATEGORIES, getFeatured, getByCategory } from '@/lib/calculators'
import type { CalculatorMeta } from '@/types'


// Dynamically resolve lucide icon by name
function CalcIcon({ name, className }: { name: string; className?: string }) {
  const Icon = (LucideIcons as unknown as Record<string, React.ComponentType<{ className?: string }>>)[
    name
      .split('-')
      .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
      .join('')
  ]
  return Icon ? <Icon className={className} /> : null
}

function CalculatorCard({ calc }: { calc: CalculatorMeta }) {
  return (
    <Link href={calc.href}>
      <Card className="h-full hover:border-blue-200 hover:shadow-sm transition-all duration-200 cursor-pointer group">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-2">
            <div className="p-2 rounded-md bg-blue-50 text-blue-600 group-hover:bg-blue-100 transition-colors">
              <CalcIcon name={calc.icon} className="h-4 w-4" />
            </div>
            {calc.badge && (
              <Badge variant="secondary" className="text-xs">
                {calc.badge}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <h3 className="font-medium text-sm text-foreground mb-1 leading-tight">
            {calc.title}
          </h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {calc.description}
          </p>
        </CardContent>
      </Card>
    </Link>
  )
}

export default function HomePage() {
  const featured = getFeatured()

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

      {/* Hero */}
      <section className="py-16 md:py-24 text-center">
        <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-foreground mb-4">
          Financial calculators <br className="hidden sm:block" />
          <span className="text-blue-600">built for India</span>
        </h1>
        <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-8">
          Free, accurate, and detailed. Tax regime comparison, EMI, SIP, FIRE,
          capital gains — all with edge-case handling and exportable results.
        </p>
        <Link
          href="#calculators"
          className="inline-flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          Explore calculators
          <ArrowRight className="h-4 w-4" />
        </Link>
      </section>

      {/* Featured */}
      <section id="calculators" className="pb-16">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-foreground">Featured</h2>
          <span className="text-sm text-muted-foreground">{CALCULATORS.length} calculators</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-16">
          {featured.map((calc) => (
            <CalculatorCard key={calc.id} calc={calc} />
          ))}
        </div>

        {/* Categories */}
        {CATEGORIES.map((category) => {
          const calcs = getByCategory(category)
          return (
            <section
              key={category}
              id={category.toLowerCase()}
              className="mb-14"
            >
              <div className="flex items-center gap-3 mb-5">
                <h2 className="text-base font-semibold text-foreground">{category}</h2>
                <div className="h-px flex-1 bg-border" />
                <span className="text-xs text-muted-foreground">{calcs.length}</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {calcs.map((calc) => (
                  <CalculatorCard key={calc.id} calc={calc} />
                ))}
              </div>
            </section>
          )
        })}
      </section>
    </div>
  )
}