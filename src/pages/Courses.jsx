// import React, { useEffect, useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import ReactPlayer from 'react-player';          
// import api from '../api/axios';
// import { useAuth } from '../context/AuthContext';
// import '../styles/coursestyle.scss';
// import Loader from '../components/Loader';
// import CourseReviews from '../components/CourseReviews';

// export default function Courses() {
//     const { user, loading } = useAuth();
//     const navigate = useNavigate();
//     const [courses, setCourses] = useState([]);
//     const [categories, setCategories] = useState([]);
//     const [selectedCategory, setSelectedCategory] = useState('all');
//     const [error, setError] = useState(null);
//             setCourses(prev =>
//                 prev.map(c =>
//                     c.id === courseId
//                         ? { ...c, pivot: isSaved ? undefined : { course_id: courseId } }
//                         : c
//                 )
//             );
//         } catch (e) {
//             console.error(e);
//         }
//     };

//     if (loading || busy) return <Loader />;
//     if (error) return <p className="error">{error}</p>;

//     const filtered = selectedCategory === 'all'
//         ? courses
//         : courses.filter(c => c.category_id === selectedCategory);

//     return (
//         <div className="courses-page">

           
//             <div className="category-filter">
//                 <button
//                     className={selectedCategory === 'all' ? 'active' : ''}
//                     onClick={() => setSelectedCategory('all')}
//                 >
//                     All
//                 </button>
//                 {categories.map(cat => (
//                     <button
//                         key={cat.id}
//                         className={selectedCategory === cat.id ? 'active' : ''}
//                         onClick={() => setSelectedCategory(cat.id)}
//                     >
//                         {cat.name}
//                     </button>
//                 ))}
//             </div>

           
//             <div className="courses-container">
//                 {filtered.map(c => {
//                     const isSaved = !!c.pivot;
//                     return (
//                         <div key={c.id} className="course-card">
//                             <div className="card-video">
//                                 <ReactPlayer
//                                     url={c.video_url}
//                                     controls
//                                     width="100%"
//                                     height="100%"
//                                 />
//                             </div>
//                             <div className="card-body">
//                                 <h2>{c.title}</h2>
//                                 <p>{c.description}</p>
//                             </div>
//                             <button
//                                 className={isSaved ? 'save-btn saved' : 'save-btn'}
//                                 onClick={() => toggleSave(c.id, isSaved)}
//                                 aria-label={isSaved ? 'Unsave' : 'Save'}
//                             >
//                                 <ion-icon
//                                     name={isSaved ? 'bookmark' : 'bookmark-outline'}
//                                 />
//                             </button>
//                             <CourseReviews courseId={c.id} />
//                         </div>
                        
//                     );
//                 })}
import React, { useEffect, useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
// Use our custom VideoPlayer component that handles dynamic imports
import VideoPlayer from '../components/VideoPlayer';
import { useAuth } from '../context/AuthContext';
import { useCourseActions } from '../context/CourseActionsContext';
import api, { clearSpecificApiCache, clearApiCache } from '../api/axios-simple';
import './courses.css';
import '../styles/course-detail.css';
import Loader from '../components/Loader';
import ProgressSummary from '../components/ProgressSummary';

export default function Courses() {
    const { user, loading } = useAuth();
    const { notifyCourseCompleted, notifyCourseUncompleted, notifyCourseSaved, notifyCourseUnsaved } = useCourseActions();
    const navigate = useNavigate();
    const location = useLocation();
    const [courses, setCourses] = useState([]);
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [error, setError] = useState(null);
    const [busy, setBusy] = useState(true);
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [completedCourses, setCompletedCourses] = useState([]);

    // Display indicator that mock data is being used
    const [usingMockData, setUsingMockData] = useState(false);  // We'll keep this but won't use mock data
    
    // Fetch courses, categories, completed courses with improved loading
    useEffect(() => {
        if (loading) return;
        if (!user) {
            navigate('/login');
            return;
        }
        
        // Extract courseId from URL query parameters if present
        const queryParams = new URLSearchParams(location.search);
        const courseIdFromUrl = queryParams.get('courseId');
        
        const fetchData = async () => {
            setBusy(true);
            setError(null);
            
            try {
                // Get courses from the backend
                const coursesResponse = await api.get('/courses');
                const coursesData = coursesResponse.data || [];
                
                // Get categories from the backend
                const categoriesResponse = await api.get('/categories');
                const categoriesData = categoriesResponse.data || [];
                
                console.log('Fetched courses:', coursesData);
                
                // Get detailed completion data
                let completedArray = [];
                try {
                    // Try the progress summary endpoint first, as it's more reliable
                    const progressResponse = await api.get('/progress-summary');
                    console.log('Progress summary response:', progressResponse.data);
                    
                    if (progressResponse.data && progressResponse.data.completedCourses) {
                        // If completedCourses array is available in the response
                        completedArray = progressResponse.data.completedCourses;
                        console.log('Got completed courses from progress summary:', completedArray);
                    } else if (Array.isArray(progressResponse.data)) {
                        // If the response is an array directly
                        completedArray = progressResponse.data.filter(item => item.pivot?.completed_at);
                        console.log('Filtered completed courses from array response:', completedArray);
                    } else if (progressResponse.data) {
                        // Try to extract from the response structure
                        if (Array.isArray(progressResponse.data.completed)) {
                            completedArray = progressResponse.data.completed;
                            console.log('Got completed courses from array in progress data:', completedArray);
                        }
                    }
                    
                    // If we couldn't get completion data from progress-summary, try the dedicated endpoint
                    if (completedArray.length === 0) {
                        try {
                            const completedResponse = await api.get('/completed-courses');
                            if (completedResponse.data && Array.isArray(completedResponse.data)) {
                                completedArray = completedResponse.data;
                                console.log('Got completed courses from dedicated endpoint:', completedArray);
                            } 
                        } catch (innerErr) {
                            console.warn('Could not fetch from dedicated endpoint, trying simple filter');  
                            // As a last resort, try to get courses that have completed_at from the courses response
                            completedArray = coursesData.filter(course => course.pivot?.completed_at)
                                .map(course => ({
                                    id: course.id,
                                    completed_at: course.pivot.completed_at
                                }));
                                
                            if (completedArray.length > 0) {
                                console.log('Extracted completion data from courses response:', completedArray);
                            } else {
                                console.warn('No completion data available from any source');
                            }
                        }
                    }
                } catch (err) {
                    console.error('Error fetching completion data:', err);
                    // As a last resort, try to extract from courses data
                    completedArray = coursesData.filter(course => course.pivot?.completed_at)
                        .map(course => ({
                            id: course.id,
                            completed_at: course.pivot.completed_at
                        }));
                        
                    if (completedArray.length > 0) {
                        console.log('Extracted completion data as fallback:', completedArray);
                    }
                }
                
                setCompletedCourses(completedArray);
                console.log('Set completed courses:', completedArray);
                
                // Map completion status to courses
                const coursesWithCompletionStatus = coursesData.map(course => {
                    // Check if course is completed - more comprehensive matching
                    const isCompleted = completedArray.some(completed => {
                        return completed && (
                            completed.id === course.id || 
                            completed.course_id === course.id ||
                            (completed.pivot && completed.pivot.course_id === course.id)
                        );
                    });
                    
                    // Add completion info to the course object
                    if (isCompleted && (!course.pivot || !course.pivot.completed_at)) {
                        return {
                            ...course,
                            pivot: {
                                ...course.pivot,
                                completed_at: new Date().toISOString()
                            }
                        };
                    }
                    return course;
                });
                
                // Set courses and categories in state
                setCourses(coursesWithCompletionStatus);
                setCategories(categoriesData);
                setUsingMockData(false);
                
                // If a courseId was provided in the URL, open that course's details
                const courseIdFromUrl = new URLSearchParams(location.search).get('courseId');
                if (courseIdFromUrl) {
                    const courseToShow = coursesWithCompletionStatus.find(c => c.id === parseInt(courseIdFromUrl, 10) || c.id === courseIdFromUrl);
                    if (courseToShow) {
                        console.log('Opening course details from URL parameter:', courseToShow.title);
                        setSelectedCourse(courseToShow);
                    } else {
                        console.warn('Course not found with ID:', courseIdFromUrl);
                    }
                }
            } catch (error) {
                console.error('Error fetching course data:', error);
                setError('Failed to load courses from the server. Please check your connection and try again.');
                
                // Empty state - don't use mock data
                setCourses([]);
                setCategories([]);
                setUsingMockData(false);
            } finally {
                setBusy(false);
            }
        };
        
        fetchData();
    }, [user, loading, navigate]);

    // toggle complete/incomplete with improved tracking and persistence
    const toggleComplete = async (course) => {
        try {
            // Show immediate feedback
            const previousCompletionStatus = course.pivot?.completed_at ? true : false;
            const nowDone = !previousCompletionStatus;
            const completionDate = nowDone ? new Date().toISOString() : null;

            // Update local state first for responsive UI
            setCourses(cs => cs.map(c =>
                c.id === course.id
                    ? {
                        ...c,
                        pivot: {
                            ...c.pivot,
                            completed_at: completionDate
                        }
                    }
                    : c
            ));
            
            // Update completedCourses state
            if (nowDone) {
                const newCompletedCourse = {
                    id: course.id,
                    title: course.title,
                    completed_at: completionDate
                };
                setCompletedCourses(prev => [...prev.filter(c => c.id !== course.id), newCompletedCourse]);
                console.log('Added course to completed:', newCompletedCourse);
            } else {
                setCompletedCourses(prev => prev.filter(c => c.id !== course.id));
                console.log('Removed course from completed:', course.id);
            }

            // Make API call to persist completion status
            console.log(`Sending toggle request for course ${course.id} to ${nowDone ? 'completed' : 'incomplete'}`);
            const res = await api.post(`/courses/${course.id}/toggle-complete`);
            console.log('Course completion status updated:', res.data);
            
            // Force refresh the completion data to ensure our frontend state matches backend
            try {
                const latestData = await api.get('/completed-courses');
                if (latestData.data && Array.isArray(latestData.data)) {
                    console.log('Refreshed completed courses:', latestData.data);
                    setCompletedCourses(latestData.data);
                    
                    // Sync the courses array with latest completion data
                    setCourses(currentCourses => currentCourses.map(c => {
                        // Check if this course is in the completed list
                        const matchingCompleted = latestData.data.find(completed => completed.id === c.id);
                        if (matchingCompleted) {
                            // It's completed
                            return {
                                ...c,
                                pivot: {
                                    ...c.pivot,
                                    completed_at: matchingCompleted.completed_at
                                }
                            };
                        } else if (c.id === course.id && c.pivot?.completed_at) {
                            // This course was toggled, but not found in completion list
                            return {
                                ...c,
                                pivot: {
                                    ...c.pivot,
                                    completed_at: null
                                }
                            };
                        }
                        return c;
                    }));
                }
            } catch (refreshError) {
                console.error('Error refreshing completion data:', refreshError);
            }
            
            // Notify the user of success
            console.log(`Course "${course.title}" marked as ${nowDone ? 'completed' : 'incomplete'}`);
            
            // Notify other components through the CourseActionsContext
            if (nowDone) {
                notifyCourseCompleted(course);
                console.log('Sent course completed notification');
            } else {
                notifyCourseUncompleted(course);
                console.log('Sent course uncompleted notification');
            }

            // If there's a mismatch between our prediction and the server response, fix it
            if (res.data.completed !== nowDone) {
                console.warn('Mismatch between client and server completion state, fixing...');
                setCourses(cs => cs.map(c =>
                    c.id === course.id
                        ? {
                            ...c,
                            pivot: {
                                ...c.pivot,
                                completed_at: res.data.completed ? completionDate : null
                            }
                        }
                        : c
                ));
                
                // Also fix completedCourses state
                if (res.data.completed) {
                    setCompletedCourses(prev => [...prev.filter(c => c.id !== course.id), {
                        id: course.id,
                        title: course.title,
                        completed_at: completionDate
                    }]);
                } else {
                    setCompletedCourses(prev => prev.filter(c => c.id !== course.id));
                }
            }
        } catch (e) {
            console.error('Error updating course completion status:', e);
            
            // Revert local state on error
            setCourses(cs => cs.map(c =>
                c.id === course.id
                    ? {
                        ...c,
                        pivot: {
                            ...c.pivot,
                            completed_at: course.pivot?.completed_at
                        }
                    }
                    : c
            ));
            
            // Alert user, but with a better message
            alert('Could not update course completion status. Please try again.');
        }
    };

    // save/unsave course with improved implementation and better persistence
    const toggleSave = async (courseId, isSaved) => {
        // Find the course object for notification purposes
        const courseToToggle = courses.find(c => c.id === courseId);
        // Create a copy of the current course state for potential rollback
        const previousCoursesState = [...courses];
        
        try {
            // Show immediate feedback (optimistic update)
            setCourses(prev =>
                prev.map(c =>
                    c.id === courseId
                        ? { 
                            ...c, 
                            pivot: isSaved ? undefined : { course_id: courseId } 
                        }
                        : c
                )
            );
            
            // Clear any related cache to ensure fresh data on next load
            if (typeof clearSpecificApiCache === 'function') {
                clearSpecificApiCache('/saved-courses');
                clearSpecificApiCache('/courses');
            }
            
            // Make API call to persist saved state
            if (isSaved) {
                // If already saved, unsave it
                await api.delete(`/courses/${courseId}/save`);
                console.log('Course unsaved successfully:', courseId);
                
                // Notify other components
                if (courseToToggle) {
                    notifyCourseUnsaved(courseToToggle);
                    console.log('Sent course unsaved notification');
                }
            } else {
                // If not saved, save it
                await api.post(`/courses/${courseId}/save`);
                console.log('Course saved successfully:', courseId);
                
                // Notify other components
                if (courseToToggle) {
                    notifyCourseSaved(courseToToggle);
                    console.log('Sent course saved notification');
                }
            }
        } catch (e) {
            console.error('Error toggling save status:', e);
            
            // Revert to previous state if the API call failed
            setCourses(previousCoursesState);
            
            // Show simple error message
            const message = isSaved ? 'Failed to unsave course.' : 'Failed to save course.';
            console.error(message);
            alert(message);
        }
    };

    if (loading || busy) return <Loader />;
    if (error) return <p className="error">{error}</p>;

    const filtered = selectedCategory === 'all'
        ? courses
        : courses.filter(c => c.category_id === selectedCategory);

    // Close the course detail view and return to the main course list
    const handleCloseCourseDetail = () => {
        setSelectedCourse(null);
    };

    // Open the course detail view for a specific course
    const handleOpenCourseDetail = (course) => {
        setSelectedCourse(course);
    };

    // Render course detail view with reviews
    const renderCourseDetail = () => {
        if (!selectedCourse) return null;
        
        const isDone = !!selectedCourse.pivot?.completed_at;
        const isSaved = !!selectedCourse.pivot;
        
        return (
            <div className="course-detail-overlay animate-fade-in">
                <div className="course-detail-container animate-scale-in">
                    <button className="close-detail-btn" onClick={handleCloseCourseDetail}>
                        <ion-icon name="close-outline"></ion-icon>
                    </button>
                    
                    <div className="course-detail-header">
                        <h2 className="course-detail-title">{selectedCourse.title}</h2>
                        <div className="course-detail-actions">
                            <button
                                className={isSaved ? 'save-btn-detail saved' : 'save-btn-detail'}
                                onClick={() => toggleSave(selectedCourse.id, isSaved)}
                                aria-label={isSaved ? 'Unsave' : 'Save'}
                            >
                                <ion-icon name={isSaved ? 'bookmark' : 'bookmark-outline'} />
                                {isSaved ? 'Saved' : 'Save'}
                            </button>
                            
                            <button
                                className={isDone ? 'complete-btn-detail done' : 'complete-btn-detail'}
                                onClick={() => toggleComplete(selectedCourse)}
                            >
                                <ion-icon name={isDone ? 'checkmark-circle' : 'checkmark-circle-outline'} />
                                {isDone ? 'Completed' : 'Mark as Complete'}
                            </button>
                        </div>
                    </div>
                    
                    <div className="course-detail-content">
                        <div className="course-detail-video">
                            <VideoPlayer 
                                url={selectedCourse.video_url} 
                                controls 
                                width="100%" 
                                height="100%"
                                playing={true} 
                            />
                        </div>
                        
                        <div className="course-detail-info">
                            <div className="course-detail-description">
                                <h3>Course Description</h3>
                                <p>{selectedCourse.description}</p>
                            </div>
                            
                            {selectedCourse.category && (
                                <div className="course-detail-category">
                                    <span className="category-label">Category:</span>
                                    <span className="category-name">{selectedCourse.category?.name}</span>
                                </div>
                            )}
                            
                            {isDone && (
                                <div className="completion-info">
                                    <ion-icon name="time-outline"></ion-icon>
                                    <span>Completed on {new Date(selectedCourse.pivot.completed_at).toLocaleDateString()}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="courses-page">
            {/* Offline mode notification */}
            {usingMockData && (
                <div className="offline-notification">
                    <div className="offline-banner">
                        <ion-icon name="cloud-offline-outline"></ion-icon>
                        <span>Unable to load your courses. Please check your connection.</span>
                        <button onClick={() => window.location.reload()} className="refresh-btn">
                            <ion-icon name="refresh-outline"></ion-icon> Reload
                        </button>
                    </div>
                </div>
            )}
            
            {/* Progress summary */}
            <ProgressSummary completedCourses={completedCourses}/>

            {/* Category filter */}
            <div className="category-filter">
                <button
                    className={selectedCategory === 'all' ? 'active' : ''}
                    onClick={() => setSelectedCategory('all')}
                >
                    All
                </button>
                {categories.map((cat, index) => (
                    <button
                        key={cat.id}
                        className={selectedCategory === cat.id ? 'active' : ''}
                        onClick={() => setSelectedCategory(cat.id)}
                        style={{ '--i': index + 1 }}
                    >
                        {cat.name}
                    </button>
                ))}
            </div>

            {filtered.length === 0 ? (
                <div className="empty-state">
                    <img src="/src/assets/empty-courses.svg" alt="No courses found" />
                    <h3>No courses found</h3>
                    <p>Try selecting a different category or check back later for new courses.</p>
                </div>
            ) : (
                <div className="courses-container">
                    {/* Reverse the array to display newest courses first */}
                    {[...filtered].reverse().map((c, index) => {
                        const isSaved = !!c.pivot;
                        const isDone = !!c.pivot?.completed_at;
                        return (
                            <div
                                key={c.id}
                                className="course-card"
                                style={{ '--i': index % 9 + 1 }}
                                onClick={() => handleOpenCourseDetail(c)}
                            >
                                <div className="card-video">
                                    <VideoPlayer url={c.video_url} controls width="100%" height="100%" />
                                </div>

                                <div className="card-body">
                                    <h2>{c.title}</h2>
                                    <p>{c.description}</p>
                                </div>

                                <div className="card-actions">
                                    <button
                                        className={isSaved ? 'save-btn saved animate-pulse' : 'save-btn'}
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            toggleSave(c.id, isSaved);
                                        }}
                                        aria-label={isSaved ? 'Unsave' : 'Save'}
                                        title={isSaved ? 'Unsave this course' : 'Save this course'}
                                    >
                                        <ion-icon name={isSaved ? 'bookmark' : 'bookmark-outline'} />
                                    </button>

                                    <button
                                        className={isDone ? 'complete-btn done' : 'complete-btn'}
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            toggleComplete(c);
                                        }}
                                    >
                                        {isDone ? '✔ Completed' : 'Mark as complete'}
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
            
            {/* Render course detail overlay when a course is selected */}
            {selectedCourse && renderCourseDetail()}
        </div>
    );
}