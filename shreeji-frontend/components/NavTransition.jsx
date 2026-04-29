'use client';

// ─────────────────────────────────────────
//  ANIMATION 1 — RUNNING DOG ON TRACK
// ─────────────────────────────────────────
const RunningDog = () => (
  <div style={{ textAlign: 'center' }}>
    <style>{`
      @keyframes dogBounce  { 0%,100%{transform:translateY(0)}    50%{transform:translateY(-14px)} }
      @keyframes legFwdA    { 0%,100%{transform:rotate(-38deg)}   50%{transform:rotate(38deg)}  }
      @keyframes legFwdB    { 0%,100%{transform:rotate(38deg)}    50%{transform:rotate(-38deg)} }
      @keyframes dogTail    { 0%,100%{transform:rotate(-35deg)}   50%{transform:rotate(35deg)}  }
      @keyframes tongueBob  { 0%,100%{transform:scaleY(1)}        50%{transform:scaleY(1.5)}    }
      @keyframes trackSlide { 0%{transform:translateX(0)} 100%{transform:translateX(-56px)}     }
      @keyframes earFlap    { 0%,100%{transform:rotate(0deg)}     50%{transform:rotate(20deg)}  }
    `}</style>

    {/* Dog */}
    <div style={{ display:'inline-block', animation:'dogBounce 0.38s ease-in-out infinite' }}>
      <svg width="180" height="110" viewBox="0 0 180 110">
        {/* Tail */}
        <path d="M30 55 Q10 30 18 12" stroke="#d97706" strokeWidth="11"
          fill="none" strokeLinecap="round"
          style={{ transformOrigin:'30px 55px', animation:'dogTail 0.32s ease-in-out infinite' }} />

        {/* Body */}
        <ellipse cx="88" cy="60" rx="50" ry="28" fill="#f59e0b" />

        {/* Neck */}
        <ellipse cx="128" cy="50" rx="18" ry="22" fill="#f59e0b" />

        {/* Head */}
        <circle cx="138" cy="36" r="24" fill="#f59e0b" />

        {/* Ear */}
        <ellipse cx="148" cy="17" rx="9" ry="15" fill="#d97706"
          style={{ transformOrigin:'148px 17px', animation:'earFlap 0.38s ease-in-out infinite' }} />

        {/* Eye */}
        <circle cx="150" cy="32" r="5" fill="#111" />
        <circle cx="151.5" cy="30.5" r="1.8" fill="white" />

        {/* Snout */}
        <ellipse cx="158" cy="44" rx="13" ry="10" fill="#fcd34d" />
        <ellipse cx="158" cy="38" rx="5.5" ry="4" fill="#111" />

        {/* Tongue */}
        <rect x="153" y="51" width="10" rx="5" fill="#f87171"
          style={{ height:10, transformOrigin:'158px 51px', animation:'tongueBob 0.38s ease-in-out infinite' }} />

        {/* Front legs */}
        <rect x="108" y="82" width="14" height="30" rx="7" fill="#f59e0b"
          style={{ transformOrigin:'115px 82px', animation:'legFwdA 0.38s ease-in-out infinite' }} />
        <rect x="126" y="82" width="14" height="30" rx="7" fill="#d97706"
          style={{ transformOrigin:'133px 82px', animation:'legFwdB 0.38s ease-in-out infinite' }} />

        {/* Back legs */}
        <rect x="58"  y="82" width="14" height="30" rx="7" fill="#f59e0b"
          style={{ transformOrigin:'65px 82px',  animation:'legFwdB 0.38s ease-in-out infinite' }} />
        <rect x="40"  y="82" width="14" height="30" rx="7" fill="#d97706"
          style={{ transformOrigin:'47px 82px',  animation:'legFwdA 0.38s ease-in-out infinite' }} />

        {/* Collar */}
        <rect x="120" y="62" width="22" height="8" rx="4" fill="#dc2626" />
        <circle cx="131" cy="70" r="4" fill="#fbbf24" />
      </svg>
    </div>

    {/* Track */}
    <div style={{ overflow:'hidden', width:180, margin:'6px auto 0', display:'flex', gap:14 }}>
      {[...Array(8)].map((_,i) => (
        <div key={i} style={{
          width:22, height:5, background:'rgba(255,255,255,0.22)',
          borderRadius:3, flexShrink:0,
          animation:'trackSlide 0.65s linear infinite',
          animationDelay:`${i * 0.08}s`,
        }} />
      ))}
    </div>

    <p style={{ color:'white', fontWeight:700, fontSize:15, marginTop:14, letterSpacing:0.5 }}>
      Fetching your page... 🐕
    </p>
  </div>
);

// ─────────────────────────────────────────
//  ANIMATION 2 — FLAG WAVING CHARACTER
// ─────────────────────────────────────────
const FlagBearer = () => (
  <div style={{ textAlign:'center' }}>
    <style>{`
      @keyframes personHop   { 0%,100%{transform:translateY(0)}    50%{transform:translateY(-12px)} }
      @keyframes armUp       { 0%,100%{transform:rotate(-18deg)}   50%{transform:rotate(22deg)}   }
      @keyframes flagFlap    { 0%,100%{transform:skewY(-10deg) scaleX(1)}  50%{transform:skewY(10deg) scaleX(0.88)} }
      @keyframes freeArm     { 0%,100%{transform:rotate(25deg)}    50%{transform:rotate(-15deg)}  }
      @keyframes legMarch    { 0%,100%{transform:rotate(-18deg)}   50%{transform:rotate(18deg)}   }
      @keyframes headWiggle  { 0%,100%{transform:rotate(-6deg)}    50%{transform:rotate(6deg)}    }
    `}</style>

    <div style={{ display:'inline-block', animation:'personHop 0.5s ease-in-out infinite' }}>
      <svg width="140" height="190" viewBox="0 0 140 190">

        {/* ── Flag pole + flag ── */}
        <line x1="82" y1="8" x2="82" y2="95" stroke="#e5e7eb" strokeWidth="4"
          strokeLinecap="round"
          style={{ transformOrigin:'82px 95px', animation:'armUp 0.5s ease-in-out infinite' }} />
        {/* Saffron */}
        <rect x="82" y="8"  width="44" height="11" rx="2" fill="#f97316"
          style={{ transformOrigin:'82px 14px', animation:'flagFlap 0.45s ease-in-out infinite' }} />
        {/* White */}
        <rect x="82" y="19" width="44" height="11" rx="2" fill="#f9fafb"
          style={{ transformOrigin:'82px 25px', animation:'flagFlap 0.45s ease-in-out infinite' }} />
        {/* Green */}
        <rect x="82" y="30" width="44" height="11" rx="2" fill="#16a34a"
          style={{ transformOrigin:'82px 36px', animation:'flagFlap 0.45s ease-in-out infinite' }} />
        {/* Chakra */}
        <circle cx="104" cy="25" r="4" fill="none" stroke="#1d4ed8" strokeWidth="1.5"
          style={{ transformOrigin:'104px 25px', animation:'flagFlap 0.45s ease-in-out infinite' }} />

        {/* Hair */}
        <path d="M42 60 Q62 38 82 60" fill="#1f2937" />

        {/* Head */}
        <circle cx="62" cy="62" r="22" fill="#fbbf24"
          style={{ transformOrigin:'62px 62px', animation:'headWiggle 0.5s ease-in-out infinite' }} />

        {/* Eyes */}
        <circle cx="55" cy="59" r="3.5" fill="#111" />
        <circle cx="69" cy="59" r="3.5" fill="#111" />
        <circle cx="56" cy="58" r="1.2" fill="white" />
        <circle cx="70" cy="58" r="1.2" fill="white" />

        {/* Big smile */}
        <path d="M52 69 Q62 80 72 69" stroke="#111" strokeWidth="2.5" fill="none" strokeLinecap="round" />

        {/* Kurta body */}
        <rect x="40" y="84" width="44" height="52" rx="10" fill="#f97316" />
        {/* Kurta collar */}
        <path d="M62 84 L55 100 L62 96 L69 100 Z" fill="#ea580c" />

        {/* Right arm (flag arm) */}
        <rect x="82" y="84" width="13" height="38" rx="6.5" fill="#fbbf24"
          style={{ transformOrigin:'88px 84px', animation:'armUp 0.5s ease-in-out infinite' }} />

        {/* Left arm (free swinging) */}
        <rect x="29" y="84" width="13" height="35" rx="6.5" fill="#fbbf24"
          style={{ transformOrigin:'35px 84px', animation:'freeArm 0.5s ease-in-out infinite' }} />

        {/* Dhoti */}
        <path d="M40 134 Q50 155 62 148 Q74 155 84 134 Z" fill="#fff7ed" />

        {/* Legs */}
        <rect x="44" y="135" width="15" height="42" rx="7" fill="#fef3c7"
          style={{ transformOrigin:'51px 135px', animation:'legMarch 0.5s ease-in-out infinite' }} />
        <rect x="63" y="135" width="15" height="42" rx="7" fill="#fef3c7"
          style={{ transformOrigin:'70px 135px', animation:'legMarch 0.5s ease-in-out infinite reverse' }} />

        {/* Feet */}
        <ellipse cx="51"  cy="177" rx="12" ry="5" fill="#92400e" />
        <ellipse cx="70"  cy="177" rx="12" ry="5" fill="#92400e" />
      </svg>
    </div>

    <p style={{ color:'#fcd34d', fontWeight:700, fontSize:15, marginTop:6 }}>
      Moving to next page! 🚩
    </p>
  </div>
);

// ─────────────────────────────────────────
//  ANIMATION 3 — NAMASTE UNCLE
// ─────────────────────────────────────────
const NamasteUncle = () => (
  <div style={{ textAlign:'center' }}>
    <style>{`
      @keyframes fullBow     { 0%,100%{transform:rotate(0deg)}    45%,55%{transform:rotate(-20deg)} }
      @keyframes handsLift   { 0%,100%{transform:translateY(0)}   45%,55%{transform:translateY(-12px)} }
      @keyync headBow       { 0%,100%{transform:rotate(0deg)}    45%,55%{transform:rotate(15deg)}  }
      @keyframes eyeSmile    { 0%,100%{transform:scaleY(1)}       45%,55%{transform:scaleY(0.3)}   }
      @keyframes haloGlow    { 0%,100%{opacity:0.5; r:28px}       50%{opacity:1; r:32px}           }
      @keyframes namasteText { 0%,100%{opacity:0; transform:translateY(8px)} 30%,70%{opacity:1; transform:translateY(0)} }
    `}</style>

    <div style={{ display:'inline-block', animation:'fullBow 1.4s ease-in-out infinite', transformOrigin:'65px 190px' }}>
      <svg width="130" height="200" viewBox="0 0 130 200">

        {/* Halo / aura */}
        <circle cx="65" cy="38" r="30" fill="none" stroke="#fcd34d" strokeWidth="2.5"
          strokeDasharray="6 4" opacity="0.6"
          style={{ animation:'haloGlow 1.4s ease-in-out infinite' }} />

        {/* Turban */}
        <ellipse cx="65" cy="28" rx="26" ry="16" fill="#f97316" />
        <ellipse cx="65" cy="22" rx="22" ry="11" fill="#ea580c" />
        <ellipse cx="65" cy="18" rx="16" ry="7"  fill="#f97316" />
        {/* Turban jewel */}
        <circle cx="65" cy="13" r="5.5" fill="#fcd34d" />
        <circle cx="65" cy="13" r="3"   fill="#f97316" />

        {/* Head */}
        <circle cx="65" cy="52" r="23" fill="#fbbf24"
          style={{ transformOrigin:'65px 52px', animation:'headBow 1.4s ease-in-out infinite' }} />

        {/* Tilak */}
        <rect x="62.5" y="36" width="5" height="10" rx="2.5" fill="#dc2626" />

        {/* Eyes (squint when bowing) */}
        <ellipse cx="56" cy="51" rx="4" ry="4" fill="#111"
          style={{ transformOrigin:'56px 51px', animation:'eyeSmile 1.4s ease-in-out infinite' }} />
        <ellipse cx="74" cy="51" rx="4" ry="4" fill="#111"
          style={{ transformOrigin:'74px 51px', animation:'eyeSmile 1.4s ease-in-out infinite' }} />
        <circle cx="57" cy="50" r="1.5" fill="white" />
        <circle cx="75" cy="50" r="1.5" fill="white" />

        {/* Mustache */}
        <path d="M54 60 Q65 67 76 60" stroke="#1f2937" strokeWidth="3"
          fill="none" strokeLinecap="round" />

        {/* Warm smile */}
        <path d="M56 64 Q65 73 74 64" stroke="#92400e" strokeWidth="2"
          fill="none" strokeLinecap="round" />

        {/* Kurta body */}
        <rect x="38" y="75" width="54" height="60" rx="12" fill="white"
          stroke="#e5e7eb" strokeWidth="1" />
        {/* Kurta center line */}
        <line x1="65" y1="78" x2="65" y2="128" stroke="#d1d5db"
          strokeWidth="1.5" strokeDasharray="5 4" />
        {/* Kurta collar */}
        <path d="M65 75 L57 92 L65 88 L73 92 Z" fill="#f3f4f6" stroke="#e5e7eb" strokeWidth="1" />

        {/* ── Namaste hands ── */}
        <g style={{ transformOrigin:'65px 108px', animation:'handsLift 1.4s ease-in-out infinite' }}>
          {/* Left hand coming from left */}
          <rect x="34" y="90" width="13" height="32" rx="6.5" fill="#fbbf24"
            transform="rotate(18, 40, 106)" />
          {/* Right hand coming from right */}
          <rect x="83" y="90" width="13" height="32" rx="6.5" fill="#fbbf24"
            transform="rotate(-18, 89, 106)" />
          {/* Joined palms */}
          <ellipse cx="65" cy="112" rx="16" ry="11" fill="#fcd34d" />
          {/* Finger lines */}
          <line x1="57" y1="104" x2="73" y2="104" stroke="#d97706" strokeWidth="1.5" />
          <line x1="55" y1="109" x2="75" y2="109" stroke="#d97706" strokeWidth="1.5" />
          <line x1="57" y1="114" x2="73" y2="114" stroke="#d97706" strokeWidth="1.5" />
          <line x1="59" y1="119" x2="71" y2="119" stroke="#d97706" strokeWidth="1.5" />
        </g>

        {/* Dhoti */}
        <path d="M38 133 Q52 158 65 150 Q78 158 92 133 Z" fill="#f1f5f9" />

        {/* Legs */}
        <rect x="42" y="142" width="16" height="48" rx="8" fill="#e2e8f0" />
        <rect x="72" y="142" width="16" height="48" rx="8" fill="#e2e8f0" />

        {/* Feet */}
        <ellipse cx="50"  cy="190" rx="13" ry="6" fill="#fbbf24" />
        <ellipse cx="80"  cy="190" rx="13" ry="6" fill="#fbbf24" />

        {/* Toe lines */}
        <line x1="44" y1="191" x2="56" y2="191" stroke="#d97706" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="74" y1="191" x2="86" y2="191" stroke="#d97706" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    </div>

    {/* Animated namaste text */}
    <p style={{
      fontFamily:"'Noto Serif Gujarati', serif",
      color:'#fcd34d', fontWeight:700, fontSize:17, marginTop:4,
      animation:'namasteText 1.4s ease-in-out infinite',
    }}>
      જય શ્રી સ્વામિનારાયણ 🙏
    </p>
    <p style={{ color:'rgba(255,255,255,0.65)', fontSize:13, marginTop:4 }}>
      Loading your page...
    </p>
  </div>
);

// ─────────────────────────────────────────
//  MAIN OVERLAY EXPORT
// ─────────────────────────────────────────
export default function NavTransition({ show, showError, animType }) {
  if (!show) return null;

  const Character = animType === 'dog' ? RunningDog
                  : animType === 'flag' ? FlagBearer
                  : NamasteUncle;

  return (
    <>
      <style>{`
        @keyframes overlayIn  { from{opacity:0} to{opacity:1} }
        @keyframes orbFloat1  { 0%,100%{transform:translate(0,0) scale(1)}      50%{transform:translate(55px,-70px) scale(1.2)}  }
        @keyframes orbFloat2  { 0%,100%{transform:translate(0,0) rotate(0deg)}  50%{transform:translate(-65px,-45px) rotate(180deg)} }
        @keyframes orbFloat3  { 0%,100%{transform:translate(0,0) scale(1)}      40%{transform:translate(70px,50px) scale(1.3)}  }
        @keyframes orbFloat4  { 0%,100%{transform:translate(0,0) rotate(0deg)}  50%{transform:translate(-50px,65px) rotate(240deg)} }
        @keyframes errorPulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.06)} }
      `}</style>

      <div style={{
        position:'fixed', inset:0, zIndex:9999,
        background:'rgba(10,18,38,0.93)',
        backdropFilter:'blur(14px)',
        display:'flex', flexDirection:'column',
        alignItems:'center', justifyContent:'center',
        animation:'overlayIn 0.3s ease',
        overflow:'hidden',
      }}>

        {/* Floating background orbs */}
        <div style={{ position:'absolute', width:220, height:220, borderRadius:'50%', background:'radial-gradient(circle, rgba(124,58,237,0.45), transparent 70%)', top:'8%',  left:'4%',  animation:'orbFloat1 4.2s ease-in-out infinite' }} />
        <div style={{ position:'absolute', width:160, height:160, borderRadius:'50%', background:'radial-gradient(circle, rgba(37,99,235,0.45), transparent 70%)',  bottom:'12%',right:'6%',  animation:'orbFloat2 3.8s ease-in-out infinite' }} />
        <div style={{ position:'absolute', width:130, height:130, borderRadius:'50%', background:'radial-gradient(circle, rgba(16,185,129,0.4), transparent 70%)',  top:'48%', right:'14%', animation:'orbFloat3 5.1s ease-in-out infinite' }} />
        <div style={{ position:'absolute', width:190, height:190, borderRadius:'50%', background:'radial-gradient(circle, rgba(245,158,11,0.35), transparent 70%)', bottom:'18%',left:'8%',  animation:'orbFloat4 4.6s ease-in-out infinite' }} />
        <div style={{ position:'absolute', width:100, height:100, borderRadius:'50%', background:'radial-gradient(circle, rgba(236,72,153,0.45), transparent 70%)', top:'18%', right:'28%', animation:'orbFloat1 3.2s ease-in-out infinite reverse' }} />

        {/* Character or Error */}
        <div style={{ position:'relative', zIndex:2, display:'flex', flexDirection:'column', alignItems:'center' }}>
          {showError ? (
            <div style={{ textAlign:'center' }}>
              <div style={{ fontSize:56, marginBottom:12, animation:'errorPulse 0.8s ease-in-out infinite' }}>⚠️</div>
              <p style={{ fontSize:20, fontWeight:700, color:'#f87171', margin:'0 0 8px' }}>
                Something went wrong!
              </p>
              <p style={{ fontSize:14, color:'rgba(255,255,255,0.6)', margin:0 }}>
                Taking you back...
              </p>
            </div>
          ) : (
            <Character />
          )}
        </div>

      </div>
    </>
  );
}