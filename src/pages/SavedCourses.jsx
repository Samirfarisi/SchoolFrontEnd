import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
// Use our custom VideoPlayer component that handles dynamic imports
import VideoPlayer from '../components/VideoPlayer';
import { IoBookmark, IoTrashOutline, IoPlayCircleOutline } from 'react-icons/io5';
import api, { clearSpecificApiCache } from '../api/axios-simple';
import { useCourseActions } from '../context/CourseActionsContext';
import './savedcourses.css';
import Loader from '../components/Loader';

export default function SavedCourses() {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedCourse, setSelectedCourse] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }

        // No need to clear cache - our simplified client handles caching automatically
        
        // First, fetch the saved courses
        api.get('/saved-courses', { headers: { 'Cache-Control': 'no-cache' } })
            .then(savedRes => {
                // Initialize courses with 0 progress by default
                const coursesWithDefaultProgress = savedRes.data.map(course => ({
                    ...course,
                    progress: 0
                }));
                
                // Set courses immediately with default progress
                setCourses(coursesWithDefaultProgress);
                
                // Then try to fetch progress data
                return api.get('/progress-summary', { 
                    headers: { 'Cache-Control': 'no-cache' } 
                })
                .then(progressRes => {
                    // Safely handle progress data
                    let progressData = [];
                    
                    // Handle different possible response structures
                    if (Array.isArray(progressRes.data)) {
                        progressData = progressRes.data;
                    } else if (progressRes.data && Array.isArray(progressRes.data.completed)) {
                        progressData = progressRes.data.completed;
                    } else if (progressRes.data && progressRes.data.data) {
                        progressData = Array.isArray(progressRes.data.data) ? progressRes.data.data : [];
                    }
                    
                    // Create a map of course_id to progress percentage
                    const progressMap = {};
                    if (Array.isArray(progressData)) {
                        progressData.forEach(item => {
                            const courseId = item.course_id || (item.course && item.course.id) || item.id;
                            const progress = item.progress || 0;
                            if (courseId) {
                                progressMap[courseId] = Math.round(progress * 100);
                            }
                        });
                    }
                    
                    // Update courses with actual progress
                    setCourses(prevCourses => 
                        prevCourses.map(course => ({
                            ...course,
                            progress: progressMap[course.id] || 0
                        }))
                    );
                });
            })
            .catch(err => {
                console.error('Error in saved courses fetch:', err);
                if (err.response?.status === 401) {
                    navigate('/login');
                } else {
                    setError('Failed to load saved courses. ' + (err.response?.data?.message || err.message || ''));
                }
            })
            .finally(() => setLoading(false));
    }, [navigate]);

    const handleUnsave = async courseId => {
        try {
            // Store current courses for rollback if needed
            const currentCourses = [...courses];
            
            // Optimistically update UI first
            setCourses(cs => cs.filter(c => c.id !== courseId));
            
            try {
                // Clear cache if the function exists
                if (typeof clearSpecificApiCache === 'function') {
                    clearSpecificApiCache('/saved-courses');
                    clearSpecificApiCache('/courses');
                }
            } catch (cacheError) {
                console.log('Cache clearing error (non-critical):', cacheError);
            }
            
            // Make API call to unsave
            await api.delete(`/courses/${courseId}/save`);
            console.log('Course unsaved successfully:', courseId);
        } catch (e) {
            console.error('Unsave failed:', e);
            
            // Restore courses on error
            if (e.response && e.response.status) {
                alert(`Could not remove saved course (${e.response.status}). Please try again.`);
            } else {
                alert('Could not remove saved course. Please check your connection and try again.');
            }
            
            // Revert to previous state
            setCourses(courses);
        }
    };

    // Function to handle viewing a course
    const handleViewCourse = (course) => {
        // Navigate to courses page with the course ID as a query parameter
        navigate(`/courses?courseId=${course.id}`);
    };
    
    if (loading) return <Loader />;
    if (error) return <p className="error">{error}</p>;

    return (
        <div className="saved-courses-page">
            <h1>Your Saved Courses</h1>
            
            <div className="saved-courses-content">
                <div className="saved-counter">
                    <div className="saved-counter-icon">
                        <span className="icon-fallback">🔖</span>
                    </div>
                    <div className="saved-counter-text">
                        You have <span>{courses.length}</span> saved courses ready to explore.
                    </div>
                </div>
                
                {courses.length === 0 ? (
                    <div className="empty-state">
                        <img src="/src/assets/empty-bookmark.svg" alt="No saved courses" />
                        <h2>No saved courses yet</h2>
                        <p>Courses you save will appear here for easy access.</p>
                        <Link to="/courses" className="btn">
                            Browse Courses
                            <span className="icon-fallback">→</span>
                        </Link>
                    </div>
                ) : (
                    <div className="saved-courses-container">
                        {/* Reverse the array to display newest saved courses first */}
                        {[...courses].reverse().map((c, index) => (
                        <div key={c.id} className="course-card" style={{'--i': index % 9 + 1}}>
                            <div className="card-video">
                                <VideoPlayer
                                    url={c.video_url}
                                    controls
                                    width="100%"
                                    height="100%"
                                />
                            </div>
                            <div className="card-body">
                                <h2>{c.title}</h2>
                                <p>{c.description}</p>
                                
                                {/* Progress Bar */}
                                <div className="progress-section">
                                    <div className="progress-text">
                                        Progress: {c.progress || 0}%
                                    </div>
                                    <div className="progress-bar-container">
                                        <div className="progress-bar">
                                            <div 
                                                className="progress-fill" 
                                                style={{ width: `${c.progress || 0}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="card-actions">
                                <button
                                    className="unsave-btn"
                                    onClick={() => handleUnsave(c.id)}
                                    aria-label="Remove from saved courses"
                                    title="Remove from saved courses"
                                >
                                    <IoTrashOutline className="unsave-icon" />
                                    <span>Remove</span>
                                </button>
                                <button 
                                    className="view-btn" 
                                    title="View course details"
                                    onClick={() => handleViewCourse(c)}
                                >
                                    <IoPlayCircleOutline className="view-icon" />
                                    <span>View Course</span>
                                </button>
                            </div>
                        </div>
                    ))}
                    </div>
                )}
            </div>
        </div>
    );
}