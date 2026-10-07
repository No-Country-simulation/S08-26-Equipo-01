export const STORY_STAGE_COUNT = 8
export const STORY_LAST_STAGE = STORY_STAGE_COUNT - 1
export const STORY_TRANSITION = 0.012
export const STORY_SCENE_TRAVEL = 5.2

function clamp01(value) {
  return Math.min(1, Math.max(0, value))
}

function smoothstep(value, start, end) {
  if (start === end) return value >= end ? 1 : 0
  const t = clamp01((value - start) / (end - start))
  return t * t * (3 - 2 * t)
}

export function stageBoundary(leftStage) {
  return (leftStage + 0.5) / STORY_LAST_STAGE
}

export function stageIndex(progress) {
  return Math.min(
    STORY_LAST_STAGE,
    Math.max(0, Math.round(clamp01(progress) * STORY_LAST_STAGE)),
  )
}

export function stageBounds(index) {
  return {
    start: index === 0 ? 0 : stageBoundary(index - 1),
    end: index === STORY_LAST_STAGE ? 1 : stageBoundary(index),
  }
}

export function stageLocalProgress(progress, index) {
  const { start, end } = stageBounds(index)
  return clamp01((progress - start) / Math.max(end - start, 0.0001))
}

export function stageDirection(index) {
  return index % 2 === 0 ? 1 : -1
}

export function stageSceneMotion(progress, index, travel = STORY_SCENE_TRAVEL) {
  const local = stageLocalProgress(progress, index)
  const direction = stageDirection(index)
  const active = stageIndex(progress) === index

  if (!active) {
    return {
      active: false,
      local,
      opacity: 0,
      offset: direction * travel,
    }
  }

  const enter = index === 0 ? 1 : smoothstep(local, 0, 0.14)
  const exit =
    index === STORY_LAST_STAGE ? 1 : 1 - smoothstep(local, 0.86, 1)

  return {
    active: true,
    local,
    opacity: enter * exit,
    offset: direction * travel * ((1 - enter) + (1 - exit)),
  }
}

export function stageOpacity(progress, index) {
  return stageSceneMotion(progress, index).opacity
}

// Kept for the legacy world renderer. New scene choreography must not use this
// to carry an object from one chapter into the next.
export function boundaryProgress(
  progress,
  leftStage,
  transition = STORY_TRANSITION,
) {
  const boundary = stageBoundary(leftStage)
  return smoothstep(
    progress,
    boundary - transition,
    boundary + transition,
  )
}

export function sampleStageVector(THREE, points, progress) {
  return new THREE.Vector3(...points[stageIndex(progress)])
}
