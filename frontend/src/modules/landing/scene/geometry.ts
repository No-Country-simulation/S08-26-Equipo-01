export interface GeometryData {
  vertices: Float32Array
  count: number
}

type Point3 = [number, number, number]
type Quad = [Point3, Point3, Point3, Point3]

function pushVertex(target: number[], position: Point3, normal: Point3) {
  target.push(...position, ...normal)
}

export function createCubeGeometry(): GeometryData {
  const data: number[] = []
  const faces: Array<{
    normal: Point3
    corners: Quad
  }> = [
    {
      normal: [0, 0, 1],
      corners: [
        [-1, -1, 1],
        [1, -1, 1],
        [1, 1, 1],
        [-1, 1, 1],
      ],
    },
    {
      normal: [0, 0, -1],
      corners: [
        [1, -1, -1],
        [-1, -1, -1],
        [-1, 1, -1],
        [1, 1, -1],
      ],
    },
    {
      normal: [1, 0, 0],
      corners: [
        [1, -1, 1],
        [1, -1, -1],
        [1, 1, -1],
        [1, 1, 1],
      ],
    },
    {
      normal: [-1, 0, 0],
      corners: [
        [-1, -1, -1],
        [-1, -1, 1],
        [-1, 1, 1],
        [-1, 1, -1],
      ],
    },
    {
      normal: [0, 1, 0],
      corners: [
        [-1, 1, 1],
        [1, 1, 1],
        [1, 1, -1],
        [-1, 1, -1],
      ],
    },
    {
      normal: [0, -1, 0],
      corners: [
        [-1, -1, -1],
        [1, -1, -1],
        [1, -1, 1],
        [-1, -1, 1],
      ],
    },
  ]

  for (const face of faces) {
    const [a, b, c, d] = face.corners
    ;[a, b, c, a, c, d].forEach((corner) =>
      pushVertex(data, corner, face.normal),
    )
  }

  return { vertices: new Float32Array(data), count: data.length / 6 }
}

export function createCylinderGeometry(segments = 20): GeometryData {
  const data: number[] = []

  for (let index = 0; index < segments; index += 1) {
    const a0 = (index / segments) * Math.PI * 2
    const a1 = ((index + 1) / segments) * Math.PI * 2
    const x0 = Math.cos(a0)
    const z0 = Math.sin(a0)
    const x1 = Math.cos(a1)
    const z1 = Math.sin(a1)

    const bottom0: Point3 = [x0, -1, z0]
    const top0: Point3 = [x0, 1, z0]
    const bottom1: Point3 = [x1, -1, z1]
    const top1: Point3 = [x1, 1, z1]

    pushVertex(data, bottom0, [x0, 0, z0])
    pushVertex(data, bottom1, [x1, 0, z1])
    pushVertex(data, top1, [x1, 0, z1])
    pushVertex(data, bottom0, [x0, 0, z0])
    pushVertex(data, top1, [x1, 0, z1])
    pushVertex(data, top0, [x0, 0, z0])

    pushVertex(data, [0, 1, 0], [0, 1, 0])
    pushVertex(data, top0, [0, 1, 0])
    pushVertex(data, top1, [0, 1, 0])

    pushVertex(data, [0, -1, 0], [0, -1, 0])
    pushVertex(data, bottom1, [0, -1, 0])
    pushVertex(data, bottom0, [0, -1, 0])
  }

  return { vertices: new Float32Array(data), count: data.length / 6 }
}
