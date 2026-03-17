import { useState } from 'react'
import { useSwipeGesture } from '../hooks/useSwipeGesture'
import type { Restaurant } from '../server/restaurants'

export type { Restaurant }

interface SwipeCardProps {
  restaurant: Restaurant
  onSwipe: (direction: 'left' | 'right') => void
}

export default function SwipeCard({ restaurant, onSwipe }: SwipeCardProps) {
  const [imgError, setImgError] = useState(false)
  const { ref, offsetX, isDragging, isLeaving, reducedMotion, handlers } =
    useSwipeGesture({ onSwipe })

  const width = ref.current?.offsetWidth ?? 300
  const thresholdPx = width * 0.3
  const rotation = (offsetX / width) * 15
  const likeOpacity = Math.min(Math.max(offsetX / thresholdPx, 0), 1)
  const passOpacity = Math.min(Math.max(-offsetX / thresholdPx, 0), 1)

  const transition =
    isDragging || reducedMotion ? 'none' : 'transform 300ms ease-out'

  return (
    <div ref={ref} className="relative select-none" role="group" aria-label={restaurant.name}>
      <div
        {...handlers}
        className="relative aspect-[3/4] overflow-hidden rounded-2xl"
        style={{
          transform: `translateX(${offsetX}px) rotate(${rotation}deg)`,
          transition,
          touchAction: 'none',
          pointerEvents: isLeaving ? 'none' : 'auto',
          cursor: isDragging ? 'grabbing' : 'grab',
        }}
      >
        {/* Image */}
        {imgError ? (
          <div className="absolute inset-0 bg-[var(--sand)]" />
        ) : (
          <img
            src={restaurant.imageUrl}
            alt={restaurant.name}
            className="absolute inset-0 h-full w-full object-cover"
            draggable={false}
            onError={() => setImgError(true)}
          />
        )}

        {/* Gradient overlay + text */}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-5 pt-16">
          <p className="text-xl font-bold text-white">{restaurant.name}</p>
          <p className="text-sm text-white/80">{restaurant.category}</p>
          <p className="mt-1 text-xs text-white/60">{restaurant.menu.slice(0, 3).join(' · ')}</p>
        </div>

        {/* LIKE hint */}
        <div
          className="absolute left-4 top-4 rounded-lg border-3 border-green-500 px-3 py-1 text-xl font-extrabold text-green-500"
          style={{ opacity: likeOpacity, rotate: '-12deg' }}
        >
          LIKE
        </div>

        {/* PASS hint */}
        <div
          className="absolute right-4 top-4 rounded-lg border-3 border-red-500 px-3 py-1 text-xl font-extrabold text-red-500"
          style={{ opacity: passOpacity, rotate: '12deg' }}
        >
          PASS
        </div>
      </div>
    </div>
  )
}
