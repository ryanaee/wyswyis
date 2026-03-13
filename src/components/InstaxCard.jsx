import { FILTERS } from '../utils/colorMatrix'

export default function InstaxCard({ imageDataUrl, filter = 'normal' }) {
  const filterLabel = FILTERS[filter]?.label ?? filter

  return (
    <div className="bg-cream p-3 pb-10 shadow-xl rotate-1 hover:rotate-0 transition-transform duration-200 max-w-xs w-full">
      {/* Photo area */}
      <div className="w-full aspect-square bg-black/10 overflow-hidden">
        {imageDataUrl ? (
          <img
            src={imageDataUrl}
            alt={`Photo with ${filterLabel} filter`}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-black/20 font-mono text-xs">
            No photo
          </div>
        )}
      </div>

      {/* Caption area */}
      <div className="mt-3 flex items-end justify-between">
        <span className="font-special text-black/70 text-sm">{filterLabel}</span>
        <span className="font-mono text-black/40 text-xs">WYSWYIS</span>
      </div>
    </div>
  )
}
