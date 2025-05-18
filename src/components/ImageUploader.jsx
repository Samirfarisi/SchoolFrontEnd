import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const ImageUploader = () => {
  const { user, setUser } = useAuth();
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(null);
  const fileInputRef = useRef(null);

  // Reset status when component mounts
  useEffect(() => {
    setUploadStatus(null);
    
    // Set initial preview if user has an avatar
    if (user && user.avatar_url) {
      setPreviewUrl(user.avatar_url);
    }
  }, [user]);

  // Handle file selection
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setSelectedFile(file);

    // Create preview image
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result);
    };
    reader.readAsDataURL(file);
  };

  // Upload the image using base64
  const handleUpload = async () => {
    if (!selectedFile || !previewUrl) {
      setUploadStatus({
        type: 'error',
        message: 'Please select an image first'
      });
      return;
    }

    setIsUploading(true);
    setUploadStatus(null);

    try {
      // Get auth token
      const token = localStorage.getItem('token') || localStorage.getItem('admin_token');
      if (!token) {
        throw new Error('Authentication token not found. Please log in again.');
      }

      // Send base64 data to server
      const response = await fetch('http://127.0.0.1:8000/api/update-profile-image-base64', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          image_data: previewUrl
        })
      });

      const data = await response.json();
      console.log('Upload response:', data);

      if (response.ok) {
        // Update user state with new avatar URL
        if (setUser && data.avatar_url) {
          console.log('New avatar URL:', data.avatar_url);
          
          // Update user state in context
          setUser(currentUser => ({
            ...currentUser,
            avatar_url: data.avatar_url
          }));
          
          setUploadStatus({
            type: 'success',
            message: 'Profile image uploaded successfully!'
          });
          
          // Close modal and refresh after delay
          setTimeout(() => {
            try {
              const modal = document.getElementById('imageUploaderModal');
              if (modal) modal.style.display = 'none';
              window.location.reload();
            } catch (err) {
              console.error('Error closing modal:', err);
            }
          }, 1500);
        }
      } else {
        setUploadStatus({
          type: 'error',
          message: data.message || 'Failed to upload image'
        });
      }
    } catch (error) {
      console.error('Upload error:', error);
      setUploadStatus({
        type: 'error',
        message: error.message || 'Network error during upload'
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="image-uploader" style={{ padding: '20px', textAlign: 'center' }}>
      <h3>Update Profile Image</h3>
      
      {/* Image preview */}
      <div style={{ marginBottom: '20px', marginTop: '15px' }}>
        {previewUrl ? (
          <img
            src={previewUrl}
            alt="Profile Preview"
            style={{
              width: '200px',
              height: '200px',
              borderRadius: '50%',
              objectFit: 'cover',
              border: '3px solid #ddd',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}
          />
        ) : (
          <div style={{
            width: '200px',
            height: '200px',
            margin: '0 auto',
            borderRadius: '50%',
            backgroundColor: '#f1f1f1',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#999',
            fontSize: '18px'
          }}>
            Select an image
          </div>
        )}
      </div>
      
      {/* File input and upload button */}
      <div style={{ marginBottom: '20px' }}>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          accept="image/jpeg, image/png, image/gif, image/jpg"
          style={{ marginBottom: '10px', display: 'none' }}
          id="file-input"
        />
        <label
          htmlFor="file-input"
          style={{
            padding: '8px 16px',
            backgroundColor: '#007bff',
            color: 'white',
            borderRadius: '4px',
            cursor: 'pointer',
            marginRight: '10px'
          }}
        >
          Choose File
        </label>
        <button
          onClick={handleUpload}
          disabled={isUploading || !selectedFile}
          style={{
            padding: '8px 16px',
            backgroundColor: isUploading || !selectedFile ? '#cccccc' : '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: isUploading || !selectedFile ? 'not-allowed' : 'pointer'
          }}
        >
          {isUploading ? 'Uploading...' : 'Upload Image'}
        </button>
      </div>
      
      {/* Display selected filename */}
      {selectedFile && (
        <div style={{ marginBottom: '15px', fontSize: '0.9em' }}>
          Selected: {selectedFile.name} ({Math.round(selectedFile.size / 1024)} KB)
        </div>
      )}
      
      {/* Status message */}
      {uploadStatus && (
        <div style={{
          padding: '10px',
          backgroundColor: uploadStatus.type === 'success' ? '#d4edda' : '#f8d7da',
          color: uploadStatus.type === 'success' ? '#155724' : '#721c24',
          borderRadius: '4px',
          marginTop: '15px'
        }}>
          {uploadStatus.message}
          {uploadStatus.type === 'success' && (
            <div style={{ marginTop: '5px', fontSize: '0.9em' }}>
              Refreshing page in a moment...
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ImageUploader;
