'use client'

export default function CornerCharacters() {
  return (
    <>
      {/* Sol alt - Koala */}
      <div style={{
        position: 'fixed', bottom: 0, left: '20px', zIndex: 20,
        pointerEvents: 'none', userSelect: 'none',
      }}>
        <svg width="80" height="90" viewBox="0 0 80 90" fill="none" xmlns="http://www.w3.org/2000/svg">
          <ellipse cx="40" cy="95" rx="22" ry="18" fill="#b0a090"/>
          <ellipse cx="16" cy="32" rx="12" ry="11" fill="#b0a090"/>
          <ellipse cx="16" cy="32" rx="7" ry="6" fill="#d4c4b8"/>
          <ellipse cx="64" cy="32" rx="12" ry="11" fill="#b0a090"/>
          <ellipse cx="64" cy="32" rx="7" ry="6" fill="#d4c4b8"/>
          <ellipse cx="40" cy="52" rx="26" ry="24" fill="#c8b8a8"/>
          <ellipse cx="32" cy="46" rx="5" ry="5.5" fill="white"/>
          <ellipse cx="48" cy="46" rx="5" ry="5.5" fill="white"/>
          <ellipse cx="33" cy="47" rx="3" ry="3.5" fill="#3a2a2a"/>
          <ellipse cx="49" cy="47" rx="3" ry="3.5" fill="#3a2a2a"/>
          <circle cx="34.5" cy="45.5" r="1" fill="white"/>
          <circle cx="50.5" cy="45.5" r="1" fill="white"/>
          <ellipse cx="40" cy="55" rx="7" ry="5" fill="#8a7060"/>
          <ellipse cx="40" cy="54" rx="5" ry="3.5" fill="#6a5048"/>
          <path d="M 34 60 Q 40 65 46 60" stroke="#6a5048" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
          <ellipse cx="26" cy="57" rx="5" ry="3" fill="#e8a0a0" opacity="0.5"/>
          <ellipse cx="54" cy="57" rx="5" ry="3" fill="#e8a0a0" opacity="0.5"/>
          <ellipse cx="18" cy="72" rx="7" ry="5" fill="#c8b8a8" transform="rotate(-20 18 72)"/>
          <ellipse cx="62" cy="72" rx="7" ry="5" fill="#c8b8a8" transform="rotate(20 62 72)"/>
        </svg>
      </div>

      {/* Sağ alt - Kurbağa */}
      <div style={{
        position: 'fixed', bottom: 0, right: '20px', zIndex: 20,
        pointerEvents: 'none', userSelect: 'none',
      }}>
        <svg width="80" height="90" viewBox="0 0 80 90" fill="none" xmlns="http://www.w3.org/2000/svg">
          <ellipse cx="40" cy="95" rx="22" ry="18" fill="#6aaa6a"/>
          <ellipse cx="22" cy="38" rx="11" ry="10" fill="#5a9a5a"/>
          <ellipse cx="58" cy="38" rx="11" ry="10" fill="#5a9a5a"/>
          <ellipse cx="40" cy="56" rx="28" ry="22" fill="#7aba7a"/>
          <ellipse cx="22" cy="37" rx="8" ry="8" fill="white"/>
          <ellipse cx="58" cy="37" rx="8" ry="8" fill="white"/>
          <ellipse cx="22" cy="38" rx="5" ry="5" fill="#2a4a2a"/>
          <ellipse cx="58" cy="38" rx="5" ry="5" fill="#2a4a2a"/>
          <circle cx="24" cy="36" r="1.5" fill="white"/>
          <circle cx="60" cy="36" r="1.5" fill="white"/>
          <ellipse cx="36" cy="52" rx="2.5" ry="2" fill="#5a9a5a"/>
          <ellipse cx="44" cy="52" rx="2.5" ry="2" fill="#5a9a5a"/>
          <path d="M 22 62 Q 40 74 58 62" stroke="#4a8a4a" strokeWidth="2" fill="#5a9a5a" strokeLinecap="round"/>
          <path d="M 22 62 Q 40 72 58 62" fill="#4a7a4a"/>
          <rect x="31" y="62" width="6" height="4" rx="1" fill="white"/>
          <rect x="39" y="62" width="6" height="4" rx="1" fill="white"/>
          <ellipse cx="16" cy="62" rx="5" ry="3" fill="#a0d0a0" opacity="0.6"/>
          <ellipse cx="64" cy="62" rx="5" ry="3" fill="#a0d0a0" opacity="0.6"/>
          <ellipse cx="16" cy="74" rx="7" ry="5" fill="#7aba7a" transform="rotate(15 16 74)"/>
          <ellipse cx="64" cy="74" rx="7" ry="5" fill="#7aba7a" transform="rotate(-15 64 74)"/>
        </svg>
      </div>
    </>
  )
}
