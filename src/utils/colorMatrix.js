/**
 * SVG/Canvas color matrices for common color vision deficiencies.
 * Each matrix is a 4×5 (20-value) row-major matrix used with
 * CanvasRenderingContext2D's putImageData after manual pixel manipulation,
 * or with an SVG <feColorMatrix type="matrix"> filter.
 *
 * Format: [R_R, R_G, R_B, R_A, R_C,
 *          G_R, G_G, G_B, G_A, G_C,
 *          B_R, B_G, B_B, B_A, B_C,
 *          A_R, A_G, A_B, A_A, A_C]
 */

export const COLOR_FILTERS = {
  normal: {
    label: 'Normal Vision',
    matrix: null,
  },
  deuteranopia: {
    label: 'Deuteranopia',
    description: 'Green-blind (~6% of males)',
    matrix: [
      0.367, 0.861, -0.228, 0, 0,
      0.280, 0.673,  0.047, 0, 0,
     -0.012, 0.043,  0.969, 0, 0,
      0,     0,      0,     1, 0,
    ],
  },
  deuteranomaly: {
    label: 'Deuteranomaly',
    description: 'Green-weak (~5% of males)',
    matrix: [
      0.800, 0.200,  0.000, 0, 0,
      0.258, 0.742,  0.000, 0, 0,
      0.000, 0.142,  0.858, 0, 0,
      0,     0,      0,     1, 0,
    ],
  },
  protanopia: {
    label: 'Protanopia',
    description: 'Red-blind (~1% of males)',
    matrix: [
      0.152, 1.053, -0.205, 0, 0,
      0.115, 0.786,  0.099, 0, 0,
     -0.004, -0.048, 1.052, 0, 0,
      0,      0,     0,     1, 0,
    ],
  },
  protanomaly: {
    label: 'Protanomaly',
    description: 'Red-weak (~1% of males)',
    matrix: [
      0.458, 0.679, -0.137, 0, 0,
      0.092, 0.875,  0.033, 0, 0,
     -0.007, 0.028,  0.979, 0, 0,
      0,     0,      0,     1, 0,
    ],
  },
  tritanopia: {
    label: 'Tritanopia',
    description: 'Blue-blind (~0.003% of population)',
    matrix: [
      1.256, -0.077, -0.179, 0, 0,
     -0.078,  0.931,  0.148, 0, 0,
      0.005,  0.691,  0.304, 0, 0,
      0,      0,      0,     1, 0,
    ],
  },
  tritanomaly: {
    label: 'Tritanomaly',
    description: 'Blue-weak',
    matrix: [
      1.017, -0.003, -0.014, 0, 0,
      0.006,  0.923,  0.071, 0, 0,
      0.002,  0.290,  0.708, 0, 0,
      0,      0,      0,     1, 0,
    ],
  },
  achromatopsia: {
    label: 'Achromatopsia',
    description: 'Complete color blindness',
    matrix: [
      0.299, 0.587, 0.114, 0, 0,
      0.299, 0.587, 0.114, 0, 0,
      0.299, 0.587, 0.114, 0, 0,
      0,     0,     0,     1, 0,
    ],
  },
  achromatomaly: {
    label: 'Achromatomaly',
    description: 'Reduced color sensitivity',
    matrix: [
      0.618, 0.320, 0.062, 0, 0,
      0.163, 0.775, 0.062, 0, 0,
      0.163, 0.320, 0.516, 0, 0,
      0,     0,     0,     1, 0,
    ],
  },
}

/**
 * Apply a 4×5 color matrix to ImageData pixel-by-pixel.
 * @param {ImageData} imageData
 * @param {number[]} matrix - 20-element flat array
 * @returns {ImageData}
 */
export function applyMatrixToImageData(imageData, matrix) {
  const data = imageData.data
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i] / 255
    const g = data[i + 1] / 255
    const b = data[i + 2] / 255
    const a = data[i + 3] / 255

    data[i]     = Math.min(255, Math.max(0, (matrix[0]  * r + matrix[1]  * g + matrix[2]  * b + matrix[3]  * a + matrix[4])  * 255))
    data[i + 1] = Math.min(255, Math.max(0, (matrix[5]  * r + matrix[6]  * g + matrix[7]  * b + matrix[8]  * a + matrix[9])  * 255))
    data[i + 2] = Math.min(255, Math.max(0, (matrix[10] * r + matrix[11] * g + matrix[12] * b + matrix[13] * a + matrix[14]) * 255))
    // preserve alpha
  }
  return imageData
}
