import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { removeToast } from '../../store/slices/uiSlice';

export default function LoadingSpinner({ fullscreen, size = 40 }) {
  const style = fullscreen ? {
    position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: 'var(--bg-primary)', zIndex: 9999
  } : {
    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40
  };

  return (
    <div style={style}>
      <div style={{ textAlign: 'center' }}>
        <div style={{
          width: size, height: size,
          border: `3px solid var(--border)`,
          borderTopColor: 'var(--accent-orange)',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
          margin: '0 auto'
        }} />
        {fullscreen && (
          <div style={{ marginTop: 16, fontFamily: 'var(--font-display)', fontSize: 20, color: 'var(--accent-orange)', letterSpacing: 2 }}>
            MOTO<span style={{ color: 'var(--text-secondary)' }}>GRUP</span>
          </div>
        )}
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

export function Toast({ toast }) {
  const dispatch = useDispatch();
  
  useEffect(() => {
    const timer = setTimeout(() => dispatch(removeToast(toast.id)), 4000);
    return () => clearTimeout(timer);
  }, [toast.id, dispatch]);

  const colors = {
    success: 'var(--success)',
    error: 'var(--danger)',
    warning: 'var(--warning)',
    info: 'var(--info)'
  };
  const icons = { success: 'fa-check-circle', error: 'fa-times-circle', warning: 'fa-exclamation-triangle', info: 'fa-info-circle' };

  return (
    <div style={{
      background: 'var(--bg-card)', border: `1px solid ${colors[toast.type] || colors.info}`,
      borderRadius: 'var(--radius)', padding: '12px 16px',
      display: 'flex', alignItems: 'center', gap: 10,
      minWidth: 280, maxWidth: 380,
      animation: 'slideIn 0.3s ease',
      boxShadow: 'var(--shadow-card)'
    }}>
      <i className={`fas ${icons[toast.type] || icons.info}`} style={{ color: colors[toast.type] || colors.info, fontSize: 18 }} />
      <div style={{ flex: 1 }}>
        {toast.title && <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 14, color: 'var(--text-primary)' }}>{toast.title}</div>}
        <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{toast.message}</div>
      </div>
      <button onClick={() => dispatch(removeToast(toast.id))}
        style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 14 }}>
        <i className="fas fa-times" />
      </button>
    </div>
  );
}
