import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { updateProfile } from '../store/slices/authSlice';
import { addToast } from '../store/slices/uiSlice';

const INTERESTS = ['Tur', 'Yarış', 'Off-road', 'Cruise', 'Bakım', 'Modifikasyon'];
const MOTO_TYPES = ['Cruiser', 'Sport', 'Touring', 'Enduro', 'Scooter', 'Naked', 'Adventure', 'Chopper', 'Diğer'];
const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', '0+', '0-'];
const EXP_LEVELS = ['Başlangıç', 'Orta', 'İleri', 'Uzman'];

const Section = ({ title, icon, children }) => (
  <div className="card" style={{ padding: 24, marginBottom: 20 }}>
    <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 18, marginBottom: 20, color: 'var(--accent-orange)', display: 'flex', alignItems: 'center', gap: 10 }}>
      <i className={`fas ${icon}`} />{title}
    </div>
    {children}
  </div>
);

const Field = ({ label, children, half }) => (
  <div style={{ marginBottom: 16, gridColumn: half ? 'span 1' : undefined }}>
    <label style={{ display: 'block', fontFamily: 'var(--font-heading)', fontWeight: 600, marginBottom: 8, fontSize: 13, color: 'var(--text-secondary)' }}>{label}</label>
    {children}
  </div>
);

export default function EditProfilePage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector(s => s.auth);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    firstName: '', lastName: '', nickname: '', bio: '',
    birthDate: '', phone: '', bloodType: '',
    motorcycle: { brand: '', model: '', plate: '', year: '', type: '' },
    experienceLevel: '',
    interests: [],
    instagram: '',
    emergencyContact: { name: '', phone: '', relation: '' },
  });

  useEffect(() => {
    if (user) {
      setForm({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        nickname: user.nickname || '',
        bio: user.bio || '',
        birthDate: user.birthDate ? user.birthDate.split('T')[0] : '',
        phone: user.phone || '',
        bloodType: user.bloodType || '',
        motorcycle: { brand: user.motorcycle?.brand || '', model: user.motorcycle?.model || '', plate: user.motorcycle?.plate || '', year: user.motorcycle?.year || '', type: user.motorcycle?.type || '' },
        experienceLevel: user.experienceLevel || '',
        interests: user.interests || [],
        instagram: user.instagram || '',
        emergencyContact: { name: user.emergencyContact?.name || '', phone: user.emergencyContact?.phone || '', relation: user.emergencyContact?.relation || '' },
      });
    }
  }, [user]);

  const set = (key, value) => setForm(f => ({ ...f, [key]: value }));
  const setMoto = (key, value) => setForm(f => ({ ...f, motorcycle: { ...f.motorcycle, [key]: value } }));
  const setEmergency = (key, value) => setForm(f => ({ ...f, emergencyContact: { ...f.emergencyContact, [key]: value } }));
  const toggleInterest = (interest) => setForm(f => ({
    ...f,
    interests: f.interests.includes(interest) ? f.interests.filter(i => i !== interest) : [...f.interests, interest]
  }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const result = await dispatch(updateProfile(form));
    if (!result.error) {
      dispatch(addToast({ type: 'success', title: 'Kaydedildi!', message: 'Profil başarıyla güncellendi.' }));
      navigate('/profile');
    } else {
      dispatch(addToast({ type: 'error', message: 'Güncelleme başarısız.' }));
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="animate-fade">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 900, letterSpacing: 2 }}>
            PROFİL <span style={{ color: 'var(--accent-orange)' }}>DÜZENLE</span>
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Bilgilerini güncel tut</p>
        </div>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? <><i className="fas fa-spinner fa-spin" /> Kaydediliyor...</> : <><i className="fas fa-save" /> Kaydet</>}
        </button>
      </div>

      <Section title="Temel Bilgiler" icon="fa-user">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <Field label="Ad *"><input className="input" value={form.firstName} onChange={e => set('firstName', e.target.value)} required /></Field>
          <Field label="Soyad *"><input className="input" value={form.lastName} onChange={e => set('lastName', e.target.value)} required /></Field>
          <Field label="Takma Ad">
            <input className="input" value={form.nickname} onChange={e => set('nickname', e.target.value.toUpperCase())} placeholder="TURBO" />
          </Field>
          <Field label="Instagram">
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: 14 }}>@</span>
              <input className="input" style={{ paddingLeft: 32 }} value={form.instagram} onChange={e => set('instagram', e.target.value)} placeholder="kullanici_adi" />
            </div>
          </Field>
        </div>
        <Field label="Hakkında">
          <textarea className="input" style={{ resize: 'none', minHeight: 80 }} value={form.bio} onChange={e => set('bio', e.target.value)} placeholder="Kendinden kısaca bahset..." maxLength={300} />
          <div style={{ textAlign: 'right', fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>{form.bio.length}/300</div>
        </Field>
      </Section>

      <Section title="Kişisel Bilgiler" icon="fa-id-card">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          <Field label="Doğum Tarihi"><input type="date" className="input" value={form.birthDate} onChange={e => set('birthDate', e.target.value)} /></Field>
          <Field label="Telefon"><input className="input" value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="0532 xxx xxxx" /></Field>
          <Field label="Kan Grubu">
            <select className="input" value={form.bloodType} onChange={e => set('bloodType', e.target.value)}>
              <option value="">Seçin...</option>
              {BLOOD_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </Field>
        </div>
      </Section>

      <Section title="Motor Bilgileri" icon="fa-motorcycle">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
          <Field label="Marka"><input className="input" value={form.motorcycle.brand} onChange={e => setMoto('brand', e.target.value)} placeholder="Honda, Kawasaki..." /></Field>
          <Field label="Model"><input className="input" value={form.motorcycle.model} onChange={e => setMoto('model', e.target.value)} placeholder="CB650R, Z900..." /></Field>
          <Field label="Plaka"><input className="input" value={form.motorcycle.plate} onChange={e => setMoto('plate', e.target.value)} placeholder="34 ABC 123" /></Field>
          <Field label="Model Yılı"><input type="number" className="input" value={form.motorcycle.year} onChange={e => setMoto('year', e.target.value)} placeholder="2023" min="1950" max="2030" /></Field>
          <div style={{ gridColumn: 'span 2' }}>
            <Field label="Motor Tipi">
              <select className="input" value={form.motorcycle.type} onChange={e => setMoto('type', e.target.value)}>
                <option value="">Seçin...</option>
                {MOTO_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </Field>
          </div>
        </div>
      </Section>

      <Section title="Deneyim & İlgi Alanları" icon="fa-star">
        <Field label="Deneyim Seviyesi">
          <div style={{ display: 'flex', gap: 10 }}>
            {EXP_LEVELS.map(level => (
              <button key={level} type="button" onClick={() => set('experienceLevel', level)}
                style={{
                  flex: 1, padding: '10px 12px', borderRadius: 'var(--radius)', border: 'none', cursor: 'pointer',
                  background: form.experienceLevel === level ? 'var(--gradient-orange)' : 'var(--bg-secondary)',
                  color: form.experienceLevel === level ? 'white' : 'var(--text-secondary)',
                  fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: 13, transition: 'all 0.2s'
                }}>
                {level}
              </button>
            ))}
          </div>
        </Field>
        <Field label="İlgi Alanları">
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {INTERESTS.map(interest => (
              <button key={interest} type="button" onClick={() => toggleInterest(interest)}
                style={{
                  padding: '8px 16px', borderRadius: 20, border: `1px solid ${form.interests.includes(interest) ? 'var(--accent-orange)' : 'var(--border)'}`,
                  background: form.interests.includes(interest) ? 'rgba(255,107,0,0.15)' : 'transparent',
                  color: form.interests.includes(interest) ? 'var(--accent-orange)' : 'var(--text-secondary)',
                  cursor: 'pointer', fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: 14, transition: 'all 0.2s'
                }}>
                {interest}
              </button>
            ))}
          </div>
        </Field>
      </Section>

      <Section title="Acil Durum İletişimi" icon="fa-phone-alt">
        <div style={{ background: 'rgba(229,53,53,0.05)', border: '1px solid rgba(229,53,53,0.2)', borderRadius: 'var(--radius)', padding: 16, marginBottom: 16 }}>
          <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>⚠️ Bu bilgiler sadece acil durumlarda kullanılır.</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          <Field label="Kişi Adı"><input className="input" value={form.emergencyContact.name} onChange={e => setEmergency('name', e.target.value)} placeholder="Ahmet Yılmaz" /></Field>
          <Field label="Telefon"><input className="input" value={form.emergencyContact.phone} onChange={e => setEmergency('phone', e.target.value)} placeholder="0532 xxx xxxx" /></Field>
          <Field label="Yakınlık"><input className="input" value={form.emergencyContact.relation} onChange={e => setEmergency('relation', e.target.value)} placeholder="Eş, Anne, Baba..." /></Field>
        </div>
      </Section>

      <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
        <button type="button" onClick={() => navigate('/profile')} className="btn btn-ghost">İptal</button>
        <button type="submit" className="btn btn-primary" disabled={loading} style={{ padding: '12px 32px' }}>
          {loading ? <><i className="fas fa-spinner fa-spin" /> Kaydediliyor...</> : <><i className="fas fa-save" /> Değişiklikleri Kaydet</>}
        </button>
      </div>
    </form>
  );
}
