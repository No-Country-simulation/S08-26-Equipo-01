import {
  stageIndex,
  stageLocalProgress,
  stageOpacity,
} from './storyTimeline.js'

function makeCanvasTexture(THREE, eyebrow, title, rows, accent) {
  const canvas = document.createElement('canvas')
  canvas.width = 920
  canvas.height = 580
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('No se pudo crear la textura de la escena 3D.')

  ctx.clearRect(0, 0, canvas.width, canvas.height)
  ctx.fillStyle = '#07111f'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.fillStyle = accent
  ctx.fillRect(0, 0, 18, canvas.height)
  ctx.fillStyle = '#7f94aa'
  ctx.font = '700 27px system-ui'
  ctx.fillText(eyebrow.toUpperCase(), 62, 72)
  ctx.fillStyle = '#f4f8ff'
  ctx.font = '800 50px system-ui'
  ctx.fillText(title, 62, 140)
  rows.forEach((row, index) => {
    const y = 230 + index * 78
    ctx.fillStyle = '#17314d'
    ctx.fillRect(62, y - 34, 790, 54)
    ctx.fillStyle = index === rows.length - 1 ? accent : '#b6c5d4'
    ctx.font = index === rows.length - 1 ? '800 30px system-ui' : '600 27px system-ui'
    ctx.fillText(row, 84, y + 2)
  })

  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  return texture
}

function card(THREE, eyebrow, title, rows, accent) {
  const group = new THREE.Group()
  const texture = makeCanvasTexture(THREE, eyebrow, title, rows, accent)
  const screen = new THREE.Mesh(
    new THREE.PlaneGeometry(1.78, 1.12),
    new THREE.MeshBasicMaterial({ map: texture, transparent: true, toneMapped: false }),
  )
  const frame = new THREE.Mesh(
    new THREE.BoxGeometry(1.9, 1.24, 0.08),
    new THREE.MeshStandardMaterial({
      color: 0x142338,
      metalness: 0.7,
      roughness: 0.32,
      transparent: true,
    }),
  )
  screen.position.z = 0.05
  group.add(frame, screen)
  return group
}

function createConnector(THREE, color) {
  const positions = new Float32Array(6)
  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  const material = new THREE.LineBasicMaterial({
    color,
    transparent: true,
    opacity: 0,
  })
  const line = new THREE.Line(geometry, material)
  line.frustumCulled = false
  return { line, material, positions }
}

function updateConnector(connector, from, to, opacity) {
  connector.positions[0] = from[0]
  connector.positions[1] = from[1]
  connector.positions[2] = from[2]
  connector.positions[3] = to[0]
  connector.positions[4] = to[1]
  connector.positions[5] = to[2]
  connector.line.geometry.attributes.position.needsUpdate = true
  connector.material.opacity = opacity
  connector.line.visible = opacity > 0.01
}

function setFade(group, opacity) {
  group.visible = opacity > 0.01
  group.traverse((object) => {
    if (!object.material) return
    object.material.transparent = true
    object.material.opacity = opacity
  })
}

export function buildIndustrialStory(THREE, root) {
  const request = card(
    THREE,
    'Solicitud',
    'SOL-2026-014',
    ['Eje de transmisión', 'AISI 4140 · 12 pzas', 'Documentos 03'],
    '#26c6f4',
  )
  request.position.set(-3.4, 0.9, 0.4)
  request.rotation.y = 0.22
  root.add(request)

  const nodeMaterial = new THREE.MeshStandardMaterial({
    color: 0x18c9f4,
    emissive: 0x0b6f92,
    emissiveIntensity: 1.2,
    transparent: true,
    opacity: 0,
  })
  const requestNode = new THREE.Mesh(
    new THREE.IcosahedronGeometry(0.15, 2),
    nodeMaterial,
  )
  requestNode.position.set(-0.42, 0.5, 0.08)
  root.add(requestNode)

  const requestLink = createConnector(THREE, 0x25c8f7)
  const pieceLink = createConnector(THREE, 0x4d8fff)
  root.add(requestLink.line, pieceLink.line)

  const expediente = new THREE.Group()
  const expedienteCards = [
    card(
      THREE,
      'Expediente 360',
      'Plano técnico',
      ['REV B', 'Tolerancias', 'PDF · 2.4 MB'],
      '#4d8fff',
    ),
    card(
      THREE,
      'Expediente 360',
      'Revisión interna',
      ['Material validado', 'Ruta definida', 'Contexto completo'],
      '#54d6ff',
    ),
    card(
      THREE,
      'Expediente 360',
      'Trazabilidad',
      ['Solicitud recibida', 'Aclaración cerrada', 'Listo para cotizar'],
      '#40d69b',
    ),
  ]
  expedienteCards.forEach((item) => expediente.add(item))

  const orbitMaterial = new THREE.MeshBasicMaterial({
    color: 0x2c8fff,
    transparent: true,
    opacity: 0,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  })
  const contextRing = new THREE.Mesh(
    new THREE.TorusGeometry(1.35, 0.018, 12, 96),
    orbitMaterial,
  )
  contextRing.rotation.x = 1.06
  expediente.add(contextRing)

  const contextNodes = Array.from({ length: 5 }, (_, index) => {
    const material = new THREE.MeshBasicMaterial({
      color: index % 2 === 0 ? 0x4d8fff : 0x45e29a,
      transparent: true,
      opacity: 0,
    })
    const node = new THREE.Mesh(new THREE.SphereGeometry(0.055, 16, 16), material)
    expediente.add(node)
    return node
  })
  root.add(expediente)

  const quotation = card(
    THREE,
    'Cotización',
    'QT-2026-014',
    ['Mecanizado CNC', 'Entrega · 20 días', '$ 38,450 MXN · APROBADA'],
    '#ffad35',
  )
  quotation.position.set(-1.7, 0.95, 0.25)
  quotation.rotation.y = 0.18
  root.add(quotation)

  const workOrder = card(
    THREE,
    'Orden de trabajo',
    'OT-2026-041',
    ['Corte → Torneado', 'Fresado → Inspección', 'RUTA LIBERADA'],
    '#9875ff',
  )
  workOrder.position.set(1.75, 1.05, -0.55)
  workOrder.rotation.y = -0.28
  root.add(workOrder)

  const measure = card(
    THREE,
    'Control dimensional',
    'Inspección conforme',
    ['Ø 24.98 mm ✓', 'Tolerancia ±0.05 ✓', 'RESULTADO · PASS'],
    '#45e29a',
  )
  measure.position.set(5.05, 1.05, -0.55)
  measure.rotation.y = -0.25
  root.add(measure)

  const deliveryCard = card(
    THREE,
    'Entrega',
    'DEL-2026-014',
    ['Transportista asignado', 'Evidencia adjunta', 'ENTREGA CONFIRMADA'],
    '#25c8f7',
  )
  deliveryCard.position.set(6.15, 1.05, -0.5)
  deliveryCard.rotation.y = -0.24
  root.add(deliveryCard)

  const stageLabels = [
    ['Solicitud', -2.5, '#25c8f7'],
    ['Cotización', -0.9, '#ffad35'],
    ['Producción', 1.1, '#4b8fff'],
    ['Calidad', 4.45, '#45e29a'],
    ['Entrega', 7.2, '#25c8f7'],
  ].map(([label, x, accent]) => {
    const labelCard = card(THREE, 'QualityTrack', label, ['FLUJO CONECTADO'], accent)
    labelCard.scale.setScalar(0.42)
    labelCard.position.set(x, 2.35, -0.25)
    root.add(labelCard)
    setFade(labelCard, 0)
    return labelCard
  })

  setFade(request, 0)
  setFade(expediente, 0)
  setFade(quotation, 0)
  setFade(workOrder, 0)
  setFade(measure, 0)
  setFade(deliveryCard, 0)

  return {
    request,
    requestNode,
    nodeMaterial,
    requestLink,
    pieceLink,
    expediente,
    expedienteCards,
    contextRing,
    contextNodes,
    quotation,
    workOrder,
    measure,
    deliveryCard,
    stageLabels,
  }
}

export function updateIndustrialStory(THREE, story, progress, time) {
  const currentStage = stageIndex(progress)

  const requestAlpha = stageOpacity(progress, 1)
  const requestLocal = stageLocalProgress(progress, 1)
  const requestTravel = THREE.MathUtils.smoothstep(requestLocal, 0.08, 0.82)
  story.request.position.x = THREE.MathUtils.lerp(-3.25, -1.18, requestTravel)
  story.request.position.y =
    THREE.MathUtils.lerp(0.95, 0.7, requestTravel) + Math.sin(time * 0.8) * 0.035
  story.request.position.z = THREE.MathUtils.lerp(0.42, 0.1, requestTravel)
  story.request.rotation.y = THREE.MathUtils.lerp(0.24, 0.05, requestTravel)
  setFade(story.request, requestAlpha)

  const nodeAlpha =
    requestAlpha * THREE.MathUtils.smoothstep(requestLocal, 0.18, 0.32)
  story.nodeMaterial.opacity = nodeAlpha
  story.nodeMaterial.emissiveIntensity = 0.9 + Math.sin(time * 2.4) * 0.35
  story.requestNode.visible = nodeAlpha > 0.01
  story.requestNode.scale.setScalar(0.9 + Math.sin(time * 2.2) * 0.08)
  updateConnector(
    story.requestLink,
    [story.request.position.x + 0.82, story.request.position.y - 0.12, story.request.position.z],
    [-0.42, 0.5, 0.08],
    nodeAlpha * 0.82,
  )
  updateConnector(
    story.pieceLink,
    [-0.42, 0.5, 0.08],
    [-0.2, 0.26, 0.08],
    nodeAlpha * 0.65,
  )

  const fileAlpha = stageOpacity(progress, 2)
  const fileLocal = stageLocalProgress(progress, 2)
  const spread = THREE.MathUtils.smoothstep(fileLocal, 0.08, 0.72)
  const targets = [
    [-1.72, 1.22, -0.48, -0.2],
    [0.48, 1.4, -0.72, 0.16],
    [-0.82, -0.08, 0.68, 0.04],
  ]
  story.expedienteCards.forEach((item, index) => {
    const target = targets[index]
    item.position.set(
      THREE.MathUtils.lerp(-0.42, target[0], spread),
      THREE.MathUtils.lerp(0.5, target[1], spread) + Math.sin(time * 0.7 + index) * 0.025,
      THREE.MathUtils.lerp(0.08, target[2], spread),
    )
    item.rotation.y = target[3] * spread
    item.scale.setScalar(THREE.MathUtils.lerp(0.28, 0.62, spread))
  })
  story.contextRing.rotation.z = time * 0.15
  story.contextRing.rotation.y = time * 0.08
  story.contextNodes.forEach((node, index) => {
    const angle = time * 0.22 + (index / story.contextNodes.length) * Math.PI * 2
    node.position.set(
      -0.25 + Math.cos(angle) * 1.34,
      0.55 + Math.sin(angle * 1.4) * 0.42,
      Math.sin(angle) * 0.72,
    )
  })
  setFade(story.expediente, fileAlpha)

  const quotationAlpha = stageOpacity(progress, 3)
  const quotationLocal = stageLocalProgress(progress, 3)
  const quotationSettle = THREE.MathUtils.smoothstep(quotationLocal, 0.08, 0.72)
  story.quotation.position.x = THREE.MathUtils.lerp(-2.75, -1.7, quotationSettle)
  story.quotation.position.y =
    THREE.MathUtils.lerp(0.72, 0.95, quotationSettle) + Math.sin(time * 0.75) * 0.035
  story.quotation.rotation.y = THREE.MathUtils.lerp(0.34, 0.18, quotationSettle)
  story.quotation.scale.setScalar(THREE.MathUtils.lerp(0.82, 1, quotationSettle))
  setFade(story.quotation, quotationAlpha)

  const workOrderAlpha = stageOpacity(progress, 4)
  const workOrderLocal = stageLocalProgress(progress, 4)
  const workOrderSettle = THREE.MathUtils.smoothstep(workOrderLocal, 0.08, 0.68)
  story.workOrder.position.x = THREE.MathUtils.lerp(2.85, 1.75, workOrderSettle)
  story.workOrder.position.y =
    THREE.MathUtils.lerp(0.76, 1.05, workOrderSettle) + Math.sin(time * 0.68) * 0.026
  story.workOrder.rotation.y = THREE.MathUtils.lerp(-0.42, -0.28, workOrderSettle)
  story.workOrder.scale.setScalar(THREE.MathUtils.lerp(0.84, 1, workOrderSettle))
  setFade(story.workOrder, workOrderAlpha)

  const measureAlpha = stageOpacity(progress, 6)
  const measureLocal = stageLocalProgress(progress, 6)
  const measureSettle = THREE.MathUtils.smoothstep(measureLocal, 0.12, 0.64)
  story.measure.position.x = THREE.MathUtils.lerp(5.9, 5.05, measureSettle)
  story.measure.position.y =
    THREE.MathUtils.lerp(0.78, 1.05, measureSettle) + Math.sin(time * 0.8) * 0.025
  story.measure.rotation.y = THREE.MathUtils.lerp(-0.4, -0.25, measureSettle)
  story.measure.scale.setScalar(THREE.MathUtils.lerp(0.84, 1, measureSettle))
  setFade(story.measure, measureAlpha)

  const deliveryAlpha = stageOpacity(progress, 7)
  const deliveryLocal = stageLocalProgress(progress, 7)
  const deliverySettle = THREE.MathUtils.smoothstep(deliveryLocal, 0.14, 0.68)
  story.deliveryCard.position.x = THREE.MathUtils.lerp(7.05, 6.15, deliverySettle)
  story.deliveryCard.position.y =
    THREE.MathUtils.lerp(0.8, 1.05, deliverySettle) + Math.sin(time * 0.72) * 0.024
  story.deliveryCard.rotation.y = THREE.MathUtils.lerp(-0.4, -0.24, deliverySettle)
  story.deliveryCard.scale.setScalar(THREE.MathUtils.lerp(0.84, 1, deliverySettle))
  setFade(story.deliveryCard, deliveryAlpha)

  story.stageLabels.forEach((label) => setFade(label, 0))

  if (currentStage !== 1) {
    updateConnector(story.requestLink, [0, 0, 0], [0, 0, 0], 0)
    updateConnector(story.pieceLink, [0, 0, 0], [0, 0, 0], 0)
  }
}
