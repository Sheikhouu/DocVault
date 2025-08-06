import { ThemeToggle } from '@/components/ui/theme-toggle'
import Link from 'next/link'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-neutral-50/50 to-primary/5 dark:from-background dark:via-neutral-900/50 dark:to-primary/5 p-4 relative">
      {/* Theme Toggle */}
      <div className="absolute top-4 right-4 z-10">
        <ThemeToggle />
      </div>
      
      {/* Brand Logo */}
      <div className="absolute top-6 left-6 z-10">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 bg-gradient-brand rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">D</span>
          </div>
          <span className="font-semibold text-foreground group-hover:text-primary transition-colors">
            DocVault
          </span>
        </Link>
      </div>

      {/* Main Content */}
      <div className="w-full max-w-md animate-scale-in">
        <div className="glass rounded-2xl p-1 shadow-xl">
          {children}
        </div>
      </div>

      {/* Background Decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-brand opacity-10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-secondary opacity-10 rounded-full blur-3xl"></div>
        <div className="absolute top-20 left-1/2 transform -translate-x-1/2 w-60 h-60 bg-accent/10 rounded-full blur-2xl"></div>
      </div>
    </div>
  )
} 