import { enhanceIndustrialEnclosure } from './industrialEnclosureEnhancements.js'
import { buildIndustrialWorld, updateIndustrialWorld } from './industrialWorld.js'

const THREE_URL = 'https://cdn.jsdelivr.net/npm/three@0.186.1/build/three.module.js'

export async function createIndustrialThreeScene(canvas, options) {
  const THREE = await import(/* @vite-ignore */ THREE_URL)
  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true,
    powerPreference: 'high-performance',
  })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5))
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFSoftShadowMap
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.08
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.setClearColor(0x020617, 0)

  const scene = new THREE.Scene()
  scene.fog = new THREE.FogExp2(0x020617, 0.043)
  const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 60)

  const hemi = new THREE.HemisphereLight(0xbddcff, 0x03070d, 0.72)
  scene.add(hemi)

  const key = new THREE.DirectionalLight(0xeef7ff, 3.1)
  key.position.set(4.8, 7.5, 5.8)
  key.castShadow = true
  key.shadow.mapSize.set(2048, 2048)
  key.shadow.camera.near = 0.5
  key.shadow.camera.far = 24
  key.shadow.camera.left = -6
  key.shadow.camera.right = 6
  key.shadow.camera.top = 5
  key.shadow.camera.bottom = -5
  key.shadow.bias = -0.00035
  scene.add(key)

  const rim = new THREE.SpotLight(0x38cfff, 22, 14, Math.PI / 4.6, 0.42, 1.8)
  rim.position.set(-3.8, 3.9, -3.2)
  rim.target.position.set(-0.05, 0.55, 0)
  scene.add(rim, rim.target)

  const enclosureFill = new THREE.PointLight(0x1b8cff, 10, 7.5, 2)
  enclosureFill.position.set(0.18, 1.25, 1.2)
  scene.add(enclosureFill)

  const cyanAccent = new THREE.PointLight(0x35e6ff, 7, 5.5, 2)
  cyanAccent.position.set(-1.55, 0.55, 1.3)
  scene.add(cyanAccent)

  const warmFill = new THREE.PointLight(0xffc36c, 2.4, 4.2, 2)
  warmFill.position.set(2.8, 0.4, 2.1)
  scene.add(warmFill)

  const bridgeLight = new THREE.PointLight(0x5ddcff, 3.8, 4.8, 2)
  bridgeLight.position.set(-2.05, 0.72, 1.7)
  scene.add(bridgeLight)

  const world = buildIndustrialWorld(THREE, scene)
  enhanceIndustrialEnclosure(THREE, world)

  let disposed = false
  let animationFrame = 0
  let lastTime = performance.now()
  let idleBlend = 1
  let resizeObserver = null

  const cameraBase = new THREE.Vector3(4.5, 2.36, 7.18)
  const targetBase = new THREE.Vector3(-0.18, 0.44, 0.04)
  camera.position.copy(cameraBase)

  const resize = () => {
    const rect = canvas.getBoundingClientRect()
    const width = Math.max(1, rect.width)
    const height = Math.max(1, rect.height)
    renderer.setSize(width, height, false)
    camera.aspect = width / height
    camera.updateProjectionMatrix()
  }

  const render = (now) => {
    if (disposed) return

    const delta = Math.min((now - lastTime) / 1000, 0.05)
    lastTime = now
    const time = now / 1000
    const progress = options.reducedMotion ? 0 : options.progressRef.current
    const idleTarget = options.reducedMotion ? 0 : options.scrollingRef.current ? 0.18 : 1
    idleBlend += (idleTarget - idleBlend) * (1 - Math.exp(-delta * 4.4))

    updateIndustrialWorld(THREE, world, progress, idleBlend, time)

    const desiredCamera = cameraBase.clone()
    const desiredTarget = targetBase.clone()

    if (!options.reducedMotion) {
      desiredCamera.x += Math.sin(time * 0.18) * 0.05 * idleBlend
      desiredCamera.y += Math.cos(time * 0.14) * 0.035 * idleBlend
      desiredCamera.z += Math.sin(time * 0.11) * 0.025 * idleBlend
      desiredTarget.x += Math.sin(time * 0.12) * 0.022 * idleBlend
      desiredTarget.y += Math.cos(time * 0.16) * 0.014 * idleBlend
      bridgeLight.intensity = 3.5 + (Math.sin(time * 1.15) + 1) * 0.35
    }

    camera.position.lerp(desiredCamera, 1 - Math.exp(-delta * 3.8))
    camera.lookAt(desiredTarget)

    renderer.render(scene, camera)
    animationFrame = requestAnimationFrame(render)
  }

  resizeObserver = new ResizeObserver(resize)
  resizeObserver.observe(canvas)
  resize()
  animationFrame = requestAnimationFrame(render)

  return {
    dispose() {
      if (disposed) return
      disposed = true
      cancelAnimationFrame(animationFrame)
      resizeObserver?.disconnect()
      scene.traverse((object) => {
        object.geometry?.dispose?.()
        if (Array.isArray(object.material)) {
          object.material.forEach((material) => material.dispose?.())
        } else {
          object.material?.dispose?.()
        }
      })
      renderer.dispose()
    },
  }
}
