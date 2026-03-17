import { Link } from '@tanstack/react-router'
import ThemeToggle from './ThemeToggle'

export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-[var(--line)] bg-[var(--header-bg)] px-4 backdrop-blur-lg">
      <nav className="flex items-center justify-between py-3">
        <Link to="/" className="text-lg font-bold text-[var(--sea-ink)] no-underline">
          오늘뭐먹
        </Link>
        <ThemeToggle />
      </nav>
    </header>
  )
}
