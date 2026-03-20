import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import type { CalculatorCategory } from '@/types'

interface CalculatorShellProps {
  title: string
  description: string
  category: CalculatorCategory
  children: React.ReactNode
}

export function CalculatorShell({
  title,
  description,
  category,
  children,
}: CalculatorShellProps) {
  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">

      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm text-muted-foreground mb-6">
        <Link href="/" className="hover:text-foreground transition-colors">
          Home
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="hover:text-foreground transition-colors">{category}</span>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-foreground font-medium">{title}</span>
      </nav>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-foreground tracking-tight mb-2">
          {title}
        </h1>
        <p className="text-muted-foreground">{description}</p>
      </div>

      {/* Calculator content */}
      {children}
    </div>
  )
}