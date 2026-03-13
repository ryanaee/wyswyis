import { Link } from 'react-router-dom'
import CameraView from '../components/CameraView'
import FilterPill from '../components/FilterPill'
import ToggleSwitch from '../components/ToggleSwitch'
import { FILTERS } from '../utils/colorMatrix'
import { useState } from 'react'

export default function Camera() {
  const [activeFilter, setActiveFilter] = useState('deuteranomaly')
  const [filterEnabled, setFilterEnabled] = useState(true)

  return (
    <main className="min-h-screen bg-black flex flex-col text-cream">
      <header className="flex items-center justify-between px-6 py-4 border-b border-white/10">
        <Link to="/" className="font-bebas text-2xl tracking-widest text-cream">
          WYSWYIS
        </Link>
        <ToggleSwitch
          enabled={filterEnabled}
          onToggle={() => setFilterEnabled(!filterEnabled)}
          label="Filter"
        />
      </header>

      <div className="flex-1 relative">
        <CameraView
          filter={filterEnabled ? activeFilter : null}
          matrix={FILTERS[activeFilter]?.matrix}
        />
      </div>

      <div className="px-6 py-4">
        <p className="font-mono text-xs text-cream/40 mb-3 uppercase tracking-widest">
          Color Blindness Type
        </p>
        <div className="flex flex-wrap gap-2 mb-6">
          {Object.entries(FILTERS).map(([key, { label }]) => (
            <FilterPill
              key={key}
              label={label}
              active={activeFilter === key}
              onClick={() => setActiveFilter(key)}
            />
          ))}
        </div>

        <Link
          to="/result"
          state={{ filter: activeFilter }}
          className="block w-full bg-red text-cream font-special text-lg text-center py-3 rounded hover:opacity-90 transition-opacity"
        >
          Capture
        </Link>
      </div>
    </main>
  )
}
