import React from 'react';
import PropTypes from 'prop-types';

/**
 * EmptyState component - displays when there's no content to show
 * with customizable image, title, message and action button
 */
const EmptyState = ({ 
  image, 
  title, 
  message, 
  actionLabel, 
  onAction 
}) => {
  return (
    <div className="empty-state animate-fade-in">
      {image && (
        <img 
          src={image} 
          alt={title || 'No content'} 
          className="animate-slide-up delay-100"
        />
      )}
      
      {title && (
        <h3 className="animate-slide-up delay-200">{title}</h3>
      )}
      
      {message && (
        <p className="animate-slide-up delay-300">{message}</p>
      )}
      
      {actionLabel && onAction && (
        <button 
          className="btn-primary animate-scale-in delay-400 hover-lift" 
          onClick={onAction}
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};

EmptyState.propTypes = {
  image: PropTypes.string,
  title: PropTypes.string,
  message: PropTypes.string,
  actionLabel: PropTypes.string,
  onAction: PropTypes.func
};

export default EmptyState;
