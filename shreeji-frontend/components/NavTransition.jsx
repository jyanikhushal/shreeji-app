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

    <svg width="520" height="290" viewBox="0 0 520 290" style={{ display:'block' }}>
      <defs>
        {/* Sky gradient */}
        <linearGradient id="sky" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%"   stopColor="#04081a" />
          <stop offset="100%" stopColor="#0d1535" />
        </linearGradient>

        {/* Ground gradient */}
        <linearGradient id="gnd" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%"   stopColor="#141e3a" />
          <stop offset="100%" stopColor="#080c1a" />
        </linearGradient>

        {/* Body shading — radial gives 3D roundness */}
        <radialGradient id="bodyG" cx="44%" cy="28%" r="62%">
          <stop offset="0%"   stopColor="#fde68a" />
          <stop offset="48%"  stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#7c2d12" />
        </radialGradient>

        {/* Head shading */}
        <radialGradient id="headG" cx="38%" cy="30%" r="58%">
          <stop offset="0%"   stopColor="#fef3c7" />
          <stop offset="52%"  stopColor="#fbbf24" />
          <stop offset="100%" stopColor="#92400e" />
        </radialGradient>

        {/* Snout */}
        <radialGradient id="snoutG" cx="40%" cy="38%" r="60%">
          <stop offset="0%"   stopColor="#fef9c3" />
          <stop offset="100%" stopColor="#fcd34d" />
        </radialGradient>

        {/* Nose */}
        <radialGradient id="noseG" cx="32%" cy="30%" r="52%">
          <stop offset="0%"   stopColor="#374151" />
          <stop offset="100%" stopColor="#030712" />
        </radialGradient>

        {/* Iris */}
        <radialGradient id="irisG" cx="35%" cy="32%" r="56%">
          <stop offset="0%"   stopColor="#d97706" />
          <stop offset="60%"  stopColor="#78350f" />
          <stop offset="100%" stopColor="#1c0a00" />
        </radialGradient>

        {/* Leg gradient — slight shading */}
        <linearGradient id="legFL" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%"   stopColor="#b45309" />
          <stop offset="55%"  stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#d97706" />
        </linearGradient>
        <linearGradient id="legBK" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%"   stopColor="#92400e" />
          <stop offset="55%"  stopColor="#d97706" />
          <stop offset="100%" stopColor="#b45309" />
        </linearGradient>

        {/* Fur detail clip */}
        <radialGradient id="furSheen" cx="50%" cy="20%" r="50%">
          <stop offset="0%"  stopColor="rgba(254,243,199,0.28)" />
          <stop offset="100%" stopColor="rgba(254,243,199,0)" />
        </radialGradient>

        {/* Speed line gradient */}
        <linearGradient id="speedG" x1="100%" y1="0%" x2="0%" y2="0%">
          <stop offset="0%"   stopColor="rgba(148,163,255,0.0)" />
          <stop offset="100%" stopColor="rgba(148,163,255,0.18)" />
        </linearGradient>

        {/* Glow for ground edge */}
        <linearGradient id="glowEdge" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%"   stopColor="rgba(99,102,241,0.35)" />
          <stop offset="100%" stopColor="rgba(99,102,241,0)" />
        </linearGradient>

        {/* Tail fur */}
        <linearGradient id="tailG" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"   stopColor="#fcd34d" />
          <stop offset="100%" stopColor="#b45309" />
        </linearGradient>
      </defs>

      {/* ── SKY BACKGROUND ── */}
      <rect width="520" height="290" fill="url(#sky)" />

      {/* Nebula ambient glow */}
      <ellipse cx="260" cy="100" rx="240" ry="100" fill="none"
        stroke="rgba(99,58,200,0.07)" strokeWidth="80" />
      <ellipse cx="180" cy="140" rx="140" ry="80" fill="none"
        stroke="rgba(37,99,235,0.06)" strokeWidth="60" />

      {/* Stars */}
      {[
        [30,18],[80,12],[145,25],[210,10],[295,20],[370,14],[440,28],[495,18],
        [60,42],[165,38],[310,35],[460,40],[500,52],[25,55],[120,52],[380,48],
      ].map(([x,y],i) => (
        <circle key={i} cx={x} cy={y} r="1.4" fill="white"
          style={{ animation:`twinkle ${1.4+i*0.25}s ease-in-out infinite`, animationDelay:`${i*0.18}s` }} />
      ))}

      {/* ── GROUND ── */}
      <rect x="0" y="238" width="520" height="52" fill="url(#gnd)" />
      {/* Glowing ground edge */}
      <rect x="0" y="236" width="520" height="8" fill="url(#glowEdge)"
        style={{ animation:'groundGlow 2s ease-in-out infinite' }} />

      {/* Ground track lines (perspective) */}
      <line x1="0" y1="248" x2="520" y2="248" stroke="rgba(99,102,241,0.12)" strokeWidth="1" />
      <line x1="0" y1="260" x2="520" y2="260" stroke="rgba(99,102,241,0.07)" strokeWidth="1" />

      {/* ── SPEED LINES ── */}
      {[148,158,166,174,182,154,162,170,178].map((y,i) => (
        <line key={i} x1={10+i*4} y1={y} x2={165-i*3} y2={y}
          stroke="url(#speedG)" strokeWidth={i===0||i===4?2.5:1.5}
          style={{ animation:`speedSlide ${0.45+i*0.04}s linear infinite`, animationDelay:`${i*0.05}s` }} />
      ))}

      {/* ── GROUND SHADOW ── */}
      <ellipse cx="252" cy="239" rx="72" ry="7" fill="rgba(0,0,0,0.55)"
        style={{ animation:'shadowPulse 0.4s ease-in-out infinite' }} />

      {/* ════════════════════════════════════
              DOG — whole group bounces
      ════════════════════════════════════ */}
      <g style={{ animation:'bodyRun 0.4s ease-in-out infinite', transformOrigin:'252px 195px' }}>

        {/* ── BACK LEGS (drawn behind body) ── */}

        {/* Back-right (B phase) */}
        <g style={{ transformOrigin:'228px 208px', animation:'legBup 0.4s ease-in-out infinite' }}>
          <rect x="220" y="208" width="17" height="33" rx="8.5" fill="url(#legBK)" opacity="0.78" />
          <g style={{ transformOrigin:'228px 241px', animation:'legBlow 0.4s ease-in-out infinite' }}>
            <rect x="221" y="241" width="15" height="27" rx="7.5" fill="#92400e" opacity="0.82" />
            {/* Paw */}
            <ellipse cx="228" cy="268" rx="11" ry="5.5" fill="#7c2d12" opacity="0.88" />
            <ellipse cx="224" cy="267" rx="4"  ry="2.5" fill="#6b2214" opacity="0.7" />
            <ellipse cx="232" cy="267" rx="4"  ry="2.5" fill="#6b2214" opacity="0.7" />
          </g>
        </g>

        {/* Back-left (A phase) */}
        <g style={{ transformOrigin:'212px 208px', animation:'legAup 0.4s ease-in-out infinite' }}>
          <rect x="204" y="208" width="17" height="33" rx="8.5" fill="url(#legBK)" opacity="0.65" />
          <g style={{ transformOrigin:'212px 241px', animation:'legAlow 0.4s ease-in-out infinite' }}>
            <rect x="205" y="241" width="15" height="27" rx="7.5" fill="#7c2d12" opacity="0.7" />
            <ellipse cx="212" cy="268" rx="11" ry="5.5" fill="#6b2214" opacity="0.75" />
          </g>
        </g>

        {/* ── TAIL ── */}
        <g style={{ transformOrigin:'178px 190px', animation:'tailSwing 0.5s ease-in-out infinite' }}>
          {/* Tail outer fur */}
          <path d="M 180 190 Q 152 162 142 132" stroke="#d97706" strokeWidth="16"
            fill="none" strokeLinecap="round" />
          {/* Tail mid highlight */}
          <path d="M 180 190 Q 152 162 142 132" stroke="#fcd34d" strokeWidth="8"
            fill="none" strokeLinecap="round" opacity="0.55" />
          {/* Tail inner shine */}
          <path d="M 180 190 Q 152 162 142 132" stroke="#fef3c7" strokeWidth="3"
            fill="none" strokeLinecap="round" opacity="0.28" />
        </g>

        {/* ── BODY ── */}
        {/* Body base */}
        <ellipse cx="246" cy="198" rx="76" ry="40" fill="url(#bodyG)" />
        {/* Fur sheen on top */}
        <ellipse cx="236" cy="182" rx="58" ry="20" fill="url(#furSheen)" />
        {/* Belly darker */}
        <ellipse cx="250" cy="218" rx="60" ry="16" fill="rgba(92,33,5,0.32)" />
        {/* Chest lighter */}
        <ellipse cx="295" cy="195" rx="25" ry="22" fill="rgba(254,243,199,0.15)" />

        {/* ── FRONT LEGS ── */}

        {/* Front-left (A phase - leads) */}
        <g style={{ transformOrigin:'282px 215px', animation:'legAup 0.4s ease-in-out infinite' }}>
          <rect x="274" y="215" width="17" height="33" rx="8.5" fill="url(#legFL)" />
          {/* Knee dimple */}
          <circle cx="282" cy="228" r="4" fill="rgba(0,0,0,0.15)" />
          <g style={{ transformOrigin:'282px 248px', animation:'legAlow 0.4s ease-in-out infinite' }}>
            <rect x="275" y="248" width="15" height="27" rx="7.5" fill="#d97706" />
            <ellipse cx="282" cy="275" rx="11"  ry="5.5" fill="#b45309" />
            <ellipse cx="278" cy="274" rx="4"   ry="2.5" fill="#92400e" />
            <ellipse cx="286" cy="274" rx="4"   ry="2.5" fill="#92400e" />
          </g>
        </g>

        {/* Front-right (B phase) */}
        <g style={{ transformOrigin:'296px 215px', animation:'legBup 0.4s ease-in-out infinite' }}>
          <rect x="288" y="215" width="17" height="33" rx="8.5" fill="#e9a012" />
          <circle cx="296" cy="228" r="4" fill="rgba(0,0,0,0.12)" />
          <g style={{ transformOrigin:'296px 248px', animation:'legBlow 0.4s ease-in-out infinite' }}>
            <rect x="289" y="248" width="15" height="27" rx="7.5" fill="#d97706" />
            <ellipse cx="296" cy="275" rx="11"  ry="5.5" fill="#b45309" />
            <ellipse cx="292" cy="274" rx="4"   ry="2.5" fill="#92400e" />
            <ellipse cx="300" cy="274" rx="4"   ry="2.5" fill="#92400e" />
          </g>
        </g>

        {/* ── NECK ── */}
        <ellipse cx="312" cy="194" rx="26" ry="28" fill="url(#bodyG)" />
        {/* Neck sheen */}
        <ellipse cx="307" cy="182" rx="16" ry="12" fill="rgba(254,243,199,0.18)" />

        {/* ── HEAD GROUP ── */}
        <g style={{ transformOrigin:'325px 165px', animation:'headBob 0.4s ease-in-out infinite' }}>

          {/* Head base */}
          <circle cx="325" cy="160" r="33" fill="url(#headG)" />
          {/* Head sheen */}
          <ellipse cx="316" cy="144" rx="20" ry="15" fill="rgba(254,251,200,0.28)" />
          {/* Head underside */}
          <ellipse cx="328" cy="178" rx="25" ry="14" fill="rgba(92,33,5,0.22)" />

          {/* ── EAR BACK (partially visible left ear) ── */}
          <path d="M 302 148 Q 287 150 280 164 Q 276 176 287 180"
            stroke="#92400e" strokeWidth="16" fill="none" strokeLinecap="round" />
          <path d="M 302 148 Q 288 150 283 163 Q 280 173 289 178"
            stroke="#b45309" strokeWidth="8" fill="none" strokeLinecap="round" opacity="0.6" />

          {/* ── EAR FRONT (right ear, floppy) ── */}
          <g style={{ transformOrigin:'338px 143px', animation:'earFlop 0.4s ease-in-out infinite' }}>
            {/* Ear outer */}
            <path d="M 336 142 Q 362 136 372 155 Q 380 172 364 182 Q 350 190 338 174 Z"
              fill="#b45309" />
            {/* Ear inner */}
            <path d="M 338 142 Q 360 138 368 155 Q 374 169 360 178 Q 349 184 340 170 Z"
              fill="#d97706" opacity="0.65" />
            {/* Ear highlight */}
            <path d="M 342 145 Q 360 141 366 155 Q 370 164 360 173"
              stroke="rgba(254,243,199,0.22)" strokeWidth="5" fill="none" strokeLinecap="round" />
          </g>

          {/* ── SNOUT ── */}
          <ellipse cx="350" cy="172" rx="20" ry="14" fill="url(#snoutG)" />
          {/* Snout shadow line */}
          <path d="M 330 168 Q 340 165 350 168" stroke="rgba(146,64,14,0.35)" strokeWidth="2" fill="none" />
          {/* Snout underside */}
          <ellipse cx="352" cy="178" rx="16" ry="9" fill="rgba(180,83,9,0.25)" />
          {/* Snout center divide */}
          <line x1="350" y1="169" x2="350" y2="176" stroke="rgba(92,33,5,0.4)" strokeWidth="1.5" />

          {/* ── NOSE ── */}
          <ellipse cx="358" cy="164" rx="10" ry="7.5" fill="url(#noseG)" />
          {/* Nose highlight */}
          <ellipse cx="354" cy="160" rx="3.5" ry="2.5" fill="rgba(255,255,255,0.38)"
            style={{ animation:'noseShine 2s ease-in-out infinite' }} />
          <ellipse cx="361" cy="165" rx="1.5" ry="1.2" fill="rgba(255,255,255,0.18)" />

          {/* ── MOUTH ── */}
          <path d="M 345 176 Q 352 183 359 176" stroke="#92400e" strokeWidth="2"
            fill="none" strokeLinecap="round" />

          {/* ── TONGUE ── */}
          <g style={{ transformOrigin:'352px 182px', animation:'tongueBob 0.4s ease-in-out infinite' }}>
            <path d="M 346 181 Q 349 196 352 197 Q 355 196 358 181 Z" fill="#f87171" />
            {/* Tongue center line */}
            <line x1="352" y1="182" x2="352" y2="195" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round" />
            {/* Tongue highlight */}
            <ellipse cx="349" cy="186" rx="2" ry="3" fill="rgba(255,200,200,0.4)" />
          </g>

          {/* ── EYE ── */}
          {/* Eye socket */}
          <ellipse cx="321" cy="153" rx="11" ry="10.5" fill="#0a0505" />
          {/* Iris */}
          <circle cx="321" cy="153" r="8.5" fill="url(#irisG)" />
          {/* Pupil */}
          <circle cx="321" cy="153" r="5.5" fill="#050202" />
          {/* Main highlight */}
          <ellipse cx="317" cy="149" rx="2.8" ry="2.5" fill="rgba(255,255,255,0.92)"
            style={{ animation:'eyeShine 2.5s ease-in-out infinite' }} />
          {/* Small secondary highlight */}
          <circle cx="324" cy="155" r="1.2" fill="rgba(255,255,255,0.45)" />
          {/* Eyelid top shadow */}
          <path d="M 311 148 Q 321 143 331 148" stroke="rgba(92,33,5,0.5)"
            strokeWidth="2.5" fill="none" strokeLinecap="round" />

          {/* ── EYEBROW (expressive arch) ── */}
          <path d="M 312 142 Q 321 138 330 142"
            stroke="#92400e" strokeWidth="2.5" fill="none" strokeLinecap="round" />

          {/* ── COLLAR ── */}
          <rect x="306" y="178" width="26" height="9" rx="4.5" fill="#dc2626" />
          {/* Collar tag */}
          <circle cx="319" cy="192" r="5" fill="#fbbf24" />
          <circle cx="319" cy="192" r="2.5" fill="#d97706" />
        </g>
      </g>
      {/* end dog */}

      {/* ── DUST PARTICLES from paws ── */}
      {[
        [272, 245, 'dustA', '0s'],
        [285, 248, 'dustB', '0.15s'],
        [222, 242, 'dustA', '0.2s'],
        [236, 245, 'dustB', '0.08s'],
      ].map(([x,y,anim,delay],i) => (
        <circle key={i} cx={x} cy={y} r="5"
          fill={i%2===0 ? 'rgba(180,120,40,0.45)' : 'rgba(200,140,50,0.35)'}
          style={{ animation:`${anim} 0.65s ease-out infinite`, animationDelay:delay }} />
      ))}

      {/* ── LOADING TEXT ── */}
      <text x="176" y="272" fill="rgba(255,255,255,0.85)" fontSize="15"
        fontWeight="600" fontFamily="system-ui,sans-serif" letterSpacing="2">
        LOADING
      </text>
      {[0,1,2].map(i => (
        <circle key={i} cx={280+i*14} cy={267} r="4" fill="#f59e0b"
          style={{ animation:`dotBounce 1.1s ease-in-out infinite`, animationDelay:`${i*0.22}s` }} />
      ))}
    </svg>
  </div>
);

export default function NavTransition({ show, showError, animType }) {
  if (!show) return null;

  return (
    <>
      <style>{`
        @keyframes overlayFade { from{opacity:0} to{opacity:1} }
        @keyframes orb1 { 0%,100%{transform:translate(0,0) scale(1)}       50%{transform:translate(50px,-65px) scale(1.18)} }
        @keyframes orb2 { 0%,100%{transform:translate(0,0) rotate(0deg)}   50%{transform:translate(-60px,-42px) rotate(180deg)} }
        @keyframes orb3 { 0%,100%{transform:translate(0,0) scale(1)}       40%{transform:translate(68px,48px) scale(1.28)} }
        @keyframes orb4 { 0%,100%{transform:translate(0,0) rotate(0deg)}   50%{transform:translate(-45px,62px) rotate(220deg)} }
        @keyframes errPulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.07)} }
      `}</style>

      <div style={{
        position:'fixed', inset:0, zIndex:9999,
        background:'rgba(4,8,26,0.96)',
        backdropFilter:'blur(16px)',
        display:'flex', flexDirection:'column',
        alignItems:'center', justifyContent:'center',
        animation:'overlayFade 0.3s ease',
        overflow:'hidden',
      }}>
        {/* Floating orbs */}
        <div style={{ position:'absolute', width:230, height:230, borderRadius:'50%', background:'radial-gradient(circle, rgba(124,58,237,0.42), transparent 70%)', top:'6%',  left:'3%',  animation:'orb1 4.4s ease-in-out infinite' }} />
        <div style={{ position:'absolute', width:170, height:170, borderRadius:'50%', background:'radial-gradient(circle, rgba(37,99,235,0.42), transparent 70%)',  bottom:'10%',right:'5%',  animation:'orb2 3.8s ease-in-out infinite' }} />
        <div style={{ position:'absolute', width:140, height:140, borderRadius:'50%', background:'radial-gradient(circle, rgba(16,185,129,0.35), transparent 70%)', top:'46%', right:'12%', animation:'orb3 5.2s ease-in-out infinite' }} />
        <div style={{ position:'absolute', width:200, height:200, borderRadius:'50%', background:'radial-gradient(circle, rgba(245,158,11,0.32), transparent 70%)', bottom:'16%',left:'7%',  animation:'orb4 4.7s ease-in-out infinite' }} />
        <div style={{ position:'absolute', width:110, height:110, borderRadius:'50%', background:'radial-gradient(circle, rgba(236,72,153,0.4), transparent 70%)',  top:'16%', right:'26%', animation:'orb1 3.3s ease-in-out infinite reverse' }} />

        {/* Content */}
        <div style={{ position:'relative', zIndex:2, display:'flex', flexDirection:'column', alignItems:'center' }}>
          {showError ? (
            <div style={{ textAlign:'center' }}>
              <div style={{ fontSize:54, marginBottom:14, animation:'errPulse 0.8s ease-in-out infinite' }}>⚠️</div>
              <p style={{ fontSize:20, fontWeight:700, color:'#f87171', margin:'0 0 8px' }}>Something went wrong!</p>
              <p style={{ fontSize:14, color:'rgba(255,255,255,0.55)', margin:0 }}>Taking you back...</p>
            </div>
          ) : (
            <RunningDog />
          )}
        </div>
      </div>
    </>
  );
}