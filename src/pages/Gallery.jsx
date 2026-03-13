import { Link } from 'react-router-dom'
import InstaxCard from '../components/InstaxCard'

export default function Gallery() {
  // Placeholder entries — replace with real persisted data
  const entries = []

  return (
    <main className="min-h-screen bg-black text-cream">
      <header className="flex items-center justify-between px-6 py-4 border-b border-white/10">
        <Link to="/" className="font-bebas text-2xl tracking-widest text-cream">
          WYSWYIS
        </Link>
        <Link
          to="/camera"
          className="bg-red text-cream font-special text-sm px-4 py-2 rounded hover:opacity-90 transition-opacity"
        >
          + New Photo
        </Link>
      </header>

      <div className="px-6 py-8">
        <h2 className="font-bebas text-4xl tracking-widest mb-6">Gallery</h2>

        {entries.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 opacity-40">
            <p className="font-special text-xl mb-2">No photos yet</p>
            <p className="font-mono text-sm">Capture your first perspective</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {entries.map((entry) => (
              <InstaxCard
                key={entry.id}
                imageDataUrl={entry.imageDataUrl}
                filter={entry.filter}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
