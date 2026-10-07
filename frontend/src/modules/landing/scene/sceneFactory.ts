import { lerp, segment, type Vec3 } from './math'
import type { ScenePainter } from './webgl'
import type { SceneFrameState } from './sceneDocuments'

const navy: [number, number, number] = [0.045, 0.09, 0.16]
const slate: [number, number, number] = [0.24, 0.34, 0.47]
const steel: [number, number, number] = [0.5, 0.63, 0.76]
const blue: [number, number, number] = [0.08, 0.42, 1]
const cyan: [number, number, number] = [0.05, 0.82, 0.96]
const emerald: [number, number, number] = [0.05, 0.78, 0.5]
const amber: [number, number, number] = [1, 0.58, 0.1]

function drawPlatform(painter: ScenePainter, state: SceneFrameState) {
  const { progress, time, idleBlend } = state
  painter.draw({
    position: [1.5, -0.88, 0],
    scale: [5.25, 0.08, 1.72],
    color: [0.025, 0.06, 0.11],
  })
  painter.draw({
    position: [1.5, -0.79, 0],
    scale: [5.2, 0.018, 0.035],
    color: blue,
    emissive: 0.62,
  })

  for (let index = -5; index <= 8; index += 1) {
    painter.draw({
      position: [index * 0.72, -0.82, 0.02],
      scale: [0.012, 0.012, 1.68],
      color: [0.09, 0.18, 0.3],
      emissive: 0.03,
      alpha: 0.48,
    })
  }

  const packets = 7
  for (let index = 0; index < packets; index += 1) {
    const travel =
      (time * (0.08 + idleBlend * 0.06) + index / packets + progress * 0.35) % 1
    const x = lerp(-3.6, 6.45, travel)
    painter.draw({
      position: [x, -0.73, 0],
      scale: [0.055, 0.028, 0.055],
      color: travel > 0.72 ? emerald : cyan,
      emissive: 1.1,
      alpha: 0.82,
    })
  }

  const nodes = [-2.6, -1.2, 0.15, 1.55, 3.35, 4.65, 5.9]
  nodes.forEach((x, index) => {
    const stageProgress = progress * 7
    const active = stageProgress >= index - 0.35
    painter.draw({
      position: [x, -0.69, 0],
      scale: [0.105, 0.045, 0.105],
      color: active ? blue : slate,
      emissive: active ? 0.8 : 0.08,
    })
  })
}

function partPosition(progress: number): Vec3 {
  const enterMachine = segment(progress, 0.45, 0.56)
  const leaveMachine = segment(progress, 0.68, 0.78)
  const toDelivery = segment(progress, 0.84, 0.95)

  let x = lerp(-0.25, 0.12, enterMachine)
  x = lerp(x, 3.35, leaveMachine)
  x = lerp(x, 5.86, toDelivery)

  const beforeMachine = 1 - segment(progress, 0.4, 0.5)
  const y = -0.03 + beforeMachine * 0.38
  return [x, y, 0]
}

function drawWorkpiece(painter: ScenePainter, state: SceneFrameState) {
  const { progress, time, idleBlend, ambientSpin } = state
  const [x, y, z] = partPosition(progress)
  const production =
    segment(progress, 0.56, 0.68) * (1 - segment(progress, 0.72, 0.78))
  const spin = ambientSpin * (0.16 + production * 2.8) + progress * 8
  const float =
    (1 - segment(progress, 0.42, 0.5)) * Math.sin(time * 0.9) * 0.075
  const py = y + float

  painter.draw({
    position: [x, py, z],
    rotation: [0, spin, Math.PI / 2],
    scale: [0.36, 0.92, 0.36],
    color: steel,
    emissive: 0.09,
    shape: 'cylinder',
  })

  ;[-0.72, -0.38, 0.38, 0.72].forEach((offset, index) => {
    painter.draw({
      position: [x + offset, py, z],
      rotation: [0, spin, Math.PI / 2],
      scale: [
        index === 0 || index === 3 ? 0.46 : 0.4,
        0.095,
        index === 0 || index === 3 ? 0.46 : 0.4,
      ],
      color: index % 2 === 0 ? [0.36, 0.49, 0.64] : [0.42, 0.56, 0.7],
      shape: 'cylinder',
    })
  })

  const markerAngle = spin + time * 0.35 * idleBlend
  painter.draw({
    position: [
      x + 0.05,
      py + Math.cos(markerAngle) * 0.39,
      z + Math.sin(markerAngle) * 0.39,
    ],
    scale: [0.21, 0.034, 0.034],
    color: cyan,
    emissive: 1.05,
  })
}

function drawMachine(painter: ScenePainter, state: SceneFrameState) {
  const { progress, time, idleBlend } = state
  const reveal = 0.34 + segment(progress, 0.36, 0.49) * 0.66
  const production = segment(progress, 0.55, 0.64)
  const running = production * (1 - segment(progress, 0.73, 0.79))

  painter.draw({
    position: [0.12, -0.62, 0],
    scale: [1.72, 0.18, 1.24],
    color: navy,
    alpha: reveal,
  })
  ;[-1.42, 1.42].forEach((x) => {
    painter.draw({
      position: [x, 0.52, 0.62],
      scale: [0.18, 1.12, 0.2],
      color: slate,
      alpha: reveal,
    })
    painter.draw({
      position: [x, 0.52, -0.62],
      scale: [0.18, 1.12, 0.2],
      color: slate,
      alpha: reveal,
    })
  })
  painter.draw({
    position: [0.0, 1.64, 0],
    scale: [1.52, 0.16, 0.78],
    color: [0.09, 0.18, 0.31],
    alpha: reveal,
  })
  painter.draw({
    position: [0.0, 0.58, -0.86],
    scale: [1.5, 0.84, 0.06],
    color: [0.035, 0.08, 0.13],
    alpha: reveal * 0.72,
  })

  const toolPulse = Math.sin(time * 2.5) * 0.035 * idleBlend * running
  const toolY = 1.22 - production * 0.92 + toolPulse
  painter.draw({
    position: [0.12, toolY + 0.48, 0],
    scale: [0.28, 0.5, 0.28],
    color: [0.23, 0.32, 0.42],
    shape: 'cylinder',
    alpha: reveal,
  })
  painter.draw({
    position: [0.12, toolY, 0],
    scale: [0.085, 0.42, 0.085],
    color: steel,
    shape: 'cylinder',
    alpha: reveal,
  })

  const chuckSpin = time * (0.3 + running * 5.5)
  ;[-0.68, 0.68].forEach((x, index) => {
    painter.draw({
      position: [x, -0.02, 0],
      rotation: [0, chuckSpin * (index === 0 ? 1 : -1), Math.PI / 2],
      scale: [0.5, 0.14, 0.5],
      color: [0.3, 0.4, 0.52],
      shape: 'cylinder',
      alpha: reveal,
    })
  })

  painter.draw({
    position: [1.18, 1.42, 0.42],
    scale: [0.075, 0.075, 0.075],
    color: running > 0.15 ? emerald : blue,
    emissive: 0.8 + Math.sin(time * 3.4) * 0.24,
    alpha: reveal,
  })
  painter.draw({
    position: [1.18, 1.18, 0.42],
    scale: [0.055, 0.055, 0.055],
    color: amber,
    emissive: 0.35 + (Math.sin(time * 1.7) + 1) * 0.15,
    alpha: reveal,
  })

  if (running > 0.04) {
    for (let index = 0; index < 12; index += 1) {
      const phase = time * (2.2 + index * 0.09) + index * 1.45
      const radius = 0.12 + index * 0.026
      painter.draw({
        position: [
          0.14 + Math.cos(phase) * radius,
          0.2 + Math.abs(Math.sin(phase * 1.35)) * (0.18 + index * 0.018),
          Math.sin(phase) * radius,
        ],
        scale: [0.012, 0.042, 0.012],
        color: index % 3 === 0 ? [1, 0.78, 0.18] : amber,
        emissive: 1.45,
        alpha: running * 0.92,
      })
    }
  }
}

function drawQualityStation(painter: ScenePainter, state: SceneFrameState) {
  const { progress, time, idleBlend } = state
  const visibility =
    segment(progress, 0.69, 0.78) * (1 - segment(progress, 0.95, 0.995) * 0.55)
  if (visibility <= 0.01) return

  ;[-0.84, 0.84].forEach((z) => {
    painter.draw({
      position: [3.35, 0.55, z],
      scale: [0.13, 1.22, 0.13],
      color: [0.08, 0.34, 0.32],
      alpha: visibility,
    })
  })
  painter.draw({
    position: [3.35, 1.68, 0],
    scale: [0.14, 0.14, 0.94],
    color: [0.08, 0.34, 0.32],
    alpha: visibility,
  })
  painter.draw({
    position: [3.35, -0.54, 0],
    scale: [0.88, 0.1, 0.82],
    color: navy,
    alpha: visibility,
  })

  const scrollScan = lerp(-0.68, 0.68, segment(progress, 0.75, 0.87))
  const idleScan = Math.sin(time * 1.55) * 0.68
  const scanZ = lerp(scrollScan, idleScan, idleBlend * 0.88)
  painter.draw({
    position: [3.35, 0.36, scanZ],
    scale: [0.58, 0.82, 0.018],
    color: emerald,
    emissive: 1.4,
    alpha: visibility * 0.28,
  })
  painter.draw({
    position: [3.35, 1.6, scanZ],
    scale: [0.2, 0.045, 0.045],
    color: emerald,
    emissive: 1.6,
    alpha: visibility,
  })

  const statusPulse = 0.7 + (Math.sin(time * 2.2) + 1) * 0.2
  painter.draw({
    position: [4.2, 1.02, -0.82],
    rotation: [0, -0.22, 0],
    scale: [0.62, 0.48, 0.035],
    color: [0.025, 0.12, 0.13],
    alpha: visibility,
  })
  ;[0.18, -0.02, -0.22].forEach((offset, index) => {
    painter.draw({
      position: [4.13, 1.02 + offset, -0.77],
      rotation: [0, -0.22, 0],
      scale: [index === 0 ? 0.4 : 0.31, 0.018, 0.012],
      color: index === 0 ? emerald : cyan,
      emissive: statusPulse,
      alpha: visibility,
    })
  })
}

function drawDeliveryStation(painter: ScenePainter, state: SceneFrameState) {
  const { progress, time } = state
  const visibility = segment(progress, 0.82, 0.9)
  if (visibility <= 0.01) return

  painter.draw({
    position: [5.9, -0.52, 0],
    scale: [1.52, 0.13, 0.88],
    color: navy,
    alpha: visibility,
  })
  for (let index = -4; index <= 4; index += 1) {
    painter.draw({
      position: [5.9 + index * 0.3, -0.31, 0],
      rotation: [Math.PI / 2, 0, 0],
      scale: [0.09, 0.8, 0.09],
      color: [0.32, 0.45, 0.58],
      shape: 'cylinder',
      alpha: visibility,
    })
  }

  const packing = segment(progress, 0.93, 0.985)
  const boxY = lerp(-0.08, 0.42, packing)
  painter.draw({
    position: [5.9, boxY, 0],
    scale: [0.96, 0.66, 0.72],
    color: [0.08, 0.24, 0.46],
    alpha: packing * 0.92,
  })
  painter.draw({
    position: [5.9, boxY + 0.69, 0],
    scale: [0.98, 0.025, 0.74],
    color: cyan,
    emissive: 0.9,
    alpha: packing,
  })
  painter.draw({
    position: [6.95, 1.0, -0.62],
    scale: [0.085, 0.085, 0.085],
    color: packing > 0.6 ? emerald : cyan,
    emissive: 1.15 + Math.sin(time * 2.6) * 0.2,
    alpha: visibility,
  })
}

function drawCellBeacons(painter: ScenePainter, state: SceneFrameState) {
  const { time } = state
  const points: Vec3[] = [
    [-2.7, 1.85, -1.08],
    [0.05, 1.95, -1.0],
    [3.35, 1.98, -1.0],
    [5.95, 1.45, -0.9],
  ]
  points.forEach((point, index) => {
    painter.draw({
      position: point,
      scale: [0.045, 0.045, 0.045],
      color: index === 2 ? emerald : blue,
      emissive: 0.8 + (Math.sin(time * 1.5 + index * 1.4) + 1) * 0.25,
      alpha: 0.78,
    })
  })
}

export function drawFactoryWorld(
  painter: ScenePainter,
  state: SceneFrameState,
) {
  drawPlatform(painter, state)
  drawCellBeacons(painter, state)
  drawMachine(painter, state)
  drawQualityStation(painter, state)
  drawDeliveryStation(painter, state)
  drawWorkpiece(painter, state)
}
