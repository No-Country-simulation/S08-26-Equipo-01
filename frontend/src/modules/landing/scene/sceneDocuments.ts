import { lerp, segment, type Vec3 } from './math'
import type { ScenePainter } from './webgl'

export interface SceneFrameState {
  progress: number
  time: number
  idleBlend: number
  ambientSpin: number
}

const blue: [number, number, number] = [0.08, 0.42, 1]
const cyan: [number, number, number] = [0.05, 0.82, 0.96]
const amber: [number, number, number] = [1, 0.58, 0.1]
const emerald: [number, number, number] = [0.05, 0.78, 0.5]
const paper: [number, number, number] = [0.82, 0.9, 1]
const slate: [number, number, number] = [0.26, 0.38, 0.53]

function drawCard(
  painter: ScenePainter,
  position: Vec3,
  rotation: Vec3,
  accent: [number, number, number],
  alpha: number,
  time: number,
  width = 0.66,
  height = 0.86,
) {
  if (alpha <= 0.01) return
  const float = Math.sin(time * 0.85 + position[0]) * 0.035
  const y = position[1] + float

  painter.draw({
    position: [position[0], y, position[2]],
    rotation,
    scale: [width, height, 0.025],
    color: paper,
    alpha,
  })
  painter.draw({
    position: [
      position[0] - width * 0.42,
      y + height * 0.36,
      position[2] + 0.04,
    ],
    rotation,
    scale: [0.055, height * 0.72, 0.012],
    color: accent,
    emissive: 0.75,
    alpha,
  })

  const lineWidths = [0.36, 0.47, 0.3, 0.41]
  lineWidths.forEach((lineWidth, index) => {
    painter.draw({
      position: [
        position[0] + 0.07,
        y + 0.34 - index * 0.18,
        position[2] + 0.045,
      ],
      rotation,
      scale: [lineWidth, 0.018, 0.01],
      color: index === 0 ? accent : slate,
      emissive: index === 0 ? 0.4 : 0,
      alpha: alpha * (index === 0 ? 1 : 0.72),
    })
  })
}

function drawConnector(
  painter: ScenePainter,
  fromX: number,
  toX: number,
  y: number,
  alpha: number,
  color: [number, number, number] = blue,
) {
  if (alpha <= 0.01) return
  painter.draw({
    position: [(fromX + toX) / 2, y, 0.18],
    scale: [Math.abs(toX - fromX) / 2, 0.012, 0.012],
    color,
    emissive: 0.8,
    alpha: alpha * 0.8,
  })
  painter.draw({
    position: [toX, y, 0.18],
    scale: [0.055, 0.055, 0.055],
    color,
    emissive: 1.1,
    alpha,
  })
}

function drawRequest(painter: ScenePainter, state: SceneFrameState) {
  const { progress, time } = state
  const enter = segment(progress, 0.045, 0.105)
  const exit = segment(progress, 0.23, 0.3)
  const alpha = enter * (1 - exit)
  const x = lerp(-3.7, -1.7, enter)
  const z = lerp(0.5, 0.05, enter)

  drawCard(
    painter,
    [x, 0.95, z],
    [0.03, -0.24, -0.04],
    cyan,
    alpha,
    time,
    0.72,
    0.92,
  )
  drawConnector(painter, x + 0.75, -0.25, 0.46, alpha, cyan)

  const attachmentAlpha = alpha * segment(progress, 0.1, 0.15)
  drawCard(
    painter,
    [x - 0.72, 0.48, -0.42],
    [-0.03, 0.2, 0.08],
    blue,
    attachmentAlpha,
    time + 0.8,
    0.38,
    0.5,
  )
  drawCard(
    painter,
    [x + 0.78, 0.32, -0.5],
    [0.02, -0.2, -0.07],
    blue,
    attachmentAlpha,
    time + 1.5,
    0.34,
    0.45,
  )
}

function drawExpediente(painter: ScenePainter, state: SceneFrameState) {
  const { progress, time } = state
  const enter = segment(progress, 0.16, 0.23)
  const exit = segment(progress, 0.4, 0.48)
  const alpha = enter * (1 - exit)
  if (alpha <= 0.01) return

  const spread = segment(progress, 0.2, 0.3)
  const pages: Array<{
    x: number
    y: number
    z: number
    r: number
    accent: [number, number, number]
  }> = [
    { x: -1.85, y: 1.15, z: -0.5, r: -0.16, accent: blue },
    { x: -0.9, y: 1.32, z: -0.72, r: 0.12, accent: cyan },
    { x: -1.35, y: 0.45, z: 0.5, r: 0.03, accent: emerald },
  ]

  pages.forEach((page, index) => {
    const x = lerp(-1.25, page.x, spread)
    const y = lerp(0.82, page.y, spread)
    const z = lerp(0.05, page.z, spread)
    drawCard(
      painter,
      [x, y, z],
      [0, page.r, page.r * 0.3],
      page.accent,
      alpha,
      time + index,
      0.5,
      0.64,
    )
  })

  drawConnector(painter, -1.0, -0.2, 0.12, alpha * 0.85, blue)
}

function drawQuotation(painter: ScenePainter, state: SceneFrameState) {
  const { progress, time } = state
  const enter = segment(progress, 0.29, 0.36)
  const exit = segment(progress, 0.53, 0.6)
  const alpha = enter * (1 - exit)
  if (alpha <= 0.01) return

  const x = -1.15
  const y = 0.9
  painter.draw({
    position: [x, y, 0.18],
    rotation: [0, 0.14, -0.025],
    scale: [0.86, 0.94, 0.035],
    color: [0.09, 0.15, 0.27],
    alpha,
  })
  painter.draw({
    position: [x - 0.58, y + 0.76, 0.23],
    scale: [0.18, 0.06, 0.015],
    color: amber,
    emissive: 0.75,
    alpha,
  })

  ;[0.38, 0.1, -0.18].forEach((offset, index) => {
    painter.draw({
      position: [x - 0.18, y + offset, 0.24],
      scale: [0.42 - index * 0.04, 0.025, 0.012],
      color: [0.56, 0.67, 0.8],
      alpha: alpha * 0.8,
    })
    painter.draw({
      position: [x + 0.52, y + offset, 0.24],
      scale: [0.18, 0.05, 0.012],
      color: amber,
      emissive: 0.25,
      alpha,
    })
  })

  const approved = segment(progress, 0.39, 0.45)
  painter.draw({
    position: [x + 0.47, y - 0.62, 0.25],
    scale: [0.27, 0.09, 0.018],
    color: approved > 0.5 ? emerald : amber,
    emissive: approved > 0.5 ? 0.65 + Math.sin(time * 2) * 0.08 : 0.25,
    alpha,
  })
  drawConnector(painter, -0.2, 0.18, -0.1, alpha * approved, emerald)
}

function drawWorkOrderCard(painter: ScenePainter, state: SceneFrameState) {
  const { progress, time } = state
  const enter = segment(progress, 0.41, 0.48)
  const exit = segment(progress, 0.65, 0.72)
  const alpha = enter * (1 - exit)
  if (alpha <= 0.01) return

  drawCard(
    painter,
    [1.4, 1.25, -0.86],
    [0.02, -0.34, 0.02],
    [0.52, 0.36, 0.96],
    alpha,
    time,
    0.58,
    0.75,
  )
  const route = segment(progress, 0.46, 0.55)
  for (let index = 0; index < 4; index += 1) {
    const active = route * 4 >= index
    painter.draw({
      position: [0.55 + index * 0.34, -0.58, -0.24],
      scale: [0.055, 0.055, 0.055],
      color: active ? blue : slate,
      emissive: active ? 0.85 : 0.05,
      alpha,
    })
  }
}

function drawAmbientScreen(painter: ScenePainter, state: SceneFrameState) {
  const { time, progress } = state
  const alpha = 0.42 + segment(progress, 0.4, 0.54) * 0.45
  painter.draw({
    position: [1.45, 1.28, -1.18],
    rotation: [0, -0.32, 0],
    scale: [0.68, 0.46, 0.035],
    color: [0.035, 0.09, 0.16],
    alpha,
  })
  for (let index = 0; index < 4; index += 1) {
    const pulse = 0.18 + (Math.sin(time * 1.25 + index * 1.2) + 1) * 0.18
    painter.draw({
      position: [1.32, 1.48 - index * 0.13, -1.12],
      rotation: [0, -0.32, 0],
      scale: [0.28 + pulse * 0.28, 0.018, 0.012],
      color: index === 0 ? cyan : blue,
      emissive: 0.35 + pulse,
      alpha,
    })
  }
}

export function drawStoryDocuments(
  painter: ScenePainter,
  state: SceneFrameState,
) {
  drawAmbientScreen(painter, state)
  drawRequest(painter, state)
  drawExpediente(painter, state)
  drawQuotation(painter, state)
  drawWorkOrderCard(painter, state)
}
