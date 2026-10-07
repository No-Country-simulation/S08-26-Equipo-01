import { useEffect, useRef, useState, type MutableRefObject } from 'react'
import { createIndustrialThreeScene, type IndustrialThreeSceneHandle } from './industrialThreeScene.js'
import { QualityTrackFallbackScene } from './QualityTrackFallbackScene'
import { QualityTrackRenderer } from './QualityTrackRenderer'

interface QualityTrackSceneProps {
  progressRef: MutableRefObject<number>
  scrollingRef: MutableRefObject<boolean>
  reducedMotion: boolean
}

type SceneStatus = 'loading' | 'three' | 'fallback' | 'css'

export function QualityTrackScene({
  progressRef,
  scrollingRef,
  reducedMotion,
}: QualityTrackSceneProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [status, setStatus] = useState<SceneStatus>('loading')

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    let mounted = true
    let threeScene: IndustrialThreeSceneHandle | null = null
    let fallbackRenderer: QualityTrackRenderer | null = null

    const startFallback = () => {
      if (!mounted) return
      try {
        fallbackRenderer = new QualityTrackRenderer(canvas, {
          progressRef,
          scrollingRef,
          reducedMotion,
          onReady: () => mounted && setStatus('fallback'),
          onRenderFailure: () => mounted && setStatus('css'),
        })
      } catch {
        setStatus('css')
      }
    }

    void createIndustrialThreeScene(canvas, {
      progressRef,
      scrollingRef,
      reducedMotion,
    })
      .then((scene) => {
        if (!mounted) {
          scene.dispose()
          return
        }
        threeScene = scene
        setStatus('three')
      })
      .catch(startFallback)

    return () => {
      mounted = false
      threeScene?.dispose()
      fallbackRenderer?.dispose()
    }
  }, [progressRef, reducedMotion, scrollingRef])

  return (
    <div className="relative h-full w-full">
      <canvas
        ref={canvasRef}
        className={`block h-full w-full transition-opacity duration-300 ${status === 'css' ? 'opacity-0' : 'opacity-100'}`}
        aria-label="Celda industrial 3D de QualityTrack"
      />

      {status === 'loading' ? (
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_65%_45%,rgba(37,99,235,0.12),transparent_28%)]" />
      ) : null}

      {status === 'css' ? (
        <QualityTrackFallbackScene progressRef={progressRef} />
      ) : null}
    </div>
  )
}
