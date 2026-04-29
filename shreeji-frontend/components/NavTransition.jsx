'use client';

const RunningDog = () => (
  <div style={{ position: 'relative', display: 'inline-block' }}>
    <style>{`
      @keyframes bodyRun    { 0%,100%{transform:translateY(0) rotate(0deg)}   25%{transform:translateY(-9px) rotate(-1.5deg)}  75%{transform:translateY(-5px) rotate(1.5deg)} }
      @keyframes headBob    { 0%,100%{transform:translateY(0) rotate(2deg)}   50%{transform:translateY(-6px) rotate(-2deg)} }
      @keyframes earFlop    { 0%,100%{transform:rotate(8deg) skewY(4deg)}     50%{transform:rotate(-6deg) skewY(-3deg)} }
      @keyframes earFlop2   { 0%,100%{transform:rotate(-5deg)}                50%{transform:rotate(12deg)} }
      @keyframes tailSwing  { 0%,100%{transform:rotate(-30deg)}               50%{transform:rotate(35deg)} }
      @keyframes legAup     { 0%,100%{transform:rotate(-42deg)}               50%{transform:rotate(22deg)} }
      @keyframes legAlow    { 0%,100%{transform:rotate(8deg)}                 50%{transform:rotate(-32deg)} }
      @keyframes legBup     { 0%,100%{transform:rotate(22deg)}                50%{transform:rotate(-42deg)} }
      @keyframes legBlow    { 0%,100%{transform:rotate(-32deg)}               50%{transform:rotate(8deg)} }
      @keyframes tongueBob  { 0%,100%{transform:rotate(0deg) scaleY(1)}       50%{transform:rotate(10deg) scaleY(1.35)} }
      @keyframes shadowPulse{ 0%,100%{transform:scaleX(1);opacity:0.45}       50%{transform:scaleX(0.78);opacity:0.22} }
      @keyframes dustA      { 0%{transform:scale(0) translate(0,0);opacity:0.7}  100%{transform:scale(2.2) translate(-18px,-20px);opacity:0} }
      @keyframes dustB      { 0%{transform:scale(0) translate(0,0);opacity:0.6}  100%{transform:scale(1.8) translate(-12px,-24px);opacity:0} }
      @keyframes speedSlide { 0%{transform:translateX(0);opacity:0.55}           100%{transform:translateX(-90px);opacity:0} }
      @keyframes twinkle    { 0%,100%{opacity:0.2;r:1.2}   50%{opacity:1;r:2} }
      @keyframes dotBounce  { 0%,80%,100%{transform:translateY(0);opacity:0.4}   40%{transform:translateY(-6px);opacity:1} }
      @keyframes groundGlow { 0%,100%{opacity:0.3} 50%{opacity:0.55} }
      @keyframes noseShine  { 0%,100%{opacity:0.3} 50%{opacity:0.7} }
      @keyframes eyeShine   { 0%,100%{opacity:0.7} 50%{opacity:1} }
    `}</style>

    <svg width="520" height="290" viewBox="0 0 520 290">

      <defs>

        {/* REALISTIC BODY */}
        <radialGradient id="bodyG" cx="38%" cy="25%" r="70%">
          <stop offset="0%" stopColor="#fff3df" />
          <stop offset="25%" stopColor="#e0a96d" />
          <stop offset="55%" stopColor="#a86b2d" />
          <stop offset="85%" stopColor="#5a3b1a" />
          <stop offset="100%" stopColor="#2b1a0d" />
        </radialGradient>

        {/* REALISTIC HEAD */}
        <radialGradient id="headG" cx="35%" cy="28%" r="65%">
          <stop offset="0%" stopColor="#fff5e6" />
          <stop offset="40%" stopColor="#d89a5b" />
          <stop offset="75%" stopColor="#8a5524" />
          <stop offset="100%" stopColor="#3a2412" />
        </radialGradient>

        {/* SNOUT */}
        <radialGradient id="snoutG" cx="45%" cy="40%" r="65%">
          <stop offset="0%" stopColor="#fff8e7" />
          <stop offset="60%" stopColor="#e8c48a" />
          <stop offset="100%" stopColor="#a67c52" />
        </radialGradient>

        {/* NOSE */}
        <radialGradient id="noseG" cx="32%" cy="30%" r="52%">
          <stop offset="0%" stopColor="#3a3a3a" />
          <stop offset="100%" stopColor="#000000" />
        </radialGradient>

        {/* FUR TEXTURE */}
        <filter id="furNoise">
          <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="2" />
          <feColorMatrix type="saturate" values="0"/>
          <feComponentTransfer>
            <feFuncA type="table" tableValues="0 0 0.08 0"/>
          </feComponentTransfer>
        </filter>

      </defs>

      {/* BACKGROUND */}
      <rect width="520" height="290" fill="#0b1025" />

      {/* SHADOW (IMPROVED) */}
      <ellipse cx="252" cy="239" rx="72" ry="9"
        fill="rgba(0,0,0,0.75)"
        style={{ filter:'blur(3px)', animation:'shadowPulse 0.4s infinite' }}
      />

      {/* DOG */}
      <g style={{ animation:'bodyRun 0.4s infinite', transformOrigin:'252px 195px' }}>

        {/* BODY WITH TEXTURE */}
        <g>
          <ellipse cx="246" cy="198" rx="76" ry="40" fill="url(#bodyG)" />
          <ellipse cx="246" cy="198" rx="76" ry="40"
            filter="url(#furNoise)" opacity="0.25"
          />
        </g>

        {/* HEAD */}
        <g style={{ animation:'headBob 0.4s infinite' }}>
          <circle cx="325" cy="160" r="33" fill="url(#headG)" />
          <ellipse cx="350" cy="172" rx="20" ry="14" fill="url(#snoutG)" />
          <ellipse cx="358" cy="164" rx="10" ry="7.5" fill="url(#noseG)" />
        </g>

      </g>

      {/* LOADING TEXT */}
      <text x="176" y="272" fill="white" fontSize="15" fontWeight="600">
        LOADING...
      </text>

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