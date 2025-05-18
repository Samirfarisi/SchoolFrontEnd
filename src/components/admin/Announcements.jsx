import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import AdminLayout from './AdminLayout';
import api from '../../api/axios';

const Announcements = () => {
  const initialFormState = {
    title: '',
    content: '',
    type: 'info',
    audience: 'all',
    startDate: '',
    endDate: '',
    isPinned: false,
  };

  // States
  const [announcements, setAnnouncements] = useState([]);
  const [formData, setFormData] = useState(initialFormState);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(null);

  // Announcement type options
  const typeOptions = [
    { value: 'info', label: 'Information', icon: 'information-circle-outline' },
    { value: 'success', label: 'Success', icon: 'checkmark-circle-outline' },
    { value: 'warning', label: 'Warning', icon: 'warning-outline' },
    { value: 'danger', label: 'Important', icon: 'alert-circle-outline' },
  ];
  
  // Audience options
  const audienceOptions = [
    { value: 'all', label: 'All Users' },
    { value: 'students', label: 'Students Only' },
    { value: 'teachers', label: 'Teachers Only' },
    { value: 'admins', label: 'Admins Only' },
  ];

  // Fetch announcements
  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        setLoading(true);
        
        // In a real application, you would make an API call to fetch announcements
        // For now, using dummy data
        setTimeout(() => {
          const mockAnnouncements = [
            {
              id: 1,
              title: 'Welcome to the New Platform',
              content: 'We are excited to announce the launch of our new learning platform.',
              type: 'success',
              audience: 'all',
              startDate: '2025-05-01',
              endDate: '2025-05-30',
              isPinned: true,
              createdAt: '2025-05-01',
            },
            {
              id: 2,
              title: 'System Maintenance',
              content: 'The platform will be down for maintenance on Sunday from 2 AM to 5 AM.',
              type: 'warning',
              audience: 'all',
              startDate: '2025-05-10',
              endDate: '2025-05-15',
              isPinned: false,
              createdAt: '2025-05-08',
            },
            {
              id: 3,
              title: 'New Courses Available',
              content: 'Check out the new mathematics and physics courses that have been added.',
              type: 'info',
              audience: 'students',
              startDate: '2025-05-05',
              endDate: '2025-06-05',
              isPinned: true,
              createdAt: '2025-05-05',
            },
            {
              id: 4,
              title: 'User Satisfaction Survey',
              content: 'Please take a moment to fill out our user satisfaction survey.',
              type: 'info',
              audience: 'all',
              startDate: '2025-05-06',
              endDate: '2025-05-20',
              isPinned: false,
              createdAt: '2025-05-06',
            },
            {
              id: 5,
              title: 'Important Policy Update',
              content: 'There has been an important update to our privacy policy.',
              type: 'danger',
              audience: 'all',
              startDate: '2025-05-09',
              endDate: '2025-05-30',
              isPinned: false,
              createdAt: '2025-05-09',
            },
          ];
          
          setAnnouncements(mockAnnouncements);
          setLoading(false);
        }, 800);
        
      } catch (error) {
        console.error('Error fetching announcements:', error);
        toast.error('Failed to load announcements');
        setLoading(false);
      }
    };
    
    fetchAnnouncements();
  }, []);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.title || !formData.content) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    try {
      setLoading(true);
      
      if (isEditing) {
        // Simulating update API call
        setTimeout(() => {
          const updatedAnnouncements = announcements.map(item => 
            item.id === editId ? { ...formData, id: editId } : item
          );
          setAnnouncements(updatedAnnouncements);
          
          // Reset form
          resetForm();
          
          toast.success('Announcement updated successfully!');
          setLoading(false);
        }, 800);
      } else {
        // Simulating create API call
        setTimeout(() => {
          const newAnnouncement = {
            ...formData,
            id: Date.now(),
            createdAt: new Date().toISOString().split('T')[0]
          };
          
          setAnnouncements(prev => [newAnnouncement, ...prev]);
          
          // Reset form
          resetForm();
          
          toast.success('Announcement created successfully!');
          setLoading(false);
        }, 800);
      }
      
    } catch (error) {
      console.error('Error saving announcement:', error);
      toast.error('Failed to save announcement');
      setLoading(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData(initialFormState);
    setIsEditing(false);
    setEditId(null);
    setShowForm(false);
  };

  // Edit announcement
  const handleEdit = (id) => {
    const announcementToEdit = announcements.find(item => item.id === id);
    if (announcementToEdit) {
      setFormData(announcementToEdit);
      setIsEditing(true);
      setEditId(id);
      setShowForm(true);
      
      // Scroll to form
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Delete announcement
  const handleDelete = (id) => {
    setConfirmDelete(id);
  };

  // Confirm delete
  const confirmDeleteAction = () => {
    try {
      // Simulating delete API call
      setTimeout(() => {
        const filteredAnnouncements = announcements.filter(item => item.id !== confirmDelete);
        setAnnouncements(filteredAnnouncements);
        
        toast.success('Announcement deleted successfully!');
        setConfirmDelete(null);
      }, 500);
    } catch (error) {
      console.error('Error deleting announcement:', error);
      toast.error('Failed to delete announcement');
      setConfirmDelete(null);
    }
  };

  // Toggle pin status
  const togglePin = (id) => {
    const updatedAnnouncements = announcements.map(item => 
      item.id === id ? { ...item, isPinned: !item.isPinned } : item
    );
    setAnnouncements(updatedAnnouncements);
    
    const isPinned = updatedAnnouncements.find(item => item.id === id).isPinned;
    toast.info(`Announcement ${isPinned ? 'pinned' : 'unpinned'}`);
  };

  // Filter announcements based on search term
  const filteredAnnouncements = announcements.filter(item => 
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="announcements-section">
        {/* Add/Edit Form */}
        <div className="admin-card" style={{'--i': 1}}>
          <div className="card-header">
            <h3 className="card-title">
              <ion-icon name="megaphone-outline"></ion-icon>
              {isEditing ? 'Edit Announcement' : 'Create New Announcement'}
            </h3>
            <div className="card-actions">
              <button 
                className="toggle-form-btn"
                onClick={() => setShowForm(!showForm)}
              >
                {showForm ? (
                  <ion-icon name="chevron-up-outline"></ion-icon>
                ) : (
                  <ion-icon name="chevron-down-outline"></ion-icon>
                )}
              </button>
            </div>
          </div>
          
          {showForm && (
            <div className="card-body announcement-form-container">
              <form className="admin-form" onSubmit={handleSubmit}>
                <div className="form-row">
                  <div className="form-col">
                    {/* Title */}
                    <div className="admin-form-group">
                      <label className="admin-form-label" htmlFor="title">
                        Title <span className="required">*</span>
                      </label>
                      <input
                        type="text"
                        id="title"
                        name="title"
                        className="admin-form-control"
                        value={formData.title}
                        onChange={handleChange}
                        placeholder="Enter announcement title"
                        required
                      />
                    </div>
                    
                    {/* Type */}
                    <div className="admin-form-group">
                      <label className="admin-form-label" htmlFor="type">
                        Announcement Type
                      </label>
                      <div className="type-selector">
                        {typeOptions.map(option => (
                          <label 
                            key={option.value} 
                            className={`type-option ${formData.type === option.value ? 'selected' : ''}`}
                          >
                            <input
                              type="radio"
                              name="type"
                              value={option.value}
                              checked={formData.type === option.value}
                              onChange={handleChange}
                              className="type-radio"
                            />
                            <span className={`type-icon ${option.value}`}>
                              <ion-icon name={option.icon}></ion-icon>
                            </span>
                            <span className="type-label">{option.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="form-col">
                    {/* Target Audience */}
                    <div className="admin-form-group">
                      <label className="admin-form-label" htmlFor="audience">
                        Target Audience
                      </label>
                      <select
                        id="audience"
                        name="audience"
                        className="admin-form-select"
                        value={formData.audience}
                        onChange={handleChange}
                      >
                        {audienceOptions.map(option => (
                          <option key={option.value} value={option.value}>{option.label}</option>
                        ))}
                      </select>
                    </div>
                    
                    {/* Dates */}
                    <div className="dates-row">
                      <div className="admin-form-group">
                        <label className="admin-form-label" htmlFor="startDate">
                          Start Date
                        </label>
                        <input
                          type="date"
                          id="startDate"
                          name="startDate"
                          className="admin-form-control"
                          value={formData.startDate}
                          onChange={handleChange}
                        />
                      </div>
                      
                      <div className="admin-form-group">
                        <label className="admin-form-label" htmlFor="endDate">
                          End Date
                        </label>
                        <input
                          type="date"
                          id="endDate"
                          name="endDate"
                          className="admin-form-control"
                          value={formData.endDate}
                          onChange={handleChange}
                        />
                      </div>
                    </div>
                    
                    {/* Pin option */}
                    <div className="admin-form-group">
                      <label className="admin-form-checkbox">
                        <input
                          type="checkbox"
                          name="isPinned"
                          checked={formData.isPinned}
                          onChange={handleChange}
                        />
                        <span>Pin this announcement</span>
                      </label>
                    </div>
                  </div>
                </div>
                
                {/* Content */}
                <div className="admin-form-group">
                  <label className="admin-form-label" htmlFor="content">
                    Content <span className="required">*</span>
                  </label>
                  <textarea
                    id="content"
                    name="content"
                    className="admin-form-textarea"
                    value={formData.content}
                    onChange={handleChange}
                    placeholder="Enter announcement content"
                    rows="5"
                    required
                  ></textarea>
                </div>
                
                {/* Actions */}
                <div className="form-actions">
                  <button 
                    type="button" 
                    className="admin-form-cancel"
                    onClick={resetForm}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="admin-form-submit"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-sm"></span>
                        Saving...
                      </>
                    ) : (
                      <>
                        <ion-icon name={isEditing ? 'save-outline' : 'add-circle-outline'}></ion-icon>
                        {isEditing ? 'Update Announcement' : 'Create Announcement'}
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
        
        {/* Announcements List */}
        <div className="admin-card" style={{'--i': 2}}>
          <div className="card-header">
            <h3 className="card-title">
              <ion-icon name="list-outline"></ion-icon>
              All Announcements
            </h3>
            <div className="card-actions">
              <div className="search-container">
                <ion-icon name="search-outline" className="search-icon"></ion-icon>
                <input
                  type="text"
                  className="search-input"
                  placeholder="Search announcements..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <button 
                className="admin-btn-primary"
                onClick={() => {
                  setShowForm(true);
                  setIsEditing(false);
                  setFormData(initialFormState);
                  
                  // Scroll to form
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              >
                <ion-icon name="add-outline"></ion-icon>
                New
              </button>
            </div>
          </div>
          <div className="card-body">
            {loading && announcements.length === 0 ? (
              <div className="admin-loading">
                <div className="spinner"></div>
                <p>Loading announcements...</p>
              </div>
            ) : filteredAnnouncements.length > 0 ? (
              <div className="announcements-list">
                {filteredAnnouncements.map((announcement, index) => (
                  <div 
                    key={announcement.id} 
                    className={`announcement-item ${announcement.type}`}
                    style={{'--i': index + 1}}
                  >
                    <div className="announcement-header">
                      <div className="announcement-title-row">
                        <h4 className="announcement-title">
                          {announcement.isPinned && (
                            <span className="pin-icon">
                              <ion-icon name="pin"></ion-icon>
                            </span>
                          )}
                          {announcement.title}
                        </h4>
                        <div className="announcement-type-badge">
                          {typeOptions.find(t => t.value === announcement.type)?.label}
                        </div>
                      </div>
                      <div className="announcement-meta">
                        <div className="announcement-dates">
                          <span>
                            <ion-icon name="calendar-outline"></ion-icon>
                            {announcement.startDate} - {announcement.endDate || 'No end date'}
                          </span>
                        </div>
                        <div className="announcement-audience">
                          <ion-icon name="people-outline"></ion-icon>
                          {audienceOptions.find(a => a.value === announcement.audience)?.label}
                        </div>
                      </div>
                    </div>
                    <div className="announcement-content">
                      <p>{announcement.content}</p>
                    </div>
                    <div className="announcement-actions">
                      <button 
                        className="action-btn pin-btn"
                        onClick={() => togglePin(announcement.id)}
                        title={announcement.isPinned ? 'Unpin announcement' : 'Pin announcement'}
                      >
                        <ion-icon name={announcement.isPinned ? 'pin' : 'pin-outline'}></ion-icon>
                      </button>
                      <button 
                        className="action-btn edit-btn"
                        onClick={() => handleEdit(announcement.id)}
                      >
                        <ion-icon name="create-outline"></ion-icon>
                      </button>
                      <button 
                        className="action-btn delete-btn"
                        onClick={() => handleDelete(announcement.id)}
                      >
                        <ion-icon name="trash-outline"></ion-icon>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-data">
                <ion-icon name="alert-circle-outline"></ion-icon>
                <p>No announcements found. {searchTerm ? 'Try a different search term.' : 'Create your first announcement!'}</p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Delete Confirmation Modal */}
      {confirmDelete && (
        <div className="admin-modal-overlay">
          <div className="admin-modal">
            <div className="admin-modal-header">
              <h3 className="admin-modal-title">Confirm Delete</h3>
              <button 
                className="admin-modal-close"
                onClick={() => setConfirmDelete(null)}
              >
                <ion-icon name="close-outline"></ion-icon>
              </button>
            </div>
            <div className="admin-modal-body">
              <p>Are you sure you want to delete this announcement? This action cannot be undone.</p>
            </div>
            <div className="admin-modal-footer">
              <button 
                className="admin-btn-secondary"
                onClick={() => setConfirmDelete(null)}
              >
                Cancel
              </button>
              <button 
                className="admin-btn-danger"
                onClick={confirmDeleteAction}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default Announcements;
