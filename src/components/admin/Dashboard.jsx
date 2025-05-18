import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import AdminLayout from './AdminLayout';
import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, BarElement } from 'chart.js';
import { Line, Doughnut, Bar } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(ArcElement, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend);

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCourses: 0,
    completedCourses: 0,
    activeUsers: 0
  });
  const [loading, setLoading] = useState(true);
  const [recentUsers, setRecentUsers] = useState([]);
  const [popularCourses, setPopularCourses] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // In a real application, you would make API calls to fetch this data
        // For now, we'll use simulated data
        
        // Simulating API calls
        setTimeout(() => {
          setStats({
            totalUsers: 256,
            totalCourses: 48,
            completedCourses: 128,
            activeUsers: 183
          });
          
          setRecentUsers([
            { id: 1, name: 'Sarah Johnson', email: 'sarah.j@example.com', joinDate: '2025-05-10', status: 'active' },
            { id: 2, name: 'Michael Chen', email: 'mchen@example.com', joinDate: '2025-05-09', status: 'active' },
            { id: 3, name: 'Emma Davis', email: 'emma.d@example.com', joinDate: '2025-05-08', status: 'pending' },
            { id: 4, name: 'Alex Rodriguez', email: 'alex.r@example.com', joinDate: '2025-05-07', status: 'active' },
            { id: 5, name: 'Zoe Williams', email: 'zoe.w@example.com', joinDate: '2025-05-06', status: 'inactive' }
          ]);
          
          setPopularCourses([
            { id: 1, title: 'Introduction au Tronc Commun', enrollments: 87, completionRate: 65, rating: 4.8 },
            { id: 2, title: 'Mathématiques 1BAC', enrollments: 76, completionRate: 58, rating: 4.6 },
            { id: 3, title: 'Physique 2BAC', enrollments: 65, completionRate: 72, rating: 4.9 },
            { id: 4, title: 'Chimie Tronc Commun', enrollments: 54, completionRate: 61, rating: 4.5 }
          ]);
          
          setLoading(false);
        }, 800);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);

  // Chart data for Enrollment Trends
  const enrollmentData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'New Enrollments',
        data: [65, 78, 90, 105, 112, 125],
        borderColor: '#13a394',
        backgroundColor: 'rgba(19, 163, 148, 0.1)',
        tension: 0.4,
        fill: true
      }
    ]
  };

  // Chart data for Completion Rates
  const completionData = {
    labels: ['Completed', 'In Progress', 'Not Started'],
    datasets: [
      {
        data: [45, 30, 25],
        backgroundColor: ['#27ae60', '#f39c12', '#e9ecef'],
        borderColor: ['#27ae60', '#f39c12', '#e9ecef'],
        borderWidth: 1
      }
    ]
  };

  // Chart data for Course Categories
  const categoryData = {
    labels: ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'Literature', 'History'],
    datasets: [
      {
        label: 'Number of Courses',
        data: [12, 8, 10, 6, 5, 7],
        backgroundColor: 'rgba(52, 152, 219, 0.7)',
      }
    ]
  };

  return (
    <AdminLayout>
      {loading ? (
        <div className="admin-loading">
          <div className="spinner"></div>
          <p>Loading dashboard data...</p>
        </div>
      ) : (
        <>
          {/* Stats Cards */}
          <div className="dashboard-stats">
            <div className="stat-card" style={{'--i': 1}}>
              <div className="stat-icon primary">
                <ion-icon name="people-outline"></ion-icon>
              </div>
              <div className="stat-details">
                <h3 className="stat-value">{stats.totalUsers}</h3>
                <p className="stat-label">Total Users</p>
                <div className="stat-change positive">
                  <ion-icon name="trending-up-outline"></ion-icon> 
                  <span>+12% this month</span>
                </div>
              </div>
            </div>
            
            <div className="stat-card" style={{'--i': 2}}>
              <div className="stat-icon info">
                <ion-icon name="book-outline"></ion-icon>
              </div>
              <div className="stat-details">
                <h3 className="stat-value">{stats.totalCourses}</h3>
                <p className="stat-label">Total Courses</p>
                <div className="stat-change positive">
                  <ion-icon name="trending-up-outline"></ion-icon> 
                  <span>+5 new this month</span>
                </div>
              </div>
            </div>
            
            <div className="stat-card" style={{'--i': 3}}>
              <div className="stat-icon success">
                <ion-icon name="checkmark-circle-outline"></ion-icon>
              </div>
              <div className="stat-details">
                <h3 className="stat-value">{stats.completedCourses}</h3>
                <p className="stat-label">Courses Completed</p>
                <div className="stat-change positive">
                  <ion-icon name="trending-up-outline"></ion-icon> 
                  <span>+18% this month</span>
                </div>
              </div>
            </div>
            
            <div className="stat-card" style={{'--i': 4}}>
              <div className="stat-icon warning">
                <ion-icon name="pulse-outline"></ion-icon>
              </div>
              <div className="stat-details">
                <h3 className="stat-value">{stats.activeUsers}</h3>
                <p className="stat-label">Active Users</p>
                <div className="stat-change positive">
                  <ion-icon name="trending-up-outline"></ion-icon> 
                  <span>+8% this month</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Charts */}
          <div className="dashboard-charts">
            <div className="admin-card" style={{'--i': 1}}>
              <div className="card-header">
                <h3 className="card-title">
                  <ion-icon name="trending-up-outline"></ion-icon>
                  Enrollment Trends
                </h3>
                <div className="card-actions">
                  <button className="action-btn">
                    <ion-icon name="download-outline"></ion-icon>
                  </button>
                  <button className="action-btn">
                    <ion-icon name="ellipsis-vertical-outline"></ion-icon>
                  </button>
                </div>
              </div>
              <div className="card-body">
                <div className="chart-container">
                  <Line 
                    data={enrollmentData} 
                    options={{
                      responsive: true,
                      plugins: {
                        legend: {
                          position: 'top',
                        },
                        title: {
                          display: false
                        }
                      }
                    }} 
                  />
                </div>
              </div>
            </div>
            
            <div className="charts-row">
              <div className="admin-card chart-card" style={{'--i': 2}}>
                <div className="card-header">
                  <h3 className="card-title">
                    <ion-icon name="pie-chart-outline"></ion-icon>
                    Completion Rates
                  </h3>
                </div>
                <div className="card-body">
                  <div className="chart-container donut-chart">
                    <Doughnut 
                      data={completionData} 
                      options={{
                        responsive: true,
                        plugins: {
                          legend: {
                            position: 'bottom'
                          }
                        },
                        cutout: '70%'
                      }} 
                    />
                  </div>
                </div>
              </div>
              
              <div className="admin-card chart-card" style={{'--i': 3}}>
                <div className="card-header">
                  <h3 className="card-title">
                    <ion-icon name="bar-chart-outline"></ion-icon>
                    Course Categories
                  </h3>
                </div>
                <div className="card-body">
                  <div className="chart-container">
                    <Bar 
                      data={categoryData} 
                      options={{
                        responsive: true,
                        plugins: {
                          legend: {
                            display: false
                          }
                        }
                      }} 
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Recent Users */}
          <div className="admin-card" style={{'--i': 4}}>
            <div className="card-header">
              <h3 className="card-title">
                <ion-icon name="people-outline"></ion-icon>
                Recent Users
              </h3>
              <div className="card-actions">
                <Link to="/admin/users" className="card-link">
                  View All
                </Link>
              </div>
            </div>
            <div className="card-body">
              <div className="table-responsive">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Join Date</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentUsers.map(user => (
                      <tr key={user.id}>
                        <td>{user.name}</td>
                        <td>{user.email}</td>
                        <td>{user.joinDate}</td>
                        <td>
                          <span className={`status-badge ${user.status}`}>
                            {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                          </span>
                        </td>
                        <td>
                          <div className="table-actions">
                            <button className="action-btn view-btn">
                              <ion-icon name="eye-outline"></ion-icon>
                            </button>
                            <button className="action-btn edit-btn">
                              <ion-icon name="create-outline"></ion-icon>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          
          {/* Popular Courses */}
          <div className="admin-card" style={{'--i': 5}}>
            <div className="card-header">
              <h3 className="card-title">
                <ion-icon name="star-outline"></ion-icon>
                Popular Courses
              </h3>
              <div className="card-actions">
                <Link to="/admin/courses" className="card-link">
                  View All
                </Link>
              </div>
            </div>
            <div className="card-body">
              <div className="table-responsive">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Course Title</th>
                      <th>Enrollments</th>
                      <th>Completion Rate</th>
                      <th>Rating</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {popularCourses.map(course => (
                      <tr key={course.id}>
                        <td>{course.title}</td>
                        <td>{course.enrollments}</td>
                        <td>
                          <div className="progress-bar-container">
                            <div 
                              className="progress-bar" 
                              style={{ width: `${course.completionRate}%` }}
                            ></div>
                            <span>{course.completionRate}%</span>
                          </div>
                        </td>
                        <td>{course.rating}/5</td>
                        <td>
                          <div className="table-actions">
                            <button className="action-btn view-btn">
                              <ion-icon name="eye-outline"></ion-icon>
                            </button>
                            <button className="action-btn edit-btn">
                              <ion-icon name="create-outline"></ion-icon>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      )}
    </AdminLayout>
  );
};

export default Dashboard;
