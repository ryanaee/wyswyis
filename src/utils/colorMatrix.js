/**
 * 4×5 color transformation matrices for color vision deficiency simulation.
 *
 * Matrix layout (row-major, operates on [R, G, B, A] in 0–255 range):
 *   [ R' ]   [ m0  m1  m2  m3  m4  ] [ R ]
 *   [ G' ] = [ m5  m6  m7  m8  m9  ] [ G ]
 *   [ B' ]   [ m10 m11 m12 m13 m14 ] [ B ]
 *   [ A' ]   [ m15 m16 m17 m18 m19 ] [ A ]
 *
 * The fifth column (m4, m9, m14, m19) is an additive offset (0–255 scale).
 * Alpha row is identity in all filters here.
 */

export const FILTERS = {
  deuteranomaly: {
    id: 'deuteranomaly',
    label: 'Deuteranomaly',
    description: 'Green-weak — the most common form of color blindness',
    prevalence: '~6% of males, ~0.4% of females',
    matrix: [
      0.8,   0.2,   0,     0, 0,
      0.258, 0.742, 0,     0, 0,
      0,     0.142, 0.858, 0, 0,
      0,     0,     0,     1, 0,
    ],
  },
  protanomaly: {
    id: 'protanomaly',
    label: 'Protanomaly',
    description: 'Red-weak — reduced sensitivity to red light',
    prevalence: '~1% of males, ~0.01% of females',
    matrix: [
      0.817, 0.183, 0,     0, 0,
      0.333, 0.667, 0,     0, 0,
      0,     0.125, 0.875, 0, 0,
      0,     0,     0,     1, 0,
    ],
  },
  protanopia: {
    id: 'protanopia',
    label: 'Protanopia',
    description: 'Red-blind — complete absence of red photoreceptors',
    prevalence: '~1% of males, ~0.02% of females',
    matrix: [
      0.567, 0.433, 0,     0, 0,
      0.558, 0.442, 0,     0, 0,
      0,     0.242, 0.758, 0, 0,
      0,     0,     0,     1, 0,
    ],
  },
  deuteranopia: {
    id: 'deuteranopia',
    label: 'Deuteranopia',
    description: 'Green-blind — complete absence of green photoreceptors',
    prevalence: '~1% of males, ~0.01% of females',
    matrix: [
      0.625, 0.375, 0,   0, 0,
      0.7,   0.3,   0,   0, 0,
      0,     0.3,   0.7, 0, 0,
      0,     0,     0,   1, 0,
    ],
  },
  tritanopia: {
    id: 'tritanopia',
    label: 'Tritanopia',
    description: 'Blue-blind — complete absence of blue photoreceptors',
    prevalence: '~0.003% of the population',
    matrix: [
      0.95, 0.05,  0,     0, 0,
      0,    0.433, 0.567, 0, 0,
      0,    0.475, 0.525, 0, 0,
      0,    0,     0,     1, 0,
    ],
  },
  achromatopsia: {
    id: 'achromatopsia',
    label: 'Achromatopsia',
    description: 'Complete color blindness — vision only in shades of grey',
    prevalence: '~0.003% of the population',
    matrix: [
      0.299, 0.587, 0.114, 0, 0,
      0.299, 0.587, 0.114, 0, 0,
      0.299, 0.587, 0.114, 0, 0,
      0,     0,     0,     1, 0,
    ],
  },
}

/**
 * Apply a 4×5 color matrix to every pixel in a canvas context.
 *
 * The matrix coefficients operate on raw 0–255 channel values:
 *   R' = m0*R + m1*G + m2*B + m3*A + m4
 *   G' = m5*R + m6*G + m7*B + m8*A + m9
 *   B' = m10*R + m11*G + m12*B + m13*A + m14
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} width
 * @param {number} height
 * @param {number[]} matrix - 20-element flat row-major array
 */
export function applyColorMatrix(ctx, width, height, matrix) {
  const imageData = ctx.getImageData(0, 0, width, height)
  const data = imageData.data

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i]
    const g = data[i + 1]
    const b = data[i + 2]
    const a = data[i + 3]

    data[i]     = Math.min(255, Math.max(0, matrix[0]  * r + matrix[1]  * g + matrix[2]  * b + matrix[3]  * a + matrix[4]))
    data[i + 1] = Math.min(255, Math.max(0, matrix[5]  * r + matrix[6]  * g + matrix[7]  * b + matrix[8]  * a + matrix[9]))
    data[i + 2] = Math.min(255, Math.max(0, matrix[10] * r + matrix[11] * g + matrix[12] * b + matrix[13] * a + matrix[14]))
    // alpha (data[i + 3]) is preserved by the identity row in all FILTERS
  }

  ctx.putImageData(imageData, 0, 0)
}

/**
 * Copy sourceCanvas into destCanvas and apply the named filter.
 *
 * @param {HTMLCanvasElement} sourceCanvas
 * @param {HTMLCanvasElement} destCanvas
 * @param {string} filterId - key in FILTERS
 * @throws {Error} if filterId is not found in FILTERS
 */
export function applyFilterToCanvas(sourceCanvas, destCanvas, filterId) {
  const filter = FILTERS[filterId]
  if (!filter) {
    throw new Error(`Unknown filter: "${filterId}". Valid ids: ${Object.keys(FILTERS).join(', ')}`)
  }

  destCanvas.width = sourceCanvas.width
  destCanvas.height = sourceCanvas.height

  const ctx = destCanvas.getContext('2d')
  ctx.drawImage(sourceCanvas, 0, 0)
  applyColorMatrix(ctx, destCanvas.width, destCanvas.height, filter.matrix)
}
