// src/components/CourseReviews.jsx
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import api from '../api/axios';
import ReviewForm from './ReviewForm';
import { useAuth } from '../context/AuthContext';
import '../index.scss';

const CourseReviews = ({ courseId, courseName }) => {
    const [reviews, setReviews] = useState([]);
    const [average, setAverage] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showReviewForm, setShowReviewForm] = useState(false);
    const { user } = useAuth();
    const [userReview, setUserReview] = useState(null);

    // Format date for display
    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    // Fetch reviews for this course
    useEffect(() => {
        const fetchReviews = async () => {
            setLoading(true);
            try {
                const response = await api.get(`/courses/${courseId}/reviews`);
                const reviewsData = response.data || [];
                
                // Find user's review if it exists
                const foundUserReview = reviewsData.find(review => 
                    review.user_id === user?.id
                );
                
                if (foundUserReview) {
                    setUserReview(foundUserReview);
                }
                
                setReviews(reviewsData);
                
                // Calculate average rating
                if (reviewsData.length > 0) {
                    const sum = reviewsData.reduce((acc, review) => acc + review.rating, 0);
                    setAverage(sum / reviewsData.length);
                }
            } catch (err) {
                console.error('Error loading reviews:', err);
                setError('Failed to load reviews.');
            } finally {
                setLoading(false);
            }
        };

        if (courseId) {
            fetchReviews();
        }
    }, [courseId, user]);

    // Handle new review submission
    const handleReviewSubmitted = (newReview) => {
        // If user already had a review, update it
        if (userReview) {
            setReviews(prevReviews => 
                prevReviews.map(review => 
                    review.id === userReview.id ? newReview : review
                )
            );
            setUserReview(newReview);
        } else {
            // Otherwise add the new review
            setReviews(prevReviews => [...prevReviews, newReview]);
            setUserReview(newReview);
        }
        
        // Recalculate average
        const updatedReviews = userReview 
            ? reviews.map(review => review.id === userReview.id ? newReview : review)
            : [...reviews, newReview];
            
        const sum = updatedReviews.reduce((acc, review) => acc + review.rating, 0);
        setAverage(sum / updatedReviews.length);
        
        // Hide the form after submission
        setShowReviewForm(false);
    };

    if (loading) {
        return <div className="loading-spinner"></div>;
    }

    if (error) {
        return <div className="review-error">{error}</div>;
    }

    return (
        <div className="course-reviews animate-fade-in">
            <div className="review-header">
                <div className="review-summary">
                    <h3>Reviews</h3>
                    {reviews.length > 0 ? (
                        <div className="rating-summary">
                            <div className="average-rating">
                                <span className="rating-number">{average.toFixed(1)}</span>
                                <div className="star-display">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <ion-icon 
                                            key={star}
                                            name={star <= Math.round(average) ? 'star' : 'star-outline'} 
                                            className="star-icon"
                                        />
                                    ))}
                                </div>
                            </div>
                            <span className="review-count">({reviews.length} {reviews.length === 1 ? 'review' : 'reviews'})</span>
                        </div>
                    ) : (
                        <p className="no-reviews">No reviews yet. Be the first to review!</p>
                    )}
                </div>
                
                {user && !showReviewForm && (
                    <button 
                        className="add-review-btn hover-lift" 
                        onClick={() => setShowReviewForm(true)}
                    >
                        {userReview ? 'Edit Your Review' : 'Add Review'}
                    </button>
                )}
            </div>
            
            {showReviewForm && (
                <ReviewForm 
                    courseId={courseId}
                    courseName={courseName}
                    onReviewSubmitted={handleReviewSubmitted}
                    initialRating={userReview?.rating || 0}
                    initialComment={userReview?.comment || ''}
                />
            )}
            
            {!showReviewForm && reviews.length > 0 && (
                <ul className="reviews-list">
                    {reviews.map(review => (
                        <li 
                            key={review.id} 
                            className={`review-item animate-fade-in ${review.user_id === user?.id ? 'user-review' : ''}`}
                            style={{ animationDelay: `${(reviews.indexOf(review) * 0.1)}s` }}
                        >
                            <div className="review-header">
                                <div className="reviewer-info">
                                    <span className="reviewer-name">
                                        {review.user_id === user?.id ? 'You' : (review.user_name || 'Anonymous')}
                                    </span>
                                    {review.user_id === user?.id && (
                                        <button 
                                            className="edit-review-btn" 
                                            onClick={() => setShowReviewForm(true)}
                                        >
                                            <ion-icon name="create-outline"></ion-icon>
                                            Edit
                                        </button>
                                    )}
                                </div>
                                <div className="review-stars">
                                    {[1, 2, 3, 4, 5].map(star => (
                                        <ion-icon 
                                            key={star}
                                            name={star <= review.rating ? 'star' : 'star-outline'} 
                                            className="star-icon"
                                        />
                                    ))}
                                </div>
                            </div>
                            {review.comment && (
                                <p className="review-comment">{review.comment}</p>
                            )}
                            <div className="review-date">
                                {review.created_at ? formatDate(review.created_at) : 'Recent'}
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

CourseReviews.propTypes = {
    courseId: PropTypes.number.isRequired,
    courseName: PropTypes.string.isRequired
};

export default CourseReviews;