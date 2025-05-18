import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import api from '../api/axios-simple';
import { useCourseActions } from '../context/CourseActionsContext';
import '../index.scss';

const ProgressSummary = ({ completedCourses = [] }) => {
    const [total, setTotal] = useState(0);
    const [done, setDone] = useState(0);
    const [loading, setLoading] = useState(true);
    const { addEventListener, lastAction } = useCourseActions();

    useEffect(() => {
        const fetchTotalCourses = async () => {
            try {
                setLoading(true);
                const response = await api.get('/courses');
                const totalCourses = response.data?.length || 29;
                setTotal(totalCourses);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching total courses:', error);
                // Fallback to a default value
                setTotal(29);
                setLoading(false);
            }
        };

        fetchTotalCourses();
    }, []);

    // Function to fetch progress data
    const fetchProgressData = async (isLocalUpdate = false) => {
        try {
            // For immediate local updates, we'll rely on the passed completedCourses prop or lastAction
            if (isLocalUpdate && Array.isArray(completedCourses)) {
                setDone(completedCourses.length);
                console.log('Setting done count immediately after action:', completedCourses.length);
                return;
            }
            
            // Otherwise, fetch from API
            const response = await api.get('/progress-summary');
            if (response.data) {
                console.log('Progress summary data:', response.data);
                
                // Store the API response value to compare with our local count
                let apiCompletedCount = 0;
                
                // Handle different response formats
                if (typeof response.data.completed === 'number') {
                    // If completed count is provided directly
                    apiCompletedCount = response.data.completed;
                    console.log('API completed count:', apiCompletedCount);
                } else if (response.data.completedCourses && Array.isArray(response.data.completedCourses)) {
                    // If completed courses array is provided
                    apiCompletedCount = response.data.completedCourses.length;
                    console.log('API completed courses array length:', apiCompletedCount);
                } else if (Array.isArray(response.data.completed)) {
                    // If completed is an array
                    apiCompletedCount = response.data.completed.length;
                    console.log('API completed array length:', apiCompletedCount);
                }
                
                // Compare with our local count - use the higher value
                // This ensures we show newly completed courses even if API hasn't updated yet
                const localCount = Array.isArray(completedCourses) ? completedCourses.length : 0;
                const finalCount = Math.max(apiCompletedCount, localCount);
                console.log(`Using count: ${finalCount} (API: ${apiCompletedCount}, Local: ${localCount})`);
                setDone(finalCount);
                
                // If total is provided in the response, use it
                if (typeof response.data.total === 'number') {
                    setTotal(response.data.total);
                }
            }
        } catch (error) {
            console.error('Error fetching progress summary:', error);
            
            // If we can't get from progress-summary, try to calculate from completedCourses prop
            if (Array.isArray(completedCourses) && completedCourses.length > 0) {
                setDone(completedCourses.length);
                console.log('Setting done count from prop:', completedCourses.length);
            }
        }
    };
    
    // Update progress when props change or when course completion events happen
    useEffect(() => {
        fetchProgressData();
        
        // Set up event listeners for course completion events
        const handleCourseCompleted = (course) => {
            console.log('Course completed event received in ProgressSummary:', course.title);
            // Use the local completedCourses data plus the new course
            // This ensures the UI updates immediately even if the backend is slow
            if (Array.isArray(completedCourses)) {
                const updatedCompletedCourses = [...completedCourses, course];
                // Make sure we don't have duplicates
                const uniqueCompletedCourses = Array.from(new Set(updatedCompletedCourses.map(c => c.id)))
                    .map(id => updatedCompletedCourses.find(c => c.id === id));
                setDone(uniqueCompletedCourses.length);
                console.log('Updated completion count with new course:', uniqueCompletedCourses.length);
            }
            fetchProgressData(true);
        };
        
        const handleCourseUncompleted = (course) => {
            console.log('Course uncompleted event received in ProgressSummary:', course.title);
            // Remove the course from our local count
            if (Array.isArray(completedCourses) && completedCourses.length > 0) {
                const updatedCompletedCourses = completedCourses.filter(c => c.id !== course.id);
                setDone(updatedCompletedCourses.length);
                console.log('Updated completion count after removal:', updatedCompletedCourses.length);
            }
            fetchProgressData(true);
        };
        
        // Register event listeners
        const removeCompletedListener = addEventListener('course-completed', handleCourseCompleted);
        const removeUncompletedListener = addEventListener('course-uncompleted', handleCourseUncompleted);
        
        // Clean up listeners
        return () => {
            removeCompletedListener();
            removeUncompletedListener();
        };
    }, [completedCourses, lastAction]);
    
    // Also update when lastAction changes (immediate response to user actions)
    useEffect(() => {
        if (lastAction?.type) {
            console.log('Course action detected in ProgressSummary:', lastAction.type);
            if (lastAction.type === 'course-completed') {
                // Increment our count immediately for responsive UI
                setDone(prevDone => prevDone + 1);
                console.log('Incremented completion count due to action');
            } else if (lastAction.type === 'course-uncompleted') {
                // Decrement our count immediately for responsive UI
                setDone(prevDone => Math.max(0, prevDone - 1));
                console.log('Decremented completion count due to action');
            }
        }
    }, [lastAction]);
    
    // Also fetch when completedCourses prop changes
    useEffect(() => {
        // If completedCourses is provided as a prop with data, use its length
        if (Array.isArray(completedCourses) && completedCourses.length > 0) {
            // If the length is different from current done count, update it
            if (done !== completedCourses.length) {
                setDone(completedCourses.length);
                console.log('Setting done count directly from prop:', completedCourses.length);
            }
        }
    }, [completedCourses, done]);

    const remaining = total - done;
    const completedPercent = total > 0 ? Math.round((done / total) * 100) : 0;

    return (
        <div className="progress-summary">
            <h2>Your Learning Progress</h2>
            <div className="progress-stats">
                <div className="stat-item">
                    <div className="stat-number">{done}</div>
                    <div className="stat-label">Completed</div>
                </div>
                <div className="stat-item">
                    <div className="stat-number">{remaining}</div>
                    <div className="stat-label">Remaining</div>
                </div>
                <div className="stat-item">
                    <div className="stat-number">{total}</div>
                    <div className="stat-label">Total Courses</div>
                </div>
            </div>
            <div className="progress-bar-container">
                <div className="progress-text">Progress: {done} / {total} completed ({completedPercent}%)</div>
                <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${completedPercent}%` }}></div>
                </div>
            </div>
        </div>
    );
};

ProgressSummary.propTypes = {
    completedCourses: PropTypes.array
};

export default ProgressSummary;
