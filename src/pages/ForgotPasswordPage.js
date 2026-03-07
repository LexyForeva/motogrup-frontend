import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.post('/auth/forgot-password', { email });
      setSent(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card animate-fade" style={{ padding: '32px' }}>
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 800, marginBottom: 8 }}>ŞİFRE SIFIRLA</h2>
      <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 28 }}>Email adresinize sıfırlama bağlantısı göndereceğiz.</p>

      {sent ? (
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📧</div>
          <div style={{ fontFamily: 'var(--font-heading)', fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Email Gönderildi!</div>
          <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 20 }}>Şifre sıfırlama bağlantısı <strong>{email}</strong> adresine gönderildi.</p>
          <Link to="/login" className="btn btn-primary" style={{ textDecoration: 'none' }}>Giriş Sayfasına Dön</Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          {error && <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 'var(--radius)', padding: '12px 16px', marginBottom: 20, color: 'var(--danger)', fontSize: 14 }}>{error}</div>}
          <div style={{ marginBottom: 24 }}>
            <label style={{ display: 'block', fontFamily: 'var(--font-heading)', fontWeight: 600, marginBottom: 8 }}>Email Adresi</label>
            <input type="email" className="input" placeholder="email@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: 14 }} disabled={loading}>
            {loading ? <><i className="fas fa-spinner fa-spin" /> Gönderiliyor...</> : <><i className="fas fa-paper-plane" /> Sıfırlama Bağlantısı Gönder</>}
          </button>
        </form>
      )}

      <div style={{ textAlign: 'center', marginTop: 20 }}>
        <Link to="/login" style={{ color: 'var(--text-muted)', fontSize: 14, textDecoration: 'none' }}>
          <i className="fas fa-arrow-left" style={{ marginRight: 6 }} />Giriş Sayfasına Dön
        </Link>
      </div>
    </div>
  );
}
