import React from 'react';
import { Outlet } from 'react-router-dom';

export default function AuthLayout() {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg-primary)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 20,
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Decorative elements */}
      <div style={{
        position: 'absolute', top: -100, right: -100,
        width: 400, height: 400,
        background: 'radial-gradient(circle, rgba(255,107,0,0.15) 0%, transparent 70%)',
        borderRadius: '50%', pointerEvents: 'none'
      }} />
      <div style={{
        position: 'absolute', bottom: -100, left: -100,
        width: 300, height: 300,
        background: 'radial-gradient(circle, rgba(255,107,0,0.08) 0%, transparent 70%)',
        borderRadius: '50%', pointerEvents: 'none'
      }} />
      
      <div style={{ width: '100%', maxWidth: 440, position: 'relative', zIndex: 1 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 12,
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: 20,
            padding: '12px 24px'
          }}>
            <span style={{ fontSize: 32 }}>🏍️</span>
            <div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 900, letterSpacing: 3, color: 'var(--accent-orange)', lineHeight: 1 }}>MOTO</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 600, color: 'var(--text-secondary)', letterSpacing: 4, lineHeight: 1 }}>GRUP</div>
            </div>
          </div>
          <div style={{ marginTop: 12, color: 'var(--text-muted)', fontSize: 13 }}>
            Türkiye'nin Profesyonel Motorcu Topluluğu
          </div>
        </div>
        <Outlet />
      </div>
    </div>
  );
}
