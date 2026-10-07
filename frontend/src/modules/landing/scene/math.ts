export type Vec3 = [number, number, number]
export type Mat4 = Float32Array

export function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value))
}

export function lerp(from: number, to: number, amount: number): number {
  return from + (to - from) * amount
}

export function smoothstep(edge0: number, edge1: number, value: number): number {
  const t = clamp01((value - edge0) / Math.max(edge1 - edge0, 0.00001))
  return t * t * (3 - 2 * t)
}

export function segment(value: number, start: number, end: number): number {
  return smoothstep(start, end, value)
}

export function mixVec3(a: Vec3, b: Vec3, amount: number): Vec3 {
  return [
    lerp(a[0], b[0], amount),
    lerp(a[1], b[1], amount),
    lerp(a[2], b[2], amount),
  ]
}

export function sampleVec3(points: Vec3[], progress: number): Vec3 {
  const first = points[0] ?? [0, 0, 0]
  if (points.length <= 1) return first
  const scaled = clamp01(progress) * (points.length - 1)
  const index = Math.min(points.length - 2, Math.floor(scaled))
  const from = points[index] ?? first
  const to = points[index + 1] ?? from
  return mixVec3(from, to, scaled - index)
}

export function identity(): Mat4 {
  return new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1])
}

export function multiply(a: Mat4, b: Mat4): Mat4 {
  const out = new Float32Array(16)
  const get = (matrix: Mat4, index: number) => matrix[index] ?? 0

  for (let column = 0; column < 4; column += 1) {
    const b0 = get(b, column * 4)
    const b1 = get(b, column * 4 + 1)
    const b2 = get(b, column * 4 + 2)
    const b3 = get(b, column * 4 + 3)

    out[column * 4] =
      get(a, 0) * b0 + get(a, 4) * b1 + get(a, 8) * b2 + get(a, 12) * b3
    out[column * 4 + 1] =
      get(a, 1) * b0 + get(a, 5) * b1 + get(a, 9) * b2 + get(a, 13) * b3
    out[column * 4 + 2] =
      get(a, 2) * b0 + get(a, 6) * b1 + get(a, 10) * b2 + get(a, 14) * b3
    out[column * 4 + 3] =
      get(a, 3) * b0 + get(a, 7) * b1 + get(a, 11) * b2 + get(a, 15) * b3
  }

  return out
}

function translation(position: Vec3): Mat4 {
  const out = identity()
  out[12] = position[0]
  out[13] = position[1]
  out[14] = position[2]
  return out
}

function scaling(scale: Vec3): Mat4 {
  const out = identity()
  out[0] = scale[0]
  out[5] = scale[1]
  out[10] = scale[2]
  return out
}

function rotationX(angle: number): Mat4 {
  const c = Math.cos(angle)
  const s = Math.sin(angle)
  return new Float32Array([1, 0, 0, 0, 0, c, s, 0, 0, -s, c, 0, 0, 0, 0, 1])
}

function rotationY(angle: number): Mat4 {
  const c = Math.cos(angle)
  const s = Math.sin(angle)
  return new Float32Array([c, 0, -s, 0, 0, 1, 0, 0, s, 0, c, 0, 0, 0, 0, 1])
}

function rotationZ(angle: number): Mat4 {
  const c = Math.cos(angle)
  const s = Math.sin(angle)
  return new Float32Array([c, s, 0, 0, -s, c, 0, 0, 0, 1, 0, 0, 0, 0, 1])
}

export function compose(
  position: Vec3,
  rotation: Vec3,
  scale: Vec3,
): Mat4 {
  let model = translation(position)
  model = multiply(model, rotationY(rotation[1]))
  model = multiply(model, rotationX(rotation[0]))
  model = multiply(model, rotationZ(rotation[2]))
  return multiply(model, scaling(scale))
}

export function perspective(
  fovRadians: number,
  aspect: number,
  near: number,
  far: number,
): Mat4 {
  const f = 1 / Math.tan(fovRadians / 2)
  const nf = 1 / (near - far)
  const out = new Float32Array(16)
  out[0] = f / aspect
  out[5] = f
  out[10] = (far + near) * nf
  out[11] = -1
  out[14] = 2 * far * near * nf
  return out
}

export function lookAt(eye: Vec3, center: Vec3, up: Vec3 = [0, 1, 0]): Mat4 {
  let zx = eye[0] - center[0]
  let zy = eye[1] - center[1]
  let zz = eye[2] - center[2]
  let length = Math.hypot(zx, zy, zz) || 1
  zx /= length
  zy /= length
  zz /= length

  let xx = up[1] * zz - up[2] * zy
  let xy = up[2] * zx - up[0] * zz
  let xz = up[0] * zy - up[1] * zx
  length = Math.hypot(xx, xy, xz) || 1
  xx /= length
  xy /= length
  xz /= length

  const yx = zy * xz - zz * xy
  const yy = zz * xx - zx * xz
  const yz = zx * xy - zy * xx

  return new Float32Array([
    xx,
    yx,
    zx,
    0,
    xy,
    yy,
    zy,
    0,
    xz,
    yz,
    zz,
    0,
    -(xx * eye[0] + xy * eye[1] + xz * eye[2]),
    -(yx * eye[0] + yy * eye[1] + yz * eye[2]),
    -(zx * eye[0] + zy * eye[1] + zz * eye[2]),
    1,
  ])
}
