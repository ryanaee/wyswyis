export default function FilterPill({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={[
        'px-4 py-1.5 rounded-full font-mono text-xs tracking-wide transition-colors border',
        active
          ? 'bg-yellow text-black border-yellow'
          : 'bg-transparent text-cream/70 border-cream/30 hover:border-cream/70 hover:text-cream',
      ].join(' ')}
    >
      {label}
    </button>
  )
}
