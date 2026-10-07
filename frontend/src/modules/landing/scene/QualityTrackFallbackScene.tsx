import { useEffect, useRef, type MutableRefObject } from 'react'

interface QualityTrackFallbackSceneProps {
  progressRef: MutableRefObject<number>
}

function Cuboid({ className }: { className: string }) {
  return (
    <div className={`qt-css-cuboid ${className}`}>
      <span className="qt-css-face qt-css-face-front" />
      <span className="qt-css-face qt-css-face-back" />
      <span className="qt-css-face qt-css-face-left" />
      <span className="qt-css-face qt-css-face-right" />
      <span className="qt-css-face qt-css-face-top" />
      <span className="qt-css-face qt-css-face-bottom" />
    </div>
  )
}

export function QualityTrackFallbackScene({
  progressRef,
}: QualityTrackFallbackSceneProps) {
  const sceneRef = useRef<HTMLDivElement>(null)
  const partRef = useRef<HTMLDivElement>(null)
  const scannerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let frame = 0

    const render = () => {
      const progress = Math.min(1, Math.max(0, progressRef.current))
      const scene = sceneRef.current
      const part = partRef.current
      const scanner = scannerRef.current

      if (scene) {
        scene.style.transform = `rotateX(-9deg) rotateY(${-17 + progress * 13}deg)`
      }

      if (part) {
        const x = -190 + progress * 390
        const y = Math.sin(performance.now() * 0.0012) * 7
        part.style.transform = `translate3d(${x}px, ${y}px, 74px) rotateY(${progress * 560}deg) rotateZ(90deg)`
      }

      if (scanner) {
        scanner.style.transform = `translate3d(${40 + progress * 80}px, 0, 18px)`
      }

      frame = window.requestAnimationFrame(render)
    }

    frame = window.requestAnimationFrame(render)
    return () => window.cancelAnimationFrame(frame)
  }, [progressRef])

  return (
    <div className="qt-css-scene-shell" aria-hidden="true">
      <div ref={sceneRef} className="qt-css-scene">
        <Cuboid className="qt-css-floor" />
        <Cuboid className="qt-css-machine-base" />
        <Cuboid className="qt-css-machine-left" />
        <Cuboid className="qt-css-machine-right" />
        <Cuboid className="qt-css-machine-top" />
        <Cuboid className="qt-css-tool" />
        <Cuboid className="qt-css-conveyor" />

        <div ref={partRef} className="qt-css-part">
          <div className="qt-css-part-core" />
          <div className="qt-css-part-ring qt-css-part-ring-a" />
          <div className="qt-css-part-ring qt-css-part-ring-b" />
        </div>

        <div ref={scannerRef} className="qt-css-scanner">
          <Cuboid className="qt-css-scanner-left" />
          <Cuboid className="qt-css-scanner-right" />
          <Cuboid className="qt-css-scanner-top" />
          <div className="qt-css-scan-plane" />
        </div>
      </div>
    </div>
  )
}
