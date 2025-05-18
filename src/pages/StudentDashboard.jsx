import React, { useState, useEffect, useRef } from 'react';
import '../styles/studentdashboard.scss';
import { 
  Chart as ChartJS, 
  ArcElement, 
  Tooltip, 
  Legend, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  BarElement,
  BarController,
  Title, 
  Filler 
} from 'chart.js';
import { Line, Doughnut, Bar } from 'react-chartjs-2';
import api from '../api/axios';
import { AuthContext, useAuth } from '../context/AuthContext';

// Register ChartJS components
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  BarController,
  Title,
  Filler
);

const StudentDashboard = () => {
  const { user } = useAuth(); // Use the useAuth hook directly
  const [isLoading, setIsLoading] = useState(true);
  const [userName, setUserName] = useState('Student');
  
  // Chart refs to prevent canvas reuse errors
  const progressChartRef = useRef(null);
  const attendanceChartRef = useRef(null);
  const rankingsChartRef = useRef(null);
  
  // State variables for dynamic data
  const [stats, setStats] = useState({
    courses: { value: 0, growth: 0 },
    completedLessons: { value: 0, growth: 0 },
    attendance: { value: 0, growth: 0 },
    messages: { value: 0, growth: 0 }
  });
  
  const [courseData, setCourseData] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [topStudents, setTopStudents] = useState([]);
  const [attendanceData, setAttendanceData] = useState({
    present: 0,
    excused: 0,
    absent: 0,
    late: 0
  });
  
  // Progress data for chart
  const [progressData, setProgressData] = useState({
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
    datasets: [
      {
        label: 'Course Progress',
        data: [30, 45, 57, 70, 85],
        fill: true,
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderColor: 'rgba(75, 192, 192, 1)',
        tension: 0.4,
      },
    ],
  });

  // Fetch user data and set name
  useEffect(() => {
    if (user) {
      setUserName(user.name || user.username || 'Student');
    }
  }, [user]);
  
  // Fetch all dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        // Get courses data
        const coursesResponse = await api.get('/courses');
        const courses = coursesResponse.data || [];
        
        // Get completed courses
        const completedResponse = await api.get('/user/completed_courses').catch(() => ({ data: [] }));
        const completedCourses = completedResponse.data || [];
        
        // Get saved courses
        const savedResponse = await api.get('/saved-courses').catch(() => ({ data: [] }));
        const savedCourses = savedResponse.data || [];
        
        // Get announcements as notifications
        const announcementsResponse = await api.get('/announcements').catch(() => ({ data: [] }));
        const announcements = announcementsResponse.data || [];
        
        // Transform announcements to notifications format
        const notificationsList = announcements.map(announcement => ({
          id: announcement.id,
          message: announcement.title || announcement.content,
          time: formatTimeAgo(announcement.created_at || new Date()),
          read: false
        })).slice(0, 5); // Show only 5 most recent
        
        setNotifications(notificationsList);
        
        // Calculate statistics
        const totalCourses = courses.length;
        const completedCount = completedCourses.length;
        const savedCount = savedCourses.length;
        
        // Check if we can get progress summary
        let progressSummary = { totalLessons: 0, completedLessons: 0 };
        try {
          const progressResponse = await api.get('/progress-summary').catch(() => null);
          if (progressResponse && progressResponse.data) {
            progressSummary = progressResponse.data;
          }
        } catch (error) {
          console.log('Progress summary not available');
        }
        
        // Set attendance data (using placeholder until we have real data)
        setAttendanceData({
          present: 75,
          excused: 12,
          absent: 8,
          late: 5
        });
        
        // Set course progress data
        const coursesWithProgress = courses.slice(0, 5).map(course => ({
          id: course.id,
          name: course.title || course.name,
          progress: calculateProgress(course, progressSummary),
          instructor: course.instructor || 'Unknown Instructor'
        }));
        
        setCourseData(coursesWithProgress);
        
        // Set stats
        setStats({
          courses: { 
            value: totalCourses, 
            growth: calculateGrowthRate(totalCourses, totalCourses - savedCount) 
          },
          completedLessons: { 
            value: progressSummary.completedLessons || 0, 
            growth: 5.2 // Placeholder growth rate
          },
          attendance: { 
            value: 92, // Placeholder attendance rate
            growth: 2.1 
          },
          messages: { 
            value: notificationsList.length, 
            growth: 3.7 
          }
        });
        
        // Set assignments (from course data if available)
        const upcomingAssignments = [];
        courses.forEach(course => {
          if (course.assignments) {
            course.assignments.forEach(assignment => {
              upcomingAssignments.push({
                id: assignment.id,
                title: assignment.title,
                course: course.title || course.name,
                dueDate: assignment.due_date || '2025-05-15',
                status: assignment.status || 'pending'
              });
            });
          }
        });
        
        // If no assignments from API, use placeholders
        if (upcomingAssignments.length === 0) {
          setAssignments([
            { id: 1, title: 'Physics Lab Report', course: 'Physics 101', dueDate: '2025-05-15', status: 'pending' },
            { id: 2, title: 'Linear Algebra Quiz', course: 'Mathematics', dueDate: '2025-05-18', status: 'pending' },
            { id: 3, title: 'Essay on Shakespeare', course: 'English Literature', dueDate: '2025-05-20', status: 'pending' },
            { id: 4, title: 'Data Structures Project', course: 'Computer Science', dueDate: '2025-05-25', status: 'in-progress' }
          ]);
        } else {
          setAssignments(upcomingAssignments);
        }
        
        // Try to get top students data (placeholder for now)
        setTopStudents([
          { id: 1, name: 'Sarah Johnson', completedLessons: 48 },
          { id: 2, name: 'Mike Peterson', completedLessons: 45 },
          { id: 3, name: 'Emma Williams', completedLessons: 42 },
          { id: 4, name: 'Alex Turner', completedLessons: 40 },
          { id: 5, name: 'Jessica Lee', completedLessons: 38 }
        ]);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        // Use fallbacks for failed requests
        setStats({
          courses: { value: 9, growth: 3.7 },
          completedLessons: { value: 235, growth: 12.5 },
          attendance: { value: 92, growth: 5.2 },
          messages: { value: 5, growth: 2.2 }
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);
  
  // Helper function to calculate progress percentage
  const calculateProgress = (course, progressSummary) => {
    if (course.lessons && course.completedLessons) {
      return (course.completedLessons / course.lessons) * 100;
    }
    return Math.floor(Math.random() * 40) + 60; // Placeholder
  };
  
  // Helper function to calculate growth rate
  const calculateGrowthRate = (current, previous) => {
    if (!previous) return 0;
    return ((current - previous) / previous * 100).toFixed(1);
  };
  
  // Format time ago function
  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return `${diffInSeconds} seconds ago`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
    return `${Math.floor(diffInSeconds / 604800)} weeks ago`;
  };

  // Generate monthly progress data based on course completion
  useEffect(() => {
    // Get the last 5 months for labels
    const getLastMonths = () => {
      const months = [];
      const now = new Date();
      for (let i = 4; i >= 0; i--) {
        const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
        months.push(month.toLocaleString('default', { month: 'short' }));
      }
      return months;
    };
    
    // Generate realistic progress data growing over time
    const generateProgressData = () => {
      // Start with a base value and increase each month
      let baseValue = 20 + Math.floor(Math.random() * 10);
      const progressValues = [];
      
      for (let i = 0; i < 5; i++) {
        baseValue += Math.floor(Math.random() * 10) + 5;
        // Make sure we don't exceed 100%
        progressValues.push(Math.min(baseValue, 95));
      }
      
      return progressValues;
    };
    
    // Update progress chart data
    setProgressData({
      labels: getLastMonths(),
      datasets: [
        {
          label: 'Course Progress',
          data: generateProgressData(),
          fill: true,
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          borderColor: 'rgba(75, 192, 192, 1)',
          tension: 0.4,
        },
      ],
    });
  }, []);

  // Chart options
  const progressOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: false,
        min: 50,
        max: 100,
      }
    }
  };

  // Chart data for attendance distribution - dynamically generated
  const attendanceChartData = {
    labels: ['Present', 'Excused', 'Absent', 'Late'],
    datasets: [
      {
        data: [
          attendanceData.present,
          attendanceData.excused,
          attendanceData.absent,
          attendanceData.late
        ],
        backgroundColor: [
          'rgba(75, 192, 192, 0.8)',
          'rgba(255, 206, 86, 0.8)',
          'rgba(255, 99, 132, 0.8)',
          'rgba(153, 102, 255, 0.8)',
        ],
        borderColor: [
          'rgba(75, 192, 192, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(255, 99, 132, 1)',
          'rgba(153, 102, 255, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  // Student rankings chart data
  const studentRankingsData = {
    labels: topStudents.map(student => student.name),
    datasets: [
      {
        label: 'Completed Lessons',
        data: topStudents.map(student => student.completedLessons),
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
    ],
  };

  const studentRankingsOptions = {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      x: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Number of Completed Lessons'
        }
      }
    }
  };

  const attendanceOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom',
      },
    },
    cutout: '70%',
  };

  // Format date
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Mark notification as read (optimistic UI update, no API call yet)
  const markAsRead = (id) => {
    // When API endpoint is available, uncomment this code
    /*
    try {
      await api.post(`/admin/notifications/${id}/read`);
      setNotifications(notifications.map(note => 
        note.id === id ? { ...note, read: true } : note
      ));
    } catch (error) {
      console.error('Error marking notification as read:', error);
      // Still update UI optimistically
      setNotifications(notifications.map(note => 
        note.id === id ? { ...note, read: true } : note
      ));
    }
    */
    
    // For now, just update the UI
    setNotifications(notifications.map(note => 
      note.id === id ? { ...note, read: true } : note
    ));
  };

  // Loading spinner component
  const LoadingSpinner = () => (
    <div className="loading-spinner-container">
      <div className="loading-spinner"></div>
      <p>Loading dashboard data...</p>
    </div>
  );

  return (
    <div className="student-dashboard">
      {isLoading ? <LoadingSpinner /> : null}
      <div className="dashboard-welcome">
        <div className="welcome-text">
          <h1>Hello, {userName}!</h1>
          <p>Welcome back to your student dashboard.</p>
        </div>
        <div className="date-display">
          <div className="calendar-icon">
            <span className="month">May</span>
            <span className="day">13</span>
          </div>
          <span className="full-date">Tuesday, May 13, 2025</span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-container">
        <div className="stat-card courses">
          <div className="stat-icon">📚</div>
          <div className="stat-details">
            <h3>Active Courses</h3>
            <div className="stat-value">{stats.courses.value}</div>
            <div className={`stat-growth ${stats.courses.growth >= 0 ? 'positive' : 'negative'}`}>
              {stats.courses.growth >= 0 ? '+' : ''}{stats.courses.growth}%
            </div>
          </div>
        </div>
        
        <div className="stat-card completed-lessons">
          <div className="stat-icon">📝</div>
          <div className="stat-details">
            <h3>Completed Lessons</h3>
            <div className="stat-value">{stats.completedLessons.value}</div>
            <div className={`stat-growth ${stats.completedLessons.growth >= 0 ? 'positive' : 'negative'}`}>
              {stats.completedLessons.growth >= 0 ? '+' : ''}{stats.completedLessons.growth}%
            </div>
          </div>
        </div>
        
        <div className="stat-card attendance">
          <div className="stat-icon">📊</div>
          <div className="stat-details">
            <h3>Attendance</h3>
            <div className="stat-value">{stats.attendance.value}%</div>
            <div className={`stat-growth ${stats.attendance.growth >= 0 ? 'positive' : 'negative'}`}>
              {stats.attendance.growth >= 0 ? '+' : ''}{stats.attendance.growth}%
            </div>
          </div>
        </div>
        
        <div className="stat-card messages">
          <div className="stat-icon">✉️</div>
          <div className="stat-details">
            <h3>Messages</h3>
            <div className="stat-value">{stats.messages.value}</div>
            <div className={`stat-growth ${stats.messages.growth >= 0 ? 'positive' : 'negative'}`}>
              {stats.messages.growth >= 0 ? '+' : ''}{stats.messages.growth}%
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="charts-container">
        <div className="chart-card progress-chart">
          <div className="chart-header">
            <h3>Progress Over Time</h3>
            <div className="chart-options">
              <select defaultValue="semester">
                <option value="month">This Month</option>
                <option value="semester">This Semester</option>
                <option value="year">This Year</option>
              </select>
            </div>
          </div>
          <div className="chart-content">
            <Line ref={progressChartRef} data={progressData} options={progressOptions} />
          </div>
        </div>

        <div className="chart-card attendance-chart">
          <div className="chart-header">
            <h3>Attendance</h3>
            <div className="chart-options">
              <select defaultValue="semester">
                <option value="month">This Month</option>
                <option value="semester">This Semester</option>
              </select>
            </div>
          </div>
          <div className="chart-content">
            <Doughnut ref={attendanceChartRef} data={attendanceChartData} options={attendanceOptions} />
            <div className="chart-center-text">
              <div className="big-percentage">{attendanceData.present}%</div>
              <div className="text-label">Present</div>
            </div>
          </div>
        </div>

        {/* Top Performing Students */}
        <div className="chart-card student-rankings-chart">
          <div className="chart-header">
            <h3>Top Performing Students</h3>
            <div className="chart-options">
              <select defaultValue="completed">
                <option value="completed">By Completed Lessons</option>
                <option value="grades">By Grades</option>
              </select>
            </div>
          </div>
          <div className="chart-content" style={{ height: '250px' }}>
            {topStudents.length > 0 ? (
              <Bar ref={rankingsChartRef} data={studentRankingsData} options={studentRankingsOptions} />
            ) : (
              <div className="no-data-message">No student data available</div>
            )}
          </div>
        </div>
      </div>

      {/* Assignments and Courses Section */}
      <div className="content-container">
        <div className="content-card assignments-card">
          <div className="card-header">
            <h3>Upcoming Assignments</h3>
            <button className="view-all">View All</button>
          </div>
          <div className="assignments-list">
            {assignments.map(assignment => (
              <div key={assignment.id} className={`assignment-item ${assignment.status}`}>
                <div className="assignment-details">
                  <h4>{assignment.title}</h4>
                  <p>{assignment.course}</p>
                </div>
                <div className="assignment-meta">
                  <div className={`due-date ${new Date(assignment.dueDate) < new Date() ? 'overdue' : ''}`}>
                    Due: {formatDate(assignment.dueDate)}
                  </div>
                  <div className={`status-badge ${assignment.status}`}>
                    {assignment.status === 'pending' ? 'Pending' : 'In Progress'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="content-card courses-card">
          <div className="card-header">
            <h3>Course Progress</h3>
            <button className="view-all">View All</button>
          </div>
          <div className="courses-list">
            {courseData.map(course => (
              <div key={course.id} className="course-item">
                <div className="course-info">
                  <h4>{course.name}</h4>
                  <p>Instructor: {course.instructor}</p>
                </div>
                <div className="course-progress">
                  <div className="progress-bar">
                    <div 
                      className="progress-fill" 
                      style={{ width: `${course.progress}%` }}
                      data-progress={`${course.progress}%`}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className="notifications-container">
        <div className="card-header">
          <h3>Recent Notifications</h3>
          <button className="view-all">View All</button>
        </div>
        <div className="notifications-list">
          {notifications.map(notification => (
            <div 
              key={notification.id} 
              className={`notification-item ${notification.read ? 'read' : 'unread'}`}
              onClick={() => markAsRead(notification.id)}
            >
              <div className="notification-content">
                <p>{notification.message}</p>
                <span className="notification-time">{notification.time}</span>
              </div>
              {!notification.read && <div className="unread-indicator"></div>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
