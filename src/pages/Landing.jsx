import { Link } from 'react-router-dom'

export default function Landing() {
  return (
    <main className="min-h-screen bg-black flex flex-col items-center justify-center px-6 text-cream">
      <h1 className="font-bebas text-7xl md:text-9xl tracking-widest text-cream mb-4">
        WYSWYIS
      </h1>
      <p className="font-crimson text-xl md:text-2xl text-center max-w-md mb-2 italic">
        What You See, What I See
      </p>
      <p className="font-mono text-sm text-center max-w-sm mb-12 opacity-60">
        A color blindness empathy platform. See the world through different eyes.
      </p>

      <div className="flex flex-col sm:flex-row gap-4">
        <Link
          to="/camera"
          className="bg-red text-cream font-special text-lg px-8 py-3 rounded hover:opacity-90 transition-opacity"
        >
          Open Camera
        </Link>
        <Link
          to="/gallery"
          className="border border-cream text-cream font-special text-lg px-8 py-3 rounded hover:bg-cream hover:text-black transition-colors"
        >
          View Gallery
        </Link>
      </div>
    </main>
  )
}
