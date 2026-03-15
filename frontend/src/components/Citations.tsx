import { useState } from 'react'
import type { Citation } from '../types'

function ChevronIcon({ direction }: { direction: 'up' | 'down' }) {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: direction === 'up' ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
      <polyline points="2 4 6 8 10 4" />
    </svg>
  )
}

function Citations({ citations }: { citations: Citation[] }) {
  const [expanded, setExpanded] = useState(false)

  if (citations.length === 0) return null

  return (
    <div className="citations-inline">
      <button className="citations-toggle" onClick={() => setExpanded(!expanded)}>
        {citations.length} source{citations.length !== 1 ? 's' : ''}
        <ChevronIcon direction={expanded ? 'up' : 'down'} />
      </button>
      {expanded && (
        <div className="citations-list">
          {citations.map((c, i) => (
            <a key={i} href={c.url} target="_blank" rel="noopener noreferrer" className="citation-link">
              <span className="citation-number">[{i + 1}]</span>
              <span className="citation-title">{c.title}</span>
            </a>
          ))}
        </div>
      )}
    </div>
  )
}

export default Citations
