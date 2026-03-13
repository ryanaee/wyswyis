import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react'
import { applyColorMatrix } from '../utils/colorMatrix'

const TARGET_FPS = 30
const FRAME_MS   = 1000 / TARGET_FPS

/**
 * Request a camera stream with graceful fallback:
 * 1. Try the preferred facingMode (ideal — won't hard-fail if unavailable)
 * 2. If that fails entirely, fall back to any available camera
 *
 * We avoid requesting specific width/height on mobile because some iOS
 * devices reject streams when dimension constraints can't be exactly met.
 */
async function requestStream(facingMode) {
  try {
    return await navigator.mediaDevices.getUserMedia({
      video: { facingMode: { ideal: facingMode } },
      audio: false,
    })
  } catch {
    // Last-resort: accept whatever camera the browser offers
    return navigator.mediaDevices.getUserMedia({ video: true, audio: false })
  }
}

const CameraView = forwardRef(function CameraView({ facingMode = 'environment', matrix }, ref) {
  const videoRef    = useRef(null)
  const canvasRef   = useRef(null)
  const streamRef   = useRef(null)
  const animFrameRef = useRef(null)
  // Keep latest matrix in a ref so the rAF loop never goes stale
  const matrixRef   = useRef(matrix)

  const [error, setError] = useState(null)

  useEffect(() => { matrixRef.current = matrix }, [matrix])

  // ── Stream lifecycle ──────────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false
    setError(null)

    async function startStream() {
      // Stop any previous stream before starting a new one
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop())
        streamRef.current = null
      }

      try {
        const stream = await requestStream(facingMode)

        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop())
          return
        }

        streamRef.current = stream

        const video = videoRef.current
        if (video) {
          video.srcObject = stream
          // iOS Safari sometimes needs an explicit play() call after srcObject assignment
          video.play().catch(() => { /* autoplay policy — user gesture may be needed */ })
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err.name === 'NotAllowedError'
              ? 'Camera access denied. Please allow camera permission and reload.'
              : 'Could not access camera. Try reloading or check browser settings.'
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

  // ── rAF render loop ───────────────────────────────────────────────────────
  useEffect(() => {
    const video  = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas) return

    // willReadFrequently tells the browser to keep the canvas in CPU memory,
    // avoiding expensive GPU↔CPU round-trips on every getImageData call.
    const ctx = canvas.getContext('2d', { willReadFrequently: true })
    let lastTime = 0

    function drawFrame(timestamp) {
      animFrameRef.current = requestAnimationFrame(drawFrame)

      if (timestamp - lastTime < FRAME_MS) return
      lastTime = timestamp

      if (video.readyState < video.HAVE_CURRENT_DATA || !video.videoWidth) return

      // Resize canvas only when video dimensions change (avoids a repaint every frame)
      if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
        canvas.width  = video.videoWidth
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
  }, []) // intentionally stable — matrix changes flow through matrixRef

  // ── Imperative capture API ────────────────────────────────────────────────
  useImperativeHandle(ref, () => ({
    capture(filterMatrix) {
      const video = videoRef.current
      if (!video || !video.videoWidth) return { normal: null, filtered: null }

      const w = video.videoWidth
      const h = video.videoHeight

      const normalCanvas = document.createElement('canvas')
      normalCanvas.width  = w
      normalCanvas.height = h
      normalCanvas.getContext('2d').drawImage(video, 0, 0, w, h)

      const filteredCanvas = document.createElement('canvas')
      filteredCanvas.width  = w
      filteredCanvas.height = h
      const filteredCtx = filteredCanvas.getContext('2d', { willReadFrequently: true })
      filteredCtx.drawImage(video, 0, 0, w, h)
      if (filterMatrix) {
        applyColorMatrix(filteredCtx, w, h, filterMatrix)
      }

      return {
        normal:   normalCanvas.toDataURL('image/jpeg', 0.92),
        filtered: filteredCanvas.toDataURL('image/jpeg', 0.92),
      }
    },
  }), [])

  if (error) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-[#0a0a0a] px-8">
        <p className="font-mono text-xs text-white/50 text-center leading-relaxed">{error}</p>
      </div>
    )
  }

  return (
    <div className="absolute inset-0">
      {/* Hidden video — the source the canvas reads from */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="absolute inset-0 w-full h-full object-cover opacity-0 pointer-events-none"
      />
      {/* Filtered canvas — CSS object-fit:cover scales it to fill the container */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ objectFit: 'cover' }}
      />
    </div>
  )
})

export default CameraView
