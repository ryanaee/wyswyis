import { useCallback, useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import InstaxCard from '../components/InstaxCard'
import { FILTERS } from '../utils/colorMatrix'
import { getLocationStringCached } from '../utils/geolocation'

const FORM_URL = import.meta.env.VITE_GOOGLE_FORM_URL ?? '#gallery-form'

// Pixel dimensions for the saved JPEG (360px card @ 2×)
const SAVE_SCALE = 2
const CARD_W   = 360 * SAVE_SCALE    // 720
const CARD_PAD = 14  * SAVE_SCALE    // 28 — top & side padding
const STRIP_H  = 52  * SAVE_SCALE    // 104 — bottom strip height
const PHOTO_W  = CARD_W - CARD_PAD * 2
const PHOTO_H  = PHOTO_W * (4 / 3)
const CARD_H   = CARD_PAD + PHOTO_H + STRIP_H

/**
 * Compose the instax card onto an offscreen canvas and return a Blob.
 * Using toBlob (instead of toDataURL) avoids large string allocation and
 * is required for the Web Share API file path on iOS.
 */
async function buildCardBlob(currentUrl, viewLabel, location) {
  const canvas = document.createElement('canvas')
  canvas.width  = CARD_W
  canvas.height = CARD_H
  const ctx = canvas.getContext('2d')

  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, CARD_W, CARD_H)

  const img = new Image()
  img.src = currentUrl
  await new Promise((res, rej) => {
    img.onload = res
    img.onerror = rej
  })
  ctx.drawImage(img, CARD_PAD, CARD_PAD, PHOTO_W, PHOTO_H)

  await document.fonts.ready

  const textX     = CARD_PAD
  const textBaseY = CARD_PAD + PHOTO_H

  ctx.font      = `bold ${13 * SAVE_SCALE}px "Space Mono", monospace`
  ctx.fillStyle = '#0a0a0a'
  ctx.textAlign = 'left'
  ctx.fillText(viewLabel, textX, textBaseY + 22 * SAVE_SCALE)

  ctx.font      = `${10 * SAVE_SCALE}px "Space Mono", monospace`
  ctx.fillStyle = 'rgba(10,10,10,0.5)'
  ctx.fillText(`📍 ${location}`, textX, textBaseY + 38 * SAVE_SCALE)

  ctx.fillStyle = 'rgba(10,10,10,0.3)'
  ctx.textAlign = 'right'
  ctx.fillText('WYSWYIS', CARD_W - CARD_PAD, textBaseY + 38 * SAVE_SCALE)

  return new Promise((res, rej) =>
    canvas.toBlob((blob) => blob ? res(blob) : rej(new Error('toBlob failed')), 'image/jpeg', 0.92)
  )
}

export default function Result() {
  const { state }  = useLocation()
  const navigate   = useNavigate()

  const filterId    = state?.filterId            ?? 'deuteranomaly'
  const normalUrl   = state?.normalImageDataUrl  ?? null
  const filteredUrl = state?.filteredImageDataUrl ?? null

  const [view,     setView]     = useState('filtered')  // 'filtered' | 'normal'
  const [location, setLocation] = useState('…')

  useEffect(() => {
    getLocationStringCached().then(setLocation)
  }, [])

  const filterLabel       = FILTERS[filterId]?.label ?? filterId
  const filteredViewLabel = `WHAT I SEE — ${filterLabel.toUpperCase()}`
  const normalViewLabel   = 'WHAT YOU SEE — NORMAL VISION'

  // ── Save — iOS-compatible via Web Share API, blob URL fallback ───────────
  const handleSave = useCallback(async () => {
    const currentUrl = view === 'filtered' ? filteredUrl : normalUrl
    if (!currentUrl) return

    const viewLabel  = view === 'filtered' ? filteredViewLabel : normalViewLabel
    const filename   = `wyswyis-${filterId}.jpg`

    try {
      const blob = await buildCardBlob(currentUrl, viewLabel, location)

      // ── Path 1: Web Share API with files (iOS Safari 15+, Android Chrome) ─
      if (
        typeof navigator.share === 'function' &&
        typeof navigator.canShare === 'function'
      ) {
        const file = new File([blob], filename, { type: 'image/jpeg' })
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({ files: [file], title: 'WYSWYIS' })
          return
        }
      }

      // ── Path 2: Blob object URL (desktop + Android, not iOS Safari) ────────
      const url = URL.createObjectURL(blob)
      const a   = document.createElement('a')
      a.href     = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      // Revoke after a tick so the download has time to start
      setTimeout(() => URL.revokeObjectURL(url), 1000)
    } catch (err) {
      // User cancelled share sheet or other benign error — ignore
      if (err?.name !== 'AbortError') console.error('Save failed:', err)
    }
  }, [view, filteredUrl, normalUrl, filteredViewLabel, normalViewLabel, location, filterId])

  return (
    <main className="min-h-screen bg-[#f5f0e8] flex flex-col items-center justify-center px-4 py-10">
      <div className="w-full max-w-[360px] flex flex-col items-center gap-6">

        {/* ── InstaxCard cross-fade ─────────────────────────────────────── */}
        <div className="relative w-full">
          {/* Invisible spacer — holds natural card height */}
          <div aria-hidden="true" className="opacity-0 pointer-events-none">
            <InstaxCard imageDataUrl={filteredUrl} viewLabel={filteredViewLabel} location={location} />
          </div>

          {/* Normal — base layer */}
          <div className="absolute inset-0">
            <InstaxCard imageDataUrl={normalUrl} viewLabel={normalViewLabel} location={location} />
          </div>

          {/* Filtered — fades in over normal (0.3s) */}
          <div
            className="absolute inset-0"
            style={{ opacity: view === 'filtered' ? 1 : 0, transition: 'opacity 0.3s ease' }}
          >
            <InstaxCard imageDataUrl={filteredUrl} viewLabel={filteredViewLabel} location={location} />
          </div>
        </div>

        {/* ── View toggle — min 44px tap targets ───────────────────────── */}
        <div className="flex gap-1 bg-black/10 p-1 rounded-full">
          {[
            { id: 'filtered', emoji: '👁',  label: 'What I See'  },
            { id: 'normal',   emoji: '🌈', label: 'What You See' },
          ].map(({ id, emoji, label }) => (
            <button
              key={id}
              onClick={() => setView(id)}
              className={[
                'px-4 rounded-full font-mono text-xs transition-all flex items-center',
                view === id
                  ? 'bg-white shadow text-black'
                  : 'text-black/50 hover:text-black/70',
              ].join(' ')}
              style={{ minHeight: 44 }}
            >
              {emoji} {label}
            </button>
          ))}
        </div>

        {/* ── Action buttons — min 44px tap targets ────────────────────── */}
        <div className="w-full flex flex-col gap-3">
          <button
            onClick={handleSave}
            className="w-full border border-black/25 text-black font-mono text-sm rounded hover:bg-black/5 transition-colors flex items-center justify-center"
            style={{ minHeight: 44 }}
          >
            ⬇ Save
          </button>

          <a
            href={FORM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full bg-[#0a0a0a] text-white font-mono text-sm rounded text-center hover:bg-black/80 transition-colors flex items-center justify-center"
            style={{ minHeight: 44 }}
          >
            ✦ Submit to Gallery
          </a>

          <button
            onClick={() => navigate('/camera')}
            className="font-mono text-xs text-black/40 underline underline-offset-4 hover:text-black transition-colors mt-1 flex items-center justify-center"
            style={{ minHeight: 44 }}
          >
            ← Retake
          </button>
        </div>

      </div>
    </main>
  )
}
