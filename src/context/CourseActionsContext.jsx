import React, { createContext, useContext, useState } from 'react';

// Create a context for managing course actions
const CourseActionsContext = createContext();

// Custom hook to use the course actions context
export const useCourseActions = () => {
  return useContext(CourseActionsContext);
};

// Provider component to wrap the application
export const CourseActionsProvider = ({ children }) => {
  // State to track the last course action
  const [lastAction, setLastAction] = useState({
    type: null, // 'save', 'unsave', 'complete', 'uncomplete'
    courseId: null,
    timestamp: null
  });

  // Events that components can subscribe to
  const [eventListeners] = useState({
    'course-saved': [],
    'course-unsaved': [],
    'course-completed': [],
    'course-uncompleted': []
  });

  // Register a new event listener
  const addEventListener = (eventType, callback) => {
    if (eventListeners[eventType]) {
      eventListeners[eventType].push(callback);
      
      // Return a function to remove this listener
      return () => {
        const index = eventListeners[eventType].indexOf(callback);
        if (index !== -1) {
          eventListeners[eventType].splice(index, 1);
        }
      };
    }
    return () => {}; // Empty cleanup function if event type doesn't exist
  };

  // Trigger an event
  const triggerEvent = (eventType, courseData) => {
    if (eventListeners[eventType]) {
      // Update last action
      setLastAction({
        type: eventType,
        courseId: courseData.id,
        timestamp: new Date()
      });
      
      // Call all listeners for this event type
      eventListeners[eventType].forEach(callback => {
        try {
          callback(courseData);
        } catch (error) {
          console.error(`Error in ${eventType} event listener:`, error);
        }
      });
    }
  };

  // Notify when a course is saved
  const notifyCourseSaved = (course) => {
    triggerEvent('course-saved', course);
  };

  // Notify when a course is unsaved
  const notifyCourseUnsaved = (course) => {
    triggerEvent('course-unsaved', course);
  };

  // Notify when a course is completed
  const notifyCourseCompleted = (course) => {
    triggerEvent('course-completed', course);
  };

  // Notify when a course is uncompleted (marked incomplete)
  const notifyCourseUncompleted = (course) => {
    triggerEvent('course-uncompleted', course);
  };

  // Value to provide to consumers
  const contextValue = {
    lastAction,
    addEventListener,
    notifyCourseSaved,
    notifyCourseUnsaved,
    notifyCourseCompleted,
    notifyCourseUncompleted
  };

  return (
    <CourseActionsContext.Provider value={contextValue}>
      {children}
    </CourseActionsContext.Provider>
  );
};

export default CourseActionsProvider;
