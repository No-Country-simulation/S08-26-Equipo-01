import type { ScenePainter } from './webgl'
import { drawStoryDocuments, type SceneFrameState } from './sceneDocuments'
import { drawFactoryWorld } from './sceneFactory'

export function renderQualityTrackFrame(
  painter: ScenePainter,
  state: SceneFrameState,
) {
  drawFactoryWorld(painter, state)
  drawStoryDocuments(painter, state)
}
