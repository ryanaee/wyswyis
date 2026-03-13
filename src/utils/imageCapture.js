import { applyMatrixToImageData } from './colorMatrix'

/**
 * Capture the current frame from a <video> element and draw it onto a <canvas>,
 * optionally applying a color matrix filter.
 *
 * @param {HTMLVideoElement} video
 * @param {HTMLCanvasElement} canvas
 * @param {number[]|null} [matrix] - 20-element color matrix, or null for no filter
 * @returns {CanvasRenderingContext2D}
 */
export function captureFrameToCanvas(video, canvas, matrix = null) {
  canvas.width = video.videoWidth
  canvas.height = video.videoHeight

  const ctx = canvas.getContext('2d')
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

  if (matrix) {
    applyColorMatrixToCanvas(canvas, ctx, matrix)
  }

  return ctx
}

/**
 * Apply a color matrix to all pixels on an existing canvas.
 *
 * @param {HTMLCanvasElement} canvas
 * @param {CanvasRenderingContext2D} ctx
 * @param {number[]} matrix - 20-element flat array
 */
export function applyColorMatrixToCanvas(canvas, ctx, matrix) {
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
  applyMatrixToImageData(imageData, matrix)
  ctx.putImageData(imageData, 0, 0)
}

/**
 * Capture a filtered snapshot from a <video> and return it as a PNG data URL.
 *
 * @param {HTMLVideoElement} video
 * @param {number[]|null} [matrix]
 * @param {string} [mimeType]
 * @param {number} [quality]
 * @returns {string} data URL
 */
export function captureDataUrl(video, matrix = null, mimeType = 'image/png', quality = 0.92) {
  const canvas = document.createElement('canvas')
  captureFrameToCanvas(video, canvas, matrix)
  return canvas.toDataURL(mimeType, quality)
}
