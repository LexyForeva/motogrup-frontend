import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setNotifications, markAllRead } from '../store/slices/notificationSlice';
import { addToast } from '../store/slices/uiSlice';
import api from '../utils/api';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

const TYPE_ICONS = {
  new_event: { icon: 'fa-calendar-plus', color: 'var(--accent-orange)' },
  event_reminder: { icon: 'fa-bell', color: 'var(--warning)' },
  emergency: { icon: 'fa-exclamation-triangle', color: 'var(--danger)' },
  like: { icon: 'fa-heart', color: '#EF4444' },
  comment: { icon: 'fa-comment', color: 'var(--info)' },
  follow: { icon: 'fa-user-plus', color: 'var(--success)' },
  badge: { icon: 'fa-trophy', color: 'var(--warning)' },
  maintenance: { icon: 'fa-wrench', color: '#8B5CF6' },
  announcement: { icon: 'fa-bullhorn', color: 'var(--accent-orange)' },
};

export default function NotificationsPage() {
  const dispatch = useDispatch();
  const { items, unreadCount } = useSelector(s => s.notifications);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/notifications?limit=50').then(({ data }) => {
      dispatch(setNotifications(data));
      setLoading(false);
    });
  }, [dispatch]);

  const handleMarkAllRead = async () => {
    await api.put('/notifications/read-all');
    dispatch(markAllRead());
    dispatch(addToast({ type: 'success', message: 'Tüm bildirimler okundu olarak işaretlendi.' }));
  };

  return (
    <div className="animate-fade" style={{ maxWidth: 700, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 900, letterSpacing: 2 }}>
            BİLDİRİM<span style={{ color: 'var(--accent-orange)' }}>LER</span>
          </h1>
          {unreadCount > 0 && <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>{unreadCount} okunmamış bildirim</p>}
        </div>
        {unreadCount > 0 && (
          <button onClick={handleMarkAllRead} className="btn btn-ghost" style={{ fontSize: 14 }}>
            <i className="fas fa-check-double" /> Tümünü Oku
          </button>
        )}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}><i className="fas fa-spinner fa-spin" style={{ fontSize: 24 }} /></div>
      ) : items.length === 0 ? (
        <div className="card" style={{ padding: 60, textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🔔</div>
          <div style={{ fontFamily: 'var(--font-heading)', fontSize: 20, fontWeight: 700 }}>Bildirim yok</div>
          <p style={{ color: 'var(--text-muted)', marginTop: 8 }}>Yeni bildirimleri burada göreceksiniz.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {items.map(notif => {
            const meta = TYPE_ICONS[notif.type] || TYPE_ICONS.announcement;
            return (
              <div key={notif._id} className="card" style={{
                padding: '14px 18px', display: 'flex', gap: 14, alignItems: 'flex-start',
                background: notif.isRead ? 'var(--bg-card)' : 'rgba(255,107,0,0.05)',
                borderColor: notif.isRead ? 'var(--border)' : 'rgba(255,107,0,0.2)'
              }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: `${meta.color}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <i className={`fas ${meta.icon}`} style={{ color: meta.color, fontSize: 16 }} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 14, marginBottom: 2 }}>{notif.title}</div>
                  {notif.message && <div style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5 }}>{notif.message}</div>}
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6 }}>
                    {format(new Date(notif.createdAt), 'dd MMM yyyy, HH:mm', { locale: tr })}
                  </div>
                </div>
                {!notif.isRead && (
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent-orange)', flexShrink: 0, marginTop: 4 }} />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
