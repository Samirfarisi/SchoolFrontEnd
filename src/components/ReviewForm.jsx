import React, { useState } from 'react';
import PropTypes from 'prop-types';
import api from '../api/axios';
import '../index.scss';

const ReviewForm = ({ courseId, courseName, onReviewSubmitted, initialRating = 0, initialComment = '' }) => {
  const [rating, setRating] = useState(initialRating);
  const [comment, setComment] = useState(initialComment);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    
    try {
      const response = await api.post('/reviews', {
        course_id: courseId,
        rating,
        comment
      });
      
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      
      if (onReviewSubmitted) {
        onReviewSubmitted(response.data);
      }
      
      // Reset form if it's a new review (not editing)
      if (!initialRating && !initialComment) {
        setRating(0);
        setComment('');
      }
    } catch (err) {
      console.error('Error submitting review:', err);
      setError(err.response?.data?.message || 'Failed to submit review. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="review-form-container animate-fade-in">
      <h3 className="review-form-title">
        {initialRating ? 'Edit your review' : `Rate this course: ${courseName}`}
      </h3>
      
      {error && (
        <div className="review-error animate-fade-in">
          {error}
        </div>
      )}
      
      {success && (
        <div className="review-success animate-fade-in">
          Your review has been submitted successfully!
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="review-form">
        <div className="rating-container">
          <p>Your rating:</p>
          <div className="star-rating">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                className={`star-button ${star <= rating ? 'active' : ''}`}
                onClick={() => setRating(star)}
                aria-label={`Rate ${star} stars`}
              >
                <ion-icon name={star <= rating ? 'star' : 'star-outline'} />
              </button>
            ))}
          </div>
        </div>
        
        <div className="comment-container">
          <label htmlFor="review-comment">Your comment (optional):</label>
          <textarea
            id="review-comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share your experience with this course..."
            rows={4}
            className="review-textarea"
          />
        </div>
        
        <button 
          type="submit" 
          className="submit-review-btn hover-lift"
          disabled={submitting || rating === 0}
        >
          {submitting ? (
            <span className="loading-spinner"></span>
          ) : (
            <>
              <ion-icon name="send" />
              {initialRating ? 'Update Review' : 'Submit Review'}
            </>
          )}
        </button>
      </form>
    </div>
  );
};

ReviewForm.propTypes = {
  courseId: PropTypes.number.isRequired,
  courseName: PropTypes.string.isRequired,
  onReviewSubmitted: PropTypes.func,
  initialRating: PropTypes.number,
  initialComment: PropTypes.string
};

export default ReviewForm;
