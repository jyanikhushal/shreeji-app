'use client';
import { ReactNode } from "react";

export default function LedgerField({
  label, icon, value, onChange, type = "text", placeholder,
  showToggle, showValue, onToggle,
}: {
  label: string;
  icon: ReactNode;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
  showToggle?: boolean;
  showValue?: boolean;
  onToggle?: () => void;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <label style={{ fontSize: '13px', fontWeight: 500, color: 'var(--color-ink)', opacity: 0.75 }}>
        {label}
      </label>
      <div style={{
        display: 'flex', alignItems: 'center', gap: '10px',
        border: '1.5px solid rgba(35,42,59,0.25)', borderRadius: '6px',
        padding: '0 14px', background: 'rgba(255,255,255,0.5)',
      }}>
        {icon}
        <input
          type={showToggle ? (showValue ? "text" : "password") : type}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={{
            flex: 1, border: 'none', outline: 'none',
            fontSize: '15px', padding: '13px 0',
            background: 'transparent', color: 'var(--color-ink)',
          }}
        />
        {showToggle && (
          <button
            type="button"
            onClick={onToggle}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', display: 'flex' }}
          >
            {showValue ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8a8370" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                <line x1="1" y1="1" x2="23" y2="23"/>
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8a8370" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
            )}
          </button>
        )}
      </div>
    </div>
  );
}