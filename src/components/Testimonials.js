import React, { useState, useEffect, useCallback } from 'react';

// ── Storage key ──────────────────────────────────────────────────────────
const STORAGE_KEY = 'lnd_feedbacks';

const INITIAL_FEEDBACKS = [
  { id: 1, name: 'Priya S.', city: 'Chennai', rating: 5, course: 'Python', text: 'Learning Python in Tamil made a huge difference. Real project exposure was invaluable. I secured a job within 3 months of completing the course.' },
  { id: 2, name: 'Arun K.', city: 'Coimbatore', rating: 5, course: 'MERN Stack', text: 'The MERN Stack course was detailed and practical. The trainer shared real production scenarios. Got placed within 2 months after completion.' },
  { id: 3, name: 'Divya R.', city: 'Madurai', rating: 5, course: 'Java', text: 'Best decision I ever made. Trainers are genuine IT professionals. Tamil medium made it stress-free and I understood everything deeply.' },
  { id: 4, name: 'Karthik M.', city: 'Salem', rating: 5, course: 'AI & ML', text: "The AI & ML course content was excellent. The trainer shared real industry case studies that I couldn't find anywhere else. Highly recommended!" },
  { id: 5, name: 'Suresh P.', city: 'Trichy', rating: 5, course: 'Java', text: 'Java training here is top-notch. Complex concepts were broken down beautifully in Tamil. I cracked my first interview with confidence.' },
  { id: 6, name: 'Anitha L.', city: 'Tirunelveli', rating: 5, course: 'SQL', text: 'The SQL and database training was amazing. Hands-on queries with real data. My confidence with databases went from zero to interview-ready.' },
];

function getStored() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return INITIAL_FEEDBACKS;
}
function saveStored(data) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch {}
}

// ── Stars component ──────────────────────────────────────────────────────
const Stars = ({ count, size = 15 }) => (
  <span style={{ color: '#fbbf24', fontSize: size, letterSpacing: '1px' }}>
    {'★'.repeat(Math.max(1, Math.min(5, count)))}{'☆'.repeat(5 - Math.max(1, Math.min(5, count)))}
  </span>
);

// ── Star Rating Picker ───────────────────────────────────────────────────
const StarPicker = ({ value, onChange }) => (
  <div style={{ display: 'flex', gap: 4 }}>
    {[1,2,3,4,5].map(n => (
      <button
        key={n}
        type="button"
        onClick={() => onChange(n)}
        style={{
          background: 'none', border: 'none', cursor: 'pointer', padding: '2px',
          fontSize: 22, color: n <= value ? '#fbbf24' : 'rgba(255,255,255,0.2)',
          transition: '0.15s',
        }}
      >★</button>
    ))}
  </div>
);

// ── Admin Panel ──────────────────────────────────────────────────────────
const EMPTY_FORM = { name: '', city: '', rating: 5, course: '', text: '' };

function AdminPanel({ feedbacks, onClose, onSave }) {
  const [list, setList] = useState(feedbacks);
  const [editing, setEditing] = useState(null); // null | 'new' | feedback id
  const [form, setForm] = useState(EMPTY_FORM);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const startAdd = () => {
    setForm(EMPTY_FORM);
    setEditing('new');
  };

  const startEdit = (fb) => {
    setForm({ name: fb.name, city: fb.city, rating: fb.rating, course: fb.course || '', text: fb.text });
    setEditing(fb.id);
  };

  const cancelEdit = () => { setEditing(null); setForm(EMPTY_FORM); };

  const saveEdit = () => {
    if (!form.name.trim() || !form.text.trim()) return;
    let updated;
    if (editing === 'new') {
      const newItem = { ...form, id: Date.now() };
      updated = [newItem, ...list];
    } else {
      updated = list.map(fb => fb.id === editing ? { ...fb, ...form } : fb);
    }
    setList(updated);
    onSave(updated);
    cancelEdit();
  };

  const confirmDelete = (id) => setDeleteConfirm(id);

  const doDelete = () => {
    const updated = list.filter(fb => fb.id !== deleteConfirm);
    setList(updated);
    onSave(updated);
    setDeleteConfirm(null);
  };

  return (
    <>
      <style>{`
        .adm-overlay {
          position: fixed; inset: 0; z-index: 9000;
          background: rgba(0,0,0,0.65);
          backdrop-filter: blur(4px);
          display: flex;
          justify-content: flex-end;
        }
        .adm-panel {
          width: 420px;
          max-width: 100vw;
          height: 100vh;
          background: #17212b;
          display: flex;
          flex-direction: column;
          box-shadow: -8px 0 48px rgba(0,0,0,0.5);
          font-family: var(--font-body);
        }
        .adm-header {
          background: #242f3d;
          padding: 0 16px;
          height: 60px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-shrink: 0;
          border-bottom: 1px solid rgba(255,255,255,0.06);
        }
        .adm-header-left { display: flex; align-items: center; gap: 12px; }
        .adm-avatar {
          width: 38px; height: 38px;
          background: linear-gradient(135deg, #00bcd4, #00e5ff);
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-size: 17px; font-weight: 700; color: #042025;
        }
        .adm-title {
          font-weight: 700; font-size: 15px; color: #fff;
          line-height: 1.2;
        }
        .adm-subtitle { font-size: 12px; color: rgba(255,255,255,0.4); }
        .adm-close-btn {
          background: none; border: none; cursor: pointer;
          color: rgba(255,255,255,0.5); padding: 8px;
          border-radius: 50%; transition: 0.2s;
          display: flex; align-items: center; justify-content: center;
        }
        .adm-close-btn:hover { background: rgba(255,255,255,0.08); color: #fff; }
        .adm-messages {
          flex: 1;
          overflow-y: auto;
          padding: 16px 12px;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .adm-messages::-webkit-scrollbar { width: 4px; }
        .adm-messages::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 2px; }
        .adm-msg-bubble {
          background: #2b5278;
          border-radius: 12px 12px 4px 12px;
          padding: 12px 14px;
          position: relative;
          transition: 0.2s;
        }
        .adm-msg-bubble:hover { background: #2e5a82; }
        .adm-msg-name {
          font-size: 13px; font-weight: 700;
          color: #6ac7e0;
          margin-bottom: 2px;
          display: flex; align-items: center; gap: 8px;
        }
        .adm-msg-course {
          font-size: 11px; background: rgba(0,188,212,0.18);
          color: #00bcd4; padding: 1px 7px; border-radius: 10px;
          font-weight: 600;
        }
        .adm-msg-text {
          font-size: 13px; color: rgba(255,255,255,0.82);
          line-height: 1.6; margin: 6px 0 8px;
        }
        .adm-msg-footer {
          display: flex; align-items: center; justify-content: space-between;
        }
        .adm-msg-meta { font-size: 11px; color: rgba(255,255,255,0.35); }
        .adm-msg-actions { display: flex; gap: 6px; }
        .adm-action-btn {
          background: none; border: 1px solid rgba(255,255,255,0.12);
          color: rgba(255,255,255,0.5); border-radius: 6px;
          padding: 3px 9px; font-size: 11px; cursor: pointer;
          display: flex; align-items: center; gap: 4px;
          transition: 0.15s; font-family: var(--font-body);
        }
        .adm-action-btn:hover { background: rgba(255,255,255,0.08); color: #fff; border-color: rgba(255,255,255,0.25); }
        .adm-action-btn.del:hover { background: rgba(239,68,68,0.15); color: #f87171; border-color: rgba(239,68,68,0.3); }
        /* Edit form */
        .adm-compose {
          background: #1c2a3a;
          border-top: 1px solid rgba(255,255,255,0.06);
          padding: 16px;
          flex-shrink: 0;
        }
        .adm-compose-title {
          font-size: 12px; font-weight: 700; color: rgba(255,255,255,0.5);
          text-transform: uppercase; letter-spacing: 0.5px;
          margin-bottom: 12px;
        }
        .adm-field-row { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 10px; }
        .adm-field { margin-bottom: 10px; }
        .adm-label { font-size: 11px; color: rgba(255,255,255,0.4); margin-bottom: 5px; display: block; }
        .adm-input, .adm-textarea {
          width: 100%; background: #242f3d;
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 8px; color: #fff;
          padding: 9px 12px; font-size: 13px;
          font-family: var(--font-body);
          outline: none; transition: 0.15s;
          box-sizing: border-box;
        }
        .adm-input:focus, .adm-textarea:focus {
          border-color: var(--color-primary);
          box-shadow: 0 0 0 2px rgba(0,188,212,0.15);
        }
        .adm-textarea { resize: vertical; min-height: 80px; }
        .adm-compose-actions {
          display: flex; gap: 8px; justify-content: flex-end; margin-top: 12px;
        }
        .adm-btn {
          padding: 8px 18px; border-radius: 8px; font-size: 13px;
          font-weight: 600; cursor: pointer; border: none;
          font-family: var(--font-body); transition: 0.15s;
        }
        .adm-btn-primary { background: var(--color-primary); color: #042025; }
        .adm-btn-primary:hover { background: var(--color-accent); }
        .adm-btn-ghost {
          background: rgba(255,255,255,0.06);
          color: rgba(255,255,255,0.6); border: 1px solid rgba(255,255,255,0.1);
        }
        .adm-btn-ghost:hover { background: rgba(255,255,255,0.1); }
        .adm-add-row {
          padding: 12px;
          flex-shrink: 0;
          border-top: 1px solid rgba(255,255,255,0.06);
        }
        .adm-add-btn {
          width: 100%; background: rgba(0,188,212,0.12);
          border: 1.5px dashed rgba(0,188,212,0.3);
          color: var(--color-primary); border-radius: 10px;
          padding: 11px; font-size: 13px; font-weight: 600;
          cursor: pointer; display: flex; align-items: center;
          justify-content: center; gap: 8px; transition: 0.15s;
          font-family: var(--font-body);
        }
        .adm-add-btn:hover { background: rgba(0,188,212,0.2); border-color: var(--color-primary); }
        /* Delete confirm modal */
        .adm-confirm {
          position: absolute; inset: 0;
          background: rgba(23,33,43,0.95);
          display: flex; align-items: center; justify-content: center;
          border-radius: 12px;
          flex-direction: column; gap: 12px;
          padding: 20px;
          z-index: 2;
        }
        .adm-confirm-text {
          color: #fff; font-size: 14px; font-weight: 600; text-align: center;
        }
        .adm-confirm-sub { color: rgba(255,255,255,0.5); font-size: 12px; text-align: center; }
        .adm-confirm-btns { display: flex; gap: 10px; margin-top: 4px; }
        .adm-btn-danger { background: #ef4444; color: #fff; }
        .adm-btn-danger:hover { background: #dc2626; }
        .adm-empty {
          text-align: center; padding: 40px 20px;
          color: rgba(255,255,255,0.3); font-size: 14px;
        }
      `}</style>

      <div className="adm-overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
        <div className="adm-panel">
          {/* Header */}
          <div className="adm-header">
            <div className="adm-header-left">
              <div className="adm-avatar">LnD</div>
              <div>
                <div className="adm-title">Feedback Manager</div>
                <div className="adm-subtitle">{list.length} student feedback{list.length !== 1 ? 's' : ''}</div>
              </div>
            </div>
            <button className="adm-close-btn" onClick={onClose}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>

          {/* Messages list */}
          <div className="adm-messages">
            {list.length === 0 && (
              <div className="adm-empty">No feedbacks yet. Add the first one below.</div>
            )}
            {list.map(fb => (
              <div className="adm-msg-bubble" key={fb.id} style={{ position: 'relative' }}>
                <div className="adm-msg-name">
                  {fb.name}
                  {fb.course && <span className="adm-msg-course">{fb.course}</span>}
                </div>
                <div className="adm-msg-text">{fb.text}</div>
                <div className="adm-msg-footer">
                  <div className="adm-msg-meta">
                    <Stars count={fb.rating} size={13} /> &nbsp;{fb.city}
                  </div>
                  <div className="adm-msg-actions">
                    <button className="adm-action-btn" onClick={() => startEdit(fb)}>
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                      Edit
                    </button>
                    <button className="adm-action-btn del" onClick={() => confirmDelete(fb.id)}>
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>
                      Delete
                    </button>
                  </div>
                </div>

                {/* Inline delete confirmation */}
                {deleteConfirm === fb.id && (
                  <div className="adm-confirm">
                    <div className="adm-confirm-text">Delete this feedback?</div>
                    <div className="adm-confirm-sub">"{fb.name}" — this cannot be undone.</div>
                    <div className="adm-confirm-btns">
                      <button className="adm-btn adm-btn-ghost" onClick={() => setDeleteConfirm(null)}>Cancel</button>
                      <button className="adm-btn adm-btn-danger" onClick={doDelete}>Delete</button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Edit / Add form */}
          {editing !== null ? (
            <div className="adm-compose">
              <div className="adm-compose-title">{editing === 'new' ? 'Add New Feedback' : 'Edit Feedback'}</div>
              <div className="adm-field-row">
                <div className="adm-field">
                  <label className="adm-label">Student Name *</label>
                  <input className="adm-input" placeholder="e.g. Priya S." value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
                </div>
                <div className="adm-field">
                  <label className="adm-label">City</label>
                  <input className="adm-input" placeholder="e.g. Chennai" value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} />
                </div>
              </div>
              <div className="adm-field-row">
                <div className="adm-field">
                  <label className="adm-label">Course</label>
                  <input className="adm-input" placeholder="e.g. Java" value={form.course} onChange={e => setForm(f => ({ ...f, course: e.target.value }))} />
                </div>
                <div className="adm-field">
                  <label className="adm-label">Rating</label>
                  <StarPicker value={form.rating} onChange={v => setForm(f => ({ ...f, rating: v }))} />
                </div>
              </div>
              <div className="adm-field">
                <label className="adm-label">Feedback *</label>
                <textarea className="adm-textarea" placeholder="Student feedback text..." value={form.text} onChange={e => setForm(f => ({ ...f, text: e.target.value }))} />
              </div>
              <div className="adm-compose-actions">
                <button className="adm-btn adm-btn-ghost" onClick={cancelEdit}>Cancel</button>
                <button
                  className="adm-btn adm-btn-primary"
                  onClick={saveEdit}
                  disabled={!form.name.trim() || !form.text.trim()}
                  style={{ opacity: (!form.name.trim() || !form.text.trim()) ? 0.5 : 1 }}
                >
                  {editing === 'new' ? 'Add Feedback' : 'Save Changes'}
                </button>
              </div>
            </div>
          ) : (
            <div className="adm-add-row">
              <button className="adm-add-btn" onClick={startAdd}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                Add New Feedback
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// ── Main Testimonials Component ──────────────────────────────────────────
export default function Testimonials() {
  const [testimonials, setTestimonials] = useState(getStored);
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);

  // Listen for admin open event from Footer
  useEffect(() => {
    const handler = () => setShowAdmin(true);
    window.addEventListener('lnd-open-admin', handler);
    return () => window.removeEventListener('lnd-open-admin', handler);
  }, []);

  const next = useCallback(() => {
    setCurrent(c => (c + 3 >= testimonials.length ? 0 : c + 1));
  }, [testimonials.length]);

  useEffect(() => {
    if (paused || testimonials.length < 3) return;
    const t = setInterval(next, 4200);
    return () => clearInterval(t);
  }, [paused, next, testimonials.length]);

  const handleSave = (updated) => {
    setTestimonials(updated);
    saveStored(updated);
    setCurrent(0);
  };

  const visible = testimonials.length > 0 ? [
    testimonials[current % testimonials.length],
    testimonials[(current + 1) % testimonials.length],
    testimonials[(current + 2) % testimonials.length],
  ] : [];

  return (
    <>
      <style>{`
        .testimonials {
          padding: var(--section-padding);
          background: var(--color-dark);
          position: relative;
          overflow: hidden;
        }
        .testimonials::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(0,229,255,0.3), transparent);
        }
        .testimonials-bg {
          position: absolute; inset: 0;
          background: radial-gradient(ellipse at 50% 100%, rgba(0,188,212,0.05) 0%, transparent 60%);
        }
        .testimonials-header {
          text-align: center;
          margin-bottom: 64px;
          position: relative;
          z-index: 1;
        }
        .testimonials-header .section-title { color: var(--color-white); }
        .testimonials-header .section-tag { background: rgba(0,229,255,0.08); border-color: rgba(0,229,255,0.2); color: var(--color-accent); }
        .t-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
          position: relative;
          z-index: 1;
        }
        .t-card {
          background: var(--color-dark-card);
          border: 1.5px solid rgba(255,255,255,0.06);
          border-radius: var(--radius-lg);
          padding: 32px 28px;
          position: relative;
          transition: var(--transition);
        }
        .t-card:hover {
          border-color: rgba(0,188,212,0.25);
          transform: translateY(-4px);
          box-shadow: 0 16px 40px rgba(0,0,0,0.4);
        }
        .t-quote {
          font-size: 56px;
          line-height: 1;
          color: var(--color-primary);
          opacity: 0.3;
          font-family: serif;
          position: absolute;
          top: 12px; right: 24px;
        }
        .t-course-tag {
          display: inline-block;
          font-size: 10px; font-weight: 700;
          background: rgba(0,188,212,0.1);
          border: 1px solid rgba(0,188,212,0.2);
          color: var(--color-accent);
          padding: 3px 10px; border-radius: 999px;
          text-transform: uppercase; letter-spacing: 0.4px;
          margin-bottom: 14px;
        }
        .t-text {
          font-size: 14px;
          color: rgba(255,255,255,0.65);
          line-height: 1.8;
          margin-bottom: 24px;
          font-style: italic;
        }
        .t-footer {
          display: flex;
          align-items: center;
          gap: 14px;
          padding-top: 20px;
          border-top: 1px solid rgba(255,255,255,0.06);
        }
        .t-avatar {
          width: 44px; height: 44px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--color-primary), var(--color-accent));
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: var(--font-display);
          font-size: 16px;
          font-weight: 700;
          color: var(--color-dark);
          flex-shrink: 0;
        }
        .t-name { font-weight: 600; color: var(--color-white); font-size: 14px; }
        .t-city-row {
          display: flex; align-items: center; gap: 5px;
          font-size: 12px; color: rgba(255,255,255,0.35); margin-top: 2px;
        }
        .t-stars { margin-top: 4px; }
        .t-nav {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 12px;
          margin-top: 48px;
          position: relative;
          z-index: 1;
        }
        .t-dot {
          width: 8px; height: 8px;
          border-radius: 50%;
          background: rgba(255,255,255,0.15);
          border: none;
          cursor: pointer;
          transition: var(--transition);
          padding: 0;
        }
        .t-dot.active {
          background: var(--color-primary);
          width: 24px;
          border-radius: 4px;
        }
        @media (max-width: 900px) {
          .t-grid { grid-template-columns: 1fr; }
          .t-grid .t-card:nth-child(2), .t-grid .t-card:nth-child(3) { display: none; }
        }
      `}</style>

      <section
        className="testimonials"
        id="testimonials"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        <div className="testimonials-bg" />
        <div className="container">
          <div className="testimonials-header">
            <span className="section-tag">Student Feedbacks</span>
            <h2 className="section-title">Words from Our <span className="accent">Learners</span></h2>
          </div>

          {testimonials.length === 0 ? (
            <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.4)', fontSize: 15, paddingBottom: 40 }}>
              No feedbacks yet. Add some from the admin panel.
            </p>
          ) : (
            <div className="t-grid">
              {visible.map((t, i) => (
                <div className="t-card" key={`${current}-${i}-${t.id}`}>
                  <div className="t-quote">"</div>
                  {t.course && <div className="t-course-tag">{t.course}</div>}
                  <p className="t-text">{t.text}</p>
                  <div className="t-footer">
                    <div className="t-avatar">{t.name[0]}</div>
                    <div className="t-info">
                      <div className="t-name">{t.name}</div>
                      <div className="t-city-row">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
                        {t.city}
                      </div>
                      <div className="t-stars"><Stars count={t.rating} /></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {testimonials.length > 1 && (
            <div className="t-nav">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  className={`t-dot${i === current ? ' active' : ''}`}
                  onClick={() => setCurrent(i)}
                  aria-label={`Go to ${i + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {showAdmin && (
        <AdminPanel
          feedbacks={testimonials}
          onClose={() => setShowAdmin(false)}
          onSave={handleSave}
        />
      )}
    </>
  );
}
