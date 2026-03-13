import { useState } from 'react'

export default function FeedbackButton() {
  const [submitted, setSubmitted] = useState(false)

  if (submitted) {
    return (
      <p className="font-mono text-xs text-cream/50">
        Thanks for your feedback!
      </p>
    )
  }

  return (
    <button
      onClick={() => setSubmitted(true)}
      className="font-mono text-xs text-cream/40 hover:text-cream/80 underline underline-offset-4 transition-colors"
    >
      Was this simulation accurate?
    </button>
  )
}
