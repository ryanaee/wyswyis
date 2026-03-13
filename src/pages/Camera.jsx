import { useCallback, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import CameraView from '../components/CameraView'
import { FILTERS } from '../utils/colorMatrix'

export default function Camera() {
  const [activeFilter, setActiveFilter] = useState('deuteranomaly')
  const [facingMode, setFacingMode] = useState('environment')
  const [isCapturing, setIsCapturing] = useState(false)
  const cameraRef = useRef(null)
  const navigate = useNavigate()

  const handleFlip = useCallback(() => {
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'))
  }, [])

  const handleShutter = useCallback(async () => {
    if (isCapturing || !cameraRef.current) return
    setIsCapturing(true)
    try {
      const matrix = FILTERS[activeFilter]?.matrix ?? null
      const { normal, filtered } = cameraRef.current.capture(matrix)
      navigate('/result', {
        state: {
          filterId: activeFilter,
          normalImageDataUrl: normal,
          filteredImageDataUrl: filtered,
        },
      })
    } finally {
      setIsCapturing(false)
    }
  }, [activeFilter, isCapturing, navigate])

  return (
    <main className="fixed inset-0 bg-[#0a0a0a] flex flex-col overflow-hidden">
      {/* ── Camera viewport ──────────────────────────────────────────────── */}
      <div className="flex-1 relative overflow-hidden">
        <CameraView
          ref={cameraRef}
          facingMode={facingMode}
          matrix={FILTERS[activeFilter]?.matrix ?? null}
        />

        {/* Filter badge — top left */}
        <div className="absolute top-4 left-4 z-10 pointer-events-none">
          <span className="font-mono text-[11px] text-white bg-black/50 px-2.5 py-1 rounded-full tracking-wide">
            {FILTERS[activeFilter]?.label}
          </span>
        </div>

        {/* Flip button — top right */}
        <button
          onClick={handleFlip}
          aria-label="Flip camera"
          className="absolute top-4 right-4 z-10 w-10 h-10 flex items-center justify-center rounded-full bg-black/50 text-white active:bg-black/70 transition-colors"
        >
          <FlipIcon />
        </button>
      </div>

      {/* ── Bottom controls ──────────────────────────────────────────────── */}
      <div className="shrink-0 bg-[#0a0a0a] pt-4 pb-10 px-4">
        {/* Horizontally scrollable filter pills */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-5">
          {Object.entries(FILTERS).map(([key, { label }]) => (
            <button
              key={key}
              onClick={() => setActiveFilter(key)}
              className={[
                'shrink-0 px-4 py-1.5 rounded-full font-mono text-xs text-white bg-white/10 border transition-colors',
                activeFilter === key ? 'border-white' : 'border-transparent',
              ].join(' ')}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Shutter button */}
        <div className="flex justify-center">
          <button
            onClick={handleShutter}
            disabled={isCapturing}
            aria-label="Capture photo"
            className="w-16 h-16 rounded-full bg-white flex items-center justify-center disabled:opacity-50 active:scale-95 transition-transform"
          >
            {/* Inner ring detail */}
            <div className="w-[54px] h-[54px] rounded-full border-2 border-black/15" />
          </button>
        </div>
      </div>
    </main>
  )
}

function FlipIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M1 4v6h6" />
      <path d="M23 20v-6h-6" />
      <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4-4.64 4.36A9 9 0 0 1 3.51 15" />
    </svg>
  )
}
