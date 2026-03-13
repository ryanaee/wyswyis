import { Link, useLocation } from 'react-router-dom'
import InstaxCard from '../components/InstaxCard'
import FeedbackButton from '../components/FeedbackButton'

export default function Result() {
  const { state } = useLocation()
  const filter = state?.filter ?? 'normal'
  const imageDataUrl = state?.imageDataUrl ?? null

  return (
    <main className="min-h-screen bg-black flex flex-col items-center justify-center px-6 text-cream">
      <header className="w-full flex items-center justify-between px-6 py-4 border-b border-white/10 absolute top-0">
        <Link to="/camera" className="font-mono text-sm text-cream/60 hover:text-cream">
          ← Back
        </Link>
        <span className="font-bebas text-xl tracking-widest">WYSWYIS</span>
      </header>

      <div className="flex flex-col items-center gap-8 mt-16">
        <InstaxCard imageDataUrl={imageDataUrl} filter={filter} />

        <div className="flex gap-4">
          <Link
            to="/gallery"
            className="border border-cream text-cream font-special text-base px-6 py-2 rounded hover:bg-cream hover:text-black transition-colors"
          >
            Save to Gallery
          </Link>
          <Link
            to="/camera"
            className="bg-red text-cream font-special text-base px-6 py-2 rounded hover:opacity-90 transition-opacity"
          >
            Retake
          </Link>
        </div>

        <FeedbackButton />
      </div>
    </main>
  )
}
