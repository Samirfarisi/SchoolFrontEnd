// src/pages/AdminAnnouncements.jsx
import React, { useState } from 'react';
import api from '../api/axios';
import '../styles/adminannouncements.scss';

export default function AdminAnnouncements() {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [feedback, setFeedback] = useState({ type: '', msg: '' });

    const handleSubmit = async e => {
        e.preventDefault();
        setFeedback({ type: '', msg: '' });
        const form = new FormData();
        form.append('title', title);
        form.append('description', description);

        try {
            await api.post('/admin/announcements', form, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setFeedback({ type: 'success', msg: 'Annonce créée !' });
            setTitle(''); setDescription('');
        } catch (err) {
            setFeedback({
                type: 'error',
                msg: err.response?.data?.message || 'Erreur lors de la création'
            });
        }
    };

    return (
        <div className="admin-announcements-page">
            <h2>Créer une annonce</h2>
            {feedback.msg && <p className={feedback.type}>{feedback.msg}</p>}
            <form onSubmit={handleSubmit}>
                <label>
                    Titre
                    <input
                        type="text"
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                        required
                    />
                </label>
                <label>
                    Description
                    <textarea
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                        required
                    />
                </label>

                <button type="submit">Publier l’annonce</button>
            </form>
        </div>
    );
}