import React, { useState } from 'react';
import api from '../api/axios';
import '../styles/admindocs.scss';

export default function AdminDocuments() {
    const [title, setTitle] = useState('');
    const [pdfFile, setPdfFile] = useState(null);
    const [thumbFile, setThumbFile] = useState(null);
    const [feedback, setFeedback] = useState('');

    const handleSubmit = async e => {
        e.preventDefault();
        setFeedback('');
        if (!title || !pdfFile) {
            setFeedback('Title and PDF are required');
            return;
        }
        const form = new FormData();
        form.append('title', title);
        form.append('pdf', pdfFile);
        if (thumbFile) form.append('thumbnail', thumbFile);

        try {
            await api.post('/admin/documents', form, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setFeedback('Document uploaded successfully!');
            setTitle(''); setPdfFile(null); setThumbFile(null);
        } catch (err) {
            setFeedback(err.response?.data?.message || 'Upload failed');
        }
    };

    return (
        <div className="admin-docs">
            <h2>Upload New Document</h2>
            {feedback && <p className={`feedback ${feedback.includes('failed') ? 'error' : 'success'}`}>{feedback}</p>}
            <form onSubmit={handleSubmit}>
                <label>
                    Title
                    <input value={title} onChange={e => setTitle(e.target.value)} required />
                </label>
                <label>
                    PDF File
                    <input type="file" accept="application/pdf" onChange={e => setPdfFile(e.target.files[0])} required />
                </label>
                <label>
                    Thumbnail (optional)
                    <input type="file" accept="image/*" onChange={e => setThumbFile(e.target.files[0])} />
                </label>
                <button type="submit">Upload Document</button>
            </form>
        </div>
    );
}