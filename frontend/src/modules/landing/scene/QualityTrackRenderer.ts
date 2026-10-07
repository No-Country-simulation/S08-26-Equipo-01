import type { MutableRefObject } from 'react'
import { lookAt, perspective, sampleVec3, type Vec3 } from './math'
import { renderQualityTrackFrame } from './renderFrame'
import { ScenePainter } from './webgl'

interface QualityTrackRendererOptions {
  progressRef: MutableRefObject<number>
  scrollingRef: MutableRefObject<boolean>
  reducedMotion: boolean
  onReady?: () => void
  onRenderFailure?: () => void
}

const cameraPositions: Vec3[] = [
  [4.1, 2.35, 5.25],
  [3.25, 2.0, 4.55],
  [2.65, 2.05, 4.05],
  [2.35, 2.15, 3.9],
  [2.55, 1.9, 3.75],
  [2.0, 1.48, 3.2],
  [5.8, 1.72, 3.65],
  [9.35, 3.55, 7.65],
]

const cameraTargets: Vec3[] = [
  [-0.1, 0.32, 0],
  [-0.72, 0.48, 0],
  [-0.85, 0.62, 0],
  [-0.55, 0.62, 0],
  [0.05, 0.36, 0],
  [0.08, 0.18, 0],
  [3.35, 0.28, 0],
  [2.0, 0.18, 0],
]

export class QualityTrackRenderer {
  private readonly painter: ScenePainter
  private readonly canvas: HTMLCanvasElement
  private readonly progressRef: MutableRefObject<number>
  private readonly scrollingRef: MutableRefObject<boolean>
  private readonly reducedMotion: boolean
  private readonly onReady?: () => void
  private readonly onRenderFailure?: () => void
  private animationFrame = 0
  private resizeObserver: ResizeObserver | null = null
  private lastTime = performance.now()
  private idleBlend = 0
  private ambientSpin = 0
  private verificationFrames = 0
  private verified = false
  private failed = false
  private disposed = false

  constructor(canvas: HTMLCanvasElement, options: QualityTrackRendererOptions) {
    this.canvas = canvas
    this.progressRef = options.progressRef
    this.scrollingRef = options.scrollingRef
    this.reducedMotion = options.reducedMotion
    this.onReady = options.onReady
    this.onRenderFailure = options.onRenderFailure
    this.painter = new ScenePainter(canvas)
    this.resizeObserver = new ResizeObserver(() => this.resize())
    this.resizeObserver.observe(canvas)
    this.resize()
    this.animationFrame = window.requestAnimationFrame(this.render)
  }

  private resize() {
    const rect = this.canvas.getBoundingClientRect()
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5)
    this.painter.resize(rect.width, rect.height, dpr)
  }

  private fail() {
    if (this.failed || this.disposed) return
    this.failed = true
    this.onRenderFailure?.()
    this.dispose()
  }

  private verifyVisibleFrame() {
    if (this.verified || this.canvas.width < 64 || this.canvas.height < 64) return

    this.verificationFrames += 1
    if (this.painter.hasVisiblePixels()) {
      this.verified = true
      this.onReady?.()
      return
    }

    if (this.verificationFrames >= 24) {
      throw new Error('La escena WebGL no produjo píxeles visibles.')
    }
  }

  private render = (now: number) => {
    if (this.disposed) return

    try {
      const delta = Math.min((now - this.lastTime) / 1000, 0.05)
      this.lastTime = now
      const progress = this.reducedMotion ? 0.12 : this.progressRef.current
      const idleTarget = this.reducedMotion
        ? 0
        : this.scrollingRef.current
          ? 0.12
          : 1
      const blendSpeed = 1 - Math.exp(-delta * 4.5)
      this.idleBlend += (idleTarget - this.idleBlend) * blendSpeed
      this.ambientSpin += delta * (0.25 + this.idleBlend * 1.7)

      const camera = sampleVec3(cameraPositions, progress)
      const target = sampleVec3(cameraTargets, progress)
      if (!this.reducedMotion) {
        const drift = this.idleBlend * 0.055
        camera[0] += Math.sin(now * 0.00031) * drift
        camera[1] += Math.cos(now * 0.00026) * drift
      }

      const aspect = Math.max(
        this.canvas.width / Math.max(this.canvas.height, 1),
        0.2,
      )
      const projection = perspective(Math.PI / 4.6, aspect, 0.1, 70)
      const view = lookAt(camera, target)

      this.painter.begin(projection, view)
      renderQualityTrackFrame(this.painter, {
        progress,
        time: now / 1000,
        idleBlend: this.idleBlend,
        ambientSpin: this.ambientSpin,
      })
      this.verifyVisibleFrame()
    } catch {
      this.fail()
      return
    }

    this.animationFrame = window.requestAnimationFrame(this.render)
  }

  dispose() {
    if (this.disposed) return
    this.disposed = true
    window.cancelAnimationFrame(this.animationFrame)
    this.resizeObserver?.disconnect()
  }
}
