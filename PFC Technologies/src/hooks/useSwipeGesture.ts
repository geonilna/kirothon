import { useCallback, useEffect, useRef, useState } from 'react'

type Direction = 'left' | 'right'

interface UseSwipeGestureOptions {
  onSwipe: (direction: Direction) => void
  threshold?: number
}

interface SwipeState {
  offsetX: number
  isDragging: boolean
  isLeaving: boolean
}

const FLYOFF_DISTANCE = 600

export function useSwipeGesture({
  onSwipe,
  threshold = 0.3,
}: UseSwipeGestureOptions) {
  const containerRef = useRef<HTMLDivElement>(null)
  const startX = useRef(0)
  const pointerId = useRef<number | null>(null)
  const [state, setState] = useState<SwipeState>({
    offsetX: 0,
    isDragging: false,
    isLeaving: false,
  })
  const [reducedMotion, setReducedMotion] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReducedMotion(mq.matches)
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    if (pointerId.current !== null) return
    pointerId.current = e.pointerId
    startX.current = e.clientX
    ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
    setState({ offsetX: 0, isDragging: true, isLeaving: false })
  }, [])

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (e.pointerId !== pointerId.current) return
    setState((s) =>
      s.isDragging ? { ...s, offsetX: e.clientX - startX.current } : s,
    )
  }, [])

  const onPointerUp = useCallback(
    (e: React.PointerEvent) => {
      if (e.pointerId !== pointerId.current) return
      pointerId.current = null

      const width = containerRef.current?.offsetWidth ?? 300
      const dx = e.clientX - startX.current

      if (Math.abs(dx) > width * threshold) {
        const dir: Direction = dx > 0 ? 'right' : 'left'
        const flyX = dx > 0 ? FLYOFF_DISTANCE : -FLYOFF_DISTANCE

        if (reducedMotion) {
          setState({ offsetX: 0, isDragging: false, isLeaving: false })
          onSwipe(dir)
        } else {
          setState({ offsetX: flyX, isDragging: false, isLeaving: true })
          setTimeout(() => {
            setState({ offsetX: 0, isDragging: false, isLeaving: false })
            onSwipe(dir)
          }, 300)
        }
      } else {
        setState({ offsetX: 0, isDragging: false, isLeaving: false })
      }
    },
    [onSwipe, threshold, reducedMotion],
  )

  return {
    ref: containerRef,
    offsetX: state.offsetX,
    isDragging: state.isDragging,
    isLeaving: state.isLeaving,
    reducedMotion,
    handlers: { onPointerDown, onPointerMove, onPointerUp },
  }
}
