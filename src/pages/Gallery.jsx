import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import InstaxCard from '../components/InstaxCard'
import { FILTERS } from '../utils/colorMatrix'

// ── Sheets / form config (set values in .env) ────────────────────────────────
const SHEET_ID  = import.meta.env.VITE_SHEET_ID      ?? 'YOUR_SHEET_ID'
const API_KEY   = import.meta.env.VITE_SHEETS_API_KEY ?? 'YOUR_API_KEY'
const FORM_URL  = import.meta.env.VITE_GOOGLE_FORM_URL ?? '#contribute-form'

// True only when both env vars have been filled in
const IS_CONFIGURED = SHEET_ID !== 'YOUR_SHEET_ID' && API_KEY !== 'YOUR_API_KEY'

// ── Mock data — used when Sheets API is not yet configured ───────────────────
const MOCK_PHOTOS = [
  { imageUrl: '', filterType: 'deuteranomaly', locationCity: 'Jakarta',   locationCountry: 'ID', timestamp: '' },
  { imageUrl: '', filterType: 'protanopia',    locationCity: 'Tokyo',     locationCountry: 'JP', timestamp: '' },
  { imageUrl: '', filterType: 'tritanopia',    locationCity: 'São Paulo', locationCountry: 'BR', timestamp: '' },
  { imageUrl: '', filterType: 'achromatopsia', locationCity: 'London',    locationCountry: 'GB', timestamp: '' },
  { imageUrl: '', filterType: 'protanomaly',   locationCity: 'New York',  locationCountry: 'US', timestamp: '' },
  { imageUrl: '', filterType: 'deuteranopia',  locationCity: 'Seoul',     locationCountry: 'KR', timestamp: '' },
  { imageUrl: '', filterType: 'deuteranomaly', locationCity: 'Sydney',    locationCountry: 'AU', timestamp: '' },
  { imageUrl: '', filterType: 'tritanopia',    locationCity: 'Berlin',    locationCountry: 'DE', timestamp: '' },
  { imageUrl: '', filterType: 'protanopia',    locationCity: 'Lagos',     locationCountry: 'NG', timestamp: '' },
  { imageUrl: '', filterType: 'achromatopsia', locationCity: 'Mumbai',    locationCountry: 'IN', timestamp: '' },
  { imageUrl: '', filterType: 'deuteranomaly', locationCity: 'Mexico City', locationCountry: 'MX', timestamp: '' },
  { imageUrl: '', filterType: 'protanomaly',   locationCity: 'Cairo',     locationCountry: 'EG', timestamp: '' },
]

/**
 * Fetch and parse approved photos from the Google Sheets spreadsheet.
 *
 * Sheet column order: timestamp | image_url | filter_type |
 *                     location_city | location_country | approved
 *
 * @returns {Promise<Array<{imageUrl, filterType, locationCity, locationCountry, timestamp}>>}
 */
export async function fetchGalleryPhotos() {
  const url =
    `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}` +
    `/values/Sheet1?key=${API_KEY}`

  const res = await fetch(url)
  if (!res.ok) throw new Error(`Sheets API responded ${res.status}`)

  const data = await res.json()
  const rows = data.values ?? []

  // Row 0 is the header — skip it; columns are positional (see order above)
  return rows.slice(1)
    .filter((row) => row[5] === 'TRUE')
    .map((row) => ({
      timestamp:       row[0] ?? '',
      imageUrl:        row[1] ?? '',
      filterType:      row[2] ?? '',
      locationCity:    row[3] ?? '',
      locationCountry: row[4] ?? '',
    }))
}

// ── Sub-components ───────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div
      className="w-full bg-white rounded-[6px] shadow-sm animate-pulse"
      style={{ padding: '14px 14px 0' }}
    >
      <div className="w-full bg-black/10" style={{ aspectRatio: '3 / 4' }} />
      <div
        className="flex flex-col justify-end gap-1.5"
        style={{ height: 52, paddingBottom: 10 }}
      >
        <div className="h-2.5 bg-black/10 rounded w-3/4" />
        <div className="h-2   bg-black/10 rounded w-1/2" />
      </div>
    </div>
  )
}

function FilterButton({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={[
        'shrink-0 px-4 py-1.5 font-mono text-xs transition-colors border',
        active
          ? 'bg-red text-cream border-red'
          : 'bg-transparent text-cream/60 border-white/20 hover:border-white/50 hover:text-cream',
      ].join(' ')}
    >
      {label}
    </button>
  )
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function Gallery() {
  const [photos, setPhotos]       = useState([])
  const [loading, setLoading]     = useState(true)
  const [activeFilter, setActiveFilter] = useState('all')

  useEffect(() => {
    if (!IS_CONFIGURED) {
      // Sheets not yet wired up — show mock data immediately, no network call
      setPhotos(MOCK_PHOTOS)
      setLoading(false)
      return
    }

    fetchGalleryPhotos()
      .then(setPhotos)
      .catch(() => setPhotos(MOCK_PHOTOS))   // fall back to mock on any error
      .finally(() => setLoading(false))
  }, [])

  const filtered = useMemo(() => {
    if (activeFilter === 'all') return photos
    return photos.filter((p) => p.filterType === activeFilter)
  }, [photos, activeFilter])

  return (
    <div className="min-h-screen bg-black text-cream">

      {/* ── Nav ──────────────────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 bg-black border-b border-white/10">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link
            to="/"
            className="font-bebas text-2xl tracking-widest text-cream hover:text-red transition-colors"
          >
            WYSWYIS
          </Link>
          <div className="flex items-center gap-4">
            <Link
              to="/camera"
              className="font-mono text-xs text-cream/60 hover:text-cream transition-colors"
            >
              ← Camera
            </Link>
            <a
              href={FORM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-red text-cream font-mono text-xs px-4 py-2 hover:opacity-90 transition-opacity"
            >
              + Contribute
            </a>
          </div>
        </div>
      </nav>

      {/* ── Banner ───────────────────────────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-6 pt-12 pb-8">
        <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-blue mb-4">
          — Community Gallery
        </div>
        <h1
          className="font-bebas leading-none text-cream mb-3"
          style={{ fontSize: 'clamp(40px, 8vw, 72px)' }}
        >
          Photos from around the world.
        </h1>
        <p className="font-crimson text-lg italic text-cream/60 mb-3">
          Each one a different perspective.
        </p>

        {/* Photo count — only shown once loaded */}
        {!loading && (
          <p className="font-mono text-xs text-yellow">
            {photos.length} perspective{photos.length !== 1 ? 's' : ''} shared
          </p>
        )}
      </section>

      {/* ── Filter bar ───────────────────────────────────────────────────── */}
      <div className="max-w-5xl mx-auto px-6 mb-8">
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          <FilterButton
            label="All"
            active={activeFilter === 'all'}
            onClick={() => setActiveFilter('all')}
          />
          {Object.values(FILTERS).map((f) => (
            <FilterButton
              key={f.id}
              label={f.label}
              active={activeFilter === f.id}
              onClick={() => setActiveFilter(f.id)}
            />
          ))}
        </div>
      </div>

      {/* ── Photo grid ───────────────────────────────────────────────────── */}
      <div className="max-w-5xl mx-auto px-6 pb-20">
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-cream/30">
            <p className="font-special text-xl mb-2">No photos yet</p>
            <p className="font-mono text-xs">
              {activeFilter === 'all'
                ? 'Be the first to contribute'
                : `No ${FILTERS[activeFilter]?.label ?? activeFilter} photos yet`}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filtered.map((photo, i) => (
              <InstaxCard
                key={`${photo.timestamp}-${photo.filterType}-${i}`}
                imageDataUrl={photo.imageUrl || null}
                viewLabel={`WHAT I SEE — ${(FILTERS[photo.filterType]?.label ?? photo.filterType).toUpperCase()}`}
                location={[photo.locationCity, photo.locationCountry].filter(Boolean).join(', ')}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Bottom contribute CTA ────────────────────────────────────────── */}
      <div className="border-t border-white/10 py-20 text-center px-6">
        <p
          className="font-bebas text-cream leading-none mb-3"
          style={{ fontSize: 'clamp(32px, 6vw, 56px)' }}
        >
          Add your perspective.
        </p>
        <p className="font-crimson text-base italic text-cream/50 mb-8">
          Submit a photo to the community gallery.
        </p>
        <a
          href={FORM_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block border-2 border-cream text-cream font-special text-base px-10 py-3 hover:bg-cream hover:text-black transition-colors"
        >
          ✦ Submit to Gallery
        </a>
      </div>

    </div>
  )
}
