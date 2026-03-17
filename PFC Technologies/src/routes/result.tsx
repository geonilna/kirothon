import { useEffect } from 'react'
import { createFileRoute, useLocation, useNavigate } from '@tanstack/react-router'
import { RotateCcw } from 'lucide-react'
import type { Restaurant } from '../components/SwipeCard'

export const Route = createFileRoute('/result')({ component: Result })

function Result() {
  const { state } = useLocation()
  const navigate = useNavigate()
  const restaurant = (state as { restaurant?: Restaurant }).restaurant

  useEffect(() => {
    if (!restaurant) navigate({ to: '/' })
  }, [restaurant, navigate])

  if (!restaurant) return null

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-12">
      <img
        src={restaurant.imageUrl}
        alt={restaurant.name}
        draggable={false}
        onError={(e) => {
          e.currentTarget.style.display = 'none'
          e.currentTarget.parentElement
            ?.querySelector<HTMLDivElement>('[data-fallback]')
            ?.classList.remove('hidden')
        }}
        className="mb-6 aspect-[3/4] w-full max-w-xs rounded-2xl object-cover"
      />
      <div
        data-fallback
        className="hidden mb-6 aspect-[3/4] w-full max-w-xs rounded-2xl bg-[var(--sand)]"
      />
      <h1 className="mb-1 text-2xl font-bold text-[var(--sea-ink)]">
        {restaurant.name}
      </h1>
      <p className="mb-8 text-sm text-[var(--sea-ink-soft)]">
        {restaurant.category}
      </p>
      <button
        onClick={() => navigate({ to: '/' })}
        className="flex cursor-pointer items-center gap-2 rounded-full bg-[var(--lagoon-deep)] px-8 py-3 text-sm font-semibold text-white"
      >
        <RotateCcw className="h-4 w-4" />
        다시 추천받기
      </button>
    </div>
  )
}
