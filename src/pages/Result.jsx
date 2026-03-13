import { useCallback, useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import InstaxCard from '../components/InstaxCard'
import { FILTERS } from '../utils/colorMatrix'
import { getLocationStringCached } from '../utils/geolocation'

const FORM_URL = import.meta.env.VITE_GOOGLE_FORM_URL ?? '#gallery-form'

// Pixel dimensions for the saved JPEG (360px card @ 2×)
const SAVE_SCALE = 2
const CARD_W = 360 * SAVE_SCALE   // 720
const CARD_PAD = 14 * SAVE_SCALE  // 28 — top & side padding
const STRIP_H = 52 * SAVE_SCALE   // 104 — bottom strip height
const PHOTO_W = CARD_W - CARD_PAD * 2
const PHOTO_H = PHOTO_W * (4 / 3)
const CARD_H = CARD_PAD + PHOTO_H + STRIP_H

export default function Result() {
  const { state } = useLocation()
  const navigate = useNavigate()

  const filterId = state?.filterId ?? 'deuteranomaly'
  const normalUrl = state?.normalImageDataUrl ?? null
  const filteredUrl = state?.filteredImageDataUrl ?? null

  const [view, setView] = useState('filtered')   // 'filtered' | 'normal'
  const [location, setLocation] = useState('…')

  useEffect(() => {
    getLocationStringCached().then(setLocation)
  }, [])

  const filterLabel = FILTERS[filterId]?.label ?? filterId
  const filteredViewLabel = `WHAT I SEE — ${filterLabel.toUpperCase()}`
  const normalViewLabel = 'WHAT YOU SEE — NORMAL VISION'

  // ── Save: compose instax frame on an offscreen canvas and download ──────
  const handleSave = useCallback(async () => {
    const currentUrl = view === 'filtered' ? filteredUrl : normalUrl
    if (!currentUrl) return

    const canvas = document.createElement('canvas')
    canvas.width = CARD_W
    canvas.height = CARD_H
    const ctx = canvas.getContext('2d')

    // White card background
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, CARD_W, CARD_H)

    // Photo
    const img = new Image()
    img.src = currentUrl
    await new Promise((res) => { img.onload = res })
    ctx.drawImage(img, CARD_PAD, CARD_PAD, PHOTO_W, PHOTO_H)

    // Wait for web fonts before drawing text
    await document.fonts.ready

    const textX = CARD_PAD
    const textBaseY = CARD_PAD + PHOTO_H   // top of the strip

    // View label
    const viewLabel = view === 'filtered' ? filteredViewLabel : normalViewLabel
    ctx.font = `bold ${13 * SAVE_SCALE}px "Space Mono", monospace`
    ctx.fillStyle = '#0a0a0a'
    ctx.textAlign = 'left'
    ctx.fillText(viewLabel, textX, textBaseY + 22 * SAVE_SCALE)

    // Location
    ctx.font = `${10 * SAVE_SCALE}px "Space Mono", monospace`
    ctx.fillStyle = 'rgba(10,10,10,0.5)'
    ctx.fillText(`📍 ${location}`, textX, textBaseY + 38 * SAVE_SCALE)

    // App name — right-aligned
    ctx.font = `${10 * SAVE_SCALE}px "Space Mono", monospace`
    ctx.fillStyle = 'rgba(10,10,10,0.3)'
    ctx.textAlign = 'right'
    ctx.fillText('WYSWYIS', CARD_W - CARD_PAD, textBaseY + 38 * SAVE_SCALE)

    // Trigger download
    const a = document.createElement('a')
    a.href = canvas.toDataURL('image/jpeg', 0.92)
    a.download = `wyswyis-${filterId}.jpg`
    a.click()
  }, [view, filteredUrl, normalUrl, filteredViewLabel, location, filterId])

  return (
    <main className="min-h-screen bg-[#f5f0e8] flex flex-col items-center justify-center px-4 py-10">
      <div className="w-full max-w-[360px] flex flex-col items-center gap-6">

        {/* ── InstaxCard with cross-fade between views ──────────────────── */}
        <div className="relative w-full">
          {/*
            Invisible spacer that holds the natural height of the card.
            Both real cards are positioned absolutely on top.
          */}
          <div aria-hidden="true" className="opacity-0 pointer-events-none">
            <InstaxCard
              imageDataUrl={filteredUrl}
              viewLabel={filteredViewLabel}
              location={location}
            />
          </div>

          {/* Normal — base layer, always visible underneath */}
          <div className="absolute inset-0">
            <InstaxCard
              imageDataUrl={normalUrl}
              viewLabel={normalViewLabel}
              location={location}
            />
          </div>

          {/* Filtered — fades in/out on top */}
          <div
            className="absolute inset-0"
            style={{
              opacity: view === 'filtered' ? 1 : 0,
              transition: 'opacity 0.3s ease',
            }}
          >
            <InstaxCard
              imageDataUrl={filteredUrl}
              viewLabel={filteredViewLabel}
              location={location}
            />
          </div>
        </div>

        {/* ── View toggle pill ───────────────────────────────────────────── */}
        <div className="flex gap-1 bg-black/10 p-1 rounded-full">
          <button
            onClick={() => setView('filtered')}
            className={[
              'px-4 py-1.5 rounded-full font-mono text-xs transition-all',
              view === 'filtered'
                ? 'bg-white shadow text-black'
                : 'text-black/50 hover:text-black/70',
            ].join(' ')}
          >
            👁 What I See
          </button>
          <button
            onClick={() => setView('normal')}
            className={[
              'px-4 py-1.5 rounded-full font-mono text-xs transition-all',
              view === 'normal'
                ? 'bg-white shadow text-black'
                : 'text-black/50 hover:text-black/70',
            ].join(' ')}
          >
            🌈 What You See
          </button>
        </div>

        {/* ── Action buttons ────────────────────────────────────────────── */}
        <div className="w-full flex flex-col gap-3">
          <button
            onClick={handleSave}
            className="w-full border border-black/25 text-black font-mono text-sm py-2.5 rounded hover:bg-black/5 transition-colors"
          >
            ⬇ Save
          </button>

          <a
            href={FORM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full bg-[#0a0a0a] text-white font-mono text-sm py-2.5 rounded text-center hover:bg-black/80 transition-colors"
          >
            ✦ Submit to Gallery
          </a>

          <button
            onClick={() => navigate('/camera')}
            className="font-mono text-xs text-black/40 underline underline-offset-4 hover:text-black transition-colors mt-1"
          >
            ← Retake
          </button>
        </div>

      </div>
    </main>
  )
}
