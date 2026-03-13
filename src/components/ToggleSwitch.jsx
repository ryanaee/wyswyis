export default function ToggleSwitch({ enabled, onToggle, label }) {
  const id = `toggle-${label?.replace(/\s+/g, '-').toLowerCase() ?? 'switch'}`

  return (
    <div className="flex items-center gap-2">
      {label && (
        <label htmlFor={id} className="font-mono text-xs text-cream/60 cursor-pointer select-none">
          {label}
        </label>
      )}
      <button
        id={id}
        role="switch"
        aria-checked={enabled}
        onClick={onToggle}
        className={[
          'relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow',
          enabled ? 'bg-red' : 'bg-white/20',
        ].join(' ')}
      >
        <span
          className={[
            'inline-block h-4 w-4 rounded-full bg-cream shadow transition-transform',
            enabled ? 'translate-x-6' : 'translate-x-1',
          ].join(' ')}
        />
      </button>
    </div>
  )
}
