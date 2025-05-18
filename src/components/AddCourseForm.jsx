import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import api from '../api/axios';
import AdminChat from '../components/AdminChat';
import AdminUsers from '../pages/AdminUsers';
import '../styles/addCourse.scss';

export default function AddCourseForm() {

    const { pathname } = useLocation();
    const isAnnouncementsTab = pathname.includes('/admin/announcements');

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [videoUrl, setVideoUrl] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [categories, setCategories] = useState([]);
    const [loadingCats, setLoadingCats] = useState(true);
    const [saving, setSaving] = useState(false);
    const [feedback, setFeedback] = useState({ type: '', message: '' });

    useEffect(() => {
        async function fetchCategories() {
            try {
                const res = await api.get('/categories');
                setCategories(res.data);
            } catch (err) {
                console.error('Failed to load categories', err);
                setFeedback({ type: 'error', message: 'Could not load categories.' });
            } finally {
                setLoadingCats(false);
            }
        }
        if (!isAnnouncementsTab) {
            fetchCategories();
        }
    }, [isAnnouncementsTab]);

    // Validate form fields before submission
    const validateForm = () => {
        if (!title.trim()) {
            setFeedback({ type: 'error', message: 'Title is required' });
            return false;
        }
        if (!description.trim()) {
            setFeedback({ type: 'error', message: 'Description is required' });
            return false;
        }
        return true;
    };

    const handleAddCourse = async () => {
        setFeedback({ type: '', message: '' });
        
        // Validate form before proceeding
        if (!validateForm()) {
            return;
        }
        
        setSaving(true);
        try {
            // Format data properly for Laravel backend
            // Make sure category_id is an integer or null
            const categoryIdValue = categoryId ? parseInt(categoryId, 10) : null;
            
            // Process video URL to ensure it's in the correct format
            let processedVideoUrl = videoUrl;
            if (videoUrl.includes('youtube.com/watch?v=')) {
                // Convert YouTube watch URLs to embed format
                const videoId = new URL(videoUrl).searchParams.get('v');
                if (videoId) {
                    processedVideoUrl = `https://www.youtube.com/embed/${videoId}`;
                }
            } else if (videoUrl.includes('youtu.be/')) {
                // Convert YouTube shortened URLs
                const parts = videoUrl.split('/');
                const videoId = parts[parts.length - 1].split('?')[0];
                if (videoId) {
                    processedVideoUrl = `https://www.youtube.com/embed/${videoId}`;
                }
            }
            
            const response = await api.post('/admin/courses', {
                title: title.trim(),
                description: description.trim(),
                video_url: processedVideoUrl,
                category_id: categoryIdValue,
            });
            
            if (response && response.data) {
                setFeedback({ type: 'success', message: 'Course added successfully!' });
                // Reset form
                setTitle(''); 
                setDescription(''); 
                setVideoUrl(''); 
                setCategoryId('');
            }
        } catch (err) {
            console.error(err);
            let errorMessage = 'Error adding course.';
            
            // Check for different error types and provide better error messages
            if (err.response) {
                // The server responded with an error
                if (err.response.status === 422) {
                    // Validation error
                    const validationErrors = err.response.data.errors;
                    if (validationErrors) {
                        // Join all validation errors
                        errorMessage = Object.values(validationErrors)
                            .flat()
                            .join(', ');
                    } else {
                        errorMessage = err.response.data.message || 'Validation failed';
                    }
                } else if (err.response.status === 500) {
                    errorMessage = 'Server error. Please try again or contact support.';
                } else {
                    errorMessage = err.response.data.message || `Error (${err.response.status})`;
                }
            } else if (err.request) {
                // No response received
                errorMessage = 'No response from server. Please check your connection.';
            }
            
            setFeedback({ type: 'error', message: errorMessage });
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className='add-course'>
            <h2>Add New Course</h2>
            {
                feedback.message && (
                    <p className={feedback.type}>{feedback.message}</p>
                )
            }
            <label>
                Title
                <input
                    type="text"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    disabled={saving}
                />
            </label>
            <label>
                Description
                <textarea
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    disabled={saving}
                />
            </label>
            <label>
                Video URL
                <input
                    type="url"
                    value={videoUrl}
                    onChange={e => setVideoUrl(e.target.value)}
                    disabled={saving}
                />
            </label>
            <label>
                Category
                {loadingCats ? (
                    <p>Loading categories…</p>
                ) : (
                    <select
                        value={categoryId}
                        onChange={e => setCategoryId(e.target.value)}
                        disabled={saving}
                    >
                        <option value="">– none –</option>
                        {categories.map(cat => (
                            <option key={cat.id} value={cat.id}>
                                {cat.name}
                            </option>
                        ))}
                    </select>
                )}
            </label>
            <button onClick={handleAddCourse} disabled={saving}>
                {saving ? 'Saving…' : 'Add Course'}
            </button>
        </div>
    )

}