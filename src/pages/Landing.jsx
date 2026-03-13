import { Link } from 'react-router-dom'
import { FILTERS } from '../utils/colorMatrix'

// Per-filter dot colors for the types preview row
const FILTER_DOTS = {
  deuteranomaly: '#4caf50',
  protanomaly:   '#ff7043',
  protanopia:    '#d42b2b',
  deuteranopia:  '#26a69a',
  tritanopia:    '#1a3a6b',
  achromatopsia: '#9e9e9e',
}

export default function Landing() {
  return (
    <div className="min-h-screen bg-cream text-black font-crimson">

      {/* ── Nav ──────────────────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 bg-cream border-b-2 border-black">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link
            to="/"
            className="font-bebas text-2xl tracking-widest leading-none hover:text-red transition-colors"
          >
            WYSWYIS
          </Link>
          <div className="flex items-center gap-6">
            <Link
              to="/gallery"
              className="font-mono text-xs uppercase tracking-widest hover:text-red transition-colors"
            >
              Gallery
            </Link>
            <a
              href="#feedback-form"
              className="font-mono text-xs uppercase tracking-widest hover:text-red transition-colors"
            >
              Feedback
            </a>
          </div>
        </div>
      </nav>

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-6 pt-16 pb-16">

        {/* Section tag */}
        <div className="inline-block border border-blue text-blue font-mono text-[10px] uppercase tracking-[0.2em] px-2 py-0.5 mb-8">
          [ Color Blindness Empathy ]
        </div>

        {/* Main headline — two-line stagger */}
        <div className="mb-6">
          <h1
            className="font-bebas leading-none text-black"
            style={{ fontSize: 'clamp(72px, 14vw, 128px)' }}
          >
            WHAT YOU SEE
          </h1>
          {/* Second line: red, pushed right for zine mis-alignment */}
          <h1
            className="font-bebas leading-none text-red ml-auto text-right"
            style={{ fontSize: 'clamp(72px, 14vw, 128px)' }}
          >
            WHAT I SEE
          </h1>
        </div>

        {/* Subheading */}
        <p className="font-special text-xl md:text-2xl italic text-black/80 mb-6 max-w-lg rotate-[-0.5deg]">
          See the world through different eyes.
        </p>

        {/* Stat pill */}
        <div className="inline-flex items-center gap-2 mb-10">
          <span className="bg-yellow font-mono text-[11px] font-bold uppercase tracking-widest text-black px-3 py-1">
            300M+ color blind people worldwide
          </span>
        </div>

        {/* CTA */}
        <div className="block">
          <Link
            to="/camera"
            className="inline-block bg-black text-cream font-special text-xl px-10 py-4 hover:bg-red transition-colors"
          >
            START SIMULATION →
          </Link>
        </div>

        {/* Decorative torn rule */}
        <div className="mt-16 border-t-2 border-dashed border-black/25" />
      </section>

      {/* ── How it works ─────────────────────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-6 py-16">

        <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-blue mb-10">
          — How it works
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
          {[
            {
              num: '01',
              title: 'Open camera',
              body: 'Select a color blindness filter. The live preview updates instantly.',
            },
            {
              num: '02',
              title: 'Tap to capture',
              body: 'Two perspectives shot in one tap — your normal view and the filtered view, side by side.',
            },
            {
              num: '03',
              title: 'Save & share',
              body: 'Download your instax card or contribute to the global gallery.',
            },
          ].map(({ num, title, body }) => (
            <div key={num} className="flex flex-col">
              {/* Step number — large decorative Bebas, red */}
              <span
                className="font-bebas text-red leading-none mb-2 select-none"
                style={{ fontSize: 'clamp(56px, 8vw, 80px)' }}
                aria-hidden="true"
              >
                {num}
              </span>
              <h3 className="font-special text-lg font-bold text-black mb-2 border-b-2 border-black pb-2">
                {title}
              </h3>
              <p className="font-crimson text-base text-black/70 italic leading-relaxed">
                {body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Color types preview ───────────────────────────────────────────── */}
      <section className="py-16 bg-black/5">
        <div className="max-w-5xl mx-auto px-6 mb-6">
          <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-blue">
            — 6 Types of Color Blindness
          </div>
        </div>

        {/* Horizontally scrollable card row */}
        <div className="flex gap-4 overflow-x-auto no-scrollbar px-6 pb-2" style={{ maxWidth: '100vw' }}>
          {Object.values(FILTERS).map((filter) => (
            <Link
              key={filter.id}
              to="/camera"
              className="shrink-0 w-48 bg-white border border-black/10 rounded-lg p-4 flex flex-col gap-2 hover:border-black/30 hover:shadow-md transition-all no-underline"
            >
              {/* Colored dot */}
              <span
                className="w-3 h-3 rounded-full block"
                style={{ backgroundColor: FILTER_DOTS[filter.id] ?? '#000' }}
              />
              {/* Label */}
              <span className="font-special text-base font-bold text-black leading-tight">
                {filter.label}
              </span>
              {/* Description */}
              <span className="font-crimson text-sm text-black/70 italic leading-snug">
                {filter.description}
              </span>
              {/* Prevalence */}
              <span className="font-mono text-[9px] text-black/40 mt-auto leading-snug">
                {filter.prevalence}
              </span>
            </Link>
          ))}
          {/* Right-edge breathing room */}
          <div className="shrink-0 w-2" aria-hidden="true" />
        </div>
      </section>

      {/* ── Community teaser ─────────────────────────────────────────────── */}
      <section className="bg-black text-cream py-24 px-6">
        <div className="max-w-xl mx-auto text-center flex flex-col items-center gap-6">

          <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-yellow/80">
            — Community
          </div>

          <h2
            className="font-bebas text-cream leading-none"
            style={{ fontSize: 'clamp(56px, 10vw, 96px)' }}
          >
            Join the gallery.
          </h2>

          <p className="font-crimson text-xl italic text-cream/70">
            Photos from around the world.
          </p>

          <Link
            to="/gallery"
            className="inline-block border-2 border-cream text-cream font-special text-lg px-10 py-3 hover:bg-cream hover:text-black transition-colors"
          >
            VIEW GALLERY →
          </Link>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <footer className="bg-black border-t border-white/10 py-6 px-6">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <span className="font-bebas text-xl tracking-widest text-cream/40">WYSWYIS</span>
          <span className="font-mono text-[10px] text-cream/20 uppercase tracking-widest">
            Color Blindness Empathy Platform
          </span>
        </div>
      </footer>

      {/* ── Floating feedback button ─────────────────────────────────────── */}
      <a
        href="#feedback-form"
        className="fixed bottom-5 right-5 z-50 bg-cream text-black font-mono text-xs px-4 py-2 rounded-full shadow-lg border border-black/10 hover:bg-yellow transition-colors"
      >
        Feedback
      </a>

    </div>
  )
}
