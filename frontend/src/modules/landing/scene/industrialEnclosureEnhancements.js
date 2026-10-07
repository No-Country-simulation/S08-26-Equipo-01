function makePlacardTexture(THREE) {
  const canvas = document.createElement('canvas')
  canvas.width = 512
  canvas.height = 220
  const ctx = canvas.getContext('2d')
  if (!ctx) return null

  ctx.fillStyle = '#d9e1e6'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.fillStyle = '#111827'
  ctx.fillRect(0, 0, canvas.width, 44)
  ctx.fillStyle = '#e8f4ff'
  ctx.font = '700 24px system-ui'
  ctx.fillText('QUALITYTRACK · CNC-01', 24, 30)

  ctx.fillStyle = '#283746'
  ctx.font = '700 18px ui-monospace, monospace'
  ctx.fillText('AUTOMATED MACHINING CELL', 24, 82)
  ctx.fillStyle = '#51606d'
  ctx.font = '600 15px ui-monospace, monospace'
  ctx.fillText('AISI 4140 · SHAFT LINE', 24, 116)
  ctx.fillText('SERIAL QT-014 · CELL A', 24, 148)

  ctx.fillStyle = '#f6c445'
  ctx.fillRect(24, 170, 464, 26)
  ctx.fillStyle = '#171717'
  ctx.font = '800 14px system-ui'
  ctx.fillText('CAUTION · AUTOMATIC MOTION', 38, 189)

  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.minFilter = THREE.LinearFilter
  texture.magFilter = THREE.LinearFilter
  return texture
}

export function enhanceIndustrialEnclosure(THREE, world) {
  const machine = world.machine
  if (!machine) return

  const shell = new THREE.MeshPhysicalMaterial({
    color: 0xcbd3d8,
    metalness: 0.3,
    roughness: 0.28,
    clearcoat: 0.72,
    clearcoatRoughness: 0.18,
  })
  const shellShadow = new THREE.MeshPhysicalMaterial({
    color: 0x778691,
    metalness: 0.48,
    roughness: 0.31,
    clearcoat: 0.26,
  })
  const structural = new THREE.MeshPhysicalMaterial({
    color: 0x273745,
    metalness: 0.86,
    roughness: 0.24,
    clearcoat: 0.18,
  })
  const seal = new THREE.MeshStandardMaterial({
    color: 0x05080c,
    metalness: 0.02,
    roughness: 0.9,
  })
  const interior = new THREE.MeshStandardMaterial({
    color: 0x18232b,
    metalness: 0.68,
    roughness: 0.34,
  })
  const guideSteel = new THREE.MeshPhysicalMaterial({
    color: 0x8998a4,
    metalness: 0.98,
    roughness: 0.16,
    clearcoat: 0.18,
  })
  const frontGlass = new THREE.MeshPhysicalMaterial({
    color: 0x89cbe2,
    transparent: true,
    opacity: 0.075,
    roughness: 0.055,
    metalness: 0,
    transmission: 0.48,
    thickness: 0.16,
    ior: 1.46,
    clearcoat: 0.7,
    clearcoatRoughness: 0.08,
    side: THREE.DoubleSide,
  })

  const box = (w, h, d, material, x, y, z, castShadow = true) => {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material)
    mesh.position.set(x, y, z)
    mesh.castShadow = castShadow
    mesh.receiveShadow = true
    machine.add(mesh)
    return mesh
  }

  const cylinder = (r, h, material, x, y, z, rx = 0, rz = 0) => {
    const mesh = new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, 32), material)
    mesh.position.set(x, y, z)
    mesh.rotation.x = rx
    mesh.rotation.z = rz
    mesh.castShadow = true
    mesh.receiveShadow = true
    machine.add(mesh)
    return mesh
  }

  // Heavier lower plinth and recessed toe-kick make the cell feel planted.
  box(4.36, 0.22, 3.14, shellShadow, 0, -1.08, 0)
  box(3.92, 0.12, 2.72, seal, 0, -1.18, 0, false)
  ;[-1.7, 1.7].forEach((x) => {
    ;[-1.08, 1.08].forEach((z) => {
      cylinder(0.095, 0.18, structural, x, -1.19, z)
      cylinder(0.12, 0.035, seal, x, -1.285, z, 0, 0)
    })
  })

  // Layered roof and corner caps break the simple-box silhouette.
  box(4.16, 0.16, 2.92, shell, 0, 2.19, 0)
  box(3.92, 0.08, 2.66, shellShadow, 0, 2.3, 0)
  ;[-1.78, 1.78].forEach((x) => {
    ;[-1.19, 1.19].forEach((z) => box(0.42, 0.18, 0.42, shell, x, 2.05, z))
  })

  // Camera-facing safety glazing with a real frame and rubber gasket.
  const frontZ = 1.235
  box(3.46, 0.08, 0.08, seal, -0.04, 1.72, frontZ, false)
  box(3.46, 0.08, 0.08, seal, -0.04, -0.5, frontZ, false)
  box(0.075, 2.28, 0.08, seal, -1.73, 0.61, frontZ, false)
  box(0.075, 2.28, 0.08, seal, 1.46, 0.61, frontZ, false)
  box(0.07, 2.18, 0.07, structural, -0.05, 0.61, frontZ + 0.015)

  const leftGlass = box(1.57, 2.08, 0.045, frontGlass, -0.88, 0.61, frontZ + 0.025, false)
  const rightGlass = box(1.36, 2.08, 0.045, frontGlass, 0.72, 0.61, frontZ + 0.025, false)
  leftGlass.renderOrder = 2
  rightGlass.renderOrder = 2

  // Door rails, hinge blocks and handle make the enclosure read as operable.
  box(3.15, 0.065, 0.12, structural, -0.08, 1.84, 1.29)
  box(3.15, 0.065, 0.12, structural, -0.08, -0.62, 1.29)
  ;[-1.58, -1.58, 1.31, 1.31].forEach((x, index) => {
    const y = index % 2 === 0 ? 1.34 : -0.05
    box(0.12, 0.28, 0.16, structural, x, y, 1.315)
  })
  box(0.085, 0.82, 0.1, guideSteel, 0.2, 0.58, 1.34)
  box(0.15, 0.12, 0.13, structural, 0.2, 1.04, 1.34)
  box(0.15, 0.12, 0.13, structural, 0.2, 0.12, 1.34)

  // Formed-sheet side cheeks add thickness without covering the hero piece.
  box(0.28, 2.4, 0.2, shell, -1.88, 0.58, 0.88)
  box(0.28, 2.4, 0.2, shell, 1.88, 0.58, 0.88)
  box(0.18, 1.5, 0.5, shellShadow, -1.93, -0.02, 0.25)
  box(0.18, 1.5, 0.5, shellShadow, 1.93, -0.02, 0.25)

  // Internal chip tray and linear guides anchor the workpiece mechanically.
  box(3.05, 0.11, 1.76, interior, 0, -0.46, 0.04)
  box(2.84, 0.05, 1.5, shellShadow, 0, -0.385, 0.04)
  ;[-0.53, 0.53].forEach((z) => {
    box(2.72, 0.075, 0.11, guideSteel, 0, -0.31, z)
    box(0.22, 0.1, 0.28, structural, -0.98, -0.24, z)
    box(0.22, 0.1, 0.28, structural, 0.98, -0.24, z)
  })

  // Folded drip lips and service seams sell sheet-metal construction.
  box(3.14, 0.055, 0.08, guideSteel, 0, -0.33, 0.84)
  box(3.14, 0.055, 0.08, guideSteel, 0, -0.33, -0.76)
  ;[-1.24, 1.24].forEach((x) => {
    box(0.018, 1.24, 0.04, structural, x, -0.06, -1.29, false)
  })

  // Right service panel with ventilation slots, visible from the camera angle.
  const serviceX = 1.975
  box(0.055, 1.34, 1.16, shell, serviceX, -0.08, -0.35)
  box(0.025, 1.18, 1.0, structural, serviceX + 0.032, -0.08, -0.35, false)
  for (let index = 0; index < 7; index += 1) {
    box(0.035, 0.045, 0.62, seal, serviceX + 0.06, -0.42 + index * 0.115, -0.35, false)
  }

  // Fasteners around the front frame provide scale and manufacturing detail.
  const fastenerMat = new THREE.MeshStandardMaterial({
    color: 0x9ba8b2,
    metalness: 0.96,
    roughness: 0.2,
  })
  ;[-1.63, -0.78, 0.78, 1.36].forEach((x) => {
    ;[-0.44, 1.66].forEach((y) => {
      cylinder(0.028, 0.022, fastenerMat, x, y, 1.315, Math.PI / 2)
    })
  })

  // Small identification placard gives the enclosure a believable industrial identity.
  const placardTexture = makePlacardTexture(THREE)
  if (placardTexture) {
    const placardMaterial = new THREE.MeshBasicMaterial({
      map: placardTexture,
      toneMapped: false,
    })
    const placard = new THREE.Mesh(new THREE.PlaneGeometry(0.72, 0.31), placardMaterial)
    placard.position.set(-1.34, 1.35, 1.355)
    placard.rotation.y = 0.015
    machine.add(placard)
  }

  // Interior light reflection strip subtly reveals glass thickness and seals.
  const reflectionMaterial = new THREE.MeshBasicMaterial({
    color: 0xb9f3ff,
    transparent: true,
    opacity: 0.18,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  })
  box(2.9, 0.016, 0.018, reflectionMaterial, -0.04, 1.61, 1.275, false)
}