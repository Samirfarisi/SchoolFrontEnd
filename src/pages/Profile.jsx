import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useCourseActions } from '../context/CourseActionsContext';
import SavedCourses from './SavedCourses';
import ImageUploader from '../components/ImageUploader';
import { FaUser } from 'react-icons/fa';
import Loader from '../components/Loader';
import './profile.css';

export default function Profile() {
    const { user, loading, setUser } = useAuth();
    const { addEventListener, lastAction } = useCourseActions();
    const navigate = useNavigate();
    // Review state removed as requested
    const [savedCourses, setSavedCourses] = useState([]);
    const [completedCourses, setCompletedCourses] = useState([]);
    const [busy, setBusy] = useState(true);
    const [error, setError] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        bio: '',
        phone: ''
    });
    const [updateFeedback, setUpdateFeedback] = useState({ type: '', message: '' });
    
    // Password change state
    const [passwordData, setPasswordData] = useState({
        current_password: '',
        new_password: '',
        confirm_password: ''
    });
    const [passwordFeedback, setPasswordFeedback] = useState({ type: '', message: '' });
    const [changingPassword, setChangingPassword] = useState(false);
    
    // Profile image upload state
    const [isUploadingImage, setIsUploadingImage] = useState(false);
    const [imageUploadFeedback, setImageUploadFeedback] = useState({ type: '', message: '' });
    const fileInputRef = React.useRef(null);

    // Function to fetch saved and completed courses data
    const fetchUserCoursesData = async () => {
        setBusy(true);
        setError(null);
        
        try {
            // Parallel fetch saved and completed courses for better performance
            const [savedCoursesPromise, completedCoursesPromise] = await Promise.allSettled([
                // Fetch saved courses
                api.get('/saved-courses', {
                    headers: { 'Cache-Control': 'no-cache' }
                }),
                
                // Fetch completed courses using our new dedicated endpoint
                api.get('/completed-courses', {
                    headers: { 'Cache-Control': 'no-cache' }
                })
            ]);
            
            // Process saved courses
            if (savedCoursesPromise.status === 'fulfilled' && savedCoursesPromise.value.data) {
                const savedData = savedCoursesPromise.value.data;
                if (Array.isArray(savedData)) {
                    console.log(`✓ Found ${savedData.length} saved courses`);
                    setSavedCourses(savedData);
                } else {
                    console.warn('⚠ Saved courses data is not an array:', savedData);
                    setSavedCourses([]);
                }
            } else {
                console.error('✗ Failed to fetch saved courses:', savedCoursesPromise.reason);
                setSavedCourses([]);
            }
            
            // Process completed courses
            if (completedCoursesPromise.status === 'fulfilled' && completedCoursesPromise.value.data) {
                const completedData = completedCoursesPromise.value.data;
                if (Array.isArray(completedData)) {
                    console.log(`✓ Found ${completedData.length} completed courses`);
                    setCompletedCourses(completedData);
                } else {
                    console.warn('⚠ Completed courses data is not an array:', completedData);
                    setCompletedCourses([]);
                }
            } else {
                // Fallback to progress summary if dedicated endpoint fails
                console.warn('⚠ Dedicated completed courses endpoint failed, trying fallback...');
                try {
                    const progressRes = await api.get('/progress-summary');
                    if (progressRes.data && progressRes.data.completedCourses) {
                        const completedList = progressRes.data.completedCourses;
                        console.log(`✓ Found ${completedList.length} completed courses from progress summary`);
                        setCompletedCourses(completedList);
                    } else {
                        console.warn('⚠ No completed courses data available from fallback');
                        setCompletedCourses([]);
                    }
                } catch (progressErr) {
                    console.error('✗ All attempts to fetch completed courses failed:', progressErr);
                    setCompletedCourses([]);
                }
            }
        } catch (e) {
            console.error('✗ General error fetching user courses data:', e);
            setError('Failed to load your courses data. Please refresh the page.');
        } finally {
            setBusy(false);
        }
    };

    useEffect(() => {
        if (loading) return;
        if (!user) {
            navigate('/login');
            return;
        }
        
        setFormData({
            first_name: user.first_name || '',
            last_name: user.last_name || '',
            email: user.email || '',
            bio: user.bio || '',
            phone: user.phone || ''
        });
        
        // Fetch saved and completed courses
        fetchUserCoursesData();
    }, [user, loading, navigate]);
    
    // Add an effect to refresh courses data when the component becomes visible
    useEffect(() => {
        // This will refresh the data when the component mounts or regains focus
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible' && user) {
                console.log('Profile page is visible, refreshing courses data...');
                fetchUserCoursesData();
            }
        };
        
        // Add visibility change listener to refresh data when user returns to the tab
        document.addEventListener('visibilitychange', handleVisibilityChange);
        
        // Clean up the event listener on component unmount
        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [user]);
    
    // Set up listeners for course action events
    useEffect(() => {
        if (!user) return;
        
        console.log('Setting up course action listeners...');
        
        // Create event handler functions that we can reference for cleanup
        const handleCourseSaved = (course) => {
            console.log('Course saved event received:', course);
            fetchUserCoursesData();
        };
        
        const handleCourseUnsaved = (course) => {
            console.log('Course unsaved event received:', course);
            fetchUserCoursesData();
        };
        
        const handleCourseCompleted = (course) => {
            console.log('Course completed event received:', course);
            fetchUserCoursesData();
        };
        
        const handleCourseUncompleted = (course) => {
            console.log('Course uncompleted event received:', course);
            fetchUserCoursesData();
        };
        
        // Register all event listeners
        const removeCourseSavedListener = addEventListener('course-saved', handleCourseSaved);
        const removeCourseUnsavedListener = addEventListener('course-unsaved', handleCourseUnsaved);
        const removeCourseCompletedListener = addEventListener('course-completed', handleCourseCompleted);
        const removeCourseUncompletedListener = addEventListener('course-uncompleted', handleCourseUncompleted);
        
        // Clean up all listeners when component unmounts
        return () => {
            removeCourseSavedListener();
            removeCourseUnsavedListener();
            removeCourseCompletedListener();
            removeCourseUncompletedListener();
            console.log('Course action listeners removed');
        };
    }, [user, addEventListener]);
    
    // Also trigger a refresh when lastAction changes
    useEffect(() => {
        if (lastAction?.type && user) {
            console.log('Course action detected:', lastAction);
            fetchUserCoursesData();
        }
    }, [lastAction, user]);

    // Function to navigate to course detail view
    const handleViewCourse = (course) => {
        navigate(`/courses?courseId=${course.id}`);
    };
    
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setUpdateFeedback({ type: '', message: '' });
            const response = await api.post('/update-profile', formData);
            
            if (response.data && response.data.user) {
                // Update user context with the new data
                setUser(response.data.user);
                setIsEditing(false);
                setUpdateFeedback({
                    type: 'success',
                    message: 'Profile updated successfully!'
                });
            }
        } catch (error) {
            console.error('Failed to update profile', error);
            setUpdateFeedback({
                type: 'error',
                message: error.response?.data?.message || error.message || 'Failed to update profile. Please try again.'
            });
        }
    };
    
    // Handle password input changes
    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setPasswordData(prev => ({
            ...prev,
            [name]: value
        }));
        
        // Clear any previous feedback when user starts typing again
        if (passwordFeedback.message) {
            setPasswordFeedback({ type: '', message: '' });
        }
    };
    
    // Handle password update submission
    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        setPasswordFeedback({ type: '', message: '' });
        
        // Validate passwords
        if (!passwordData.current_password) {
            setPasswordFeedback({ type: 'error', message: 'Please enter your current password' });
            return;
        }
        
        if (!passwordData.new_password) {
            setPasswordFeedback({ type: 'error', message: 'Please enter a new password' });
            return;
        }
        
        if (passwordData.new_password.length < 8) {
            setPasswordFeedback({ type: 'error', message: 'Password must be at least 8 characters long' });
            return;
        }
        
        if (passwordData.new_password !== passwordData.confirm_password) {
            setPasswordFeedback({ type: 'error', message: 'New passwords do not match' });
            return;
        }
        
        setChangingPassword(true);
        
        try {
            // Call the API to update the password
            await api.post('/change-password', {
                current_password: passwordData.current_password,
                new_password: passwordData.new_password,
                password_confirmation: passwordData.confirm_password
            });
            
            // Clear form and show success message
            setPasswordData({
                current_password: '',
                new_password: '',
                confirm_password: ''
            });
            setPasswordFeedback({ type: 'success', message: 'Password updated successfully' });
        } catch (error) {
            console.error('Failed to update password', error);
            
            // Handle specific error messages from the backend
            const errorMessage = error.response?.data?.message || 'Failed to update password. Please try again.';
            setPasswordFeedback({ type: 'error', message: errorMessage });
        } finally {
            setChangingPassword(false);
        }
    };

    if (loading || busy) {
        return (
            <div className="loader">
                <div className="loader-spinner"></div>
            </div>
        );
    }
    
    if (error) return <p className="error">{error}</p>;

    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };
    
    // Handle clicking on Change Photo button
    const handleImageClick = () => {
        // Trigger the hidden file input click
        fileInputRef.current.click();
    };
    
    // Handle when a file is selected
    const handleImageChange = async (e) => {
        if (!e.target.files || e.target.files.length === 0) {
            return;
        }
        
        const file = e.target.files[0];
        
        // Check file size (max 2MB)
        if (file.size > 2 * 1024 * 1024) {
            setImageUploadFeedback({
                type: 'error',
                message: 'Image size must be less than 2MB'
            });
            return;
        }
        
        // Check file type
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/jpg'];
        if (!allowedTypes.includes(file.type)) {
            setImageUploadFeedback({
                type: 'error',
                message: 'Please select a valid image file (JPEG, PNG, or GIF)'
            });
            return;
        }
        
        try {
            setIsUploadingImage(true);
            setImageUploadFeedback({ type: '', message: '' });
            
            // Create a pure FormData object
            const formData = new FormData();
            formData.append('image', file);
            
            // Use XMLHttpRequest for most reliable file upload
            const xhr = new XMLHttpRequest();
            xhr.open('POST', 'http://127.0.0.1:8000/api/update-profile-image', true);
            
            // Set the auth header
            const token = localStorage.getItem('token') || localStorage.getItem('admin_token');
            if (token) {
                xhr.setRequestHeader('Authorization', `Bearer ${token}`);
            }
            
            // Handle the response
            xhr.onload = function() {
                if (xhr.status >= 200 && xhr.status < 300) {
                    // Success
                    const response = JSON.parse(xhr.responseText);
                    
                    if (response && response.avatar_url) {
                        // Update state
                        if (setUser) {
                            setUser(prev => ({ ...prev, avatar_url: response.avatar_url }));
                        }
                        
                        // Show success feedback
                        setImageUploadFeedback({
                            type: 'success',
                            message: 'Profile image updated successfully!'
                        });
                        
                        // Force reload for simplicity
                        setTimeout(() => {
                            window.location.reload();
                        }, 1000); 
                    }
                } else {
                    // Error
                    console.error('Upload failed:', xhr.status, xhr.responseText);
                    let errorMsg = 'Failed to upload image';
                    try {
                        const response = JSON.parse(xhr.responseText);
                        errorMsg = response.message || errorMsg;
                    } catch (e) {}
                    
                    setImageUploadFeedback({
                        type: 'error',
                        message: errorMsg
                    });
                }
                setIsUploadingImage(false);
            };
            
            // Handle network errors
            xhr.onerror = function() {
                console.error('Network error during upload');
                setImageUploadFeedback({
                    type: 'error',
                    message: 'Network error. Please check your connection.'
                });
                setIsUploadingImage(false);
            };
            
            // Send the form data
            xhr.send(formData);
            
        } catch (error) {
            console.error('Error in image upload:', error);
            setImageUploadFeedback({
                type: 'error',
                message: error.message || 'Failed to process the image'
            });
            setIsUploadingImage(false);
        }
    };
    
    // Upload image to server
    const uploadProfileImage = async (file) => {
        try {
            setIsUploadingImage(true);
            setImageUploadFeedback({ type: '', message: '' });
            
            // Create FormData object for file upload
            const formData = new FormData();
            formData.append('image', file);
            
            // Important: Use axios but with the correct headers for multipart form data
            // The browser will automatically set the correct Content-Type with boundary
            const customConfig = {
                headers: {
                    'Accept': 'application/json',
                    // Do NOT set Content-Type here - axios will set it automatically with the correct boundary
                    // when FormData is provided as the data
                }
            };
            
            console.log('Uploading file:', file.name, file.type, file.size);
            
            const response = await api.post('/update-profile-image', formData, customConfig);
            console.log('Upload response:', response.data);
            
            // Update the user object with the new avatar URL
            if (response.data && response.data.avatar_url) {
                console.log('New avatar URL:', response.data.avatar_url);
                
                // Update global user state if setUser function is available
                if (setUser) {
                    setUser(prev => ({ ...prev, avatar_url: response.data.avatar_url }));
                }
                
                // Show success message
                setImageUploadFeedback({
                    type: 'success',
                    message: 'Profile image updated successfully!'
                });
                
                // Update the profile image directly in the DOM to avoid page refresh
                // This is a direct DOM manipulation as a last resort
                const avatarImg = document.querySelector('.profile-avatar img');
                if (avatarImg) {
                    avatarImg.src = response.data.avatar_url;
                } else {
                    // If there was no image before, we need to replace the placeholder with an image
                    const placeholder = document.querySelector('.avatar-placeholder');
                    if (placeholder && placeholder.parentNode) {
                        const img = document.createElement('img');
                        img.src = response.data.avatar_url;
                        img.alt = user?.first_name || user?.name || 'User';
                        placeholder.parentNode.replaceChild(img, placeholder);
                    }
                }
            }
        } catch (error) {
            console.error('Error uploading profile image:', error);
            setImageUploadFeedback({
                type: 'error',
                message: error.response?.data?.message || error.message || 'Failed to upload image. Please try again.'
            });
        } finally {
            setIsUploadingImage(false);
        }
    };

    // Show loader if we're still loading user data or profile data
    if (loading || busy) {
        return <Loader />;
    }
    
    if (error) {
        return <div className="error-message">{error}</div>;
    }

    return (
        <div className="profile-page animate-fade-in">
            <h1 className="animate-slide-up">Your Profile</h1>
            
            <div className="profile-container">
                {/* Profile Sidebar */}
                <div className="profile-sidebar animate-slide-in-left">
                    <div className="profile-header">
                        <div className="profile-avatar">
                            <div className="avatar-container">
                                <div className="static-avatar">
                                    <FaUser className="static-avatar-icon" />
                                </div>
                            </div>
                        </div>
                        <h2 className="profile-name">{user?.first_name || user?.name || 'User'}</h2>
                        <p className="profile-email">{user?.email || 'No email provided'}</p>
                    </div>
                    
                    <div className="profile-stats-container">
                        <div className="profile-stats">
                            <div className="stat-item" style={{'--i': 1}}>
                                <div className="stat-value">{Array.isArray(savedCourses) ? savedCourses.length : 0}</div>
                                <div className="stat-label">Saved</div>
                            </div>
                            <div className="stat-item" style={{'--i': 2}}>
                                <div className="stat-value">{Array.isArray(completedCourses) ? completedCourses.length : 0}</div>
                                <div className="stat-label">Completed</div>
                            </div>
                        </div>
                        
                        <div className="courses-preview-section">
                            <div className="courses-preview">
                                <h3 className="preview-title">Saved Courses</h3>
                                {savedCourses.length > 0 ? (
                                    <div className="preview-courses">
                                        {savedCourses.slice(0, 3).map(course => (
                                            <div 
                                                key={`saved-${course.id}`} 
                                                className="preview-course-item" 
                                                onClick={() => handleViewCourse(course)}
                                                style={{ cursor: 'pointer' }} 
                                                title="Click to view this course">
                                                <div className="preview-course-thumbnail">
                                                    {course.thumbnail_url ? (
                                                        <img src={course.thumbnail_url} alt={course.title} />
                                                    ) : (
                                                        <div className="thumbnail-placeholder">
                                                            <ion-icon name="bookmark-outline"></ion-icon>
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="preview-course-info">
                                                    <h4>{course.title}</h4>
                                                    <p className="preview-course-category">
                                                        {course.category?.name || 'Uncategorized'}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                        {savedCourses.length > 3 && (
                                            <div className="preview-more">
                                                +{savedCourses.length - 3} more
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="empty-preview">
                                        <ion-icon name="bookmark-outline"></ion-icon>
                                        <p>No saved courses yet</p>
                                    </div>
                                )}
                                <Link to="/saved-courses" className="preview-view-all">
                                    View all saved courses
                                </Link>
                            </div>

                            <div className="courses-preview">
                                <h3 className="preview-title">Completed Courses</h3>
                                {completedCourses.length > 0 ? (
                                    <div className="preview-courses">
                                        {completedCourses.slice(0, 3).map(course => (
                                            <div 
                                                key={`completed-${course.id}`} 
                                                className="preview-course-item" 
                                                onClick={() => handleViewCourse(course)}
                                                style={{ cursor: 'pointer' }} 
                                                title="Click to view this course">
                                                <div className="preview-course-thumbnail">
                                                    {course.thumbnail_url ? (
                                                        <img src={course.thumbnail_url} alt={course.title} />
                                                    ) : (
                                                        <div className="thumbnail-placeholder">
                                                            <ion-icon name="checkmark-circle-outline"></ion-icon>
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="preview-course-info">
                                                    <h4>{course.title}</h4>
                                                    <p className="preview-course-category">
                                                        {course.category?.name || 'Uncategorized'}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                        {completedCourses.length > 3 && (
                                            <div className="preview-more">
                                                +{completedCourses.length - 3} more
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="empty-preview">
                                        <ion-icon name="trophy-outline"></ion-icon>
                                        <p>No completed courses yet</p>
                                    </div>
                                )}
                                <Link to="/courses" className="preview-view-all">
                                    Browse all courses
                                </Link>
                            </div>
                        </div>
                        
                        <div className="profile-actions">
                            <Link to="/courses" className="profile-action-btn">
                                <ion-icon name="book-outline"></ion-icon>
                                Browse Courses
                            </Link>
                            <Link to="/saved-courses" className="profile-action-btn">
                                <ion-icon name="bookmark-outline"></ion-icon>
                                View Saved
                            </Link>
                        </div>
                    </div>
                    
                    <div className="profile-meta">
                        <div className="meta-item" style={{'--i': 1}}>
                            <div className="meta-icon">
                                <ion-icon name="calendar-outline"></ion-icon>
                            </div>
                            <div className="meta-text">
                                <span className="meta-label">Member Since</span>
                                {user.created_at ? formatDate(user.created_at) : 'N/A'}
                            </div>
                        </div>
                        <div className="meta-item" style={{'--i': 2}}>
                            <div className="meta-icon">
                                <ion-icon name="school-outline"></ion-icon>
                            </div>
                            <div className="meta-text">
                                <span className="meta-label">Student ID</span>
                                {user.id || 'N/A'}
                            </div>
                        </div>
                        <div className="meta-item" style={{'--i': 3}}>
                            <div className="meta-icon">
                                <ion-icon name="trophy-outline"></ion-icon>
                            </div>
                            <div className="meta-text">
                                <span className="meta-label">Progress</span>
                                {completedCourses.length > 0 ? 'In Progress' : 'Just Started'}
                            </div>
                        </div>
                    </div>
                </div>
                
                {/* Profile Content */}
                <div className="profile-content">
                    {/* Personal Information */}
                    <div className="profile-section">
                        <div className="section-header">
                            <h2 className="section-title">Personal Information</h2>
                            <button 
                                className="section-action"
                                onClick={() => setIsEditing(!isEditing)}
                            >
                                <ion-icon name={isEditing ? 'close-outline' : 'create-outline'}></ion-icon>
                                {isEditing ? 'Cancel' : 'Edit'}
                            </button>
                        </div>
                        
                        <div className="section-body">
                            {updateFeedback.message && (
                                <div className={`alert alert-${updateFeedback.type === 'success' ? 'success' : 'danger'} mb-3`}>
                                    {updateFeedback.message}
                                </div>
                            )}
                            {isEditing ? (
                                <form className="profile-form" onSubmit={handleSubmit}>
                                    <div className="form-group" style={{'--i': 1}}>
                                        <label className="form-label">First Name</label>
                                        <input 
                                            type="text" 
                                            className="form-control" 
                                            name="first_name"
                                            value={formData.first_name}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                    <div className="form-group" style={{'--i': 2}}>
                                        <label className="form-label">Last Name</label>
                                        <input 
                                            type="text" 
                                            className="form-control" 
                                            name="last_name"
                                            value={formData.last_name}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                    <div className="form-group" style={{'--i': 3}}>
                                        <label className="form-label">Email</label>
                                        <input 
                                            type="email" 
                                            className="form-control" 
                                            name="email"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                    <div className="form-group" style={{'--i': 4}}>
                                        <label className="form-label">Phone</label>
                                        <input 
                                            type="text" 
                                            className="form-control" 
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleInputChange}
                                            placeholder="Enter your phone number"
                                        />
                                    </div>
                                    <div className="form-group full-width" style={{'--i': 5}}>
                                        <label className="form-label">Bio</label>
                                        <textarea 
                                            className="form-control" 
                                            name="bio"
                                            value={formData.bio}
                                            onChange={handleInputChange}
                                            rows="4"
                                        ></textarea>
                                    </div>
                                    <div className="form-actions">
                                        <button type="button" className="btn btn-secondary" onClick={() => setIsEditing(false)}>
                                            Cancel
                                        </button>
                                        <button type="submit" className="btn btn-primary">
                                            <ion-icon name="save-outline"></ion-icon>
                                            Save Changes
                                        </button>
                                    </div>
                                </form>
                            ) : (
                                <div className="user-info">
                                    <div className="form-group" style={{'--i': 1}}>
                                        <label className="form-label">Name</label>
                                        <div className="info-value">{user.first_name || user.name} {user.last_name || ''}</div>
                                    </div>
                                    <div className="form-group" style={{'--i': 2}}>
                                        <label className="form-label">Email</label>
                                        <div className="info-value">{user.email}</div>
                                    </div>
                                    {user.phone && (
                                        <div className="form-group" style={{'--i': 3}}>
                                            <label className="form-label">Phone</label>
                                            <div className="info-value">{user.phone}</div>
                                        </div>
                                    )}
                                    {user.bio && (
                                        <div className="form-group" style={{'--i': 3}}>
                                            <label className="form-label">Bio</label>
                                            <div className="info-value">{user.bio}</div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                    
                    {/* Review Section removed as requested */}
                    
                    {/* Password Section */}
                    <div className="profile-section password-section">
                        <div className="section-header">
                            <h2 className="section-title">Change Password</h2>
                        </div>
                        
                        <div className="section-body">
                            {passwordFeedback.message && (
                                <div className={`alert ${passwordFeedback.type === 'success' ? 'alert-success' : 'alert-danger'}`}>
                                    <span className="icon-fallback">
                                        {passwordFeedback.type === 'success' ? '✓' : '⚠️'}
                                    </span>
                                    {passwordFeedback.message}
                                </div>
                            )}
                            
                            <form className="profile-form" onSubmit={handlePasswordSubmit}>
                                <div className="form-group" style={{'--i': 1}}>
                                    <label className="form-label">Current Password</label>
                                    <input 
                                        type="password" 
                                        className="form-control" 
                                        name="current_password"
                                        value={passwordData.current_password}
                                        onChange={handlePasswordChange}
                                        placeholder="Enter current password" 
                                    />
                                </div>
                                <div className="form-group" style={{'--i': 2}}>
                                    <label className="form-label">New Password</label>
                                    <input 
                                        type="password" 
                                        className="form-control" 
                                        name="new_password"
                                        value={passwordData.new_password}
                                        onChange={handlePasswordChange}
                                        placeholder="Enter new password" 
                                    />
                                </div>
                                <div className="form-group" style={{'--i': 3}}>
                                    <label className="form-label">Confirm New Password</label>
                                    <input 
                                        type="password" 
                                        className="form-control" 
                                        name="confirm_password"
                                        value={passwordData.confirm_password}
                                        onChange={handlePasswordChange}
                                        placeholder="Confirm new password" 
                                    />
                                </div>
                                <div className="form-actions">
                                    <button 
                                        type="submit" 
                                        className="btn btn-primary"
                                        disabled={changingPassword}
                                    >
                                        {changingPassword ? (
                                            <>
                                                <div className="spinner-border spinner-border-sm me-2"></div>
                                                Updating...
                                            </>
                                        ) : (
                                            <>
                                                <span className="icon-fallback">🔒</span>
                                                Update Password
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                    
                    {/* Saved Courses Section */}
                    <div className="profile-section">
                        <div className="section-header">
                            <h2 className="section-title">Saved Courses</h2>
                        </div>
                        
                        <div className="section-body">
                            <SavedCourses />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}