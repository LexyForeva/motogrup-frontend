import React, { useRef } from 'react';
import { useSelector } from 'react-redux';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

const BADGES_DEF = {
  'first-tour': '🥇', 'km-100': '🛣️', 'km-500': '🛣️', 'km-1000': '🏅',
  'photographer': '📸', 'event-lover': '🎯', 'star-member': '⭐', 'hot-member': '🔥'
};

export default function MemberCardPage() {
  const { user } = useSelector(s => s.auth);

  if (!user) return null;

  return (
    <div className="animate-fade" style={{ maxWidth: 600, margin: '0 auto' }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 900, letterSpacing: 2 }}>
          ÜYELİK <span style={{ color: 'var(--accent-orange)' }}>KARTIM</span>
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Dijital üyelik kartınız</p>
      </div>

      {/* The Card */}
      <div id="member-card" style={{
        background: 'linear-gradient(135deg, #1a0a0a 0%, #0a0a0a 30%, #1a0a0a 60%, #2d1a0a 100%)',
        border: '1px solid rgba(255,107,0,0.4)',
        borderRadius: 20,
        padding: 32,
        position: 'relative',
        overflow: 'hidden',
        marginBottom: 24,
        boxShadow: '0 0 40px rgba(255,107,0,0.15)'
      }}>
        {/* Background pattern */}
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 4px, rgba(255,107,0,0.03) 4px, rgba(255,107,0,0.03) 8px)', pointerEvents: 'none' }} />

        {/* Orange stripe top */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: 'var(--gradient-orange)' }} />

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 28 }}>🏍️</span>
            <div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 900, letterSpacing: 3, color: 'var(--accent-orange)', lineHeight: 1 }}>MOTO</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.5)', letterSpacing: 4, lineHeight: 1 }}>GRUP</div>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontFamily: 'var(--font-heading)', fontSize: 11, color: 'rgba(255,255,255,0.4)', letterSpacing: 2 }}>ÜYE NO</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 900, color: 'var(--accent-orange)', letterSpacing: 2 }}>{user.memberNumber}</div>
          </div>
        </div>

        {/* Main info */}
        <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start', marginBottom: 24 }}>
          <div style={{
            width: 88, height: 88, borderRadius: '50%',
            background: 'var(--gradient-orange)',
            border: '3px solid rgba(255,107,0,0.5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 30, fontWeight: 700, color: 'white', fontFamily: 'var(--font-heading)', flexShrink: 0, overflow: 'hidden'
          }}>
            {user.avatar
              ? <img src={user.avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : `${user.firstName?.[0]}${user.lastName?.[0]}`}
          </div>

          <div style={{ flex: 1 }}>
            {user.nickname && (
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 30, fontWeight: 900, color: 'var(--accent-orange)', letterSpacing: 2, lineHeight: 1, marginBottom: 4 }}>
                {user.nickname}
              </div>
            )}
            <div style={{ fontFamily: 'var(--font-heading)', fontSize: 18, fontWeight: 700, color: 'white', marginBottom: 6 }}>
              {user.firstName} {user.lastName}
            </div>
            {user.motorcycle?.brand && (
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', marginBottom: 4 }}>
                <i className="fas fa-motorcycle" style={{ marginRight: 6, color: 'var(--accent-orange)' }} />
                {user.motorcycle.brand} {user.motorcycle.model}
              </div>
            )}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 6 }}>
              {user.bloodType && (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: 'rgba(229,53,53,0.2)', border: '1px solid rgba(229,53,53,0.4)', borderRadius: 20, padding: '2px 10px', fontSize: 12, fontFamily: 'var(--font-heading)', fontWeight: 700, color: '#EF4444' }}>
                  🩸 {user.bloodType}
                </span>
              )}
              {user.experienceLevel && (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: 'rgba(255,107,0,0.15)', border: '1px solid rgba(255,107,0,0.3)', borderRadius: 20, padding: '2px 10px', fontSize: 12, fontFamily: 'var(--font-heading)', fontWeight: 700, color: 'var(--accent-orange)' }}>
                  ⚡ {user.experienceLevel}
                </span>
              )}
            </div>
          </div>

          {/* QR Code placeholder */}
          <div style={{ width: 80, height: 80, background: 'white', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, flexDirection: 'column', padding: 4 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 1, width: '100%', height: '100%' }}>
              {Array.from({ length: 49 }, (_, i) => {
                const pattern = [0,1,2,3,4,5,6,7,13,14,20,21,27,28,34,35,41,42,43,44,45,46,48,8,9,10,11,12];
                return <div key={i} style={{ background: pattern.includes(i) || Math.random() > 0.5 ? '#000' : '#fff', borderRadius: 1 }} />;
              })}
            </div>
          </div>
        </div>

        {/* Stats bar */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20, padding: '16px 0', borderTop: '1px solid rgba(255,107,0,0.2)', borderBottom: '1px solid rgba(255,107,0,0.2)' }}>
          {[
            { icon: 'fa-route', label: 'KM', value: (user.stats?.totalKm || 0).toLocaleString() },
            { icon: 'fa-calendar-check', label: 'Etkinlik', value: user.stats?.totalEvents || 0 },
            { icon: 'fa-camera', label: 'Fotoğraf', value: user.stats?.totalPhotos || 0 },
            { icon: 'fa-trophy', label: 'Rozet', value: user.stats?.totalBadges || 0 },
          ].map(stat => (
            <div key={stat.label} style={{ textAlign: 'center' }}>
              <i className={`fas ${stat.icon}`} style={{ color: 'var(--accent-orange)', fontSize: 14, display: 'block', marginBottom: 4 }} />
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 900, color: 'white', lineHeight: 1 }}>{stat.value}</div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', fontFamily: 'var(--font-heading)', marginTop: 2 }}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Badges */}
        {user.badges?.length > 0 && (
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
            {user.badges.map(b => (
              <span key={b.badgeId} style={{ fontSize: 22 }} title={b.badgeId}>{BADGES_DEF[b.badgeId]}</span>
            ))}
          </div>
        )}

        {/* Footer */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', fontFamily: 'var(--font-heading)' }}>
            <i className="fas fa-calendar" style={{ marginRight: 4 }} />
            Üyelik: {user.createdAt ? format(new Date(user.createdAt), 'MMMM yyyy', { locale: tr }) : '-'}
          </div>
          <div style={{ fontSize: 10, color: 'rgba(255,107,0,0.5)', fontFamily: 'var(--font-heading)', letterSpacing: 1 }}>
            motogrup.com
          </div>
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 12 }}>
        <button onClick={() => window.print()} className="btn btn-primary" style={{ flex: 1, justifyContent: 'center', padding: 14 }}>
          <i className="fas fa-print" /> Yazdır / PDF
        </button>
        <button onClick={() => {
          const el = document.getElementById('member-card');
          if (el) {
            const text = `MotoGrup Üyesi\n${user.firstName} ${user.lastName}\n${user.nickname ? `"${user.nickname}"\n` : ''}Üye No: ${user.memberNumber}`;
            if (navigator.share) navigator.share({ title: 'MotoGrup Üyelik Kartım', text });
            else navigator.clipboard.writeText(text).then(() => alert('Bilgiler kopyalandı!'));
          }
        }} className="btn btn-ghost" style={{ flex: 1, justifyContent: 'center', padding: 14 }}>
          <i className="fas fa-share-alt" /> Paylaş
        </button>
      </div>

      {/* Print style */}
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #member-card, #member-card * { visibility: visible; }
          #member-card { position: fixed; top: 0; left: 0; width: 100%; }
        }
      `}</style>
    </div>
  );
}
