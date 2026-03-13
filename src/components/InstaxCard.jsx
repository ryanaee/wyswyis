/**
 * InstaxCard — polaroid-style photo card.
 *
 * Props:
 *   imageDataUrl  — data URL of the photo to display
 *   viewLabel     — uppercase line shown in the bottom strip, e.g.
 *                   "WHAT I SEE — DEUTERANOMALY"
 *   location      — location string, e.g. "Jakarta, ID"
 */
export default function InstaxCard({ imageDataUrl, viewLabel = '', location = '' }) {
  return (
    <div
      className="w-full bg-white rounded-[6px] shadow-lg"
      style={{ padding: '14px 14px 0' }}
    >
      {/* Photo — 3:4 aspect ratio */}
      <div className="w-full overflow-hidden bg-black/5" style={{ aspectRatio: '3 / 4' }}>
        {imageDataUrl ? (
          <img
            src={imageDataUrl}
            alt={viewLabel || 'Photo'}
            className="w-full h-full object-cover"
            draggable={false}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center font-mono text-xs text-black/20">
            No photo
          </div>
        )}
      </div>

      {/* Bottom strip — 52px tall, side padding inherited from card */}
      <div
        className="flex items-end justify-between"
        style={{ height: 52, paddingBottom: 10 }}
      >
        <div className="flex flex-col gap-0.5 min-w-0 pr-2">
          <span
            className="font-mono text-[10px] font-bold text-black uppercase tracking-tight leading-tight truncate"
          >
            {viewLabel}
          </span>
          {location && (
            <span className="font-mono text-[9px] text-black/50 leading-tight truncate">
              📍 {location}
            </span>
          )}
        </div>
        <span className="font-mono text-[9px] text-black/30 shrink-0">WYSWYIS</span>
      </div>
    </div>
  )
}
