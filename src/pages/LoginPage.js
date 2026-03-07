import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { login, clearError } from '../store/slices/authSlice';

export default function LoginPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector(s => s.auth);
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(clearError());
    const result = await dispatch(login(form));
    if (!result.error) navigate('/');
  };

  return (
    <div className="card animate-fade" style={{ padding: '32px' }}>
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 800, marginBottom: 8, letterSpacing: 1 }}>
        GİRİŞ YAP
      </h2>
      <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 28 }}>Hesabına giriş yap ve yola çık 🏍️</p>

      {error && (
        <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 'var(--radius)', padding: '12px 16px', marginBottom: 20, color: 'var(--danger)', fontSize: 14 }}>
          <i className="fas fa-exclamation-circle" style={{ marginRight: 8 }} />{error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', fontFamily: 'var(--font-heading)', fontWeight: 600, marginBottom: 8, fontSize: 14 }}>Email</label>
          <div style={{ position: 'relative' }}>
            <i className="fas fa-envelope" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: 14 }} />
            <input type="email" className="input" style={{ paddingLeft: 40 }}
              placeholder="email@example.com" value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })} required />
          </div>
        </div>

        <div style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <label style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: 14 }}>Şifre</label>
            <Link to="/forgot-password" style={{ color: 'var(--accent-orange)', fontSize: 13, textDecoration: 'none' }}>Şifremi Unuttum</Link>
          </div>
          <div style={{ position: 'relative' }}>
            <i className="fas fa-lock" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: 14 }} />
            <input type={showPass ? 'text' : 'password'} className="input" style={{ paddingLeft: 40, paddingRight: 44 }}
              placeholder="••••••••" value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })} required />
            <button type="button" onClick={() => setShowPass(!showPass)} style={{
              position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
              background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer'
            }}>
              <i className={`fas ${showPass ? 'fa-eye-slash' : 'fa-eye'}`} />
            </button>
          </div>
        </div>

        <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: 14, fontSize: 16 }} disabled={loading}>
          {loading ? <><i className="fas fa-spinner fa-spin" /> Giriş yapılıyor...</> : <><i className="fas fa-motorcycle" /> Giriş Yap</>}
        </button>
      </form>

      <div style={{ textAlign: 'center', marginTop: 24, color: 'var(--text-muted)', fontSize: 14 }}>
        Hesabın yok mu?{' '}
        <Link to="/register" style={{ color: 'var(--accent-orange)', textDecoration: 'none', fontWeight: 600 }}>Kayıt Ol</Link>
      </div>

      {/* Demo credentials */}
      <div style={{ marginTop: 20, padding: 16, background: 'var(--bg-secondary)', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
        <div style={{ fontSize: 12, fontFamily: 'var(--font-heading)', color: 'var(--text-muted)', marginBottom: 8 }}>DEMO HESAPLARI</div>
        {[
          { label: 'Admin', email: 'admin@motogrup.com', pass: 'Admin123!' },
          { label: 'Üye', email: 'ali@example.com', pass: 'User123!' },
        ].map(acc => (
          <div key={acc.label} onClick={() => setForm({ email: acc.email, password: acc.pass })}
            style={{ fontSize: 12, color: 'var(--text-secondary)', cursor: 'pointer', padding: '4px 0',
              display: 'flex', gap: 8, alignItems: 'center' }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--accent-orange)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}
          >
            <span className="badge badge-orange">{acc.label}</span>
            <span>{acc.email}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
