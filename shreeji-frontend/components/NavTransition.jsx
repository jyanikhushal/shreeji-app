'use client';

const RunningDog = () => (
  <div style={{ position: 'relative', display: 'inline-block' }}>
    <style>{`
      @keyframes runCycle {
        0%   { background-position: 0px; }
        100% { background-position: -4096px; }
      }

      @keyframes floatBounce {
        0%,100% { transform: translateY(0px); }
        50%     { transform: translateY(-10px); }
      }

      @keyframes shadowPulse {
        0%,100% { transform: scaleX(1); opacity: 0.4; }
        50%     { transform: scaleX(0.7); opacity: 0.2; }
      }
    `}</style>

    {/* Shadow */}
    <div style={{
      position: 'absolute',
      bottom: 10,
      left: '50%',
      transform: 'translateX(-50%)',
      width: 140,
      height: 14,
      borderRadius: '50%',
      background: 'rgba(0,0,0,0.6)',
      animation: 'shadowPulse 0.5s infinite ease-in-out'
    }} />

    {/* REAL DOG SPRITE */}
    <div style={{
      width: 256,
      height: 160,
      backgroundImage: `url("https://i.imgur.com/8Km9tLL.png")`,
      backgroundRepeat: 'no-repeat',
      animation: `
        runCycle 0.8s steps(16) infinite,
        floatBounce 0.4s ease-in-out infinite
      `,
      transform: 'scale(1.4)',
      imageRendering: 'auto'
    }} />

    {/* Loading text (same as yours) */}
    <div style={{
      textAlign: 'center',
      marginTop: 12,
      fontSize: 15,
      fontWeight: 600,
      letterSpacing: 2,
      color: 'rgba(255,255,255,0.85)'
    }}>
      LOADING
      <span style={{ marginLeft: 8 }}>
        <span style={{ animation: 'blink 1s infinite' }}>.</span>
        <span style={{ animation: 'blink 1s infinite 0.2s' }}>.</span>
        <span style={{ animation: 'blink 1s infinite 0.4s' }}>.</span>
      </span>
    </div>
  </div>
);