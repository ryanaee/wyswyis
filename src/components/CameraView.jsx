import { useEffect, useRef } from 'react'
import { applyColorMatrix } from '../utils/colorMatrix'

export default function CameraView({ filter = 'normal', matrix }) {
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const animFrameRef = useRef(null)

  useEffect(() => {
    let stream

    async function startCamera() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
          audio: false,
        })
        if (videoRef.current) {
          videoRef.current.srcObject = stream
        }
      } catch (err) {
        console.error('Camera access denied:', err)
      }
    }

    startCamera()

    return () => {
      if (stream) stream.getTracks().forEach((t) => t.stop())
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current)
    }
  }, [])

  useEffect(() => {
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas) return

    const ctx = canvas.getContext('2d')

    function drawFrame() {
      if (video.readyState >= video.HAVE_CURRENT_DATA) {
        canvas.width = video.videoWidth || canvas.offsetWidth
        canvas.height = video.videoHeight || canvas.offsetHeight
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
        if (matrix) {
          applyColorMatrix(ctx, canvas.width, canvas.height, matrix)
        }
      }
      animFrameRef.current = requestAnimationFrame(drawFrame)
    }

    animFrameRef.current = requestAnimationFrame(drawFrame)

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current)
    }
  }, [matrix])

  return (
    <div className="relative w-full h-full bg-black/60">
      {/* Hidden video source */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="absolute inset-0 w-full h-full object-cover opacity-0"
      />
      {/* Filtered canvas output */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full object-cover"
      />
      {filter && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 text-cream font-mono text-xs px-3 py-1 rounded-full">
          {filter}
        </div>
      )}
    </div>
  )
}
