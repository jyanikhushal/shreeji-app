'use client';

const RunningDog = () => (
  <div style={{ position: 'relative', display: 'inline-block' }}>
    <style>{`
      @keyframes pageFlip {
        0% { transform: rotateY(0deg); }
        50% { transform: rotateY(-180deg); }
        100% { transform: rotateY(0deg); }
      }

      @keyframes entryScroll {
        0% { transform: translateY(0); }
        100% { transform: translateY(-40px); }
      }

      @keyframes screenGlow {
        0%,100% { opacity: 0.8; }
        50% { opacity: 1; }
      }

      @keyframes dotBounce {
        0%,80%,100%{transform:translateY(0);opacity:0.4}
        40%{transform:translateY(-6px);opacity:1}
      }
    `}</style>

    <svg width="520" height="290" viewBox="0 0 520 290">

      {/* Background */}
      <rect width="520" height="290" fill="#0b1025" />

      {/* LEFT: BOOK */}
      <g transform="translate(120,140)">
        {/* Book base */}
        <rect x="-40" y="-30" width="80" height="60" rx="6" fill="#8b5e3c"/>

        {/* Static page */}
        <rect x="-38" y="-28" width="36" height="56" fill="#fff8e7"/>

        {/* Flipping page */}
        <g style={{
          transformOrigin: "-2px 0px",
          animation: "pageFlip 1.2s infinite ease-in-out"
        }}>
          <rect x="-2" y="-28" width="36" height="56" fill="#fffdf5"/>
        </g>
      </g>

      {/* RIGHT: LAPTOP */}
      <g transform="translate(360,150)">
        {/* Screen */}
        <rect x="-50" y="-40" width="100" height="60" rx="6" fill="#1f2937"/>

        {/* Screen content */}
        <clipPath id="screenClip">
          <rect x="-48" y="-38" width="96" height="56"/>
        </clipPath>

        <g clipPath="url(#screenClip)">
          <g style={{ animation: "entryScroll 2s linear infinite" }}>
            {[0,1,2,3,4].map(i => (
              <rect key={i} x="-45" y={-35 + i*15} width="80" height="8"
                fill="#22c55e" opacity="0.8"/>
            ))}
          </g>
        </g>

        {/* Glow */}
        <rect x="-50" y="-40" width="100" height="60"
          fill="none"
          stroke="#22c55e"
          strokeWidth="1"
          style={{ animation:"screenGlow 2s infinite" }}
        />

        {/* Keyboard */}
        <rect x="-60" y="20" width="120" height="10" rx="4" fill="#111827"/>
      </g>

      {/* CENTER ARROW (flow indicator) */}
      <text x="240" y="155" fill="#22c55e" fontSize="28">→</text>

      {/* LOADING TEXT */}
      <text x="176" y="272" fill="rgba(255,255,255,0.85)" fontSize="15"
        fontWeight="600" letterSpacing="2">
        LOADING
      </text>

      {[0,1,2].map(i => (
        <circle key={i} cx={280+i*14} cy={267} r="4" fill="#22c55e"
          style={{ animation:`dotBounce 1.1s infinite`, animationDelay:`${i*0.2}s` }}
        />
      ))}
    </svg>
  </div>
);

export default function NavTransition({ show, showError }) {
  if (!show) return null;

  return (
    <div style={{
      position:'fixed', inset:0, zIndex:9999,
      background:'rgba(4,8,26,0.96)',
      display:'flex',
      alignItems:'center',
      justifyContent:'center'
    }}>
      {showError ? (
        <p style={{ color:'red' }}>Error</p>
      ) : (
        <RunningDog />
      )}
    </div>
  );
}