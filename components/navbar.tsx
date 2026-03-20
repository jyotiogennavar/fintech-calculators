'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { Menu, X, Github, Calculator } from 'lucide-react'
import { cn } from '@/lib/utils'
import { CATEGORIES } from '@/lib/calculators'

export function Navbar() {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 items-center justify-between">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 font-semibold text-foreground">
            <Calculator className="h-5 w-5 text-blue-600" />
            <span>FinCalc</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {CATEGORIES.map((cat) => (
              <Link
                key={cat}
                href={`/#${cat.toLowerCase()}`}
                className={cn(
                  'px-3 py-1.5 text-sm rounded-md transition-colors',
                  'text-muted-foreground hover:text-foreground hover:bg-accent',
                  pathname.includes(cat.toLowerCase()) && 'text-foreground bg-accent'
                )}
              >
                {cat}
              </Link>
            ))}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-2">
            <Link
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-accent"
            >
              <Github className="h-4 w-4" />
              <span>GitHub</span>
            </Link>

            {/* Mobile menu toggle */}
            <button
              className="md:hidden p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border/60 bg-background px-4 py-3 space-y-1">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat}
              href={`/#${cat.toLowerCase()}`}
              className="block px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent rounded-md transition-colors"
              onClick={() => setMobileOpen(false)}
            >
              {cat}
            </Link>
          ))}
          <Link
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent rounded-md transition-colors"
          >
            <Github className="h-4 w-4" />
            GitHub
          </Link>
        </div>
      )}
    </header>
  )
}