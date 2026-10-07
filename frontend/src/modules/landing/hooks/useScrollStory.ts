import {
  useEffect,
  useRef,
  useState,
  type MutableRefObject,
  type RefObject,
} from 'react'

interface ScrollStoryState {
  progressRef: MutableRefObject<number>
  scrollingRef: MutableRefObject<boolean>
  activeIndex: number
  reducedMotion: boolean
}

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value))
}

export function useScrollStory(
  containerRef: RefObject<HTMLElement | null>,
  stageCount: number,
): ScrollStoryState {
  const progressRef = useRef(0)
  const scrollingRef = useRef(false)
  const [activeIndex, setActiveIndex] = useState(0)
  const [reducedMotion, setReducedMotion] = useState(false)

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    const sync = () => setReducedMotion(media.matches)
    sync()
    media.addEventListener('change', sync)
    return () => media.removeEventListener('change', sync)
  }, [])

  useEffect(() => {
    const container = containerRef.current
    if (!container || stageCount < 2) return

    let frame = 0
    let idleTimer = 0
    let lastIndex = -1

    const update = () => {
      frame = 0
      const rect = container.getBoundingClientRect()
      const scrollable = Math.max(container.offsetHeight - window.innerHeight, 1)
      const progress = clamp01(-rect.top / scrollable)
      const nextIndex = Math.min(
        stageCount - 1,
        Math.max(0, Math.round(progress * (stageCount - 1))),
      )

      progressRef.current = progress
      if (nextIndex !== lastIndex) {
        lastIndex = nextIndex
        setActiveIndex(nextIndex)
      }
    }

    const requestUpdate = () => {
      scrollingRef.current = true
      window.clearTimeout(idleTimer)
      idleTimer = window.setTimeout(() => {
        scrollingRef.current = false
      }, 170)

      if (!frame) frame = window.requestAnimationFrame(update)
    }

    const onResize = () => {
      if (!frame) frame = window.requestAnimationFrame(update)
    }

    update()
    window.addEventListener('scroll', requestUpdate, { passive: true })
    window.addEventListener('resize', onResize)

    return () => {
      window.removeEventListener('scroll', requestUpdate)
      window.removeEventListener('resize', onResize)
      window.clearTimeout(idleTimer)
      if (frame) window.cancelAnimationFrame(frame)
    }
  }, [containerRef, stageCount])

  return {
    progressRef,
    scrollingRef,
    activeIndex,
    reducedMotion,
  }
}
