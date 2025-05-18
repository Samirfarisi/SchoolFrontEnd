import React from 'react';
import PropTypes from 'prop-types';

/**
 * AnimatedLoader component - displays an animated loading spinner
 * with customizable size and message
 */
const AnimatedLoader = ({ 
  size = 'medium', 
  message = 'Loading...',
  fullscreen = false,
  transparent = false
}) => {
  // Determine spinner size based on prop
  const spinnerSizeClass = {
    small: 'w-4 h-4 border-2',
    medium: 'w-8 h-8 border-3',
    large: 'w-12 h-12 border-4'
  }[size] || 'w-8 h-8 border-3';
  
  const containerClass = `
    flex flex-col items-center justify-center
    ${fullscreen ? 'fixed inset-0 z-50' : 'p-6'}
    ${transparent ? 'bg-transparent' : 'bg-white bg-opacity-90'}
    animate-fade-in
  `;

  return (
    <div className={containerClass.trim()}>
      <div 
        className={`loading-spinner ${spinnerSizeClass} animate-spin`}
        aria-label="Loading content"
      ></div>
      
      {message && (
        <p className="mt-3 text-primary animate-fade-in delay-300">
          {message}
        </p>
      )}
    </div>
  );
};

AnimatedLoader.propTypes = {
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  message: PropTypes.string,
  fullscreen: PropTypes.bool,
  transparent: PropTypes.bool
};

export default AnimatedLoader;
