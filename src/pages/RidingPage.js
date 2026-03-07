import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { addToast } from '../store/slices/uiSlice';
import api from '../utils/api';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

const WEATHERS = ['Güneşli', 'Bulutlu', 'Yağmurlu', 'Karlı', 'Rüzgarlı'];
const WEATHER_ICONS = { 'Güneşli': '☀️', 'Bulutlu': '☁️', 'Yağmurlu': '🌧️', 'Karlı': '❄️', 'Rüzgarlı': '💨' };

const empty = { date: new Date().toISOString().split('T')[0], distance: '', duration: '', avgSpeed: '', startPoint: '', endPoint: '', weather: 'Güneşli', notes: '' };

export default function RidingPage() {
  const dispatch = useDispatch();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get('/riding').then(({ data }) => { setLogs(data.data || []); setLoading(false); });
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await api.post('/riding', form);
      setLogs(prev => [data.data, ...prev]);
      setShowForm(false);
      setForm(empty);
      dispatch(addToast({ type: 'success', message: '🏍️ Sürüş kaydedildi!' }));
    } catch {
      dispatch(addToast({ type: 'error', message: 'Kayıt başarısız.' }));
    }
    setSaving(false);
  };

  const handleDelete = async (id, distance) => {
    if (!window.confirm('Bu sürüş kaydını silmek istediğinizden emin misiniz?')) return;
    await api.delete(`/riding/${id}`);
    setLogs(prev => prev.filter(l => l._id !== id));
    dispatch(addToast({ type: 'success', message: 'Kayıt silindi.' }));
  };

  const totalKm = logs.reduce((s, l) => s + (l.distance || 0), 0);
  const totalDuration = logs.reduce((s, l) => s + (l.duration || 0), 0);
  const avgSpeed = logs.filter(l => l.avgSpeed).length > 0
    ? Math.round(logs.filter(l => l.avgSpeed).reduce((s, l) => s + l.avgSpeed, 0) / logs.filter(l => l.avgSpeed).length)
    : 0;

  // Chart data - last 7 logs
  const chartData = [...logs].slice(0, 10).reverse().map(l => ({
    date: format(new Date(l.date), 'dd MMM', { locale: tr }),
    km: l.distance,
    hız: l.avgSpeed || 0
  }));

  // Monthly chart
  const monthlyMap = {};
  logs.forEach(l => {
    const key = format(new Date(l.date), 'MMM yy', { locale: tr });
    monthlyMap[key] = (monthlyMap[key] || 0) + l.distance;
  });
  const monthlyData = Object.entries(monthlyMap).slice(-6).map(([ay, km]) => ({ ay, km }));

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 12px' }}>
        <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 13 }}>{label}</div>
        <div style={{ color: 'var(--accent-orange)', fontSize: 13 }}>{payload[0].value} km</div>
      </div>
    );
  };

  return (
    <div className="animate-fade">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 900, letterSpacing: 2 }}>
            SÜRÜŞ <span style={{ color: 'var(--accent-orange)' }}>GEÇMİŞİ</span>
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Tüm sürüşlerinizin kayıtları</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn btn-primary">
          <i className="fas fa-plus" /> Sürüş Ekle
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16, marginBottom: 24 }}>
        {[
          { icon: 'fa-route', label: 'Toplam KM', value: totalKm.toLocaleString(), suffix: 'km', color: 'var(--accent-orange)' },
          { icon: 'fa-motorcycle', label: 'Sürüş Sayısı', value: logs.length, suffix: 'tur', color: 'var(--info)' },
          { icon: 'fa-clock', label: 'Toplam Süre', value: Math.floor(totalDuration / 60), suffix: 'saat', color: 'var(--success)' },
          { icon: 'fa-tachometer-alt', label: 'Ort. Hız', value: avgSpeed, suffix: 'km/h', color: '#8B5CF6' },
        ].map(stat => (
          <div key={stat.label} className="card" style={{ padding: '20px 24px', textAlign: 'center' }}>
            <i className={`fas ${stat.icon}`} style={{ color: stat.color, fontSize: 24, marginBottom: 8, display: 'block' }} />
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 30, fontWeight: 900, color: stat.color, lineHeight: 1 }}>
              {stat.value}<span style={{ fontSize: 14, color: 'var(--text-muted)', fontFamily: 'var(--font-body)', fontWeight: 400 }}> {stat.suffix}</span>
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'var(--font-heading)', marginTop: 4 }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Charts */}
      {logs.length > 2 && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
          <div className="card" style={{ padding: 20 }}>
            <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 15, marginBottom: 16 }}>Son 10 Sürüş (KM)</div>
            <ResponsiveContainer width="100%" height={150}>
              <BarChart data={chartData}>
                <XAxis dataKey="date" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
                <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="km" fill="var(--accent-orange)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="card" style={{ padding: 20 }}>
            <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 15, marginBottom: 16 }}>Aylık KM</div>
            <ResponsiveContainer width="100%" height={150}>
              <LineChart data={monthlyData}>
                <XAxis dataKey="ay" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
                <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="km" stroke="var(--accent-orange)" strokeWidth={2} dot={{ fill: 'var(--accent-orange)' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Add form */}
      {showForm && (
        <div className="card" style={{ padding: 24, marginBottom: 24 }}>
          <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 18, marginBottom: 20, color: 'var(--accent-orange)' }}>
            <i className="fas fa-motorcycle" style={{ marginRight: 8 }} />Yeni Sürüş Kaydı
          </h3>
          <form onSubmit={handleSave}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 16 }}>
              {[
                { label: 'Tarih *', type: 'date', key: 'date' },
                { label: 'Mesafe (km) *', type: 'number', key: 'distance', placeholder: '150' },
                { label: 'Süre (dakika)', type: 'number', key: 'duration', placeholder: '180' },
                { label: 'Ort. Hız (km/h)', type: 'number', key: 'avgSpeed', placeholder: '85' },
                { label: 'Başlangıç', type: 'text', key: 'startPoint', placeholder: 'İstanbul' },
                { label: 'Bitiş', type: 'text', key: 'endPoint', placeholder: 'Ankara' },
              ].map(field => (
                <div key={field.key}>
                  <label style={{ display: 'block', fontFamily: 'var(--font-heading)', fontWeight: 600, marginBottom: 6, fontSize: 13, color: 'var(--text-secondary)' }}>{field.label}</label>
                  <input type={field.type} className="input" placeholder={field.placeholder} value={form[field.key]}
                    onChange={e => setForm(f => ({ ...f, [field.key]: e.target.value }))}
                    required={field.label.includes('*')} />
                </div>
              ))}
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontFamily: 'var(--font-heading)', fontWeight: 600, marginBottom: 10, fontSize: 13, color: 'var(--text-secondary)' }}>Hava Durumu</label>
              <div style={{ display: 'flex', gap: 8 }}>
                {WEATHERS.map(w => (
                  <button key={w} type="button" onClick={() => setForm(f => ({ ...f, weather: w }))}
                    style={{
                      padding: '8px 14px', borderRadius: 'var(--radius)',
                      border: `1px solid ${form.weather === w ? 'var(--accent-orange)' : 'var(--border)'}`,
                      background: form.weather === w ? 'rgba(255,107,0,0.15)' : 'transparent',
                      color: form.weather === w ? 'var(--accent-orange)' : 'var(--text-secondary)',
                      cursor: 'pointer', fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: 13, transition: 'all 0.2s'
                    }}>
                    {WEATHER_ICONS[w]} {w}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontFamily: 'var(--font-heading)', fontWeight: 600, marginBottom: 6, fontSize: 13, color: 'var(--text-secondary)' }}>Notlar</label>
              <textarea className="input" style={{ resize: 'none', minHeight: 70 }} placeholder="Sürüş notları..."
                value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
            </div>

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button type="button" onClick={() => setShowForm(false)} className="btn btn-ghost">İptal</button>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? <><i className="fas fa-spinner fa-spin" /> Kaydediliyor...</> : <><i className="fas fa-save" /> Kaydet</>}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Log list */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}><i className="fas fa-spinner fa-spin" style={{ fontSize: 24 }} /></div>
      ) : logs.length === 0 ? (
        <div className="card" style={{ padding: 60, textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🛣️</div>
          <div style={{ fontFamily: 'var(--font-heading)', fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Henüz sürüş kaydı yok</div>
          <button onClick={() => setShowForm(true)} className="btn btn-primary" style={{ display: 'inline-flex' }}>
            <i className="fas fa-plus" /> İlk Sürüşü Ekle
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {logs.map(log => (
            <div key={log._id} className="card" style={{ padding: '16px 20px', display: 'flex', gap: 16, alignItems: 'center' }}>
              <div style={{ width: 44, height: 44, background: 'rgba(255,107,0,0.15)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 20 }}>
                {WEATHER_ICONS[log.weather] || '🏍️'}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                  <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 15 }}>
                    {log.startPoint && log.endPoint ? `${log.startPoint} → ${log.endPoint}` : format(new Date(log.date), 'dd MMMM yyyy', { locale: tr })}
                  </div>
                  <button onClick={() => handleDelete(log._id, log.distance)} style={{ padding: '6px 12px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 'var(--radius)', color: 'var(--danger)', cursor: 'pointer', fontSize: 13 }}>
                    <i className="fas fa-trash" />
                  </button>
                </div>
                <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
                  <span><i className="fas fa-calendar" style={{ marginRight: 4, color: 'var(--accent-orange)' }} />{format(new Date(log.date), 'dd MMM yyyy', { locale: tr })}</span>
                  <span style={{ color: 'var(--accent-orange)', fontWeight: 700 }}><i className="fas fa-route" style={{ marginRight: 4 }} />{log.distance} km</span>
                  {log.duration && <span><i className="fas fa-clock" style={{ marginRight: 4 }} />{Math.floor(log.duration / 60)}s {log.duration % 60}dk</span>}
                  {log.avgSpeed && <span><i className="fas fa-tachometer-alt" style={{ marginRight: 4 }} />Ort. {log.avgSpeed} km/h</span>}
                </div>
                {log.notes && <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4, fontStyle: 'italic' }}>{log.notes}</div>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
