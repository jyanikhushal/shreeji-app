'use client';
export const dynamic = "force-dynamic";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useToast } from "@/app/context/ToastContext";
import { getData } from "@/app/utils/api";
import { motion } from "framer-motion";
import KiranaBackground from "@/components/home/KiranaBackground";
import LedgerField from "@/components/ui/LedgerField";
import StampButton from "@/components/ui/StampButton";
import NavTransition from "@/components/NavTransition";
import { useNavTransition } from "@/hooks/useNavTransition";

type Malik = {
  _id: string;
  name: string;
  phone: string;
  shopName?: string;
};

export default function SignupMalikPage() {
  const router = useRouter();
  const { navigateTo, stamping } = useNavTransition();
  const { showMessage } = useToast();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [shopName, setShopName] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSignup = async () => {
    if (!name || !phone || !password || !shopName) {
      showMessage("error", "Fill all fields");
      return;
    }

    const isValidPhone = (phone: string): boolean => {
      const cleaned = phone.trim();
      const phoneRegex = /^[6-9]\d{9}$/;
      return phoneRegex.test(cleaned);
    };

    if (!isValidPhone(phone)) {
      showMessage("error", "Enter valid phone number");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/signup/malik`, {
        method: "POST",
        headers: {
          "Content-Type": 'application/json'
        },
        body: JSON.stringify({
          name, phone, password, shopName
        })
      });

      const malikData = await getData<Malik>(res);

      if (!malikData) {
        showMessage("error", "Invalid server response");
        setLoading(false);
        return;
      }

      showMessage("success", "ACCOUNT CREATED!");
      navigateTo("/login/malik");

    } catch (err: unknown) {
      console.error("FULL ERROR:", err);

      if (err instanceof Error) {
        if (err.message.toLowerCase().includes("exist")) {
          showMessage("error", "Account already exists. Redirecting to login...");
          navigateTo("/login/malik");
        } else {
          showMessage("error", err.message);
        }
      } else {
        showMessage("error", "Check your Internet Connectivity");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', 
      padding: 'clamp(1rem, 5vw, 2rem)', // Fluid outer padding
      background: 'linear-gradient(160deg, #E8DCC0 0%, #DED0AC 100%)',
      position: 'relative', overflow: 'hidden',
    }}>
      <NavTransition show={stamping} />
      <KiranaBackground />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15, ease: [0.32, 0.72, 0, 1] }}
        style={{
          background: 'var(--color-paper)',
          position: 'relative', zIndex: 1,
          width: '100%', maxWidth: '420px',
          padding: 'clamp(1.75rem, 6vw, 2.5rem) clamp(1.5rem, 5vw, 2.25rem) clamp(1.75rem, 5vw, 2.25rem) clamp(1.5rem, 6vw, 2.75rem)',
          borderRadius: '4px',
          boxShadow: '0 20px 50px rgba(35,42,59,0.25)',
          borderLeft: '6px solid var(--color-rule-red)',
          backgroundImage: `repeating-linear-gradient(
            to bottom,
            transparent 0px, transparent 38px,
            rgba(35,42,59,0.06) 39px, transparent 40px
          )`,
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'clamp(1.25rem, 4vw, 1.5rem)' }}>
          
          <div style={{
            width: 76, height: 76, borderRadius: '50%',
            background: '#E8E4D9',
            border: '3px solid #A88D5A',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 0 #C4B999, 0 8px 16px rgba(0,0,0,0.15)',
            overflow: 'hidden',
            position: 'relative'
          }}>
            <Image 
              src="/digiKhata-logo.png" 
              alt="digikhata logo" 
              fill
              style={{ objectFit: 'cover' }}
              priority 
            />
          </div>

          <div style={{ textAlign: 'center' }}>
            <h1 style={{ fontFamily: 'var(--font-rozha, serif)', fontSize: 'clamp(22px, 6vw, 26px)', color: 'var(--color-ink)', margin: 0, fontWeight: 400 }}>
              Create Malik Account
            </h1>
            <p style={{ fontSize: 'clamp(12px, 3.5vw, 14px)', color: 'var(--color-ink)', opacity: 0.7, margin: '6px 0 0', fontFamily: 'var(--font-noto-gujarati)' }}>
              નવું માલિક ખાતું બનાવો
            </p>
          </div>

          <div style={{ width: '100%', height: '1px', background: 'repeating-linear-gradient(to right, rgba(35,42,59,0.3) 0, rgba(35,42,59,0.3) 4px, transparent 4px, transparent 8px)' }} />

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(10px, 3vw, 14px)', width: '100%' }}>
            
            <LedgerField
              label="Full Name"
              value={name}
              onChange={setName}
              placeholder="Enter your name"
              icon={
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-brass)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
              }
            />

            <LedgerField
              label="Phone Number"
              value={phone}
              onChange={setPhone}
              placeholder="Enter phone number"
              icon={
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-brass)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.63 3.4 2 2 0 0 1 3.6 1.22h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.8a16 16 0 0 0 6.29 6.29l.96-.96a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
                </svg>
              }
            />

            <LedgerField
              label="Shop Name"
              value={shopName}
              onChange={setShopName}
              placeholder="Enter Shop Name"
              icon={
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-brass)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                  <line x1="3" y1="9" x2="21" y2="9"/>
                  <line x1="9" y1="21" x2="9" y2="9"/>
                </svg>
              }
            />

            <LedgerField
              label="Password"
              value={password}
              onChange={setPassword}
              placeholder="Create a password"
              showToggle
              showValue={showPassword}
              onToggle={() => setShowPassword(p => !p)}
              icon={
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-brass)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
              }
            />

            <div style={{ marginTop: '4px' }}>
              <StampButton
                tone="ink"
                onClick={handleSignup}
                disabled={loading}
                icon={
                  loading ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-paper)" strokeWidth="2.5" strokeLinecap="round">
                      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83">
                        <animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="0.8s" repeatCount="indefinite" />
                      </path>
                    </svg>
                  ) : undefined
                }
              >
                {loading ? "Creating..." : "Create Account"}
              </StampButton>
            </div>

            <button
              onClick={() => navigateTo('/')}
              style={{
                width: '100%', padding: '12px',
                background: 'transparent', color: 'var(--color-ink)', opacity: 0.6,
                border: '1px dashed rgba(35,42,59,0.3)', borderRadius: '6px',
                fontSize: 'clamp(13px, 3.5vw, 14px)', fontWeight: 500, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-ink)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6"/>
              </svg>
              Back to Home
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}