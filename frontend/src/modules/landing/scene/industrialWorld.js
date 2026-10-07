function createBrushedTexture(THREE) {
  const canvas = document.createElement('canvas')
  canvas.width = 512
  canvas.height = 128
  const ctx = canvas.getContext('2d')
  if (!ctx) return null

  ctx.fillStyle = '#8a97a3'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  for (let y = 0; y < canvas.height; y += 1) {
    const value = 118 + Math.floor(Math.random() * 32)
    ctx.fillStyle = `rgb(${value}, ${value + 7}, ${value + 12})`
    ctx.globalAlpha = 0.12 + Math.random() * 0.16
    ctx.fillRect(0, y, canvas.width, 1)
  }
  ctx.globalAlpha = 1

  const texture = new THREE.CanvasTexture(canvas)
  texture.wrapS = THREE.RepeatWrapping
  texture.wrapT = THREE.RepeatWrapping
  texture.repeat.set(4, 1)
  texture.colorSpace = THREE.SRGBColorSpace
  return texture
}

function createDataCurve(THREE) {
  return new THREE.CatmullRomCurve3([
    new THREE.Vector3(1.95, 1.05, 1.36),
    new THREE.Vector3(1.25, 1.15, 1.08),
    new THREE.Vector3(0.85, 0.72, 0.78),
    new THREE.Vector3(0.38, 0.42, 0.52),
    new THREE.Vector3(-0.05, 0.27, 0.18),
  ])
}

function drawMonitor(world, time, idleBlend) {
  const ctx = world.monitorContext
  if (!ctx) return

  const pulse = (Math.sin(time * 1.8) + 1) / 2
  const load = Math.round(36 + pulse * 7 + idleBlend * 3)
  const rpm = Math.round(780 + pulse * 34)
  const traceProgress = 0.72 + pulse * 0.04

  ctx.clearRect(0, 0, 900, 560)
  const gradient = ctx.createLinearGradient(0, 0, 900, 560)
  gradient.addColorStop(0, '#06111d')
  gradient.addColorStop(1, '#020813')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, 900, 560)

  ctx.strokeStyle = 'rgba(104, 211, 255, .10)'
  ctx.lineWidth = 1
  for (let x = 0; x < 900; x += 56) {
    ctx.beginPath()
    ctx.moveTo(x, 0)
    ctx.lineTo(x, 560)
    ctx.stroke()
  }
  for (let y = 0; y < 560; y += 56) {
    ctx.beginPath()
    ctx.moveTo(0, y)
    ctx.lineTo(900, y)
    ctx.stroke()
  }

  ctx.fillStyle = '#77dcff'
  ctx.font = '700 34px system-ui'
  ctx.fillText('QUALITYTRACK', 44, 58)
  ctx.fillStyle = '#60778f'
  ctx.font = '700 18px ui-monospace, monospace'
  ctx.fillText('INDUSTRIAL TRACE · CNC-01', 44, 90)

  ctx.fillStyle = '#45e29a'
  ctx.beginPath()
  ctx.arc(58, 145, 9, 0, Math.PI * 2)
  ctx.fill()
  ctx.shadowColor = '#45e29a'
  ctx.shadowBlur = 22
  ctx.fill()
  ctx.shadowBlur = 0

  ctx.fillStyle = '#eef8ff'
  ctx.font = '800 44px system-ui'
  ctx.fillText('TRACKED / READY', 84, 160)

  ctx.fillStyle = '#8ea7bd'
  ctx.font = '600 20px ui-monospace, monospace'
  ctx.fillText('PART', 44, 225)
  ctx.fillText('MATERIAL', 44, 274)
  ctx.fillText('TELEMETRY', 44, 323)
  ctx.fillStyle = '#e9f4ff'
  ctx.font = '700 23px ui-monospace, monospace'
  ctx.fillText('SHAFT-014', 250, 225)
  ctx.fillText('AISI 4140', 250, 274)
  ctx.fillText(`${rpm} RPM · ${load}% LOAD`, 250, 323)

  ctx.fillStyle = '#0f263d'
  ctx.fillRect(44, 372, 812, 20)
  ctx.fillStyle = '#218bff'
  ctx.fillRect(44, 372, 812 * traceProgress, 20)
  ctx.fillStyle = '#7890a8'
  ctx.font = '700 15px ui-monospace, monospace'
  ctx.fillText('TRACEABILITY LINK', 44, 426)
  ctx.fillStyle = '#47d8ff'
  ctx.fillText('REQUEST → CASE → QUOTE → WORK ORDER', 260, 426)

  const chartY = 500
  ctx.strokeStyle = '#2bc8f3'
  ctx.lineWidth = 3
  ctx.beginPath()
  for (let x = 44; x <= 856; x += 18) {
    const y = chartY - 20 - Math.sin(x * 0.033 + time * 2.1) * 10 - Math.sin(x * 0.011) * 7
    if (x === 44) ctx.moveTo(x, y)
    else ctx.lineTo(x, y)
  }
  ctx.stroke()

  world.monitorTexture.needsUpdate = true
}

export function buildIndustrialWorld(THREE, scene) {
  const root = new THREE.Group()
  root.position.set(0.16, 0, 0)
  scene.add(root)

  const brushedTexture = createBrushedTexture(THREE)

  const steel = new THREE.MeshPhysicalMaterial({
    color: 0x9aa8b4,
    map: brushedTexture,
    metalness: 0.94,
    roughness: 0.24,
    clearcoat: 0.18,
    clearcoatRoughness: 0.28,
  })
  const machinedSteel = new THREE.MeshPhysicalMaterial({
    color: 0xaebbc5,
    map: brushedTexture,
    metalness: 0.98,
    roughness: 0.15,
    clearcoat: 0.35,
    clearcoatRoughness: 0.18,
  })
  const graphite = new THREE.MeshStandardMaterial({
    color: 0x101923,
    metalness: 0.76,
    roughness: 0.29,
  })
  const frameMetal = new THREE.MeshPhysicalMaterial({
    color: 0x334556,
    metalness: 0.82,
    roughness: 0.26,
    clearcoat: 0.2,
  })
  const enamel = new THREE.MeshPhysicalMaterial({
    color: 0xc5ced4,
    metalness: 0.32,
    roughness: 0.31,
    clearcoat: 0.62,
    clearcoatRoughness: 0.21,
  })
  const rubber = new THREE.MeshStandardMaterial({
    color: 0x090d12,
    metalness: 0.08,
    roughness: 0.82,
  })
  const floorMat = new THREE.MeshPhysicalMaterial({
    color: 0x071019,
    metalness: 0.28,
    roughness: 0.42,
    clearcoat: 0.12,
  })
  const glass = new THREE.MeshPhysicalMaterial({
    color: 0x79bdda,
    transparent: true,
    opacity: 0.13,
    roughness: 0.07,
    metalness: 0.02,
    transmission: 0.34,
    thickness: 0.12,
    ior: 1.45,
    clearcoat: 0.5,
  })
  const cyanGlow = new THREE.MeshStandardMaterial({
    color: 0x1ed8ff,
    emissive: 0x0b8db2,
    emissiveIntensity: 2.1,
    metalness: 0.28,
    roughness: 0.2,
  })

  const box = (w, h, d, material, x, y, z, parent = root, bevel = false) => {
    const geometry = new THREE.BoxGeometry(w, h, d, bevel ? 2 : 1, bevel ? 2 : 1, bevel ? 2 : 1)
    const mesh = new THREE.Mesh(geometry, material)
    mesh.position.set(x, y, z)
    mesh.castShadow = true
    mesh.receiveShadow = true
    parent.add(mesh)
    return mesh
  }

  const cylinder = (rt, rb, h, material, x, y, z, rx = 0, rz = 0, parent = root, segments = 40) => {
    const mesh = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, segments), material)
    mesh.position.set(x, y, z)
    mesh.rotation.x = rx
    mesh.rotation.z = rz
    mesh.castShadow = true
    mesh.receiveShadow = true
    parent.add(mesh)
    return mesh
  }

  const floor = box(10.8, 0.14, 5.4, floorMat, 0.5, -1.24, 0.05)
  const grid = new THREE.GridHelper(10.6, 32, 0x1d547b, 0x10283f)
  grid.position.set(0.5, -1.16, 0.05)
  grid.material.transparent = true
  grid.material.opacity = 0.26
  root.add(grid)

  const backWall = box(8.8, 4.3, 0.12, graphite, 0.65, 0.75, -2.25)
  backWall.material = graphite.clone()
  backWall.material.color.setHex(0x09121d)
  backWall.material.roughness = 0.64

  const wallRibs = []
  for (let x = -3.2; x <= 4.4; x += 1.25) {
    wallRibs.push(box(0.035, 3.65, 0.04, frameMetal, x, 0.7, -2.17))
  }

  const machine = new THREE.Group()
  machine.position.set(0.5, -0.02, 0)
  root.add(machine)

  const addMachineBox = (w, h, d, material, x, y, z) => box(w, h, d, material, x, y, z, machine)

  addMachineBox(4.25, 0.42, 3.05, graphite, 0, -0.92, 0)
  addMachineBox(4.05, 0.18, 2.82, frameMetal, 0, -0.69, 0)
  addMachineBox(0.34, 3.18, 0.34, frameMetal, -1.76, 0.55, 1.18)
  addMachineBox(0.34, 3.18, 0.34, frameMetal, 1.76, 0.55, 1.18)
  addMachineBox(0.34, 3.18, 0.34, frameMetal, -1.76, 0.55, -1.18)
  addMachineBox(0.34, 3.18, 0.34, frameMetal, 1.76, 0.55, -1.18)
  addMachineBox(3.9, 0.34, 2.72, frameMetal, 0, 1.98, 0)
  addMachineBox(3.62, 0.14, 2.45, enamel, 0, 2.18, 0)

  addMachineBox(3.34, 0.08, 2.24, glass, 0, 0.66, -1.22)
  addMachineBox(0.08, 2.26, 2.18, glass, -1.79, 0.62, 0)
  addMachineBox(0.08, 2.26, 2.18, glass, 1.79, 0.62, 0)

  addMachineBox(0.72, 1.25, 0.1, enamel, -1.33, -0.02, -1.28)
  addMachineBox(0.72, 1.25, 0.1, enamel, 1.33, -0.02, -1.28)
  addMachineBox(0.18, 1.55, 0.09, frameMetal, 0.02, 0.35, -1.285)

  const handle = cylinder(0.035, 0.035, 0.8, steel, 0.22, 0.48, -1.34, 0, 0, machine, 20)
  handle.rotation.z = 0

  const boltMaterial = new THREE.MeshStandardMaterial({ color: 0x8796a4, metalness: 0.92, roughness: 0.22 })
  const boltPositions = [
    [-1.57, 1.78, -1.31], [1.57, 1.78, -1.31], [-1.57, -0.47, -1.31], [1.57, -0.47, -1.31],
    [-1.55, 1.76, 1.27], [1.55, 1.76, 1.27],
  ]
  boltPositions.forEach(([x, y, z]) => {
    const bolt = cylinder(0.055, 0.055, 0.04, boltMaterial, x, y, z, Math.PI / 2, 0, machine, 20)
    bolt.castShadow = false
  })

  const vent = new THREE.Group()
  vent.position.set(-1.38, -0.42, 1.56)
  machine.add(vent)
  for (let index = 0; index < 7; index += 1) {
    box(0.62, 0.035, 0.035, rubber, 0, index * 0.08, 0, vent)
  }

  const emergencyHousing = cylinder(0.115, 0.115, 0.11, graphite, 1.64, 1.48, 1.34, Math.PI / 2, 0, machine, 32)
  emergencyHousing.castShadow = false
  cylinder(0.085, 0.085, 0.08, new THREE.MeshStandardMaterial({
    color: 0xd81f32,
    emissive: 0x5f0710,
    emissiveIntensity: 0.6,
    roughness: 0.34,
  }), 1.64, 1.48, 1.41, Math.PI / 2, 0, machine, 32)

  const workpieceGroup = new THREE.Group()
  workpieceGroup.position.set(-0.08, 0.18, 0.12)
  root.add(workpieceGroup)

  const profile = [
    [0.20, -1.58], [0.24, -1.49], [0.24, -1.26], [0.31, -1.19], [0.31, -1.02],
    [0.43, -0.93], [0.43, -0.68], [0.52, -0.61], [0.52, -0.46], [0.35, -0.38],
    [0.35, -0.15], [0.43, -0.08], [0.43, 0.08], [0.35, 0.15], [0.35, 0.38],
    [0.52, 0.46], [0.52, 0.61], [0.43, 0.68], [0.43, 0.93], [0.31, 1.02],
    [0.31, 1.19], [0.24, 1.26], [0.24, 1.49], [0.20, 1.58],
  ].map(([radius, axis]) => new THREE.Vector2(radius, axis))

  const workpiece = new THREE.Mesh(new THREE.LatheGeometry(profile, 96), machinedSteel)
  workpiece.rotation.z = Math.PI / 2
  workpiece.castShadow = true
  workpiece.receiveShadow = true
  workpieceGroup.add(workpiece)

  const grooveMat = new THREE.MeshStandardMaterial({ color: 0x293a48, metalness: 0.96, roughness: 0.18 })
  const grooves = [-0.82, -0.58, -0.28, 0.28, 0.58, 0.82].map((x, index) => {
    const radius = index === 2 || index === 3 ? 0.36 : 0.45
    const ring = new THREE.Mesh(new THREE.TorusGeometry(radius, 0.022, 12, 64), grooveMat)
    ring.position.x = x
    ring.rotation.y = Math.PI / 2
    ring.castShadow = true
    workpieceGroup.add(ring)
    return ring
  })

  const keyway = new THREE.Mesh(
    new THREE.BoxGeometry(1.28, 0.052, 0.095),
    new THREE.MeshStandardMaterial({ color: 0x112330, metalness: 0.74, roughness: 0.2 }),
  )
  keyway.position.set(0, 0.425, 0)
  workpieceGroup.add(keyway)

  const inspectionMark = new THREE.Mesh(
    new THREE.BoxGeometry(0.26, 0.024, 0.08),
    new THREE.MeshBasicMaterial({ color: 0x27d8ff }),
  )
  inspectionMark.position.set(0.22, 0.456, 0)
  workpieceGroup.add(inspectionMark)

  const chuckMaterial = new THREE.MeshPhysicalMaterial({
    color: 0x4a5a66,
    metalness: 0.97,
    roughness: 0.21,
    clearcoat: 0.18,
  })
  const chuckLeft = cylinder(0.61, 0.61, 0.28, chuckMaterial, -0.98, 0.18, 0.12, 0, Math.PI / 2, machine, 56)
  const chuckRight = cylinder(0.61, 0.61, 0.28, chuckMaterial, 0.98, 0.18, 0.12, 0, Math.PI / 2, machine, 56)

  const jawMaterial = new THREE.MeshStandardMaterial({ color: 0x687783, metalness: 0.95, roughness: 0.2 })
  ;[-0.98, 0.98].forEach((x) => {
    for (let index = 0; index < 3; index += 1) {
      const angle = (index / 3) * Math.PI * 2
      const jaw = box(0.18, 0.18, 0.38, jawMaterial, x, 0.18 + Math.cos(angle) * 0.38, 0.12 + Math.sin(angle) * 0.38, machine)
      jaw.rotation.x = angle
    }
  })

  const head = new THREE.Group()
  head.position.set(0, 0.16, 0.02)
  machine.add(head)
  const headBody = cylinder(0.31, 0.37, 0.78, frameMetal, 0, 1.22, 0, 0, 0, head, 48)
  headBody.castShadow = true
  cylinder(0.13, 0.19, 0.2, graphite, 0, 0.77, 0, 0, 0, head, 36)
  const tool = cylinder(0.045, 0.085, 0.72, machinedSteel, 0, 0.35, 0, 0, 0, head, 28)
  tool.material = machinedSteel.clone()
  tool.material.color.setHex(0xc6d3dc)

  const taskLightMaterial = new THREE.MeshStandardMaterial({
    color: 0xcaf5ff,
    emissive: 0x70dfff,
    emissiveIntensity: 3.2,
    roughness: 0.1,
  })
  const taskLight = box(1.3, 0.045, 0.045, taskLightMaterial, 0, 1.72, -0.96, machine)
  taskLight.castShadow = false

  const makeTowerLight = (color, y) => {
    const material = new THREE.MeshStandardMaterial({
      color,
      emissive: color,
      emissiveIntensity: 0.4,
      roughness: 0.22,
    })
    const mesh = cylinder(0.085, 0.085, 0.15, material, 1.5, y, 0.88, 0, 0, machine, 28)
    mesh.castShadow = false
    return material
  }
  cylinder(0.035, 0.035, 0.58, graphite, 1.5, 2.0, 0.88, 0, 0, machine, 18)
  const tower = {
    green: makeTowerLight(0x25dc8d, 2.19),
    amber: makeTowerLight(0xffae38, 2.37),
    red: makeTowerLight(0xff4358, 2.55),
  }

  const monitorCanvas = document.createElement('canvas')
  monitorCanvas.width = 900
  monitorCanvas.height = 560
  const monitorContext = monitorCanvas.getContext('2d')
  const monitorTexture = new THREE.CanvasTexture(monitorCanvas)
  monitorTexture.colorSpace = THREE.SRGBColorSpace
  monitorTexture.minFilter = THREE.LinearFilter
  monitorTexture.magFilter = THREE.LinearFilter
  const monitorMaterial = new THREE.MeshBasicMaterial({ map: monitorTexture, toneMapped: false })
  const monitor = new THREE.Mesh(new THREE.PlaneGeometry(1.42, 0.88), monitorMaterial)
  monitor.position.set(1.78, 0.82, 1.29)
  monitor.rotation.y = -0.26
  machine.add(monitor)
  const monitorFrame = addMachineBox(1.58, 1.02, 0.095, graphite, 1.78, 0.82, 1.34)
  monitorFrame.castShadow = true

  const dataCurve = createDataCurve(THREE)
  const dataPoints = dataCurve.getPoints(54)
  const dataGeometry = new THREE.BufferGeometry().setFromPoints(dataPoints)
  const dataMaterial = new THREE.LineBasicMaterial({
    color: 0x2fcfff,
    transparent: true,
    opacity: 0.24,
    blending: THREE.AdditiveBlending,
  })
  const dataLine = new THREE.Line(dataGeometry, dataMaterial)
  root.add(dataLine)

  const dataPulseMaterial = new THREE.MeshBasicMaterial({
    color: 0x54dcff,
    transparent: true,
    opacity: 0.9,
    blending: THREE.AdditiveBlending,
  })
  const dataPulses = Array.from({ length: 8 }, () => {
    const pulse = new THREE.Mesh(new THREE.SphereGeometry(0.045, 18, 18), dataPulseMaterial.clone())
    root.add(pulse)
    return pulse
  })

  const dustGeometry = new THREE.BufferGeometry()
  const dustPositions = new Float32Array(110 * 3)
  for (let index = 0; index < 110; index += 1) {
    dustPositions[index * 3] = -3 + Math.random() * 7
    dustPositions[index * 3 + 1] = -0.7 + Math.random() * 3.6
    dustPositions[index * 3 + 2] = -1.5 + Math.random() * 3.2
  }
  dustGeometry.setAttribute('position', new THREE.BufferAttribute(dustPositions, 3))
  const dustMaterial = new THREE.PointsMaterial({
    color: 0x8edfff,
    size: 0.016,
    transparent: true,
    opacity: 0.14,
    depthWrite: false,
  })
  const dust = new THREE.Points(dustGeometry, dustMaterial)
  root.add(dust)

  const underGlowMaterial = new THREE.MeshBasicMaterial({
    color: 0x0b71a1,
    transparent: true,
    opacity: 0.16,
    blending: THREE.AdditiveBlending,
  })
  const underGlow = new THREE.Mesh(new THREE.PlaneGeometry(4.3, 2.3), underGlowMaterial)
  underGlow.rotation.x = -Math.PI / 2
  underGlow.position.set(0.5, -1.15, 0.12)
  root.add(underGlow)

  return {
    root,
    floor,
    grid,
    machine,
    wallRibs,
    workpieceGroup,
    workpiece,
    grooves,
    chuckLeft,
    chuckRight,
    head,
    tower,
    taskLight,
    monitorContext,
    monitorTexture,
    dataCurve,
    dataLine,
    dataMaterial,
    dataPulses,
    dust,
    dustMaterial,
    underGlow,
    underGlowMaterial,
    startedAt: performance.now() / 1000,
    lastMonitorTick: -1,
  }
}

export function updateIndustrialWorld(THREE, world, progress, idleBlend, time) {
  const elapsed = Math.max(0, time - world.startedAt)
  const settle = THREE.MathUtils.smoothstep(Math.min(elapsed / 1.35, 1), 0, 1)
  const gentleProgress = THREE.MathUtils.clamp(progress * 3.2, 0, 1)

  world.root.position.x = THREE.MathUtils.lerp(0.38, 0.16, settle)
  world.root.rotation.y = THREE.MathUtils.lerp(-0.025, 0, settle)

  world.workpieceGroup.position.set(
    THREE.MathUtils.lerp(-0.28, -0.08, settle),
    0.18 + Math.sin(time * 0.72) * 0.014 * idleBlend,
    0.12,
  )
  world.workpieceGroup.rotation.x = time * (0.18 + idleBlend * 0.04) + gentleProgress * 0.08

  world.head.position.y = 0.16 + Math.sin(time * 0.75) * 0.022 * idleBlend
  world.chuckLeft.rotation.y += 0.006 + idleBlend * 0.002
  world.chuckRight.rotation.y -= 0.006 + idleBlend * 0.002

  world.tower.green.emissiveIntensity = 1.05 + Math.sin(time * 1.65) * 0.16
  world.tower.amber.emissiveIntensity = 0.08 + (Math.sin(time * 0.55) + 1) * 0.035
  world.tower.red.emissiveIntensity = 0.035

  world.dataMaterial.opacity = 0.2 + idleBlend * 0.08
  world.dataPulses.forEach((pulse, index) => {
    const t = (time * (0.07 + idleBlend * 0.025) + index / world.dataPulses.length) % 1
    const point = world.dataCurve.getPointAt(t)
    pulse.position.copy(point)
    const intensity = 0.58 + Math.sin(time * 2 + index) * 0.18
    pulse.scale.setScalar(0.72 + intensity * 0.22)
    pulse.material.opacity = 0.48 + intensity * 0.38
  })

  world.dust.rotation.y = time * 0.012
  world.dust.position.y = Math.sin(time * 0.16) * 0.035
  world.dustMaterial.opacity = 0.08 + idleBlend * 0.07

  world.underGlowMaterial.opacity = 0.12 + idleBlend * 0.055 + Math.sin(time * 0.8) * 0.018

  if (Math.floor(time * 3) !== world.lastMonitorTick) {
    world.lastMonitorTick = Math.floor(time * 3)
    drawMonitor(world, time, idleBlend)
  }
}
