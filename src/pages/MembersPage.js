import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';

export default function MembersPage() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const timeout = setTimeout(() => {
      api.get(`/users?search=${search}&limit=40`).then(({ data }) => {
        setMembers(data.data || []);
        setLoading(false);
      });
    }, 300);
    return () => clearTimeout(timeout);
  }, [search]);

  const roleColors = { admin: 'var(--warning)', moderator: 'var(--info)', member: 'var(--success)' };
  const roleLabels = { admin: '👑 Admin', moderator: '🛡️ Mod', member: '🏍️ Üye' };
  const expColors = { 'Uzman': 'var(--danger)', 'İleri': 'var(--warning)', 'Orta': 'var(--info)', 'Başlangıç': 'var(--success)' };

  return (
    <div className="animate-fade">
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 900, letterSpacing: 2 }}>
          GRUB<span style={{ color: 'var(--accent-orange)' }}>UMUZ</span>
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Tüm MotoGrup üyeleri</p>
      </div>

      {/* Search */}
      <div style={{ position: 'relative', marginBottom: 24, maxWidth: 400 }}>
        <i className="fas fa-search" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
        <input className="input" style={{ paddingLeft: 40 }} placeholder="Üye ara... (ad, takma ad, numara)"
          value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}><i className="fas fa-spinner fa-spin" style={{ fontSize: 24 }} /></div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
          {members.map(member => (
            <Link key={member._id} to={`/profile/${member._id}`} style={{ textDecoration: 'none' }}>
              <div className="card" style={{ padding: 20, display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                <div style={{
                  width: 56, height: 56, borderRadius: '50%', flexShrink: 0,
                  background: 'var(--gradient-orange)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 20, fontWeight: 700, color: 'white', fontFamily: 'var(--font-heading)', overflow: 'hidden'
                }}>
                  {member.avatar
                    ? <img src={member.avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : `${member.firstName?.[0]}${member.lastName?.[0]}`}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 16, color: 'var(--text-primary)' }}>
                        {member.nickname || `${member.firstName} ${member.lastName}`}
                      </div>
                      {member.nickname && <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{member.firstName} {member.lastName}</div>}
                    </div>
                    <span style={{ fontSize: 11, color: roleColors[member.role], fontFamily: 'var(--font-heading)', fontWeight: 700, flexShrink: 0 }}>
                      {roleLabels[member.role]}
                    </span>
                  </div>

                  {member.motorcycle?.brand && (
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
                      <i className="fas fa-motorcycle" style={{ color: 'var(--accent-orange)', marginRight: 4 }} />
                      {member.motorcycle.brand} {member.motorcycle.model}
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: 10, marginTop: 8, fontSize: 11, color: 'var(--text-muted)' }}>
                    <span><i className="fas fa-route" style={{ marginRight: 3 }} />{(member.stats?.totalKm || 0).toLocaleString()} km</span>
                    <span><i className="fas fa-calendar" style={{ marginRight: 3 }} />{member.stats?.totalEvents || 0} etkinlik</span>
                    {member.experienceLevel && (
                      <span style={{ color: expColors[member.experienceLevel] || 'var(--text-muted)', fontWeight: 600 }}>⚡ {member.experienceLevel}</span>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
