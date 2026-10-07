import type { MutableRefObject } from 'react'

export interface IndustrialThreeSceneOptions {
  progressRef: MutableRefObject<number>
  scrollingRef: MutableRefObject<boolean>
  reducedMotion: boolean
}

export interface IndustrialThreeSceneHandle {
  dispose(): void
}

export function createIndustrialThreeScene(
  canvas: HTMLCanvasElement,
  options: IndustrialThreeSceneOptions,
): Promise<IndustrialThreeSceneHandle>
