import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { addToast } from '../store/slices/uiSlice';
import api from '../utils/api';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

const diffColors = { 'Kolay': 'var(--success)', 'Orta': 'var(--warning)', 'Zor': 'var(--danger)' };

export default function EventsPage() {
  const dispatch = useDispatch();
  const { user } = useSelector(s => s.auth);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ upcoming: '', difficulty: '' });
  const [showCreate, setShowCreate] = useState(false);
  const [newEvent, setNewEvent] = useState({ title: '', description: '', date: '', startPoint: '', distance: '', estimatedDuration: '', difficulty: 'Orta', capacity: 30 });
  const [creating, setCreating] = useState(false);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams(filter).toString();
      const { data } = await api.get(`/events?${params}&limit=20`);
      setEvents(data.data || []);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { fetchEvents(); }, [filter]);

  const handleJoin = async (eventId, isJoined) => {
    try {
      const { data } = await api.post(`/events/${eventId}/join`);
      setEvents(prev => prev.map(e => {
        if (e._id !== eventId) return e;
        const userId = user._id;
        return { ...e, participants: data.isJoined ? [...e.participants, { user: { _id: userId, firstName: user.firstName, lastName: user.lastName } }] : e.participants.filter(p => p.user?._id !== userId) };
      }));
      dispatch(addToast({ type: 'success', message: data.message }));
    } catch (err) {
      dispatch(addToast({ type: 'error', message: err.response?.data?.message || 'İşlem başarısız.' }));
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      await api.post('/events', newEvent);
      dispatch(addToast({ type: 'success', title: 'Etkinlik Oluşturuldu!', message: 'Etkinlik onay bekliyor.' }));
      setShowCreate(false);
      fetchEvents();
    } catch (err) {
      dispatch(addToast({ type: 'error', message: err.response?.data?.message || 'Etkinlik oluşturulamadı.' }));
    }
    setCreating(false);
  };

  return (
    <div className="animate-fade">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 900, letterSpacing: 2 }}>
            ETKİN<span style={{ color: 'var(--accent-orange)' }}>LİKLER</span>
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>{events.length} etkinlik listeleniyor</p>
        </div>
        {['admin', 'moderator'].includes(user?.role) && (
          <button onClick={() => setShowCreate(!showCreate)} className="btn btn-primary">
            <i className="fas fa-plus" /> Etkinlik Oluştur
          </button>
        )}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
        <button onClick={() => setFilter({ ...filter, upcoming: filter.upcoming ? '' : 'true' })}
          className={`btn ${filter.upcoming ? 'btn-primary' : 'btn-ghost'}`} style={{ padding: '8px 16px', fontSize: 14 }}>
          <i className="fas fa-clock" /> Yaklaşan
        </button>
        {['Kolay', 'Orta', 'Zor'].map(d => (
          <button key={d} onClick={() => setFilter({ ...filter, difficulty: filter.difficulty === d ? '' : d })}
            className={`btn ${filter.difficulty === d ? 'btn-primary' : 'btn-ghost'}`} style={{ padding: '8px 16px', fontSize: 14 }}>
            {d}
          </button>
        ))}
      </div>

      {/* Create form */}
      {showCreate && (
        <div className="card" style={{ padding: 24, marginBottom: 24 }}>
          <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 18, marginBottom: 20 }}>Yeni Etkinlik Oluştur</h3>
          <form onSubmit={handleCreate}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div style={{ gridColumn: 'span 2' }}>
                <input className="input" placeholder="Etkinlik Başlığı *" value={newEvent.title} onChange={e => setNewEvent({ ...newEvent, title: e.target.value })} required />
              </div>
              <input type="datetime-local" className="input" value={newEvent.date} onChange={e => setNewEvent({ ...newEvent, date: e.target.value })} required />
              <input className="input" placeholder="Başlangıç Noktası *" value={newEvent.startPoint} onChange={e => setNewEvent({ ...newEvent, startPoint: e.target.value })} required />
              <input type="number" className="input" placeholder="Mesafe (km)" value={newEvent.distance} onChange={e => setNewEvent({ ...newEvent, distance: e.target.value })} />
              <input className="input" placeholder="Tahmini Süre (4 saat)" value={newEvent.estimatedDuration} onChange={e => setNewEvent({ ...newEvent, estimatedDuration: e.target.value })} />
              <select className="input" value={newEvent.difficulty} onChange={e => setNewEvent({ ...newEvent, difficulty: e.target.value })}>
                {['Kolay', 'Orta', 'Zor'].map(d => <option key={d} value={d}>{d}</option>)}
              </select>
              <input type="number" className="input" placeholder="Kontenjan" value={newEvent.capacity} onChange={e => setNewEvent({ ...newEvent, capacity: e.target.value })} />
              <div style={{ gridColumn: 'span 2' }}>
                <textarea className="input" style={{ resize: 'none', minHeight: 80 }} placeholder="Etkinlik açıklaması..." value={newEvent.description} onChange={e => setNewEvent({ ...newEvent, description: e.target.value })} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 16 }}>
              <button type="button" onClick={() => setShowCreate(false)} className="btn btn-ghost">İptal</button>
              <button type="submit" className="btn btn-primary" disabled={creating}>
                {creating ? <><i className="fas fa-spinner fa-spin" /> Oluşturuluyor...</> : 'Oluştur'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Events grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}><i className="fas fa-spinner fa-spin" style={{ fontSize: 24 }} /></div>
      ) : events.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 60 }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📅</div>
          <div style={{ fontFamily: 'var(--font-heading)', fontSize: 20, fontWeight: 700 }}>Etkinlik bulunamadı</div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 16 }}>
          {events.map(event => {
            const isJoined = event.participants?.some(p => p.user?._id === user?._id || p.user === user?._id);
            const isFull = event.participants?.filter(p=>p.status==='confirmed').length >= event.capacity;
            return (
              <div key={event._id} className="card" style={{ overflow: 'hidden' }}>
                {event.isFeatured && (
                  <div style={{ background: 'var(--gradient-orange)', padding: '6px 16px', fontSize: 12, fontFamily: 'var(--font-heading)', fontWeight: 700, letterSpacing: 1 }}>
                    ⭐ ÖNE ÇIKAN
                  </div>
                )}
                <div style={{ padding: 20 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                    <div>
                      <Link to={`/events/${event._id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                        <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 18, marginBottom: 4, transition: 'color 0.2s' }}
                          onMouseEnter={e => e.target.style.color = 'var(--accent-orange)'}
                          onMouseLeave={e => e.target.style.color = 'inherit'}
                        >{event.title}</h3>
                      </Link>
                      <div style={{ color: 'var(--accent-orange)', fontSize: 14, fontFamily: 'var(--font-heading)', fontWeight: 600 }}>
                        <i className="fas fa-calendar" style={{ marginRight: 6 }} />
                        {format(new Date(event.date), 'dd MMMM yyyy, EEEE', { locale: tr })}
                      </div>
                    </div>
                    <span style={{ background: `rgba(255,255,255,0.05)`, color: diffColors[event.difficulty], border: `1px solid ${diffColors[event.difficulty]}`, borderRadius: 20, padding: '4px 12px', fontSize: 12, fontFamily: 'var(--font-heading)', fontWeight: 600, flexShrink: 0 }}>
                      {event.difficulty}
                    </span>
                  </div>

                  {event.description && (
                    <p style={{ color: 'var(--text-muted)', fontSize: 13, lineHeight: 1.6, marginBottom: 14, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {event.description}
                    </p>
                  )}

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 16 }}>
                    {[
                      { icon: 'fa-map-marker-alt', value: event.startPoint },
                      { icon: 'fa-route', value: event.distance ? `${event.distance} km` : '-' },
                      { icon: 'fa-clock', value: event.estimatedDuration || '-' },
                      { icon: 'fa-users', value: `${event.participants?.filter(p=>p.status==='confirmed').length || 0} / ${event.capacity}` },
                    ].map(item => (
                      <div key={item.icon} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text-muted)' }}>
                        <i className={`fas ${item.icon}`} style={{ color: 'var(--accent-orange)', width: 14 }} />
                        {item.value}
                      </div>
                    ))}
                  </div>

                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => handleJoin(event._id, isJoined)}
                      className={`btn ${isJoined ? 'btn-ghost' : isFull ? 'btn-ghost' : 'btn-primary'}`}
                      disabled={isFull && !isJoined}
                      style={{ flex: 1, justifyContent: 'center', padding: '10px', fontSize: 14 }}>
                      <i className={`fas ${isJoined ? 'fa-user-minus' : 'fa-user-plus'}`} />
                      {isJoined ? 'Ayrıl' : isFull ? 'Dolu' : 'Katıl'}
                    </button>
                    <Link to={`/events/${event._id}`} className="btn btn-ghost" style={{ textDecoration: 'none', padding: '10px 14px' }}>
                      <i className="fas fa-info-circle" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
