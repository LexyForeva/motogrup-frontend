import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { addToast } from '../store/slices/uiSlice';
import api from '../utils/api';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

const TABS = [
  { id: 'stats', label: 'İstatistikler', icon: 'fa-chart-bar' },
  { id: 'users', label: 'Kullanıcılar', icon: 'fa-users' },
  { id: 'events', label: 'Etkinlikler', icon: 'fa-calendar' },
  { id: 'announcements', label: 'Duyurular', icon: 'fa-bullhorn' },
];

export default function AdminPage() {
  const dispatch = useDispatch();
  const [tab, setTab] = useState('stats');
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [events, setEvents] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newAnn, setNewAnn] = useState({ title: '', content: '', type: 'info', isEmergency: false, notify: true });
  const [savingAnn, setSavingAnn] = useState(false);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [statsRes, usersRes, eventsRes, annRes] = await Promise.all([
          api.get('/admin/stats'),
          api.get('/admin/users?limit=30'),
          api.get('/admin/events'),
          api.get('/admin/announcements'),
        ]);
        setStats(statsRes.data.data);
        setUsers(usersRes.data.data || []);
        setEvents(eventsRes.data.data || []);
        setAnnouncements(annRes.data.data || []);
      } catch {}
      setLoading(false);
    };
    fetchAll();
  }, []);

  const handleRoleChange = async (userId, role) => {
    try {
      await api.put(`/admin/users/${userId}`, { role });
      setUsers(prev => prev.map(u => u._id === userId ? { ...u, role } : u));
      dispatch(addToast({ type: 'success', message: 'Rol güncellendi.' }));
    } catch { dispatch(addToast({ type: 'error', message: 'İşlem başarısız.' })); }
  };

  const handleToggleUser = async (userId, isActive) => {
    try {
      await api.put(`/admin/users/${userId}`, { isActive: !isActive });
      setUsers(prev => prev.map(u => u._id === userId ? { ...u, isActive: !isActive } : u));
      dispatch(addToast({ type: 'success', message: `Kullanıcı ${!isActive ? 'aktif edildi' : 'devre dışı bırakıldı'}.` }));
    } catch {}
  };

  const handleApproveEvent = async (eventId) => {
    try {
      await api.put(`/admin/events/${eventId}/approve`);
      setEvents(prev => prev.map(e => e._id === eventId ? { ...e, isApproved: true } : e));
      dispatch(addToast({ type: 'success', message: 'Etkinlik onaylandı.' }));
    } catch {}
  };

  const handleCreateAnn = async (e) => {
    e.preventDefault();
    setSavingAnn(true);
    try {
      const { data } = await api.post('/admin/announcements', newAnn);
      setAnnouncements(prev => [data.data, ...prev]);
      setNewAnn({ title: '', content: '', type: 'info', isEmergency: false, notify: true });
      dispatch(addToast({ type: 'success', message: 'Duyuru oluşturuldu.' }));
    } catch { dispatch(addToast({ type: 'error', message: 'İşlem başarısız.' })); }
    setSavingAnn(false);
  };

  const handleDeleteAnn = async (id) => {
    await api.delete(`/admin/announcements/${id}`);
    setAnnouncements(prev => prev.filter(a => a._id !== id));
    dispatch(addToast({ type: 'success', message: 'Duyuru silindi.' }));
  };

  const roleColors = { admin: 'var(--warning)', moderator: 'var(--info)', member: 'var(--success)' };

  if (loading) return <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}><i className="fas fa-spinner fa-spin" style={{ fontSize: 24 }} /></div>;

  return (
    <div className="animate-fade">
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 900, letterSpacing: 2 }}>
          YÖNETİM <span style={{ color: 'var(--warning)' }}>PANELİ</span>
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>👑 Admin Dashboard</p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, background: 'var(--bg-secondary)', borderRadius: 'var(--radius-lg)', padding: 4, marginBottom: 24, width: 'fit-content' }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            style={{
              padding: '10px 20px', borderRadius: 'var(--radius)', border: 'none', cursor: 'pointer',
              background: tab === t.id ? 'var(--bg-card)' : 'transparent',
              color: tab === t.id ? 'var(--text-primary)' : 'var(--text-muted)',
              fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 14, transition: 'all 0.2s',
              display: 'flex', alignItems: 'center', gap: 8
            }}>
            <i className={`fas ${t.icon}`} style={{ color: tab === t.id ? 'var(--accent-orange)' : 'inherit' }} />
            {t.label}
          </button>
        ))}
      </div>

      {/* Stats tab */}
      {tab === 'stats' && stats && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 24 }}>
            {[
              { icon: 'fa-users', label: 'Toplam Üye', value: stats.users, color: 'var(--info)' },
              { icon: 'fa-user-plus', label: 'Bu Ay Yeni', value: stats.newUsersThisMonth, color: 'var(--success)' },
              { icon: 'fa-calendar-check', label: 'Etkinlik', value: stats.events, color: 'var(--accent-orange)' },
              { icon: 'fa-newspaper', label: 'Gönderi', value: stats.posts, color: '#8B5CF6' },
            ].map(stat => (
              <div key={stat.label} className="card" style={{ padding: 24, textAlign: 'center' }}>
                <i className={`fas ${stat.icon}`} style={{ color: stat.color, fontSize: 28, marginBottom: 10, display: 'block' }} />
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 36, fontWeight: 900, color: stat.color, lineHeight: 1 }}>{stat.value}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'var(--font-heading)', marginTop: 6 }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Users tab */}
      {tab === 'users' && (
        <div className="card" style={{ overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
            <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 16 }}>
              <i className="fas fa-users" style={{ color: 'var(--accent-orange)', marginRight: 8 }} />
              Kullanıcı Yönetimi ({users.length})
            </div>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--bg-secondary)' }}>
                  {['Üye', 'No', 'Email', 'Rol', 'Motor', 'Durum', 'İşlem'].map(col => (
                    <th key={col} style={{ padding: '12px 16px', textAlign: 'left', fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 12, color: 'var(--text-muted)', letterSpacing: 1 }}>{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user._id} style={{ borderTop: '1px solid var(--border)' }}>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--gradient-orange)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: 'white', flexShrink: 0 }}>
                          {user.firstName?.[0]}{user.lastName?.[0]}
                        </div>
                        <div>
                          <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 14 }}>{user.nickname || `${user.firstName} ${user.lastName}`}</div>
                          {user.nickname && <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{user.firstName} {user.lastName}</div>}
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: 12, color: 'var(--text-muted)', fontFamily: 'var(--font-heading)' }}>{user.memberNumber}</td>
                    <td style={{ padding: '12px 16px', fontSize: 13, color: 'var(--text-secondary)' }}>{user.email}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <select value={user.role} onChange={e => handleRoleChange(user._id, e.target.value)}
                        style={{ background: 'var(--bg-secondary)', border: `1px solid ${roleColors[user.role]}`, borderRadius: 8, color: roleColors[user.role], padding: '4px 8px', cursor: 'pointer', fontSize: 12, fontFamily: 'var(--font-heading)', fontWeight: 700 }}>
                        <option value="member">Üye</option>
                        <option value="moderator">Moderatör</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: 12, color: 'var(--text-muted)' }}>
                      {user.motorcycle?.brand ? `${user.motorcycle.brand} ${user.motorcycle.model}` : '-'}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ fontSize: 11, fontFamily: 'var(--font-heading)', fontWeight: 700, color: user.isActive ? 'var(--success)' : 'var(--danger)', background: user.isActive ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)', border: `1px solid ${user.isActive ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`, borderRadius: 20, padding: '3px 10px' }}>
                        {user.isActive ? 'Aktif' : 'Devre Dışı'}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <button onClick={() => handleToggleUser(user._id, user.isActive)}
                        style={{ padding: '5px 10px', borderRadius: 8, border: 'none', cursor: 'pointer', background: user.isActive ? 'rgba(239,68,68,0.1)' : 'rgba(34,197,94,0.1)', color: user.isActive ? 'var(--danger)' : 'var(--success)', fontSize: 11, fontFamily: 'var(--font-heading)', fontWeight: 700 }}>
                        {user.isActive ? 'Devre Dışı' : 'Aktif Et'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Events tab */}
      {tab === 'events' && (
        <div className="card" style={{ overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
            <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 16 }}>
              <i className="fas fa-calendar" style={{ color: 'var(--accent-orange)', marginRight: 8 }} />Etkinlik Yönetimi
            </div>
          </div>
          {events.map(event => (
            <div key={event._id} style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
              <div>
                <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 15 }}>{event.title}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                  {event.date && format(new Date(event.date), 'dd MMM yyyy', { locale: tr })} · {event.createdBy?.firstName} {event.createdBy?.lastName}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <span style={{ fontSize: 11, fontFamily: 'var(--font-heading)', fontWeight: 700, color: event.isApproved ? 'var(--success)' : 'var(--warning)', background: event.isApproved ? 'rgba(34,197,94,0.1)' : 'rgba(245,158,11,0.1)', border: `1px solid ${event.isApproved ? 'rgba(34,197,94,0.3)' : 'rgba(245,158,11,0.3)'}`, borderRadius: 20, padding: '3px 10px' }}>
                  {event.isApproved ? '✓ Onaylı' : '⏳ Bekliyor'}
                </span>
                {!event.isApproved && (
                  <button onClick={() => handleApproveEvent(event._id)} className="btn btn-primary" style={{ padding: '6px 14px', fontSize: 13 }}>
                    <i className="fas fa-check" /> Onayla
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Announcements tab */}
      {tab === 'announcements' && (
        <div>
          <div className="card" style={{ padding: 24, marginBottom: 20 }}>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 16, marginBottom: 20, color: 'var(--accent-orange)' }}>
              <i className="fas fa-plus" style={{ marginRight: 8 }} />Yeni Duyuru Oluştur
            </h3>
            <form onSubmit={handleCreateAnn}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                <div style={{ gridColumn: 'span 2' }}>
                  <label style={{ display: 'block', fontFamily: 'var(--font-heading)', fontWeight: 600, marginBottom: 6, fontSize: 13, color: 'var(--text-secondary)' }}>Başlık *</label>
                  <input className="input" placeholder="Duyuru başlığı" value={newAnn.title} onChange={e => setNewAnn(a => ({ ...a, title: e.target.value }))} required />
                </div>
                <div>
                  <label style={{ display: 'block', fontFamily: 'var(--font-heading)', fontWeight: 600, marginBottom: 6, fontSize: 13, color: 'var(--text-secondary)' }}>Tip</label>
                  <select className="input" value={newAnn.type} onChange={e => setNewAnn(a => ({ ...a, type: e.target.value }))}>
                    <option value="info">Bilgi</option>
                    <option value="success">Başarılı</option>
                    <option value="warning">Uyarı</option>
                    <option value="danger">Tehlike</option>
                  </select>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', gap: 10 }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: 13 }}>
                    <input type="checkbox" checked={newAnn.isEmergency} onChange={e => setNewAnn(a => ({ ...a, isEmergency: e.target.checked }))} />
                    🚨 Acil Duyuru (Kırmızı Banner)
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: 13 }}>
                    <input type="checkbox" checked={newAnn.notify} onChange={e => setNewAnn(a => ({ ...a, notify: e.target.checked }))} />
                    🔔 Tüm üyelere bildirim gönder
                  </label>
                </div>
                <div style={{ gridColumn: 'span 2' }}>
                  <label style={{ display: 'block', fontFamily: 'var(--font-heading)', fontWeight: 600, marginBottom: 6, fontSize: 13, color: 'var(--text-secondary)' }}>İçerik *</label>
                  <textarea className="input" style={{ resize: 'none', minHeight: 80 }} placeholder="Duyuru içeriği..." value={newAnn.content} onChange={e => setNewAnn(a => ({ ...a, content: e.target.value }))} required />
                </div>
              </div>
              <button type="submit" className="btn btn-primary" disabled={savingAnn}>
                {savingAnn ? <><i className="fas fa-spinner fa-spin" /> Yayınlanıyor...</> : <><i className="fas fa-bullhorn" /> Duyuruyu Yayınla</>}
              </button>
            </form>
          </div>

          {/* Announcements list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {announcements.map(ann => (
              <div key={ann._id} className="card" style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, borderColor: ann.isEmergency ? 'rgba(229,53,53,0.4)' : 'var(--border)' }}>
                <div style={{ flex: 1 }}>
                  {ann.isEmergency && <div style={{ fontSize: 11, color: 'var(--danger)', fontFamily: 'var(--font-heading)', fontWeight: 700, marginBottom: 4 }}>🚨 ACİL DUYURU</div>}
                  <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 15, marginBottom: 4 }}>{ann.title}</div>
                  <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{ann.content}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6 }}>
                    {ann.createdAt && format(new Date(ann.createdAt), 'dd MMM yyyy, HH:mm', { locale: tr })}
                  </div>
                </div>
                <button onClick={() => handleDeleteAnn(ann._id)} style={{ padding: '6px 12px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 'var(--radius)', color: 'var(--danger)', cursor: 'pointer', flexShrink: 0 }}>
                  <i className="fas fa-trash" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
