import React, { useEffect } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../store/slices/authSlice';
import { toggleSidebar } from '../../store/slices/uiSlice';
import { setNotifications } from '../../store/slices/notificationSlice';
import api from '../../utils/api';

const NAV_ITEMS = [
  { to: '/', icon: 'fa-home', label: 'Ana Sayfa', exact: true },
  { to: '/events', icon: 'fa-calendar-alt', label: 'Etkinlikler' },
  { to: '/academy', icon: 'fa-graduation-cap', label: 'Akademi' },
  { to: '/members', icon: 'fa-users', label: 'Üyeler' },
  { to: '/maintenance', icon: 'fa-wrench', label: 'Bakım' },
  { to: '/riding', icon: 'fa-route', label: 'Sürüş Geçmişi' },
  { to: '/badges', icon: 'fa-trophy', label: 'Rozetler' },
  { to: '/member-card', icon: 'fa-id-card', label: 'Üye Kartım' },
];

export default function Layout() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector(s => s.auth);
  const { sidebarOpen } = useSelector(s => s.ui);
  const { unreadCount } = useSelector(s => s.notifications);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const { data } = await api.get('/notifications?limit=5');
        dispatch(setNotifications(data));
      } catch {}
    };
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [dispatch]);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <aside style={{
        width: sidebarOpen ? 260 : 70,
        background: 'var(--bg-secondary)',
        borderRight: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        top: 0, left: 0, bottom: 0,
        zIndex: 100,
        transition: 'width 0.3s ease',
        overflow: 'hidden'
      }}>
        {/* Logo */}
        <div style={{ padding: '20px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 12, minHeight: 70 }}>
          <div style={{
            width: 38, height: 38, background: 'var(--gradient-orange)',
            borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 18, flexShrink: 0
          }}>🏍️</div>
          {sidebarOpen && (
            <div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 900, letterSpacing: 2, color: 'var(--accent-orange)' }}>MOTO</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 600, color: 'var(--text-secondary)', marginTop: -4 }}>GRUP</div>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '12px 8px', overflowY: 'auto' }}>
          {NAV_ITEMS.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.exact}
              style={({ isActive }) => ({
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '12px 12px',
                borderRadius: 'var(--radius)',
                color: isActive ? 'var(--accent-orange)' : 'var(--text-secondary)',
                background: isActive ? 'rgba(255,107,0,0.1)' : 'transparent',
                textDecoration: 'none',
                fontFamily: 'var(--font-heading)',
                fontWeight: 600,
                fontSize: 15,
                marginBottom: 2,
                transition: 'all 0.2s',
                borderLeft: isActive ? '3px solid var(--accent-orange)' : '3px solid transparent',
                whiteSpace: 'nowrap',
                overflow: 'hidden'
              })}
            >
              <i className={`fas ${item.icon}`} style={{ width: 20, textAlign: 'center', fontSize: 16, flexShrink: 0 }} />
              {sidebarOpen && item.label}
            </NavLink>
          ))}

          {['admin', 'moderator'].includes(user?.role) && (
            <NavLink to="/admin"
              style={({ isActive }) => ({
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '12px 12px', borderRadius: 'var(--radius)',
                color: isActive ? '#F59E0B' : 'var(--text-secondary)',
                background: isActive ? 'rgba(245,158,11,0.1)' : 'transparent',
                textDecoration: 'none', fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: 15,
                marginBottom: 2, transition: 'all 0.2s',
                borderLeft: isActive ? '3px solid #F59E0B' : '3px solid transparent',
                whiteSpace: 'nowrap', overflow: 'hidden', marginTop: 8
              })}
            >
              <i className="fas fa-crown" style={{ width: 20, textAlign: 'center', fontSize: 16, flexShrink: 0 }} />
              {sidebarOpen && 'Yönetim Paneli'}
            </NavLink>
          )}
        </nav>

        {/* User info */}
        <div style={{ padding: '12px 8px', borderTop: '1px solid var(--border)' }}>
          <NavLink to="/profile" style={{
            display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px',
            borderRadius: 'var(--radius)', textDecoration: 'none',
            background: 'var(--bg-card)', marginBottom: 8, overflow: 'hidden'
          }}>
            <div style={{
              width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
              background: 'var(--gradient-orange)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 14, fontWeight: 700, color: 'white', fontFamily: 'var(--font-heading)'
            }}>
              {user?.avatar ? (
                <img src={user.avatar} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
              ) : (
                `${user?.firstName?.[0]}${user?.lastName?.[0]}`
              )}
            </div>
            {sidebarOpen && (
              <div style={{ overflow: 'hidden' }}>
                <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 14, color: 'var(--text-primary)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                  {user?.nickname || user?.firstName}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{user?.memberNumber}</div>
              </div>
            )}
          </NavLink>
          <button onClick={handleLogout} style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px',
            borderRadius: 'var(--radius)', background: 'transparent', border: 'none',
            color: 'var(--text-muted)', cursor: 'pointer', fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: 14,
            transition: 'all 0.2s', whiteSpace: 'nowrap', overflow: 'hidden'
          }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--danger)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
          >
            <i className="fas fa-sign-out-alt" style={{ width: 20, textAlign: 'center', flexShrink: 0 }} />
            {sidebarOpen && 'Çıkış Yap'}
          </button>
        </div>
      </aside>

      {/* Main */}
      <div style={{ flex: 1, marginLeft: sidebarOpen ? 260 : 70, transition: 'margin-left 0.3s ease', display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        {/* Topbar */}
        <header style={{
          height: 64, background: 'var(--bg-secondary)',
          borderBottom: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 24px', position: 'sticky', top: 0, zIndex: 99
        }}>
          <button onClick={() => dispatch(toggleSidebar())} style={{
            background: 'none', border: 'none', color: 'var(--text-secondary)',
            cursor: 'pointer', fontSize: 18, padding: 8, borderRadius: 8,
            transition: 'color 0.2s'
          }}>
            <i className="fas fa-bars" />
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <NavLink to="/notifications" style={{ position: 'relative', color: 'var(--text-secondary)', textDecoration: 'none', padding: 8 }}>
              <i className="fas fa-bell" style={{ fontSize: 18 }} />
              {unreadCount > 0 && (
                <span style={{
                  position: 'absolute', top: 4, right: 4,
                  background: 'var(--accent-orange)', color: 'white',
                  borderRadius: '50%', width: 18, height: 18,
                  fontSize: 10, fontWeight: 700,
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>{unreadCount > 9 ? '9+' : unreadCount}</span>
              )}
            </NavLink>

            <NavLink to="/profile/edit" style={{ color: 'var(--text-secondary)', textDecoration: 'none', padding: 8 }}>
              <i className="fas fa-cog" style={{ fontSize: 18 }} />
            </NavLink>
          </div>
        </header>

        {/* Content */}
        <main style={{ flex: 1, padding: '24px', maxWidth: 1200, width: '100%', margin: '0 auto' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
