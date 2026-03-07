import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { addToast } from '../store/slices/uiSlice';
import api from '../utils/api';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

const TYPES = ['Yağ Değişimi', 'Genel Bakım', 'Lastik Bakımı', 'Parça Değişimi', 'Temizlik', 'Diğer'];
const TYPE_ICONS = {
  'Yağ Değişimi': 'fa-oil-can',
  'Genel Bakım': 'fa-wrench',
  'Lastik Bakımı': 'fa-circle-notch',
  'Parça Değişimi': 'fa-cogs',
  'Temizlik': 'fa-soap',
  'Diğer': 'fa-tools'
};
const TYPE_COLORS = {
  'Yağ Değişimi': '#F59E0B',
  'Genel Bakım': '#3B82F6',
  'Lastik Bakımı': '#22C55E',
  'Parça Değişimi': '#8B5CF6',
  'Temizlik': '#06B6D4',
  'Diğer': '#6B7280'
};

const emptyForm = { type: 'Yağ Değişimi', description: '', date: new Date().toISOString().split('T')[0], km: '', nextKm: '', cost: '', shop: '', notes: '' };

export default function MaintenancePage() {
  const dispatch = useDispatch();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    api.get('/maintenance').then(({ data }) => { setRecords(data.data || []); setLoading(false); });
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editId) {
        const { data } = await api.put(`/maintenance/${editId}`, form);
        setRecords(prev => prev.map(r => r._id === editId ? data.data : r));
        dispatch(addToast({ type: 'success', message: 'Bakım kaydı güncellendi.' }));
      } else {
        const { data } = await api.post('/maintenance', form);
        setRecords(prev => [data.data, ...prev]);
        dispatch(addToast({ type: 'success', message: 'Bakım kaydı eklendi.' }));
      }
      setShowForm(false);
      setForm(emptyForm);
      setEditId(null);
    } catch {
      dispatch(addToast({ type: 'error', message: 'Kayıt başarısız.' }));
    }
    setSaving(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bu bakım kaydını silmek istediğinizden emin misiniz?')) return;
    await api.delete(`/maintenance/${id}`);
    setRecords(prev => prev.filter(r => r._id !== id));
    dispatch(addToast({ type: 'success', message: 'Kayıt silindi.' }));
  };

  const handleEdit = (record) => {
    setForm({ ...record, date: record.date?.split('T')[0] || '' });
    setEditId(record._id);
    setShowForm(true);
  };

  const totalCost = records.reduce((sum, r) => sum + (r.cost || 0), 0);

  return (
    <div className="animate-fade">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 900, letterSpacing: 2 }}>
            BAKIM <span style={{ color: 'var(--accent-orange)' }}>TAKİBİ</span>
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Motorunuzun bakım geçmişini takip edin</p>
        </div>
        <button onClick={() => { setShowForm(true); setEditId(null); setForm(emptyForm); }} className="btn btn-primary">
          <i className="fas fa-plus" /> Bakım Ekle
        </button>
      </div>

      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 24 }}>
        {[
          { icon: 'fa-clipboard-list', label: 'Toplam Kayıt', value: records.length, color: 'var(--accent-orange)' },
          { icon: 'fa-lira-sign', label: 'Toplam Maliyet', value: `₺${totalCost.toLocaleString()}`, color: 'var(--success)' },
          { icon: 'fa-oil-can', label: 'Yağ Değişimi', value: records.filter(r => r.type === 'Yağ Değişimi').length, color: '#F59E0B' },
          { icon: 'fa-calendar-check', label: 'Bu Yıl', value: records.filter(r => new Date(r.date).getFullYear() === new Date().getFullYear()).length, color: 'var(--info)' },
        ].map(stat => (
          <div key={stat.label} className="card" style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 44, height: 44, background: `rgba(255,255,255,0.05)`, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <i className={`fas ${stat.icon}`} style={{ color: stat.color, fontSize: 18 }} />
            </div>
            <div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 900, color: stat.color, lineHeight: 1 }}>{stat.value}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'var(--font-heading)', marginTop: 2 }}>{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div className="card" style={{ padding: 24, marginBottom: 24 }}>
          <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 18, marginBottom: 20, color: 'var(--accent-orange)' }}>
            <i className="fas fa-wrench" style={{ marginRight: 8 }} />
            {editId ? 'Bakım Kaydını Düzenle' : 'Yeni Bakım Kaydı'}
          </h3>
          <form onSubmit={handleSave}>
            {/* Type selector */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontFamily: 'var(--font-heading)', fontWeight: 600, marginBottom: 10, fontSize: 13, color: 'var(--text-secondary)' }}>Bakım Türü</label>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {TYPES.map(type => (
                  <button key={type} type="button" onClick={() => setForm(f => ({ ...f, type }))}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px',
                      borderRadius: 'var(--radius)', border: `1px solid ${form.type === type ? TYPE_COLORS[type] : 'var(--border)'}`,
                      background: form.type === type ? `${TYPE_COLORS[type]}22` : 'transparent',
                      color: form.type === type ? TYPE_COLORS[type] : 'var(--text-secondary)',
                      cursor: 'pointer', fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: 13, transition: 'all 0.2s'
                    }}>
                    <i className={`fas ${TYPE_ICONS[type]}`} />{type}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 16 }}>
              <div>
                <label style={{ display: 'block', fontFamily: 'var(--font-heading)', fontWeight: 600, marginBottom: 6, fontSize: 13, color: 'var(--text-secondary)' }}>Tarih *</label>
                <input type="date" className="input" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} required />
              </div>
              <div>
                <label style={{ display: 'block', fontFamily: 'var(--font-heading)', fontWeight: 600, marginBottom: 6, fontSize: 13, color: 'var(--text-secondary)' }}>Şu Anki KM</label>
                <input type="number" className="input" placeholder="15000" value={form.km} onChange={e => setForm(f => ({ ...f, km: e.target.value }))} />
              </div>
              <div>
                <label style={{ display: 'block', fontFamily: 'var(--font-heading)', fontWeight: 600, marginBottom: 6, fontSize: 13, color: 'var(--text-secondary)' }}>Sonraki Bakım KM</label>
                <input type="number" className="input" placeholder="20000" value={form.nextKm} onChange={e => setForm(f => ({ ...f, nextKm: e.target.value }))} />
              </div>
              <div>
                <label style={{ display: 'block', fontFamily: 'var(--font-heading)', fontWeight: 600, marginBottom: 6, fontSize: 13, color: 'var(--text-secondary)' }}>Maliyet (₺)</label>
                <input type="number" className="input" placeholder="500" value={form.cost} onChange={e => setForm(f => ({ ...f, cost: e.target.value }))} />
              </div>
              <div>
                <label style={{ display: 'block', fontFamily: 'var(--font-heading)', fontWeight: 600, marginBottom: 6, fontSize: 13, color: 'var(--text-secondary)' }}>Servis / Yer</label>
                <input className="input" placeholder="Honda Yetkili Servisi" value={form.shop} onChange={e => setForm(f => ({ ...f, shop: e.target.value }))} />
              </div>
              <div>
                <label style={{ display: 'block', fontFamily: 'var(--font-heading)', fontWeight: 600, marginBottom: 6, fontSize: 13, color: 'var(--text-secondary)' }}>Kısa Açıklama</label>
                <input className="input" placeholder="20W-50 Motul yağ..." value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
              </div>
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontFamily: 'var(--font-heading)', fontWeight: 600, marginBottom: 6, fontSize: 13, color: 'var(--text-secondary)' }}>Notlar</label>
              <textarea className="input" style={{ resize: 'none', minHeight: 70 }} placeholder="Ek notlar..." value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
            </div>

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button type="button" onClick={() => { setShowForm(false); setEditId(null); }} className="btn btn-ghost">İptal</button>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? <><i className="fas fa-spinner fa-spin" /> Kaydediliyor...</> : <><i className="fas fa-save" /> {editId ? 'Güncelle' : 'Kaydet'}</>}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Records list */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}><i className="fas fa-spinner fa-spin" style={{ fontSize: 24 }} /></div>
      ) : records.length === 0 ? (
        <div className="card" style={{ padding: 60, textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🔧</div>
          <div style={{ fontFamily: 'var(--font-heading)', fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Henüz bakım kaydı yok</div>
          <p style={{ color: 'var(--text-muted)', marginBottom: 20 }}>İlk bakım kaydını ekleyin ve takibi başlatın.</p>
          <button onClick={() => setShowForm(true)} className="btn btn-primary" style={{ display: 'inline-flex' }}>
            <i className="fas fa-plus" /> İlk Kaydı Ekle
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {records.map(record => (
            <div key={record._id} className="card" style={{ padding: '18px 20px', display: 'flex', gap: 16, alignItems: 'flex-start' }}>
              <div style={{
                width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                background: `${TYPE_COLORS[record.type]}22`,
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <i className={`fas ${TYPE_ICONS[record.type] || 'fa-tools'}`} style={{ color: TYPE_COLORS[record.type], fontSize: 18 }} />
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8, marginBottom: 6 }}>
                  <div>
                    <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 16, color: TYPE_COLORS[record.type] }}>{record.type}</span>
                    {record.description && <span style={{ color: 'var(--text-muted)', fontSize: 14, marginLeft: 10 }}>— {record.description}</span>}
                  </div>
                  <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                    <button onClick={() => handleEdit(record)} className="btn btn-ghost" style={{ padding: '6px 12px', fontSize: 13 }}>
                      <i className="fas fa-edit" />
                    </button>
                    <button onClick={() => handleDelete(record._id)} style={{ padding: '6px 12px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 'var(--radius)', color: 'var(--danger)', cursor: 'pointer', fontSize: 13, transition: 'all 0.2s' }}>
                      <i className="fas fa-trash" />
                    </button>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', fontSize: 13, color: 'var(--text-muted)' }}>
                  <span><i className="fas fa-calendar" style={{ marginRight: 4, color: 'var(--accent-orange)' }} />{format(new Date(record.date), 'dd MMM yyyy', { locale: tr })}</span>
                  {record.km && <span><i className="fas fa-tachometer-alt" style={{ marginRight: 4 }} />{Number(record.km).toLocaleString()} km</span>}
                  {record.nextKm && <span><i className="fas fa-arrow-right" style={{ marginRight: 4, color: 'var(--success)' }} />Sonraki: {Number(record.nextKm).toLocaleString()} km</span>}
                  {record.cost > 0 && <span><i className="fas fa-lira-sign" style={{ marginRight: 4, color: 'var(--success)' }} />₺{Number(record.cost).toLocaleString()}</span>}
                  {record.shop && <span><i className="fas fa-map-marker-alt" style={{ marginRight: 4 }} />{record.shop}</span>}
                </div>
                {record.notes && <div style={{ marginTop: 6, fontSize: 13, color: 'var(--text-muted)', fontStyle: 'italic' }}>{record.notes}</div>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
