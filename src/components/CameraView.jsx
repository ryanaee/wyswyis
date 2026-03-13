import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react'
import { applyColorMatrix } from '../utils/colorMatrix'

const TARGET_FPS = 30
const FRAME_MS = 1000 / TARGET_FPS

const CameraView = forwardRef(function CameraView({ facingMode = 'environment', matrix }, ref) {
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const streamRef = useRef(null)
  const animFrameRef = useRef(null)
  // Keep latest matrix in a ref so the rAF loop never goes stale
  const matrixRef = useRef(matrix)

  const [error, setError] = useState(null)

  useEffect(() => {
    matrixRef.current = matrix
  }, [matrix])

  // ── Stream lifecycle — restarts whenever facingMode changes ──────────────
  useEffect(() => {
    let cancelled = false
    setError(null)

    async function startStream() {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop())
        streamRef.current = null
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode,
            width: { ideal: 1920 },
            height: { ideal: 1440 },
          },
          audio: false,
        })

        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop())
          return
        }

        streamRef.current = stream
        if (videoRef.current) {
          videoRef.current.srcObject = stream
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err.name === 'NotAllowedError'
              ? 'Camera access denied. Please allow camera permission and reload.'
              : 'Could not access camera.'
          )
        }
      }
    }

    startStream()

    return () => {
      cancelled = true
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop())
        streamRef.current = null
      }
    }
  }, [facingMode])

  // ── rAF render loop — set up once, reads matrix from ref ─────────────────
  useEffect(() => {
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas) return

    // willReadFrequently avoids GPU round-trip on every getImageData call
    const ctx = canvas.getContext('2d', { willReadFrequently: true })
    let lastTime = 0

    function drawFrame(timestamp) {
      animFrameRef.current = requestAnimationFrame(drawFrame)

      if (timestamp - lastTime < FRAME_MS) return
      lastTime = timestamp

      if (video.readyState < video.HAVE_CURRENT_DATA || !video.videoWidth) return

      // Resize canvas only when video dimensions actually change
      if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
      }

      ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

      if (matrixRef.current) {
        applyColorMatrix(ctx, canvas.width, canvas.height, matrixRef.current)
      }
    }

    animFrameRef.current = requestAnimationFrame(drawFrame)

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current)
    }
  }, []) // intentionally empty — matrix updates flow through matrixRef

  // ── Imperative API exposed to Camera.jsx ─────────────────────────────────
  useImperativeHandle(ref, () => ({
    /**
     * Capture two frames from the current video feed synchronously:
     * one with no filter (normal) and one with the provided matrix applied.
     * Both draw from the same video.currentTime so they are identical images.
     *
     * @param {number[]|null} filterMatrix
     * @returns {{ normal: string, filtered: string }}
     */
    capture(filterMatrix) {
      const video = videoRef.current
      if (!video || !video.videoWidth) return { normal: null, filtered: null }

      const w = video.videoWidth
      const h = video.videoHeight

      const normalCanvas = document.createElement('canvas')
      normalCanvas.width = w
      normalCanvas.height = h
      normalCanvas.getContext('2d').drawImage(video, 0, 0, w, h)

      const filteredCanvas = document.createElement('canvas')
      filteredCanvas.width = w
      filteredCanvas.height = h
      const filteredCtx = filteredCanvas.getContext('2d', { willReadFrequently: true })
      filteredCtx.drawImage(video, 0, 0, w, h)
      if (filterMatrix) {
        applyColorMatrix(filteredCtx, w, h, filterMatrix)
      }

      return {
        normal: normalCanvas.toDataURL('image/jpeg', 0.92),
        filtered: filteredCanvas.toDataURL('image/jpeg', 0.92),
      }
    },
  }), [])

  if (error) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-[#0a0a0a] px-8">
        <p className="font-mono text-xs text-white/50 text-center">{error}</p>
      </div>
    )
  }

  return (
    <div className="absolute inset-0">
      {/* Hidden video — source of truth for the canvas */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="absolute inset-0 w-full h-full object-cover opacity-0 pointer-events-none"
      />
      {/* Filtered canvas output */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full object-cover"
      />
    </div>
  )
})

export default CameraView
