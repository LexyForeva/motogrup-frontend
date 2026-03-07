import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { register, clearError } from '../store/slices/authSlice';

export default function RegisterPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector(s => s.auth);
  const [form, setForm] = useState({ firstName: '', lastName: '', nickname: '', email: '', password: '', confirmPassword: '' });
  const [showPass, setShowPass] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) return;
    dispatch(clearError());
    const { confirmPassword, ...data } = form;
    const result = await dispatch(register(data));
    if (!result.error) navigate('/');
  };

  return (
    <div className="card animate-fade" style={{ padding: '32px' }}>
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 800, marginBottom: 8, letterSpacing: 1 }}>KAYIT OL</h2>
      <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 28 }}>MotoGrup ailesine katıl! 🔥</p>

      {error && (
        <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 'var(--radius)', padding: '12px 16px', marginBottom: 20, color: 'var(--danger)', fontSize: 14 }}>
          <i className="fas fa-exclamation-circle" style={{ marginRight: 8 }} />{error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
          <div>
            <label style={{ display: 'block', fontFamily: 'var(--font-heading)', fontWeight: 600, marginBottom: 6, fontSize: 13 }}>Ad *</label>
            <input className="input" placeholder="Adınız" value={form.firstName}
              onChange={e => setForm({ ...form, firstName: e.target.value })} required />
          </div>
          <div>
            <label style={{ display: 'block', fontFamily: 'var(--font-heading)', fontWeight: 600, marginBottom: 6, fontSize: 13 }}>Soyad *</label>
            <input className="input" placeholder="Soyadınız" value={form.lastName}
              onChange={e => setForm({ ...form, lastName: e.target.value })} required />
          </div>
        </div>

        <div style={{ marginBottom: 12 }}>
          <label style={{ display: 'block', fontFamily: 'var(--font-heading)', fontWeight: 600, marginBottom: 6, fontSize: 13 }}>Takma Ad</label>
          <input className="input" placeholder="TURBO, EAGLE, THUNDER..." value={form.nickname}
            onChange={e => setForm({ ...form, nickname: e.target.value.toUpperCase() })} />
        </div>

        <div style={{ marginBottom: 12 }}>
          <label style={{ display: 'block', fontFamily: 'var(--font-heading)', fontWeight: 600, marginBottom: 6, fontSize: 13 }}>Email *</label>
          <input type="email" className="input" placeholder="email@example.com" value={form.email}
            onChange={e => setForm({ ...form, email: e.target.value })} required />
        </div>

        <div style={{ marginBottom: 12 }}>
          <label style={{ display: 'block', fontFamily: 'var(--font-heading)', fontWeight: 600, marginBottom: 6, fontSize: 13 }}>Şifre *</label>
          <div style={{ position: 'relative' }}>
            <input type={showPass ? 'text' : 'password'} className="input" style={{ paddingRight: 44 }}
              placeholder="En az 6 karakter" value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })} required minLength={6} />
            <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
              <i className={`fas ${showPass ? 'fa-eye-slash' : 'fa-eye'}`} />
            </button>
          </div>
        </div>

        <div style={{ marginBottom: 24 }}>
          <label style={{ display: 'block', fontFamily: 'var(--font-heading)', fontWeight: 600, marginBottom: 6, fontSize: 13 }}>Şifre Tekrar *</label>
          <input type="password" className="input" placeholder="••••••••" value={form.confirmPassword}
            onChange={e => setForm({ ...form, confirmPassword: e.target.value })} required />
          {form.confirmPassword && form.password !== form.confirmPassword && (
            <p style={{ color: 'var(--danger)', fontSize: 12, marginTop: 4 }}>Şifreler eşleşmiyor</p>
          )}
        </div>

        <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: 14, fontSize: 16 }} disabled={loading || form.password !== form.confirmPassword}>
          {loading ? <><i className="fas fa-spinner fa-spin" /> Kayıt yapılıyor...</> : <><i className="fas fa-user-plus" /> Kayıt Ol</>}
        </button>
      </form>

      <div style={{ textAlign: 'center', marginTop: 24, color: 'var(--text-muted)', fontSize: 14 }}>
        Zaten hesabın var mı?{' '}
        <Link to="/login" style={{ color: 'var(--accent-orange)', textDecoration: 'none', fontWeight: 600 }}>Giriş Yap</Link>
      </div>
    </div>
  );
}
