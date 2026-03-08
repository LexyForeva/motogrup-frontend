import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { addToast } from '../store/slices/uiSlice';
import { setUser } from '../store/slices/authSlice';
import api from '../utils/api';

export default function EditProfilePage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector(s => s.auth);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    nickname: '',
    bio: '',
    phone: '',
    bloodType: '',
    experienceLevel: '',
    interests: [],
    instagram: '',
    motorcycle: {
      brand: '',
      model: '',
      year: '',
      plate: '',
      type: ''
    },
    emergencyContact: {
      name: '',
      phone: '',
      relation: ''
    }
  });

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        nickname: user.nickname || '',
        bio: user.bio || '',
        phone: user.phone || '',
        bloodType: user.bloodType || '',
        experienceLevel: user.experienceLevel || '',
        interests: user.interests || [],
        instagram: user.instagram || '',
        motorcycle: user.motorcycle || { brand: '', model: '', year: '', plate: '', type: '' },
        emergencyContact: user.emergencyContact || { name: '', phone: '', relation: '' }
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: { ...prev[parent], [child]: value }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleInterestToggle = (interest) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.put('/users/profile', formData);
      dispatch(setUser(data.data));
      dispatch(addToast({ type: 'success', message: 'Profil güncellendi!' }));
      navigate('/profile/' + user._id);
    } catch (err) {
      dispatch(addToast({ type: 'error', message: err.response?.data?.message || 'Güncelleme başarısız.' }));
    }
    setLoading(false);
  };

  const interestOptions = ['Tur', 'Yarış', 'Off-road', 'Cruise', 'Modifikasyon', 'Fotoğrafçılık'];
  const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', '0+', '0-'];
  const experienceLevels = ['Başlangıç', 'Orta', 'İleri', 'Uzman'];
  const motorcycleTypes = ['Naked', 'Sport', 'Cruiser', 'Adventure', 'Touring', 'Off-road', 'Scooter'];

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }} className="animate-fade">
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 900, letterSpacing: 2 }}>
          PROFİL <span style={{ color: 'var(--accent-orange)' }}>DÜZENLE</span>
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Bilgilerini güncelle</p>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Kişisel Bilgiler */}
        <div className="card" style={{ padding: 20, marginBottom: 16 }}>
          <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, marginBottom: 16, color: 'var(--accent-orange)' }}>
            <i className="fas fa-user" style={{ marginRight: 8 }} />
            Kişisel Bilgiler
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label className="label">Ad</label>
              <input className="input" name="firstName" value={formData.firstName} onChange={handleChange} required />
            </div>
            <div>
              <label className="label">Soyad</label>
              <input className="input" name="lastName" value={formData.lastName} onChange={handleChange} required />
            </div>
          </div>
          <div style={{ marginTop: 12 }}>
            <label className="label">Takma Ad</label>
            <input className="input" name="nickname" value={formData.nickname} onChange={handleChange} placeholder="Örn: TURBO" />
          </div>
          <div style={{ marginTop: 12 }}>
            <label className="label">Biyografi</label>
            <textarea className="input" name="bio" value={formData.bio} onChange={handleChange} rows={3} placeholder="Kendinden bahset..." style={{ resize: 'none' }} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 12 }}>
            <div>
              <label className="label">Telefon</label>
              <input className="input" name="phone" value={formData.phone} onChange={handleChange} placeholder="0532 123 4567" />
            </div>
            <div>
              <label className="label">Kan Grubu</label>
              <select className="input" name="bloodType" value={formData.bloodType} onChange={handleChange}>
                <option value="">Seç</option>
                {bloodTypes.map(bt => <option key={bt} value={bt}>{bt}</option>)}
              </select>
            </div>
          </div>
          <div style={{ marginTop: 12 }}>
            <label className="label">Instagram</label>
            <input className="input" name="instagram" value={formData.instagram} onChange={handleChange} placeholder="@kullaniciadi" />
          </div>
        </div>

        {/* Motor Bilgileri */}
        <div className="card" style={{ padding: 20, marginBottom: 16 }}>
          <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, marginBottom: 16, color: 'var(--accent-orange)' }}>
            <i className="fas fa-motorcycle" style={{ marginRight: 8 }} />
            Motor Bilgileri
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label className="label">Marka</label>
              <input className="input" name="motorcycle.brand" value={formData.motorcycle.brand} onChange={handleChange} placeholder="Örn: Yamaha" />
            </div>
            <div>
              <label className="label">Model</label>
              <input className="input" name="motorcycle.model" value={formData.motorcycle.model} onChange={handleChange} placeholder="Örn: MT-07" />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginTop: 12 }}>
            <div>
              <label className="label">Yıl</label>
              <input className="input" type="number" name="motorcycle.year" value={formData.motorcycle.year} onChange={handleChange} placeholder="2023" />
            </div>
            <div>
              <label className="label">Plaka</label>
              <input className="input" name="motorcycle.plate" value={formData.motorcycle.plate} onChange={handleChange} placeholder="34 ABC 123" />
            </div>
            <div>
              <label className="label">Tip</label>
              <select className="input" name="motorcycle.type" value={formData.motorcycle.type} onChange={handleChange}>
                <option value="">Seç</option>
                {motorcycleTypes.map(mt => <option key={mt} value={mt}>{mt}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Deneyim ve İlgi Alanları */}
        <div className="card" style={{ padding: 20, marginBottom: 16 }}>
          <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, marginBottom: 16, color: 'var(--accent-orange)' }}>
            <i className="fas fa-star" style={{ marginRight: 8 }} />
            Deneyim ve İlgi Alanları
          </h3>
          <div>
            <label className="label">Deneyim Seviyesi</label>
            <select className="input" name="experienceLevel" value={formData.experienceLevel} onChange={handleChange}>
              <option value="">Seç</option>
              {experienceLevels.map(el => <option key={el} value={el}>{el}</option>)}
            </select>
          </div>
          <div style={{ marginTop: 12 }}>
            <label className="label">İlgi Alanları</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
              {interestOptions.map(interest => (
                <button
                  key={interest}
                  type="button"
                  onClick={() => handleInterestToggle(interest)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: 'var(--radius)',
                    border: 'none',
                    background: formData.interests.includes(interest) ? 'var(--gradient-orange)' : 'var(--bg-secondary)',
                    color: formData.interests.includes(interest) ? 'white' : 'var(--text-secondary)',
                    cursor: 'pointer',
                    fontFamily: 'var(--font-heading)',
                    fontWeight: 600,
                    fontSize: 13,
                    transition: 'all 0.2s'
                  }}
                >
                  {interest}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Acil Durum İletişim */}
        <div className="card" style={{ padding: 20, marginBottom: 16 }}>
          <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, marginBottom: 16, color: 'var(--danger)' }}>
            <i className="fas fa-phone-alt" style={{ marginRight: 8 }} />
            Acil Durum İletişim
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label className="label">İsim</label>
              <input className="input" name="emergencyContact.name" value={formData.emergencyContact.name} onChange={handleChange} placeholder="Yakınınızın adı" />
            </div>
            <div>
              <label className="label">Yakınlık</label>
              <input className="input" name="emergencyContact.relation" value={formData.emergencyContact.relation} onChange={handleChange} placeholder="Örn: Eş, Anne, Kardeş" />
            </div>
          </div>
          <div style={{ marginTop: 12 }}>
            <label className="label">Telefon</label>
            <input className="input" name="emergencyContact.phone" value={formData.emergencyContact.phone} onChange={handleChange} placeholder="0532 123 4567" />
          </div>
        </div>

        {/* Butonlar */}
        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
          <button type="button" onClick={() => navigate('/profile/' + user._id)} className="btn" style={{ background: 'var(--bg-secondary)', color: 'var(--text-secondary)' }}>
            İptal
          </button>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? <><i className="fas fa-spinner fa-spin" /> Kaydediliyor...</> : <><i className="fas fa-save" /> Kaydet</>}
          </button>
        </div>
      </form>
    </div>
  );
}
