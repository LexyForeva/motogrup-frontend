import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { addToast } from '../store/slices/uiSlice';
import api from '../utils/api';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

export default function EventDetailPage() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { user } = useSelector(s => s.auth);
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/events/${id}`).then(({ data }) => { setEvent(data.data); setLoading(false); }).catch(() => setLoading(false));
  }, [id]);

  const handleJoin = async () => {
    try {
      const { data } = await api.post(`/events/${id}/join`);
      setEvent(prev => ({
        ...prev,
        participants: data.isJoined
          ? [...prev.participants, { user: { _id: user._id, firstName: user.firstName, lastName: user.lastName, nickname: user.nickname, avatar: user.avatar } }]
          : prev.participants.filter(p => p.user?._id !== user._id)
      }));
      dispatch(addToast({ type: 'success', message: data.message }));
    } catch (err) {
      dispatch(addToast({ type: 'error', message: err.response?.data?.message || 'İşlem başarısız.' }));
    }
  };

  if (loading) return <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}><i className="fas fa-spinner fa-spin" style={{ fontSize: 24 }} /></div>;
  if (!event) return <div style={{ textAlign: 'center', padding: 60 }}>Etkinlik bulunamadı.</div>;

  const isJoined = event.participants?.some(p => p.user?._id === user?._id);
  const confirmedCount = event.participants?.filter(p => p.status === 'confirmed').length;
  const diffColors = { 'Kolay': 'var(--success)', 'Orta': 'var(--warning)', 'Zor': 'var(--danger)' };

  return (
    <div className="animate-fade" style={{ maxWidth: 800, margin: '0 auto' }}>
      <Link to="/events" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: 14, display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 20 }}>
        <i className="fas fa-arrow-left" /> Etkinliklere Dön
      </Link>

      <div className="card" style={{ overflow: 'hidden', marginBottom: 20 }}>
        <div style={{ background: 'linear-gradient(135deg, #1a0a0a 0%, #2d1a0a 100%)', padding: '40px 32px', position: 'relative' }}>
          <div style={{ position: 'absolute', top: 20, right: 20 }}>
            <span style={{ color: diffColors[event.difficulty], border: `1px solid ${diffColors[event.difficulty]}`, background: `rgba(0,0,0,0.3)`, borderRadius: 20, padding: '4px 14px', fontSize: 13, fontFamily: 'var(--font-heading)', fontWeight: 700 }}>{event.difficulty}</span>
          </div>
          <div style={{ color: 'var(--accent-orange)', fontSize: 14, fontFamily: 'var(--font-heading)', fontWeight: 600, marginBottom: 8 }}>
            {format(new Date(event.date), "dd MMMM yyyy, EEEE - HH:mm", { locale: tr })}
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 40, fontWeight: 900, letterSpacing: 2, marginBottom: 16 }}>{event.title}</h1>
          <div style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
            Oluşturan: <strong>{event.createdBy?.nickname || event.createdBy?.firstName}</strong>
          </div>
        </div>

        <div style={{ padding: 32 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 20, marginBottom: 24 }}>
            {[
              { icon: 'fa-map-marker-alt', label: 'Başlangıç Noktası', value: event.startPoint },
              { icon: 'fa-route', label: 'Mesafe', value: event.distance ? `${event.distance} km` : 'Belirtilmedi' },
              { icon: 'fa-clock', label: 'Tahmini Süre', value: event.estimatedDuration || 'Belirtilmedi' },
              { icon: 'fa-users', label: 'Katılımcı / Kontenjan', value: `${confirmedCount} / ${event.capacity}` },
            ].map(item => (
              <div key={item.label} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <div style={{ width: 36, height: 36, background: 'rgba(255,107,0,0.15)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <i className={`fas ${item.icon}`} style={{ color: 'var(--accent-orange)' }} />
                </div>
                <div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-heading)', marginBottom: 2 }}>{item.label}</div>
                  <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 15 }}>{item.value}</div>
                </div>
              </div>
            ))}
          </div>

          {event.description && (
            <div style={{ marginBottom: 24 }}>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, marginBottom: 10 }}>Etkinlik Hakkında</h3>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8 }}>{event.description}</p>
            </div>
          )}

          <div style={{ display: 'flex', gap: 12 }}>
            <button onClick={handleJoin} className={`btn ${isJoined ? 'btn-ghost' : 'btn-primary'}`} style={{ padding: '12px 32px', fontSize: 15 }}>
              <i className={`fas ${isJoined ? 'fa-user-minus' : 'fa-user-plus'}`} />
              {isJoined ? 'Etkinlikten Ayrıl' : 'Etkinliğe Katıl'}
            </button>
          </div>
        </div>
      </div>

      {/* Participants */}
      <div className="card" style={{ padding: 24 }}>
        <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 18, marginBottom: 16 }}>
          <i className="fas fa-users" style={{ color: 'var(--accent-orange)', marginRight: 8 }} />
          Katılımcılar ({confirmedCount})
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12 }}>
          {event.participants?.slice(0, 12).map(p => (
            <Link key={p._id} to={`/profile/${p.user?._id}`} style={{ textDecoration: 'none' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius)', transition: 'background 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-card-hover)'}
                onMouseLeave={e => e.currentTarget.style.background = 'var(--bg-secondary)'}
              >
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--gradient-orange)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: 'white', flexShrink: 0, overflow: 'hidden' }}>
                  {p.user?.avatar ? <img src={p.user.avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : `${p.user?.firstName?.[0]}${p.user?.lastName?.[0]}`}
                </div>
                <div style={{ overflow: 'hidden' }}>
                  <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 13, color: 'var(--text-primary)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                    {p.user?.nickname || p.user?.firstName}
                  </div>
                  {p.user?.motorcycle?.brand && <div style={{ fontSize: 11, color: 'var(--text-muted)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{p.user.motorcycle.brand}</div>}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
