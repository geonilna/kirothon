import { Link, createFileRoute } from '@tanstack/react-router'
import { MapPin } from 'lucide-react'

export const Route = createFileRoute('/')({ component: Home })

function Home() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-12">
      <MapPin className="mb-4 h-12 w-12 text-[var(--lagoon-deep)]" />
      <h1 className="mb-2 text-2xl font-bold text-[var(--sea-ink)]">어디서 먹을까?</h1>
      <p className="mb-8 text-sm text-[var(--sea-ink-soft)]">지역을 선택하세요</p>
      <div className="mb-8 rounded-xl border border-[var(--line)] bg-[var(--chip-bg)] px-6 py-3 text-base font-semibold text-[var(--sea-ink)]">
        교대
      </div>
      <Link
        to="/swipe"
        className="cursor-pointer rounded-full bg-[var(--lagoon-deep)] px-8 py-3 text-sm font-semibold text-white no-underline transition-colors hover:opacity-90"
      >
        시작하기
      </Link>
    </div>
  )
}
