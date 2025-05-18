import React, { useState } from 'react';
import { toast } from 'react-toastify';
import AdminLayout from './AdminLayout';
import api from '../../api/axios';

const AddCourse = () => {
  const initialFormState = {
    title: '',
    description: '',
    category: '',
    duration: '',
    level: 'beginner',
    image: '',
    materials: [''],
    isPublished: false
  };

  const [formData, setFormData] = useState(initialFormState);
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(null);
  const [dragOver, setDragOver] = useState(false);

  // Categories for the dropdown
  const categories = [
    "Mathematics",
    "Physics",
    "Chemistry",
    "Biology",
    "Literature",
    "History",
    "Geography",
    "Computer Science",
    "Art",
    "Physical Education"
  ];

  // Levels for the dropdown
  const levels = [
    { value: "beginner", label: "Beginner" },
    { value: "intermediate", label: "Intermediate" },
    { value: "advanced", label: "Advanced" }
  ];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    handleFile(file);
  };

  const handleFile = (file) => {
    if (file) {
      // In a real application, you would upload the file to a server
      // For now, just create a preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
        setFormData(prev => ({ ...prev, image: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const addMaterial = () => {
    setFormData(prev => ({
      ...prev,
      materials: [...prev.materials, '']
    }));
  };

  const handleMaterialChange = (index, value) => {
    const updatedMaterials = [...formData.materials];
    updatedMaterials[index] = value;
    
    setFormData(prev => ({
      ...prev,
      materials: updatedMaterials
    }));
  };

  const removeMaterial = (index) => {
    const updatedMaterials = formData.materials.filter((_, i) => i !== index);
    
    setFormData(prev => ({
      ...prev,
      materials: updatedMaterials
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.title || !formData.description || !formData.category) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    try {
      setLoading(true);
      
      // Filter out empty materials
      const filteredMaterials = formData.materials.filter(material => material.trim() !== '');
      const dataToSubmit = {
        ...formData,
        materials: filteredMaterials
      };

      // In a real application, you would make an API call to save the course
      // Simulating API call with setTimeout
      setTimeout(() => {
        // Success message
        toast.success('Course added successfully!');
        
        // Reset form
        setFormData(initialFormState);
        setPreview(null);
        
        setLoading(false);
      }, 1500);
      
    } catch (error) {
      console.error('Error adding course:', error);
      toast.error('Failed to add course. Please try again.');
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="admin-card" style={{'--i': 1}}>
        <div className="card-header">
          <h3 className="card-title">
            <ion-icon name="add-circle-outline"></ion-icon>
            Add New Course
          </h3>
        </div>
        <div className="card-body">
          <form className="admin-form" onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-col">
                {/* Title */}
                <div className="admin-form-group">
                  <label className="admin-form-label" htmlFor="title">
                    Course Title <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    className="admin-form-control"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="Enter course title"
                    required
                  />
                </div>
                
                {/* Category */}
                <div className="admin-form-group">
                  <label className="admin-form-label" htmlFor="category">
                    Category <span className="required">*</span>
                  </label>
                  <select
                    id="category"
                    name="category"
                    className="admin-form-select"
                    value={formData.category}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select a category</option>
                    {categories.map((category, index) => (
                      <option key={index} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
                
                {/* Duration */}
                <div className="admin-form-group">
                  <label className="admin-form-label" htmlFor="duration">
                    Duration
                  </label>
                  <input
                    type="text"
                    id="duration"
                    name="duration"
                    className="admin-form-control"
                    value={formData.duration}
                    onChange={handleChange}
                    placeholder="e.g., 2 weeks, 10 hours"
                  />
                </div>
                
                {/* Level */}
                <div className="admin-form-group">
                  <label className="admin-form-label" htmlFor="level">
                    Difficulty Level
                  </label>
                  <select
                    id="level"
                    name="level"
                    className="admin-form-select"
                    value={formData.level}
                    onChange={handleChange}
                  >
                    {levels.map((level, index) => (
                      <option key={index} value={level.value}>{level.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="form-col">
                {/* Image Upload */}
                <div className="admin-form-group">
                  <label className="admin-form-label">Course Image</label>
                  <div 
                    className={`image-upload-area ${dragOver ? 'dragover' : ''}`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                  >
                    {preview ? (
                      <div className="image-preview-container">
                        <img src={preview} alt="Course preview" className="image-preview" />
                        <button 
                          type="button" 
                          className="remove-image"
                          onClick={() => {
                            setPreview(null);
                            setFormData(prev => ({ ...prev, image: '' }));
                          }}
                        >
                          <ion-icon name="close-circle"></ion-icon>
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="upload-icon">
                          <ion-icon name="cloud-upload-outline"></ion-icon>
                        </div>
                        <p>Drag and drop an image here, or click to select</p>
                        <input
                          type="file"
                          id="image"
                          name="image"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="file-input"
                        />
                      </>
                    )}
                  </div>
                </div>
                
                {/* Published Status */}
                <div className="admin-form-group">
                  <label className="admin-form-checkbox">
                    <input
                      type="checkbox"
                      name="isPublished"
                      checked={formData.isPublished}
                      onChange={handleChange}
                    />
                    <span>Publish course immediately</span>
                  </label>
                </div>
              </div>
            </div>
            
            {/* Description */}
            <div className="admin-form-group">
              <label className="admin-form-label" htmlFor="description">
                Description <span className="required">*</span>
              </label>
              <textarea
                id="description"
                name="description"
                className="admin-form-textarea"
                value={formData.description}
                onChange={handleChange}
                placeholder="Enter course description"
                required
              ></textarea>
            </div>
            
            {/* Course Materials */}
            <div className="admin-form-group">
              <label className="admin-form-label">
                Course Materials
                <button 
                  type="button" 
                  className="add-material-btn"
                  onClick={addMaterial}
                >
                  <ion-icon name="add-circle-outline"></ion-icon> Add Material
                </button>
              </label>
              <div className="materials-list">
                {formData.materials.map((material, index) => (
                  <div key={index} className="material-item">
                    <input
                      type="text"
                      className="admin-form-control"
                      value={material}
                      onChange={(e) => handleMaterialChange(index, e.target.value)}
                      placeholder="Enter material URL or title"
                    />
                    <button 
                      type="button" 
                      className="remove-material"
                      onClick={() => removeMaterial(index)}
                    >
                      <ion-icon name="trash-outline"></ion-icon>
                    </button>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Submit Button */}
            <div className="form-actions">
              <button 
                type="button" 
                className="admin-form-cancel"
                onClick={() => {
                  setFormData(initialFormState);
                  setPreview(null);
                }}
              >
                Reset
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
                    <ion-icon name="save-outline"></ion-icon>
                    Add Course
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AddCourse;
