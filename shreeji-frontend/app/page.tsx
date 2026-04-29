'use client';  // tells next.js that this page runs on browser not server
export const dynamic = "force-dynamic";
import { useRouter } from 'next/navigation'; //navigation tool to move bw pages
import {useEffect} from 'react';
import {useNavTransition} from '@/hooks/useNavTransition';
import NavTransition from '@/components/NavTransition';
export default function HomePage(){ // react function that returns UI
  // const router=useRouter();    I AM REPLACYING THIS TO NAVIGATE FUNCTION TO ADD DYNAMIC OBJECTS WHILE NAVIGATION FORM ONE PAGE TO ANOTHER
  const { navigateTo, transitioning, showError, animType } = useNavTransition();
// auto redirect if already logged in
 useEffect(() => {
  const malik = localStorage.getItem("malik");

  if (malik) {
    navigateTo("/dashboard/malik");
  }
},);
 

 return (
  <div style={{
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2rem',
    background: 'linear-gradient(135deg, #dbeafe 0%, #eff6ff 40%, #e0e7ff 100%)',
    position: 'relative',
    overflow: 'hidden',
  }}>

    {/* ── BACKGROUND KIRANA ITEMS ── */}
    <div style={{ position:'absolute', inset:0, pointerEvents:'none', zIndex:0 }}>

      {/* Wheat/grain bag — top left */}
      <svg style={{position:'absolute', top:'4%', left:'3%', opacity:0.18}} width="90" height="90" viewBox="0 0 90 90">
        <ellipse cx="45" cy="65" rx="30" ry="22" fill="#92400e"/>
        <rect x="20" y="30" width="50" height="38" rx="8" fill="#b45309"/>
        <ellipse cx="45" cy="30" rx="25" ry="10" fill="#d97706"/>
        <path d="M30 30 Q45 15 60 30" fill="#fbbf24" opacity="0.6"/>
        <text x="45" y="58" textAnchor="middle" fontSize="10" fill="#fef3c7" fontWeight="bold">ATTA</text>
        {[35,45,55].map((x,i)=><ellipse key={i} cx={x} cy="22" rx="4" ry="6" fill="#fbbf24" opacity="0.7"/>)}
      </svg>

      {/* Oil bottle — top right */}
      <svg style={{position:'absolute', top:'3%', right:'5%', opacity:0.18}} width="70" height="110" viewBox="0 0 70 110">
        <rect x="22" y="8" width="12" height="18" rx="3" fill="#ca8a04"/>
        <rect x="18" y="24" width="20" height="6" rx="2" fill="#a16207"/>
        <rect x="10" y="28" width="50" height="72" rx="12" fill="#eab308"/>
        <rect x="14" y="35" width="42" height="58" rx="10" fill="#fde047" opacity="0.5"/>
        <text x="35" y="68" textAnchor="middle" fontSize="9" fill="#713f12" fontWeight="bold">SOYA</text>
        <text x="35" y="80" textAnchor="middle" fontSize="9" fill="#713f12" fontWeight="bold">OIL</text>
        <ellipse cx="35" cy="8" rx="7" ry="3" fill="#a16207"/>
      </svg>

      {/* Tomatoes — left middle */}
      <svg style={{position:'absolute', top:'35%', left:'2%', opacity:0.18}} width="100" height="80" viewBox="0 0 100 80">
        <circle cx="30" cy="50" r="22" fill="#dc2626"/>
        <circle cx="30" cy="50" r="22" fill="#ef4444" opacity="0.5"/>
        <path d="M22 30 Q30 18 38 30" fill="#16a34a" stroke="#15803d" strokeWidth="1"/>
        <path d="M30 28 Q30 20 30 18" stroke="#15803d" strokeWidth="2" fill="none"/>
        <circle cx="65" cy="45" r="20" fill="#dc2626"/>
        <circle cx="65" cy="45" r="20" fill="#ef4444" opacity="0.5"/>
        <path d="M57 27 Q65 15 73 27" fill="#16a34a" stroke="#15803d" strokeWidth="1"/>
        <path d="M65 25 Q65 17 65 15" stroke="#15803d" strokeWidth="2" fill="none"/>
      </svg>

      {/* Rice bag — bottom left */}
      <svg style={{position:'absolute', bottom:'6%', left:'4%', opacity:0.18}} width="100" height="110" viewBox="0 0 100 110">
        <rect x="10" y="30" width="80" height="70" rx="10" fill="#6b7280"/>
        <rect x="10" y="30" width="80" height="70" rx="10" fill="#9ca3af" opacity="0.5"/>
        <ellipse cx="50" cy="30" rx="40" ry="14" fill="#d1d5db"/>
        <path d="M25 30 Q50 10 75 30" fill="#e5e7eb" opacity="0.7"/>
        <rect x="20" y="50" width="60" height="35" rx="6" fill="white" opacity="0.25"/>
        <text x="50" y="65" textAnchor="middle" fontSize="10" fill="white" fontWeight="bold">BASMATI</text>
        <text x="50" y="78" textAnchor="middle" fontSize="10" fill="white" fontWeight="bold">RICE</text>
        {[30,40,50,60,70].map((x,i)=><ellipse key={i} cx={x} cy="88" rx="3" ry="2" fill="white" opacity="0.4"/>)}
      </svg>

      {/* Onions — bottom right */}
      <svg style={{position:'absolute', bottom:'8%', right:'4%', opacity:0.18}} width="110" height="85" viewBox="0 0 110 85">
        <ellipse cx="30" cy="58" rx="22" ry="20" fill="#7c3aed"/>
        <ellipse cx="30" cy="58" rx="22" ry="20" fill="#a78bfa" opacity="0.4"/>
        <ellipse cx="30" cy="42" rx="10" ry="16" fill="#8b5cf6" opacity="0.6"/>
        <path d="M25 30 Q30 20 35 30" fill="#16a34a"/>
        <ellipse cx="68" cy="55" rx="22" ry="20" fill="#7c3aed"/>
        <ellipse cx="68" cy="55" rx="22" ry="20" fill="#a78bfa" opacity="0.4"/>
        <ellipse cx="68" cy="39" rx="10" ry="16" fill="#8b5cf6" opacity="0.6"/>
        <path d="M63 27 Q68 17 73 27" fill="#16a34a"/>
        <ellipse cx="49" cy="60" rx="18" ry="16" fill="#6d28d9"/>
        <ellipse cx="49" cy="60" rx="18" ry="16" fill="#c4b5fd" opacity="0.3"/>
        <path d="M44 46 Q49 38 54 46" fill="#16a34a"/>
      </svg>

      {/* Tea packet — top center-right */}
      <svg style={{position:'absolute', top:'8%', right:'22%', opacity:0.15}} width="70" height="90" viewBox="0 0 70 90">
        <rect x="8" y="10" width="54" height="72" rx="6" fill="#92400e"/>
        <rect x="12" y="14" width="46" height="64" rx="4" fill="#b45309" opacity="0.6"/>
        <rect x="16" y="25" width="38" height="40" rx="3" fill="#fef3c7" opacity="0.9"/>
        <text x="35" y="42" textAnchor="middle" fontSize="8" fill="#78350f" fontWeight="bold">TATA</text>
        <text x="35" y="54" textAnchor="middle" fontSize="8" fill="#78350f" fontWeight="bold">CHAI</text>
        <rect x="8" y="8" width="54" height="10" rx="3" fill="#78350f"/>
      </svg>

      {/* Dal/lentil pile — right middle */}
      <svg style={{position:'absolute', top:'42%', right:'2%', opacity:0.15}} width="95" height="70" viewBox="0 0 95 70">
        <ellipse cx="48" cy="58" rx="44" ry="12" fill="#d97706" opacity="0.5"/>
        {[
          [20,48,10],[35,42,10],[50,38,10],[65,42,10],[80,48,10],
          [28,36,9],[43,30,9],[58,34,9],[73,38,9],
          [36,24,8],[50,20,8],[64,24,8],
          [48,12,7]
        ].map(([cx,cy,r],i)=>(
          <ellipse key={i} cx={cx} cy={cy} rx={r} ry={r! *0.6} fill="#f59e0b"/>
        ))}
      </svg>

      {/* Chilli peppers — top center-left */}
      <svg style={{position:'absolute', top:'15%', left:'12%', opacity:0.15}} width="80" height="70" viewBox="0 0 80 70">
        <path d="M15 60 Q10 40 20 25 Q28 12 35 18 Q38 22 33 28 Q25 32 22 45 Z" fill="#dc2626"/>
        <path d="M35 18 Q42 8 40 4" stroke="#16a34a" strokeWidth="3" fill="none" strokeLinecap="round"/>
        <path d="M40 5 Q45 2 43 8" fill="#16a34a"/>
        <path d="M45 58 Q42 38 52 23 Q60 10 67 16 Q70 20 65 26 Q57 30 54 43 Z" fill="#dc2626"/>
        <path d="M67 16 Q72 6 70 2" stroke="#16a34a" strokeWidth="3" fill="none" strokeLinecap="round"/>
        <path d="M70 3 Q75 0 73 6" fill="#16a34a"/>
      </svg>

      {/* Mustard/spice jar — bottom center */}
      <svg style={{position:'absolute', bottom:'5%', left:'38%', opacity:0.15}} width="65" height="95" viewBox="0 0 65 95">
        <rect x="12" y="22" width="41" height="62" rx="8" fill="#d97706"/>
        <rect x="16" y="28" width="33" height="50" rx="6" fill="#fbbf24" opacity="0.4"/>
        <rect x="10" y="18" width="45" height="10" rx="3" fill="#b45309"/>
        <ellipse cx="32" cy="18" rx="22" ry="6" fill="#92400e"/>
        <rect x="14" y="5" width="37" height="16" rx="4" fill="#78350f"/>
        <ellipse cx="32" cy="5" rx="18" ry="4" fill="#92400e"/>
        <rect x="18" y="38" width="29" height="28" rx="4" fill="white" opacity="0.2"/>
        <text x="32" y="52" textAnchor="middle" fontSize="7" fill="white" fontWeight="bold">HALDI</text>
        <text x="32" y="62" textAnchor="middle" fontSize="7" fill="white" fontWeight="bold">POWDER</text>
      </svg>

      {/* Potatoes — left upper */}
      <svg style={{position:'absolute', top:'60%', left:'5%', opacity:0.15}} width="90" height="65" viewBox="0 0 90 65">
        <ellipse cx="25" cy="42" rx="20" ry="15" fill="#a16207"/>
        <ellipse cx="25" cy="42" rx="20" ry="15" fill="#ca8a04" opacity="0.4"/>
        <circle cx="20" cy="36" r="2" fill="#78350f" opacity="0.5"/>
        <circle cx="30" cy="44" r="2" fill="#78350f" opacity="0.5"/>
        <ellipse cx="55" cy="38" rx="22" ry="16" fill="#a16207"/>
        <ellipse cx="55" cy="38" rx="22" ry="16" fill="#ca8a04" opacity="0.4"/>
        <circle cx="50" cy="32" r="2" fill="#78350f" opacity="0.5"/>
        <circle cx="62" cy="40" r="2" fill="#78350f" opacity="0.5"/>
        <ellipse cx="75" cy="46" rx="14" ry="12" fill="#92400e"/>
        <ellipse cx="75" cy="46" rx="14" ry="12" fill="#ca8a04" opacity="0.3"/>
      </svg>

      {/* Sugar packet — right upper */}
      <svg style={{position:'absolute', top:'22%', right:'8%', opacity:0.15}} width="75" height="95" viewBox="0 0 75 95">
        <rect x="8" y="15" width="59" height="72" rx="8" fill="#e5e7eb"/>
        <rect x="12" y="20" width="51" height="62" rx="6" fill="white" opacity="0.6"/>
        <rect x="8" y="12" width="59" height="10" rx="3" fill="#d1d5db"/>
        <rect x="18" y="32" width="39" height="38" rx="4" fill="#f3f4f6" opacity="0.8"/>
        <text x="37" y="48" textAnchor="middle" fontSize="9" fill="#374151" fontWeight="bold">CHINI</text>
        <text x="37" y="60" textAnchor="middle" fontSize="8" fill="#6b7280">Sugar</text>
        <path d="M20 75 Q37 70 54 75" stroke="#d1d5db" strokeWidth="1" fill="none"/>
      </svg>

    </div>

    {/* ── MAIN CARD ── */}
    <div style={{
      background: 'rgba(255,255,255,0.88)',
      backdropFilter: 'blur(16px)',
      border: '0.5px solid rgba(200,210,240,0.7)',
      borderRadius: '24px',
      padding: '3rem',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '2rem',
      width: '100%',
      maxWidth: '440px',
      position: 'relative',
      zIndex: 1,
    }}>

      {/* Icon */}
      <div style={{
        width: 72,
        height: 72,
        borderRadius: '20px',
        background: '#dbeafe',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
          <line x1="3" y1="6" x2="21" y2="6"/>
          <path d="M16 10a4 4 0 0 1-8 0"/>
        </svg>
      </div>

      {/* Title */}
      <div style={{ textAlign: 'center' }}>
        <h1 style={{
          fontSize: '30px',
          fontWeight: 600,
          color: '#1e3a8a',
          margin: 0,
          letterSpacing: '-0.5px',
        }}>
          Kirana Stores
        </h1>
        <p style={{
          fontSize: '15px',
          color: '#6b7280',
          margin: '8px 0 0',
        }}>
          તમારો ભરોસો, અમારી જવાબદારી
        </p>
      </div>

      <div style={{ width:'100%', height:'0.5px', background:'rgba(200,210,240,0.8)' }} />

      {/* Buttons */}
      <div style={{ display:'flex', flexDirection:'column', gap:'14px', width:'100%' }}>

        <button
          onClick={() => navigateTo('/login/malik')}
          style={{
            width:'100%', padding:'16px',
            background:'#2563eb', color:'white',
            border:'none', borderRadius:'12px',
            fontSize:'17px', fontWeight:600,
            cursor:'pointer',
            display:'flex', alignItems:'center', justifyContent:'center', gap:'10px',
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
          </svg>
          Malik Login
        </button>

        <button
          onClick={() => navigateTo('/login/grahak')}
          style={{
            width:'100%', padding:'16px',
            background:'white', color:'#1e40af',
            border:'1.5px solid #93c5fd', borderRadius:'12px',
            fontSize:'17px', fontWeight:600,
            cursor:'pointer',
            display:'flex', alignItems:'center', justifyContent:'center', gap:'10px',
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1e40af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
          </svg>
          Grahak Login
        </button>

        <button
          onClick={() => navigateTo('/signup/malik')}
          style={{
            width:'100%', padding:'15px',
            background:'#f0fdf4', color:'#166534',
            border:'1.5px solid #86efac', borderRadius:'12px',
            fontSize:'16px', fontWeight:600,
            cursor:'pointer',
            display:'flex', alignItems:'center', justifyContent:'center', gap:'10px',
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#166534" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <line x1="19" y1="8" x2="19" y2="14"/>
            <line x1="16" y1="11" x2="22" y2="11"/>
          </svg>
          New Malik Signup
        </button>

      </div>
    </div>
    <NavTransition show={transitioning} showError={showError} animType={animType} />
  </div>
);
}
