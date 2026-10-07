import { compose, type Mat4, type Vec3 } from './math'
import {
  createCubeGeometry,
  createCylinderGeometry,
  type GeometryData,
} from './geometry'

export interface DrawOptions {
  position: Vec3
  rotation?: Vec3
  scale: Vec3
  color: [number, number, number]
  emissive?: number
  alpha?: number
  shape?: 'cube' | 'cylinder'
}

interface Mesh {
  buffer: WebGLBuffer
  count: number
}

const vertexShaderSource = `
attribute vec3 aPosition;
attribute vec3 aNormal;
uniform mat4 uProjection;
uniform mat4 uView;
uniform mat4 uModel;
varying vec3 vNormal;
varying vec3 vWorldPosition;
void main() {
  vec4 world = uModel * vec4(aPosition, 1.0);
  vWorldPosition = world.xyz;
  vNormal = normalize(mat3(uModel) * aNormal);
  gl_Position = uProjection * uView * world;
}
`

const fragmentShaderSource = `
precision mediump float;
varying vec3 vNormal;
varying vec3 vWorldPosition;
uniform vec3 uColor;
uniform float uEmissive;
uniform float uAlpha;
void main() {
  vec3 lightDirection = normalize(vec3(-0.45, 0.85, 0.55));
  float diffuse = max(dot(normalize(vNormal), lightDirection), 0.0);
  float rim = pow(1.0 - abs(dot(normalize(vNormal), normalize(vec3(0.2, 0.3, 1.0)))), 2.0);
  float heightGlow = clamp((vWorldPosition.y + 1.0) * 0.08, 0.0, 0.18);
  vec3 lit = uColor * (0.52 + diffuse * 0.78 + rim * 0.24 + heightGlow);
  lit += uColor * uEmissive;
  gl_FragColor = vec4(lit, uAlpha);
}
`

function compileShader(
  gl: WebGLRenderingContext,
  type: number,
  source: string,
): WebGLShader {
  const shader = gl.createShader(type)
  if (!shader) throw new Error('No se pudo crear el shader WebGL.')
  gl.shaderSource(shader, source)
  gl.compileShader(shader)
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    throw new Error(
      gl.getShaderInfoLog(shader) ?? 'Error al compilar shader WebGL.',
    )
  }
  return shader
}

function createProgram(gl: WebGLRenderingContext): WebGLProgram {
  const program = gl.createProgram()
  if (!program) throw new Error('No se pudo crear el programa WebGL.')
  gl.attachShader(
    program,
    compileShader(gl, gl.VERTEX_SHADER, vertexShaderSource),
  )
  gl.attachShader(
    program,
    compileShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource),
  )
  gl.linkProgram(program)
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    throw new Error(gl.getProgramInfoLog(program) ?? 'Error al enlazar WebGL.')
  }
  return program
}

function createMesh(gl: WebGLRenderingContext, geometry: GeometryData): Mesh {
  const buffer = gl.createBuffer()
  if (!buffer) throw new Error('No se pudo crear el buffer WebGL.')
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
  gl.bufferData(gl.ARRAY_BUFFER, geometry.vertices, gl.STATIC_DRAW)
  return { buffer, count: geometry.count }
}

function createContext(canvas: HTMLCanvasElement): WebGLRenderingContext {
  const options: WebGLContextAttributes = {
    alpha: true,
    antialias: true,
    depth: true,
    premultipliedAlpha: false,
    powerPreference: 'high-performance',
  }

  const primary = canvas.getContext('webgl', options)
  if (primary) return primary

  const compatible = canvas.getContext('webgl', {
    alpha: true,
    antialias: false,
    depth: true,
  })
  if (compatible) return compatible

  const legacy = canvas.getContext(
    'experimental-webgl',
    options,
  ) as WebGLRenderingContext | null
  if (legacy) return legacy

  throw new Error('WebGL no está disponible en este navegador.')
}

export class ScenePainter {
  readonly gl: WebGLRenderingContext
  private readonly program: WebGLProgram
  private readonly cube: Mesh
  private readonly cylinder: Mesh
  private readonly positionLocation: number
  private readonly normalLocation: number
  private readonly projectionLocation: WebGLUniformLocation
  private readonly viewLocation: WebGLUniformLocation
  private readonly modelLocation: WebGLUniformLocation
  private readonly colorLocation: WebGLUniformLocation
  private readonly emissiveLocation: WebGLUniformLocation
  private readonly alphaLocation: WebGLUniformLocation

  constructor(canvas: HTMLCanvasElement) {
    const gl = createContext(canvas)

    this.gl = gl
    this.program = createProgram(gl)
    this.cube = createMesh(gl, createCubeGeometry())
    this.cylinder = createMesh(gl, createCylinderGeometry())
    this.positionLocation = gl.getAttribLocation(this.program, 'aPosition')
    this.normalLocation = gl.getAttribLocation(this.program, 'aNormal')

    if (this.positionLocation < 0 || this.normalLocation < 0) {
      throw new Error('No se pudieron preparar los atributos de la escena 3D.')
    }

    const uniform = (name: string) => {
      const location = gl.getUniformLocation(this.program, name)
      if (!location) throw new Error(`No se encontró el uniform ${name}.`)
      return location
    }

    this.projectionLocation = uniform('uProjection')
    this.viewLocation = uniform('uView')
    this.modelLocation = uniform('uModel')
    this.colorLocation = uniform('uColor')
    this.emissiveLocation = uniform('uEmissive')
    this.alphaLocation = uniform('uAlpha')

    gl.enable(gl.DEPTH_TEST)
    gl.depthFunc(gl.LEQUAL)
    gl.enable(gl.BLEND)
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)
    gl.clearColor(0.015, 0.027, 0.06, 0)
  }

  begin(projection: Mat4, view: Mat4) {
    const { gl } = this
    if (gl.isContextLost()) {
      throw new Error('El contexto WebGL se perdió durante la animación.')
    }

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
    gl.useProgram(this.program)
    gl.uniformMatrix4fv(this.projectionLocation, false, projection)
    gl.uniformMatrix4fv(this.viewLocation, false, view)
  }

  draw({
    position,
    rotation = [0, 0, 0],
    scale,
    color,
    emissive = 0,
    alpha = 1,
    shape = 'cube',
  }: DrawOptions) {
    if (alpha <= 0.01) return
    const { gl } = this
    const mesh = shape === 'cylinder' ? this.cylinder : this.cube

    gl.bindBuffer(gl.ARRAY_BUFFER, mesh.buffer)
    gl.enableVertexAttribArray(this.positionLocation)
    gl.vertexAttribPointer(this.positionLocation, 3, gl.FLOAT, false, 24, 0)
    gl.enableVertexAttribArray(this.normalLocation)
    gl.vertexAttribPointer(this.normalLocation, 3, gl.FLOAT, false, 24, 12)
    gl.uniformMatrix4fv(
      this.modelLocation,
      false,
      compose(position, rotation, scale),
    )
    gl.uniform3fv(this.colorLocation, color)
    gl.uniform1f(this.emissiveLocation, emissive)
    gl.uniform1f(this.alphaLocation, alpha)
    gl.drawArrays(gl.TRIANGLES, 0, mesh.count)
  }

  hasVisiblePixels(): boolean {
    const { gl } = this
    if (gl.isContextLost()) return false

    const width = gl.drawingBufferWidth
    const height = gl.drawingBufferHeight
    if (width < 8 || height < 8) return false

    const sampleSize = 9
    const startX = Math.max(0, Math.floor(width / 2 - sampleSize / 2))
    const startY = Math.max(0, Math.floor(height / 2 - sampleSize / 2))
    const pixels = new Uint8Array(sampleSize * sampleSize * 4)

    gl.readPixels(
      startX,
      startY,
      sampleSize,
      sampleSize,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      pixels,
    )

    for (let index = 0; index < pixels.length; index += 4) {
      const red = pixels[index] ?? 0
      const green = pixels[index + 1] ?? 0
      const blue = pixels[index + 2] ?? 0
      const alpha = pixels[index + 3] ?? 0
      if (alpha > 8 && red + green + blue > 20) return true
    }

    return false
  }

  resize(width: number, height: number, dpr: number) {
    const canvas = this.gl.canvas as HTMLCanvasElement
    const pixelWidth = Math.max(1, Math.floor(width * dpr))
    const pixelHeight = Math.max(1, Math.floor(height * dpr))
    if (canvas.width !== pixelWidth || canvas.height !== pixelHeight) {
      canvas.width = pixelWidth
      canvas.height = pixelHeight
    }
    this.gl.viewport(0, 0, canvas.width, canvas.height)
  }
}
