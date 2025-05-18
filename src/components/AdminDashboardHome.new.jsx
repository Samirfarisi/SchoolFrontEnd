import React, { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  ArcElement,
  LineElement,
  BarElement,
  PointElement,
  BarController,
  LineController,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Doughnut, Line, Bar } from 'react-chartjs-2';
import { FaUsers, FaBook, FaCheckCircle, FaBookmark, FaComments, FaUserCircle } from 'react-icons/fa';
import './AdminDashboard.css';

// Register all required ChartJS components
ChartJS.register(
  ArcElement,
  LineElement,
  BarElement,
  PointElement,
  BarController,
  LineController,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend,
  Filler
);

const AdminDashboardHome = () => {
  // Static data for dashboard
  const dashboardData = {
    stats: {
      totalUsers: 5,
      totalCourses: 10,
      completedCourses: 3,
      savedCourses: 8,
      totalMessages: 12
    },
    courseDistribution: {
      labels: ['Technical', 'HVAC', 'SEOC'],
      data: [4, 3, 3]
    },
    userRegistrationData: {
      labels: ['Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May'],
      data: [1, 2, 1, 3, 2, 5]
    },
    topCourses: [
      { id: 1, title: 'Introduction to React', saves_count: 8 },
      { id: 2, title: 'Advanced JavaScript', saves_count: 6 },
      { id: 3, title: 'HVAC Basics', saves_count: 5 },
      { id: 4, title: 'Technical Course 101', saves_count: 4 },
      { id: 5, title: 'SEOC Fundamentals', saves_count: 3 }
    ],
    recentActivity: [
      { type: 'user_registered', user: 'John Doe', timestamp: new Date() },
      { type: 'course_saved', user: 'Jane Smith', course: 'Introduction to React', timestamp: new Date(Date.now() - 86400000) },
      { type: 'course_completed', user: 'Alex Brown', course: 'HVAC Basics', timestamp: new Date(Date.now() - 172800000) },
      { type: 'user_registered', user: 'David Green', timestamp: new Date(Date.now() - 259200000) },
      { type: 'course_saved', user: 'Jeffrey Keller', course: 'SEOC Fundamentals', timestamp: new Date(Date.now() - 345600000) }
    ]
  };

  // State for loading
  const [isLoading, setIsLoading] = useState(true);
  
  // Basic loading effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);

  // Chart data for Doughnut chart
  const doughnutData = {
    labels: dashboardData.courseDistribution.labels,
    datasets: [
      {
        data: dashboardData.courseDistribution.data,
        backgroundColor: [
          '#56cf94', // Green for Technical
          '#4cc9f0', // Blue for HVAC  
          '#b266ff'  // Purple for SEOC
        ],
        borderWidth: 0,
        cutout: '70%',
        hoverOffset: 4
      }
    ]
  };

  // Chart options for Doughnut chart
  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 12
          }
        }
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const label = context.label || '';
            const value = context.raw || 0;
            const total = context.dataset.data.reduce((acc, curr) => acc + curr, 0);
            const percentage = Math.round((value / total) * 100);
            return `${label}: ${value} (${percentage}%)`;
          }
        }
      }
    }
  };

  // Chart data for Line chart
  const lineData = {
    labels: dashboardData.userRegistrationData.labels,
    datasets: [
      {
        label: 'New Users',
        data: dashboardData.userRegistrationData.data,
        borderColor: '#56cf94',
        backgroundColor: 'rgba(86, 207, 148, 0.2)',
        tension: 0.4,
        fill: true,
        pointBackgroundColor: '#56cf94',
        pointRadius: 4,
        pointHoverRadius: 6
      }
    ]
  };

  // Chart options for Line chart
  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          display: true,
          drawBorder: false,
          color: 'rgba(200, 200, 200, 0.2)'
        },
        ticks: {
          precision: 0,
          font: {
            size: 11
          }
        }
      },
      x: {
        grid: {
          display: false
        },
        ticks: {
          font: {
            size: 11
          }
        }
      }
    },
    plugins: {
      legend: {
        display: true,
        position: 'top',
        labels: {
          boxWidth: 12,
          font: {
            size: 12
          }
        }
      }
    }
  };

  // Chart data for Bar chart
  const barData = {
    labels: dashboardData.topCourses.map(course => course.title),
    datasets: [
      {
        label: 'Saves',
        data: dashboardData.topCourses.map(course => course.saves_count || 0),
        backgroundColor: '#4cc9f0',
        borderRadius: 6,
        barThickness: 12,
        maxBarThickness: 18
      }
    ]
  };

  // Chart options for Bar chart
  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'y',
    scales: {
      x: {
        beginAtZero: true,
        grid: {
          display: true,
          drawBorder: false,
          color: 'rgba(200, 200, 200, 0.2)'
        },
        ticks: {
          precision: 0,
          font: {
            size: 11
          }
        }
      },
      y: {
        grid: {
          display: false
        },
        ticks: {
          font: {
            size: 11
          }
        }
      }
    },
    plugins: {
      legend: {
        display: false
      }
    }
  };

  // Format date helper function
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="admin-dashboard-loader">
        <div className="spinner"></div>
        <p>Loading dashboard data...</p>
      </div>
    );
  }

  return (
    <div className="admin-dashboard-container">
      <div className="admin-dashboard-header">
        <h1>Admin Dashboard</h1>
        <p>Welcome to the administration panel. Here's an overview of your platform's performance and activity.</p>
      </div>
      
      {/* Stats Overview */}
      <div className="admin-dashboard-stats">
        <div className="stat-card primary">
          <div className="stat-icon">
            <FaUsers />
          </div>
          <div className="stat-details">
            <h3>Total Users</h3>
            <h2>{dashboardData.stats.totalUsers}</h2>
          </div>
        </div>
        
        <div className="stat-card success">
          <div className="stat-icon">
            <FaBook />
          </div>
          <div className="stat-details">
            <h3>Total Courses</h3>
            <h2>{dashboardData.stats.totalCourses}</h2>
          </div>
        </div>
        
        <div className="stat-card info">
          <div className="stat-icon">
            <FaCheckCircle />
          </div>
          <div className="stat-details">
            <h3>Completed</h3>
            <h2>{dashboardData.stats.completedCourses}</h2>
          </div>
        </div>
        
        <div className="stat-card warning">
          <div className="stat-icon">
            <FaBookmark />
          </div>
          <div className="stat-details">
            <h3>Saved</h3>
            <h2>{dashboardData.stats.savedCourses}</h2>
          </div>
        </div>
        
        <div className="stat-card danger">
          <div className="stat-icon">
            <FaComments />
          </div>
          <div className="stat-details">
            <h3>Messages</h3>
            <h2>{dashboardData.stats.totalMessages}</h2>
          </div>
        </div>
      </div>
      
      {/* Charts and Data Sections */}
      <div className="admin-dashboard-content">
        {/* Top Row */}
        <div className="admin-dashboard-row">
          {/* Course Distribution */}
          <div className="admin-dashboard-widget large">
            <div className="widget-header">
              <h3>Course Distribution by Category</h3>
            </div>
            <div className="widget-body">
              <div className="chart-container">
                <Doughnut 
                  data={doughnutData} 
                  options={doughnutOptions} 
                  id="doughnut-chart"
                  key="distribution-chart"
                />
              </div>
            </div>
          </div>
          
          {/* User Registration */}
          <div className="admin-dashboard-widget large">
            <div className="widget-header">
              <h3>User Registrations</h3>
            </div>
            <div className="widget-body">
              <div className="chart-container">
                <Line 
                  data={lineData} 
                  options={lineOptions} 
                  id="line-chart" 
                  key="registration-chart"
                />
              </div>
            </div>
          </div>
        </div>
        
        {/* Bottom Row */}
        <div className="admin-dashboard-row">
          {/* Top Courses */}
          <div className="admin-dashboard-widget">
            <div className="widget-header">
              <h3>Top Saved Courses</h3>
            </div>
            <div className="widget-body">
              <div className="chart-container small-chart">
                <Bar 
                  data={barData} 
                  options={barOptions} 
                  id="bar-chart"
                  key="top-courses-chart"
                />
              </div>
            </div>
          </div>
          
          {/* Recent Activity */}
          <div className="admin-dashboard-widget">
            <div className="widget-header">
              <h3>Recent Activity</h3>
            </div>
            <div className="widget-body">
              <div className="activity-feed">
                {dashboardData.recentActivity.length === 0 ? (
                  <div className="no-activity">No recent activity to display</div>
                ) : (
                  dashboardData.recentActivity.map((activity, index) => (
                    <div className="activity-item" key={index}>
                      <div className="activity-icon">
                        <FaUserCircle />
                      </div>
                      <div className="activity-details">
                        <div className="activity-content">
                          <strong>{activity.user}</strong> 
                          {activity.type === 'user_registered' && ' registered'}
                          {activity.type === 'course_saved' && ` saved "${activity.course}"`}
                          {activity.type === 'course_completed' && ` completed "${activity.course}"`}
                        </div>
                        <div className="activity-time">
                          {formatDate(activity.timestamp)}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardHome;
