import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addToast } from '../store/slices/uiSlice';
import api from '../utils/api';

const CATEGORIES = [
  { id: 'sürüş-teknikleri', label: 'Sürüş Teknikleri', icon: 'fa-motorcycle', color: '#FF6B00' },
  { id: 'grup-kuralları', label: 'Grup Kuralları', icon: 'fa-hands-helping', color: '#3B82F6' },
  { id: 'motor-bakımı', label: 'Motor Bakımı', icon: 'fa-wrench', color: '#22C55E' },
  { id: 'ilk-yardım', label: 'İlk Yardım', icon: 'fa-first-aid', color: '#EF4444' },
];

export default function AcademyPage() {
  const dispatch = useDispatch();
  const { user } = useSelector(s => s.auth);
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('');
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    api.get(`/academy${activeCategory ? `?category=${activeCategory}` : ''}`).then(({ data }) => {
      setLessons(data.data || []);
      setLoading(false);
    });
  }, [activeCategory]);

  const handleComplete = async (lessonId) => {
    try {
      await api.post(`/academy/${lessonId}/complete`);
      dispatch(addToast({ type: 'success', message: '✅ Ders tamamlandı olarak işaretlendi!' }));
    } catch {}
  };

  const getYouTubeId = (url) => {
    const match = url?.match(/(?:embed\/|v=|\/v\/|youtu\.be\/|\/embed\/)([^&?#]+)/);
    return match ? match[1] : '';
  };

  const completedIds = user?.completedLessons || [];
  const grouped = CATEGORIES.reduce((acc, cat) => {
    acc[cat.id] = lessons.filter(l => l.category === cat.id);
    return acc;
  }, {});

  return (
    <div className="animate-fade">
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 900, letterSpacing: 2 }}>
          MOTORCU <span style={{ color: 'var(--accent-orange)' }}>AKADEMİSİ</span>
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Profesyonel motorculuk eğitimleri</p>
      </div>

      {/* Category tabs */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 24, flexWrap: 'wrap' }}>
        <button onClick={() => setActiveCategory('')} className={`btn ${!activeCategory ? 'btn-primary' : 'btn-ghost'}`} style={{ padding: '8px 16px', fontSize: 14 }}>
          <i className="fas fa-th" /> Tümü
        </button>
        {CATEGORIES.map(cat => (
          <button key={cat.id} onClick={() => setActiveCategory(cat.id === activeCategory ? '' : cat.id)}
            style={{
              display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px',
              borderRadius: 'var(--radius)', border: `1px solid ${activeCategory === cat.id ? cat.color : 'var(--border)'}`,
              background: activeCategory === cat.id ? `rgba(${cat.color === '#FF6B00' ? '255,107,0' : cat.color === '#3B82F6' ? '59,130,246' : cat.color === '#22C55E' ? '34,197,94' : '239,68,68'},0.1)` : 'transparent',
              color: activeCategory === cat.id ? cat.color : 'var(--text-secondary)',
              cursor: 'pointer', fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: 14, transition: 'all 0.2s'
            }}>
            <i className={`fas ${cat.icon}`} style={{ color: cat.color }} />{cat.label}
          </button>
        ))}
      </div>

      {/* Video modal */}
      {selected && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
          onClick={e => e.target === e.currentTarget && setSelected(null)}>
          <div className="card" style={{ width: '100%', maxWidth: 900, padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
              <div>
                <h2 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 24, marginBottom: 8 }}>{selected.title}</h2>
                <div style={{ display: 'flex', gap: 12, color: 'var(--text-muted)', fontSize: 13, flexWrap: 'wrap' }}>
                  <span><i className="fas fa-user" style={{ marginRight: 4 }} />{selected.instructor}</span>
                  <span><i className="fas fa-clock" style={{ marginRight: 4 }} />{selected.duration}</span>
                  <span><i className="fas fa-eye" style={{ marginRight: 4 }} />{selected.views} izlenme</span>
                  <span style={{ 
                    background: selected.difficulty === 'Kolay' ? 'rgba(34,197,94,0.2)' : selected.difficulty === 'Orta' ? 'rgba(255,107,0,0.2)' : 'rgba(239,68,68,0.2)',
                    color: selected.difficulty === 'Kolay' ? '#22C55E' : selected.difficulty === 'Orta' ? '#FF6B00' : '#EF4444',
                    padding: '2px 8px',
                    borderRadius: 6,
                    fontWeight: 600
                  }}>{selected.difficulty}</span>
                </div>
              </div>
              <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 24, padding: 4 }}>
                <i className="fas fa-times" />
              </button>
            </div>

            {/* Video */}
            {selected.youtubeUrl ? (
              <div style={{ aspectRatio: '16/9', borderRadius: 'var(--radius)', overflow: 'hidden', marginBottom: 20, border: '2px solid var(--border)' }}>
                <iframe src={selected.youtubeUrl} style={{ width: '100%', height: '100%', border: 'none' }} allowFullScreen title={selected.title} />
              </div>
            ) : (
              <div style={{ aspectRatio: '16/9', background: 'var(--bg-secondary)', borderRadius: 'var(--radius)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20, border: '2px dashed var(--border)' }}>
                <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                  <i className="fas fa-video-slash" style={{ fontSize: 48, marginBottom: 12, opacity: 0.5 }} />
                  <div style={{ fontSize: 16, fontFamily: 'var(--font-heading)' }}>Video yakında eklenecek</div>
                  <div style={{ fontSize: 13, marginTop: 4 }}>Kendi videolarınızı yükleyebilirsiniz</div>
                </div>
              </div>
            )}

            {/* Description */}
            {selected.description && (
              <div style={{ 
                background: 'rgba(255,107,0,0.05)', 
                borderLeft: '3px solid var(--accent-orange)',
                borderRadius: 'var(--radius)', 
                padding: 16, 
                marginBottom: 20
              }}>
                <div style={{ fontSize: 12, color: 'var(--accent-orange)', fontWeight: 600, marginBottom: 6, fontFamily: 'var(--font-heading)' }}>
                  <i className="fas fa-info-circle" style={{ marginRight: 6 }} />DERS HAKKINDA
                </div>
                <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, margin: 0 }}>
                  {selected.description}
                </p>
              </div>
            )}

            {/* Tags */}
            {selected.tags?.length > 0 && (
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8, fontFamily: 'var(--font-heading)' }}>
                  <i className="fas fa-tags" style={{ marginRight: 6 }} />ETİKETLER
                </div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {selected.tags.map(tag => (
                    <span key={tag} className="badge badge-orange" style={{ fontSize: 12 }}>
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <button onClick={() => { handleComplete(selected._id); setSelected(null); }} className="btn btn-primary" style={{ flex: 1 }}>
                <i className="fas fa-check-circle" /> Dersi Tamamla
              </button>
              <button onClick={() => setSelected(null)} className="btn btn-ghost">
                <i className="fas fa-times" /> Kapat
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lessons by category */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}><i className="fas fa-spinner fa-spin" style={{ fontSize: 24 }} /></div>
      ) : (
        (activeCategory ? [CATEGORIES.find(c => c.id === activeCategory)] : CATEGORIES).map(cat => {
          const catLessons = grouped[cat.id] || [];
          if (!catLessons.length) return null;
          return (
            <div key={cat.id} style={{ marginBottom: 32 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                <div style={{ width: 40, height: 40, background: `rgba(${cat.color === '#FF6B00' ? '255,107,0' : cat.color === '#3B82F6' ? '59,130,246' : cat.color === '#22C55E' ? '34,197,94' : '239,68,68'},0.2)`, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <i className={`fas ${cat.icon}`} style={{ color: cat.color }} />
                </div>
                <h2 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 20 }}>{cat.label}</h2>
                <span className="badge badge-orange">{catLessons.length} ders</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
                {catLessons.map(lesson => {
                  const isCompleted = completedIds.includes(lesson._id);
                  return (
                    <div key={lesson._id} className="card" style={{ cursor: 'pointer', overflow: 'hidden', position: 'relative' }} onClick={() => setSelected(lesson)}>
                      {isCompleted && (
                        <div style={{ position: 'absolute', top: 10, right: 10, background: 'var(--success)', color: 'white', borderRadius: '50%', width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2, fontSize: 12 }}>
                          <i className="fas fa-check" />
                        </div>
                      )}
                      {/* Thumbnail */}
                      <div style={{ height: 140, background: 'linear-gradient(135deg, #1a1a1a, #2a1a1a)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                        <i className="fas fa-play-circle" style={{ fontSize: 48, color: 'rgba(255,107,0,0.7)' }} />
                        <div style={{ position: 'absolute', bottom: 8, right: 8, background: 'rgba(0,0,0,0.7)', color: 'white', borderRadius: 6, padding: '2px 8px', fontSize: 12, fontFamily: 'var(--font-heading)' }}>{lesson.duration}</div>
                      </div>
                      <div style={{ padding: 16 }}>
                        <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 15, marginBottom: 6 }}>{lesson.title}</h3>
                        {lesson.description && <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: 10, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{lesson.description}</p>}
                        <div style={{ display: 'flex', gap: 8, fontSize: 12, color: 'var(--text-muted)' }}>
                          <span><i className="fas fa-eye" style={{ marginRight: 4 }} />{lesson.views}</span>
                          <span><i className="fas fa-heart" style={{ marginRight: 4 }} />{lesson.likes?.length || 0}</span>
                          <span style={{ marginLeft: 'auto', color: cat.color, fontFamily: 'var(--font-heading)', fontWeight: 600 }}>{lesson.difficulty}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
