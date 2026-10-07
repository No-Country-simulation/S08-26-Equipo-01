import { useEffect, useRef, useState } from 'react'
import type { CSSProperties } from 'react'

interface UsePinnedSectionProgressOptions {
  reducedMotion: boolean
  accelerateReverse?: boolean
  reverseMultiplier?: number
  revealDistance?: number
}

export function clampProgress(value: number) {
  return Math.min(1, Math.max(0, value))
}

export function rangeProgress(progress: number, start: number, end: number) {
  if (end <= start) return progress >= end ? 1 : 0
  return clampProgress((progress - start) / (end - start))
}

export function usePinnedSectionProgress({
  reducedMotion,
  accelerateReverse = false,
  reverseMultiplier = 2,
  revealDistance = 12,
}: UsePinnedSectionProgressOptions) {
  const sectionRef = useRef<HTMLElement | null>(null)
  const [scrollProgress, setScrollProgress] = useState(reducedMotion ? 1 : 0)

  useEffect(() => {
    if (reducedMotion) {
      const reducedMotionFrame = window.requestAnimationFrame(() =>
        setScrollProgress(1),
      )
      return () => window.cancelAnimationFrame(reducedMotionFrame)
    }

    let frame = 0

    const sync = () => {
      frame = 0
      const section = sectionRef.current
      if (!section) return

      const rect = section.getBoundingClientRect()
      const travel = Math.max(section.offsetHeight - window.innerHeight, 1)
      const next = clampProgress(-rect.top / travel)

      setScrollProgress((previous) =>
        Math.abs(previous - next) > 0.002 ? next : previous,
      )
    }

    const requestSync = () => {
      if (frame) return
      frame = window.requestAnimationFrame(sync)
    }

    sync()
    window.addEventListener('scroll', requestSync, { passive: true })
    window.addEventListener('resize', requestSync)

    return () => {
      window.removeEventListener('scroll', requestSync)
      window.removeEventListener('resize', requestSync)
      if (frame) window.cancelAnimationFrame(frame)
    }
  }, [reducedMotion])

  useEffect(() => {
    if (reducedMotion || !accelerateReverse) return

    const accelerateReverseScroll = (event: WheelEvent) => {
      if (
        event.deltaY >= 0 ||
        event.ctrlKey ||
        Math.abs(event.deltaX) > Math.abs(event.deltaY)
      ) {
        return
      }

      const section = sectionRef.current
      if (!section) return

      const rect = section.getBoundingClientRect()
      const travel = Math.max(section.offsetHeight - window.innerHeight, 1)
      const progress = clampProgress(-rect.top / travel)

      if (
        progress <= 0.015 ||
        progress >= 0.995 ||
        rect.top > 0 ||
        rect.bottom <= window.innerHeight
      ) {
        return
      }

      event.preventDefault()

      const deltaPixels =
        event.deltaMode === WheelEvent.DOM_DELTA_LINE
          ? event.deltaY * 16
          : event.deltaMode === WheelEvent.DOM_DELTA_PAGE
            ? event.deltaY * window.innerHeight
            : event.deltaY

      window.scrollBy({
        top: deltaPixels * reverseMultiplier,
        behavior: 'auto',
      })
    }

    window.addEventListener('wheel', accelerateReverseScroll, {
      passive: false,
    })
    return () => window.removeEventListener('wheel', accelerateReverseScroll)
  }, [accelerateReverse, reducedMotion, reverseMultiplier])

  const reveal = (
    start: number,
    end: number,
    distance = revealDistance,
  ): CSSProperties => {
    const value = reducedMotion ? 1 : rangeProgress(scrollProgress, start, end)

    return {
      opacity: value,
      transform: `translate3d(0, ${(1 - value) * distance}px, 0)`,
    }
  }

  return { sectionRef, scrollProgress, reveal }
}
