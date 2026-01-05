import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Plus, Trash2, Edit2, Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import Modal from '../components/Modal';

const Notes = () => {
    const [notes, setNotes] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingNote, setEditingNote] = useState(null);

    // Form State
    const [formData, setFormData] = useState({
        content: '',
        verses: '' // "Gen 1:1" format text
    });

    useEffect(() => {
        loadNotes();
    }, []);

    const loadNotes = async () => {
        try {
            const data = await api.getNotes();
            // Sort by date desc
            const sorted = data.sort((a, b) => new Date(b.date) - new Date(a.date));
            setNotes(sorted);
        } catch (error) {
            console.error('Failed to load notes', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const today = format(new Date(), 'yyyy-MM-dd');

        try {
            if (editingNote) {
                // Update
                await api.updateNote(editingNote.id, {
                    ...formData, // content, verses
                    date: editingNote.date // keep original date
                });
            } else {
                // Create
                await api.addNote({
                    date: today,
                    content: formData.content,
                    verses: formData.verses
                });
            }

            closeModal();
            loadNotes();
        } catch (error) {
            console.error('Failed to save note', error);
            alert('노트 저장 실패');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('정말 삭제하시겠습니까?')) return;
        try {
            await api.deleteNote(id);
            loadNotes();
        } catch (error) {
            console.error('Delete failed', error);
        }
    };

    const openCreateModal = () => {
        setEditingNote(null);
        setFormData({ content: '', verses: '' });
        setIsModalOpen(true);
    };

    const openEditModal = (note) => {
        setEditingNote(note);
        setFormData({ content: note.content, verses: note.verses || '' });
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingNote(null);
    };

    return (
        <div className="page-notes container">
            <div className="header-actions" style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '2rem'
            }}>
                <h2>내 묵상 노트</h2>
                <button
                    onClick={openCreateModal}
                    className="btn-primary"
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.6rem 1rem',
                        backgroundColor: 'var(--pk-color-primary)',
                        color: 'white',
                        border: 'none',
                        borderRadius: 'var(--pk-radius-md)',
                        fontWeight: '500'
                    }}
                >
                    <Plus size={18} />
                    새 노트 작성
                </button>
            </div>

            <div className="notes-list" style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
                {notes.map(note => (
                    <div key={note.id} className="note-card" style={{
                        backgroundColor: 'var(--pk-color-bg)',
                        border: '1px solid var(--pk-color-border)',
                        borderRadius: 'var(--pk-radius-lg)',
                        padding: '1.5rem',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '1rem'
                    }}>
                        <div className="note-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--pk-color-text-secondary)', fontSize: '0.9rem' }}>
                                <CalendarIcon size={16} />
                                <span>{note.date}</span>
                            </div>
                            <div className="note-actions">
                                <button onClick={() => openEditModal(note)} style={{ marginRight: '0.5rem', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--pk-color-text-secondary)' }}>
                                    <Edit2 size={18} />
                                </button>
                                <button onClick={() => handleDelete(note.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }}>
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>

                        {note.verses && (
                            <div className="note-verses" style={{
                                backgroundColor: 'var(--pk-color-bg-secondary)',
                                padding: '0.5rem 0.8rem',
                                borderRadius: 'var(--pk-radius-md)',
                                fontSize: '0.9rem',
                                fontWeight: '500',
                                color: 'var(--pk-color-primary)'
                            }}>
                                📖 {note.verses}
                            </div>
                        )}

                        <div className="note-content" style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>
                            {note.content}
                        </div>
                    </div>
                ))}

                {notes.length === 0 && (
                    <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '3rem', color: 'var(--pk-color-text-secondary)', background: 'var(--pk-color-bg-secondary)', borderRadius: 'var(--pk-radius-lg)' }}>
                        아직 작성된 노트가 없습니다. <br />
                        말씀을 읽고 첫 번째 묵상을 남겨보세요!
                    </div>
                )}
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={closeModal}
                title={editingNote ? '노트 수정' : '새 노트 작성'}
            >
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>관련 구절 (선택)</label>
                        <input
                            type="text"
                            placeholder="예: 창세기 1:1"
                            value={formData.verses}
                            onChange={e => setFormData({ ...formData, verses: e.target.value })}
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                border: '1px solid var(--pk-color-border)',
                                borderRadius: 'var(--pk-radius-md)',
                                fontFamily: 'inherit'
                            }}
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>묵상 내용</label>
                        <textarea
                            required
                            rows={6}
                            placeholder="오늘 말씀을 통해 느낀 점을 기록해보세요."
                            value={formData.content}
                            onChange={e => setFormData({ ...formData, content: e.target.value })}
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                border: '1px solid var(--pk-color-border)',
                                borderRadius: 'var(--pk-radius-md)',
                                fontFamily: 'inherit',
                                resize: 'vertical'
                            }}
                        />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem' }}>
                        <button
                            type="button"
                            onClick={closeModal}
                            style={{
                                padding: '0.75rem 1.5rem',
                                border: '1px solid var(--pk-color-border)',
                                borderRadius: 'var(--pk-radius-md)',
                                background: 'white',
                                cursor: 'pointer'
                            }}
                        >
                            취소
                        </button>
                        <button
                            type="submit"
                            className="btn-primary"
                            style={{
                                padding: '0.75rem 1.5rem',
                                backgroundColor: 'var(--pk-color-primary)',
                                color: 'white',
                                border: 'none',
                                borderRadius: 'var(--pk-radius-md)',
                                fontWeight: '500',
                                cursor: 'pointer'
                            }}
                        >
                            {editingNote ? '수정 완료' : '저장하기'}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default Notes;
