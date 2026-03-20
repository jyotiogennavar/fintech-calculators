import Link from 'next/link'
import { Calculator } from 'lucide-react'
import { CATEGORIES } from '@/lib/calculators'

export function Footer() {
  return (
    <footer className="border-t border-border/60 bg-background mt-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">

          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 font-semibold text-foreground mb-3">
              <Calculator className="h-4 w-4 text-blue-600" />
              FinCalc
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Free, open-source financial calculators for India. No sign-up required.
            </p>
          </div>

          {/* Category links */}
          {CATEGORIES.slice(0, 3).map((cat) => (
            <div key={cat}>
              <h3 className="text-sm font-medium text-foreground mb-3">{cat}</h3>
              <ul className="space-y-2">
                <li>
                  <Link
                    href={`/#${cat.toLowerCase()}`}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    View all {cat}
                  </Link>
                </li>
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 pt-6 border-t border-border/60 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} FinCalc. For informational purposes only — not financial advice.
          </p>
          <p className="text-xs text-muted-foreground">
            Built with Next.js · shadcn/ui · Recharts
          </p>
        </div>
      </div>
    </footer>
  )
}