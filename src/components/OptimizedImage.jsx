import React, { useState, useEffect, memo } from 'react';
import PropTypes from 'prop-types';

// Optimized image component with lazy loading, blur-up technique, and WEBP support
const OptimizedImage = ({ 
  src, 
  alt, 
  width, 
  height, 
  className = '', 
  placeholderColor = '#e2e8f0',
  priority = false,
  onLoad = () => {},
  style = {}
}) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  // Generate a low-quality placeholder for blur-up effect
  const placeholderStyle = {
    backgroundColor: placeholderColor,
    filter: 'blur(10px)',
    transition: 'opacity 500ms ease-in-out',
    opacity: loaded ? 0 : 1,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  };

  // Handle successful image load
  const handleImageLoaded = () => {
    setLoaded(true);
    onLoad();
  };

  // Handle image load failure with fallback logic
  const handleError = () => {
    setError(true);
    console.warn(`Failed to load image: ${src}`);
    
    // Try to load from correct path if it's a local asset path
    if (typeof src === 'string') {
      if (src.startsWith('/src/assets/')) {
        // Fix the path by using the correct import path format
        // For Vite/Webpack projects, assets should be in the public folder or imported directly
        const correctedPath = src.replace('/src/assets/', '/assets/');
        
        // Update the image source
        const imgElement = document.querySelector(`img[data-src="${src}"]`);
        if (imgElement) {
          imgElement.src = correctedPath;
        }
      }
    }
  };

  // Detect if browser supports webp format
  const [supportsWebp, setSupportsWebp] = useState(false);
  useEffect(() => {
    const checkWebpSupport = async () => {
      const webpSupported = document.createElement('canvas')
        .toDataURL('image/webp')
        .indexOf('data:image/webp') === 0;
      setSupportsWebp(webpSupported);
    };
    checkWebpSupport();
  }, []);

  // Determine the best image source based on browser support
  const getBestImageSrc = () => {
    if (error) {
      // Return a generic placeholder on error
      return 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAzNjAgMjQwIiBmaWxsPSIjZTJlOGYwIj48cmVjdCB3aWR0aD0iMzYwIiBoZWlnaHQ9IjI0MCIvPjwvc3ZnPg==';
    }
    
    // Handle imported images from Vite/Webpack
    if (typeof src === 'object') {
      if (src.default) return src.default; // ESM imports
      return src; // Direct imports
    }
    
    // Fix path for assets that use /src/assets pattern (common Vite/React error)
    if (typeof src === 'string') {
      if (src.startsWith('/src/assets/')) {
        return src.replace('/src/assets/', '/assets/');
      }
      
      // If source is already webp or svg, use it directly
      if (src.endsWith('.webp') || src.endsWith('.svg')) {
        return src;
      }
      
      // Use webp if supported, otherwise use the original
      if (supportsWebp && !src.includes('data:')) {
        // Only try to add .webp for image URLs that have an extension
        if (src.match(/\.(jpe?g|png|gif)$/i)) {
          const srcWithoutExt = src.substring(0, src.lastIndexOf('.'));
          return `${srcWithoutExt}.webp`;
        }
      }
    }
    
    return src;
  };

  return (
    <div style={{ position: 'relative', width, height, overflow: 'hidden', ...style }} className={className}>
      <div style={placeholderStyle} aria-hidden="true" />
      
      <img
        src={getBestImageSrc()}
        data-src={typeof src === 'string' ? src : 'imported-image'}
        alt={alt}
        width={width}
        height={height}
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : "auto"}
        onLoad={handleImageLoaded}
        onError={handleError}
        style={{
          display: 'block',
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          transition: 'opacity 500ms ease-in-out',
          opacity: loaded ? 1 : 0,
        }}
      />
    </div>
  );
};

OptimizedImage.propTypes = {
  src: PropTypes.string.isRequired,
  alt: PropTypes.string.isRequired,
  width: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  height: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  className: PropTypes.string,
  placeholderColor: PropTypes.string,
  priority: PropTypes.bool,
  onLoad: PropTypes.func,
  style: PropTypes.object,
};

// Memoize the component to prevent unnecessary re-renders
export default memo(OptimizedImage);
