import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { addToast } from '../store/slices/uiSlice';
import api from '../utils/api';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

export default function BadgesPage() {
  const dispatch = useDispatch();
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBadges = async () => {
      try {
        // Check for new badges
        const checkRes = await api.get('/badges/check');
        if (checkRes.data.newBadges?.length > 0) {
          checkRes.data.newBadges.forEach(b => {
            dispatch(addToast({ type: 'success', title: `🏆 Yeni Rozet Kazandın!`, message: `${b.icon} ${b.name}` }));
          });
        }
        const { data } = await api.get('/badges');
        setBadges(data.data || []);
      } catch {}
      setLoading(false);
    };
    fetchBadges();
  }, [dispatch]);

  const earned = badges.filter(b => b.earned);
  const locked = badges.filter(b => !b.earned);

  if (loading) return <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}><i className="fas fa-spinner fa-spin" style={{ fontSize: 24 }} /></div>;

  return (
    <div className="animate-fade">
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 900, letterSpacing: 2 }}>
          ROZET <span style={{ color: 'var(--accent-orange)' }}>VİTRİNİ</span>
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>{earned.length} / {badges.length} rozet kazanıldı</p>
      </div>

      {/* Progress bar */}
      <div className="card" style={{ padding: 24, marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
          <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 700 }}>Toplam İlerleme</span>
          <span style={{ color: 'var(--accent-orange)', fontFamily: 'var(--font-heading)', fontWeight: 700 }}>{earned.length}/{badges.length}</span>
        </div>
        <div style={{ height: 8, background: 'var(--border)', borderRadius: 4, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${(earned.length / badges.length) * 100}%`, background: 'var(--gradient-orange)', borderRadius: 4, transition: 'width 0.5s ease' }} />
        </div>
      </div>

      {/* Earned */}
      {earned.length > 0 && (
        <div style={{ marginBottom: 32 }}>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 20, marginBottom: 16, color: 'var(--success)' }}>
            <i className="fas fa-check-circle" style={{ marginRight: 8 }} />Kazanılan Rozetler ({earned.length})
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
            {earned.map(badge => (
              <div key={badge.id} className="card" style={{ padding: 24, textAlign: 'center', background: 'rgba(255,107,0,0.05)', borderColor: 'rgba(255,107,0,0.3)' }}>
                <div style={{ fontSize: 52, marginBottom: 12 }}>{badge.icon}</div>
                <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 18, marginBottom: 6 }}>{badge.name}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: 12 }}>{badge.description}</div>
                {badge.earnedAt && <div style={{ fontSize: 11, color: 'var(--accent-orange)', fontFamily: 'var(--font-heading)' }}>
                  <i className="fas fa-calendar" style={{ marginRight: 4 }} />
                  {format(new Date(badge.earnedAt), 'dd MMM yyyy', { locale: tr })}
                </div>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Locked */}
      {locked.length > 0 && (
        <div>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 20, marginBottom: 16, color: 'var(--text-muted)' }}>
            <i className="fas fa-lock" style={{ marginRight: 8 }} />Kilitli Rozetler ({locked.length})
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
            {locked.map(badge => (
              <div key={badge.id} className="card" style={{ padding: 24, textAlign: 'center', opacity: 0.5 }}>
                <div style={{ fontSize: 52, marginBottom: 12, filter: 'grayscale(100%)' }}>{badge.icon}</div>
                <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 18, marginBottom: 6 }}>???</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5 }}>{badge.description}</div>
                <div style={{ marginTop: 10, fontSize: 11, color: 'var(--text-muted)', background: 'var(--bg-secondary)', borderRadius: 20, padding: '4px 12px', display: 'inline-block' }}>
                  <i className="fas fa-lock" style={{ marginRight: 4 }} />{badge.condition}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
