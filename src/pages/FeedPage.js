import React, { useState, useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { addToast } from '../store/slices/uiSlice';
import api from '../utils/api';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

const PostCard = ({ post, onLike, onComment }) => {
  const { user } = useSelector(s => s.auth);
  const [showComments, setShowComments] = useState(false);
  const [comment, setComment] = useState('');
  const isLiked = post.likes?.includes(user?._id);

  const handleComment = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;
    await onComment(post._id, comment);
    setComment('');
  };

  return (
    <div className="card" style={{ padding: 20, marginBottom: 16 }}>
      {/* Author */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <Link to={`/profile/${post.author?._id}`} style={{ textDecoration: 'none' }}>
          <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--gradient-orange)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 700, color: 'white', fontFamily: 'var(--font-heading)', flexShrink: 0, overflow: 'hidden' }}>
            {post.author?.avatar ? <img src={post.author.avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : `${post.author?.firstName?.[0]}${post.author?.lastName?.[0]}`}
          </div>
        </Link>
        <div style={{ flex: 1 }}>
          <Link to={`/profile/${post.author?._id}`} style={{ textDecoration: 'none' }}>
            <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 15, color: 'var(--text-primary)' }}>
              {post.author?.nickname || `${post.author?.firstName} ${post.author?.lastName}`}
              {post.author?.motorcycle?.brand && <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}> · {post.author.motorcycle.brand} {post.author.motorcycle.model}</span>}
            </div>
          </Link>
          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            {format(new Date(post.createdAt), 'dd MMM yyyy, HH:mm', { locale: tr })}
          </div>
        </div>
      </div>

      {post.content && <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: post.images?.length ? 12 : 0 }}>{post.content}</p>}

      {post.images?.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: post.images.length > 1 ? '1fr 1fr' : '1fr', gap: 8, marginTop: 12, marginBottom: 4, borderRadius: 'var(--radius)', overflow: 'hidden' }}>
          {post.images.slice(0, 4).map((img, i) => (
            <img key={i} src={img} alt="" style={{ width: '100%', aspectRatio: '16/9', objectFit: 'cover' }} />
          ))}
        </div>
      )}

      {/* Actions */}
      <div style={{ display: 'flex', gap: 4, paddingTop: 12, borderTop: '1px solid var(--border)', marginTop: 12 }}>
        <button onClick={() => onLike(post._id)} style={{
          flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          padding: '8px 12px', borderRadius: 'var(--radius)', border: 'none', cursor: 'pointer',
          background: isLiked ? 'rgba(239,68,68,0.1)' : 'transparent',
          color: isLiked ? '#EF4444' : 'var(--text-muted)',
          fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: 14,
          transition: 'all 0.2s'
        }}>
          <i className={`${isLiked ? 'fas' : 'far'} fa-heart`} />
          {post.likes?.length > 0 && post.likes.length}
        </button>
        <button onClick={() => setShowComments(!showComments)} style={{
          flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          padding: '8px 12px', borderRadius: 'var(--radius)', border: 'none', cursor: 'pointer',
          background: showComments ? 'rgba(59,130,246,0.1)' : 'transparent',
          color: showComments ? 'var(--info)' : 'var(--text-muted)',
          fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: 14, transition: 'all 0.2s'
        }}>
          <i className="far fa-comment" />
          {post.comments?.length > 0 && post.comments.length}
        </button>
        <button style={{
          flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          padding: '8px 12px', borderRadius: 'var(--radius)', border: 'none', cursor: 'pointer',
          background: 'transparent', color: 'var(--text-muted)',
          fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: 14, transition: 'all 0.2s'
        }}>
          <i className="fas fa-share" />
        </button>
      </div>

      {showComments && (
        <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--border)' }}>
          {post.comments?.map(c => (
            <div key={c._id} style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--gradient-orange)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: 'white', flexShrink: 0 }}>
                {c.author?.firstName?.[0]}
              </div>
              <div style={{ background: 'var(--bg-secondary)', borderRadius: 'var(--radius)', padding: '8px 12px', flex: 1 }}>
                <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 13, color: 'var(--accent-orange)', marginBottom: 2 }}>
                  {c.author?.nickname || c.author?.firstName}
                </div>
                <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{c.content}</div>
              </div>
            </div>
          ))}
          <form onSubmit={handleComment} style={{ display: 'flex', gap: 8 }}>
            <input className="input" style={{ fontSize: 13 }} placeholder="Yorum yaz..." value={comment} onChange={e => setComment(e.target.value)} />
            <button type="submit" className="btn btn-primary" style={{ padding: '10px 16px', flexShrink: 0 }}>
              <i className="fas fa-paper-plane" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default function FeedPage() {
  const dispatch = useDispatch();
  const { user } = useSelector(s => s.auth);
  const [posts, setPosts] = useState([]);
  const [events, setEvents] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [postContent, setPostContent] = useState('');
  const [posting, setPosting] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [postsRes, eventsRes, annRes] = await Promise.all([
        api.get('/posts?limit=10'),
        api.get('/events?upcoming=true&limit=3'),
        api.get('/admin/announcements')
      ]);
      setPosts(postsRes.data.data || []);
      setEvents(eventsRes.data.data || []);
      setAnnouncements(annRes.data.data || []);
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handlePost = async (e) => {
    e.preventDefault();
    if (!postContent.trim()) return;
    setPosting(true);
    try {
      const { data } = await api.post('/posts', { content: postContent });
      setPosts(prev => [data.data, ...prev]);
      setPostContent('');
      dispatch(addToast({ type: 'success', message: 'Gönderi paylaşıldı!' }));
    } catch { dispatch(addToast({ type: 'error', message: 'Gönderi paylaşılamadı.' })); }
    setPosting(false);
  };

  const handleLike = async (postId) => {
    try {
      const { data } = await api.post(`/posts/${postId}/like`);
      setPosts(prev => prev.map(p => {
        if (p._id !== postId) return p;
        return { ...p, likes: data.liked ? [...(p.likes || []), user._id] : (p.likes || []).filter(id => id !== user._id) };
      }));
    } catch {}
  };

  const handleComment = async (postId, content) => {
    try {
      const { data } = await api.post(`/posts/${postId}/comment`, { content });
      setPosts(prev => prev.map(p => p._id === postId ? { ...p, comments: data.data } : p));
    } catch {}
  };

  return (
    <div style={{ maxWidth: 680, margin: '0 auto' }} className="animate-fade">
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 900, letterSpacing: 2 }}>
          ANA <span style={{ color: 'var(--accent-orange)' }}>SAYFA</span>
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Grubunuzun son gelişmeleri</p>
      </div>

      {/* Emergency announcements */}
      {announcements.filter(a => a.isEmergency).map(a => (
        <div key={a._id} style={{
          background: 'rgba(229,53,53,0.15)', border: '1px solid rgba(229,53,53,0.5)',
          borderRadius: 'var(--radius)', padding: '14px 18px', marginBottom: 16,
          display: 'flex', gap: 12, alignItems: 'center'
        }}>
          <i className="fas fa-exclamation-triangle" style={{ color: 'var(--danger)', fontSize: 20, flexShrink: 0 }} />
          <div>
            <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, color: 'var(--danger)' }}>🚨 ACİL DUYURU</div>
            <div style={{ fontSize: 14, color: 'var(--text-secondary)', marginTop: 2 }}>{a.content}</div>
          </div>
        </div>
      ))}

      {/* Upcoming events quick view */}
      {events.length > 0 && (
        <div className="card" style={{ padding: 16, marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 16 }}>
              <i className="fas fa-calendar-alt" style={{ color: 'var(--accent-orange)', marginRight: 8 }} />
              Yaklaşan Etkinlikler
            </div>
            <Link to="/events" style={{ color: 'var(--accent-orange)', fontSize: 13, textDecoration: 'none' }}>Tümü →</Link>
          </div>
          <div style={{ display: 'flex', gap: 10, overflowX: 'auto' }}>
            {events.map(ev => (
              <Link key={ev._id} to={`/events/${ev._id}`} style={{ textDecoration: 'none', flexShrink: 0 }}>
                <div style={{ background: 'var(--bg-secondary)', borderRadius: 'var(--radius)', padding: '12px 16px', minWidth: 160, border: '1px solid var(--border)', transition: 'border-color 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent-orange)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
                >
                  <div style={{ fontSize: 11, color: 'var(--accent-orange)', fontFamily: 'var(--font-heading)', fontWeight: 600, marginBottom: 4 }}>
                    {format(new Date(ev.date), 'dd MMM', { locale: tr })}
                  </div>
                  <div style={{ fontSize: 13, fontFamily: 'var(--font-heading)', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>{ev.title}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                    <i className="fas fa-map-marker-alt" style={{ marginRight: 4 }} />{ev.startPoint?.split('-')[0]}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                    <i className="fas fa-users" style={{ marginRight: 4 }} />{ev.participants?.length || 0} katılımcı
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Create post */}
      <div className="card" style={{ padding: 16, marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
          <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--gradient-orange)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: 'white', flexShrink: 0 }}>
            {user?.firstName?.[0]}{user?.lastName?.[0]}
          </div>
          <form onSubmit={handlePost} style={{ flex: 1 }}>
            <textarea className="input" style={{ resize: 'none', minHeight: 80 }}
              placeholder="Paylaşmak istediğin bir şey var mı? 🏍️"
              value={postContent} onChange={e => setPostContent(e.target.value)} />
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
              <button type="submit" className="btn btn-primary" disabled={!postContent.trim() || posting} style={{ padding: '8px 20px' }}>
                {posting ? <><i className="fas fa-spinner fa-spin" /> Paylaşılıyor...</> : <><i className="fas fa-paper-plane" /> Paylaş</>}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Posts */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>
          <i className="fas fa-spinner fa-spin" style={{ fontSize: 24 }} />
        </div>
      ) : posts.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 60 }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🏍️</div>
          <div style={{ fontFamily: 'var(--font-heading)', fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Henüz gönderi yok!</div>
          <p style={{ color: 'var(--text-muted)' }}>İlk gönderiyi siz paylaşın.</p>
        </div>
      ) : (
        posts.map(post => <PostCard key={post._id} post={post} onLike={handleLike} onComment={handleComment} />)
      )}
    </div>
  );
}
