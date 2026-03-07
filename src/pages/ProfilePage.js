import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import api from '../utils/api';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

const BADGES_DEF = {
  'first-tour': { icon: '🥇', name: 'İlk Tur' },
  'km-100': { icon: '🛣️', name: '100 KM' },
  'km-500': { icon: '🛣️', name: '500 KM' },
  'km-1000': { icon: '🏅', name: '1000 KM' },
  'photographer': { icon: '📸', name: 'Fotoğrafçı' },
  'event-lover': { icon: '🎯', name: 'Etkinlik Aşığı' },
  'star-member': { icon: '⭐', name: 'Yıldız Üye' },
  'hot-member': { icon: '🔥', name: 'Ateşli Üye' },
};

export default function ProfilePage() {
  const { id } = useParams();
  const { user: me } = useSelector(s => s.auth);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [posts, setPosts] = useState([]);
  const [activeTab, setActiveTab] = useState('posts');

  const isOwnProfile = !id || id === me?._id;
  const userId = id || me?._id;

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await api.get(`/users/profile/${userId}`);
        setProfile(data.data);
        setIsFollowing(data.data.followers?.some(f => f._id === me?._id || f === me?._id));
        
        const postsRes = await api.get(`/posts?userId=${userId}&limit=12`);
        setPosts(postsRes.data.data || []);
      } catch {}
      setLoading(false);
    };
    if (userId) fetch();
  }, [userId, me?._id]);

  const handleFollow = async () => {
    try {
      const { data } = await api.post(`/users/follow/${userId}`);
      setIsFollowing(data.isFollowing);
    } catch {}
  };

  if (loading) return <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}><i className="fas fa-spinner fa-spin" style={{ fontSize: 24 }} /></div>;
  if (!profile) return <div style={{ textAlign: 'center', padding: 60 }}>Kullanıcı bulunamadı.</div>;

  const roleColors = { admin: 'var(--warning)', moderator: 'var(--info)', member: 'var(--success)' };
  const roleLabels = { admin: 'Admin', moderator: 'Moderatör', member: 'Üye' };

  return (
    <div className="animate-fade">
      {/* Cover */}
      <div style={{
        height: 200, background: profile.coverPhoto ? `url(${profile.coverPhoto}) center/cover` : 'linear-gradient(135deg, #1a1a1a 0%, #2d1a0a 50%, #1a0a0a 100%)',
        borderRadius: 'var(--radius-xl)', marginBottom: -60, position: 'relative', overflow: 'hidden'
      }}>
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 50%, rgba(0,0,0,0.7))' }} />
        {/* Carbon fiber overlay */}
        <div style={{ position: 'absolute', inset: 0, opacity: 0.3, backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 3px, rgba(255,107,0,0.05) 3px, rgba(255,107,0,0.05) 6px)' }} />
      </div>

      {/* Profile header */}
      <div className="card" style={{ padding: 24, paddingTop: 72, marginBottom: 20, position: 'relative' }}>
        {/* Avatar */}
        <div style={{ position: 'absolute', top: -50, left: 24 }}>
          <div style={{
            width: 100, height: 100, borderRadius: '50%',
            background: 'var(--gradient-orange)',
            border: '4px solid var(--bg-card)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 36, fontWeight: 700, color: 'white', fontFamily: 'var(--font-heading)', overflow: 'hidden'
          }}>
            {profile.avatar ? <img src={profile.avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : `${profile.firstName?.[0]}${profile.lastName?.[0]}`}
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginBottom: 12 }}>
          {isOwnProfile ? (
            <Link to="/profile/edit" className="btn btn-outline" style={{ padding: '8px 16px', textDecoration: 'none', fontSize: 14 }}>
              <i className="fas fa-edit" /> Profili Düzenle
            </Link>
          ) : (
            <>
              <button onClick={handleFollow} className={`btn ${isFollowing ? 'btn-ghost' : 'btn-primary'}`} style={{ padding: '8px 16px', fontSize: 14 }}>
                <i className={`fas ${isFollowing ? 'fa-user-minus' : 'fa-user-plus'}`} />
                {isFollowing ? 'Takipten Çık' : 'Takip Et'}
              </button>
              {profile.phone && (
                <a href={`tel:${profile.phone}`} className="btn btn-ghost" style={{ padding: '8px 16px', fontSize: 14, textDecoration: 'none' }}>
                  <i className="fas fa-phone" />
                </a>
              )}
            </>
          )}
        </div>

        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 900, letterSpacing: 1 }}>
              {profile.nickname || profile.firstName} {!profile.nickname && profile.lastName}
            </h1>
            {profile.nickname && <span style={{ color: 'var(--text-muted)', fontSize: 16 }}>{profile.firstName} {profile.lastName}</span>}
            <span style={{ background: `rgba(255,255,255,0.1)`, color: roleColors[profile.role], border: `1px solid ${roleColors[profile.role]}`, borderRadius: 20, padding: '2px 10px', fontSize: 12, fontFamily: 'var(--font-heading)', fontWeight: 600 }}>
              {roleLabels[profile.role]}
            </span>
          </div>
          <div style={{ color: 'var(--text-muted)', fontSize: 14, marginTop: 4 }}>#{profile.memberNumber}</div>
          {profile.bio && <p style={{ color: 'var(--text-secondary)', marginTop: 10, fontSize: 14, lineHeight: 1.6 }}>{profile.bio}</p>}

          {/* Badges */}
          {profile.badges?.length > 0 && (
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 12 }}>
              {profile.badges.map(b => (
                <span key={b.badgeId} title={BADGES_DEF[b.badgeId]?.name} style={{
                  background: 'rgba(255,107,0,0.1)', border: '1px solid rgba(255,107,0,0.3)',
                  borderRadius: 20, padding: '4px 10px', fontSize: 16
                }}>{BADGES_DEF[b.badgeId]?.icon}</span>
              ))}
            </div>
          )}
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginTop: 20, paddingTop: 20, borderTop: '1px solid var(--border)' }}>
          {[
            { icon: 'fa-route', label: 'KM', value: (profile.stats?.totalKm || 0).toLocaleString() },
            { icon: 'fa-calendar', label: 'Etkinlik', value: profile.stats?.totalEvents || 0 },
            { icon: 'fa-camera', label: 'Fotoğraf', value: profile.stats?.totalPhotos || 0 },
            { icon: 'fa-trophy', label: 'Rozet', value: profile.stats?.totalBadges || 0 },
          ].map(stat => (
            <div key={stat.label} style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 900, color: 'var(--accent-orange)' }}>{stat.value}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'var(--font-heading)' }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Motor info */}
      {profile.motorcycle?.brand && (
        <div className="card" style={{ padding: 20, marginBottom: 20 }}>
          <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 16, marginBottom: 14, color: 'var(--accent-orange)' }}>
            <i className="fas fa-motorcycle" style={{ marginRight: 8 }} />Motor Bilgileri
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12 }}>
            {[
              { label: 'Marka / Model', value: `${profile.motorcycle.brand} ${profile.motorcycle.model}` },
              { label: 'Plaka', value: profile.motorcycle.plate },
              { label: 'Yıl', value: profile.motorcycle.year },
              { label: 'Tip', value: profile.motorcycle.type },
            ].filter(i => i.value).map(item => (
              <div key={item.label}>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 2, fontFamily: 'var(--font-heading)' }}>{item.label}</div>
                <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 15 }}>{item.value}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Personal info */}
      <div className="card" style={{ padding: 20, marginBottom: 20 }}>
        <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 16, marginBottom: 14, color: 'var(--accent-orange)' }}>
          <i className="fas fa-user" style={{ marginRight: 8 }} />Kişisel Bilgiler
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12 }}>
          {[
            { label: 'Yaş', value: profile.birthDate && `${Math.floor((Date.now() - new Date(profile.birthDate)) / (365.25*24*60*60*1000))} yaşında`, icon: '🎂' },
            { label: 'Kan Grubu', value: profile.bloodType, icon: '🩸', highlight: true },
            { label: 'Deneyim', value: profile.experienceLevel, icon: '⭐' },
            { label: 'Üye Since', value: profile.createdAt && format(new Date(profile.createdAt), 'MMMM yyyy', { locale: tr }), icon: '📅' },
            { label: 'Instagram', value: profile.instagram && `@${profile.instagram}`, icon: '📱' },
          ].filter(i => i.value).map(item => (
            <div key={item.label} style={{ 
              background: item.highlight ? 'rgba(229,53,53,0.1)' : 'transparent',
              border: item.highlight ? '1px solid rgba(229,53,53,0.3)' : 'none',
              borderRadius: 8,
              padding: item.highlight ? 10 : 0
            }}>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 2, fontFamily: 'var(--font-heading)' }}>
                {item.icon && <span style={{ marginRight: 4 }}>{item.icon}</span>}
                {item.label}
              </div>
              <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 14 }}>{item.value}</div>
            </div>
          ))}
        </div>
        {profile.interests?.length > 0 && (
          <div style={{ marginTop: 14 }}>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 8, fontFamily: 'var(--font-heading)' }}>İlgi Alanları</div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {profile.interests.map(i => (
                <span key={i} className="badge badge-orange">{i}</span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Emergency contact - only own profile */}
      {isOwnProfile && profile.emergencyContact?.name && (
        <div className="card" style={{ 
          padding: 20, 
          marginBottom: 20, 
          background: 'linear-gradient(135deg, rgba(229,53,53,0.05) 0%, rgba(229,53,53,0.1) 100%)',
          border: '2px solid rgba(229,53,53,0.4)',
          boxShadow: '0 4px 12px rgba(229,53,53,0.2)'
        }}>
          <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 18, marginBottom: 16, color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <i className="fas fa-exclamation-triangle" style={{ fontSize: 20 }} />
            Acil Durum İletişimi
          </div>
          <div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: 12, padding: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
              <div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>İletişim Kişisi</div>
                <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 18, marginBottom: 4 }}>{profile.emergencyContact.name}</div>
                <div style={{ color: 'var(--text-secondary)', fontSize: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <i className="fas fa-phone" />
                  {profile.emergencyContact.phone}
                </div>
                {profile.emergencyContact.relation && (
                  <div style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 4 }}>
                    <i className="fas fa-user-friends" style={{ marginRight: 4 }} />
                    {profile.emergencyContact.relation}
                  </div>
                )}
              </div>
              <a href={`tel:${profile.emergencyContact.phone}`} className="btn btn-danger" style={{ textDecoration: 'none', padding: '12px 20px', fontSize: 15, fontWeight: 700 }}>
                <i className="fas fa-phone-alt" /> Hemen Ara
              </a>
            </div>
          </div>
          <div style={{ marginTop: 12, fontSize: 12, color: 'var(--text-muted)', fontStyle: 'italic', display: 'flex', alignItems: 'center', gap: 6 }}>
            <i className="fas fa-info-circle" />
            Bu bilgi sadece sizin tarafınızdan görülebilir
          </div>
        </div>
      )}

      {/* Posts */}
      {posts.length > 0 && (
        <div className="card" style={{ padding: 20 }}>
          <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 16, marginBottom: 16 }}>
            <i className="fas fa-camera" style={{ color: 'var(--accent-orange)', marginRight: 8 }} />Paylaşımlar
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: 4 }}>
            {posts.filter(p => p.images?.length).flatMap(p => p.images).slice(0, 9).map((img, i) => (
              <div key={i} style={{ aspectRatio: '1', borderRadius: 8, overflow: 'hidden' }}>
                <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
