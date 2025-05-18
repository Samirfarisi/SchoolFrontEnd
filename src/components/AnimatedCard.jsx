import React from 'react';
import PropTypes from 'prop-types';
import '../index.scss';

/**
 * AnimatedCard - A reusable card component with animation effects
 * Used for courses, announcements, and other content items
 */
const AnimatedCard = ({
  children,
  image,
  imageAlt = '',
  title,
  subtitle,
  badge,
  badgeVariant = 'primary',
  footer,
  clickable = false,
  onClick,
  className = '',
  variant = 'default',
  delay = 0,
  ...props
}) => {
  // Base classes for all cards
  const baseClasses = `
    relative rounded-lg overflow-hidden bg-white shadow
    ${clickable ? 'cursor-pointer hover-lift' : ''}
    animate-fade-in
  `;
  
  // Delay classes for staggered animations
  const delayClass = delay ? `delay-${delay}` : '';
  
  // Badge variant styles
  const badgeVariants = {
    primary: 'bg-primary text-white',
    secondary: 'bg-gray-100 text-gray-800',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    danger: 'bg-red-100 text-red-800',
    info: 'bg-blue-100 text-blue-800'
  };
  
  // Card variants
  const variantClasses = {
    default: '',
    outline: 'border border-gray-200 shadow-sm',
    elevated: 'shadow-md',
    flat: 'shadow-none border border-gray-100'
  };
  
  // Combined classes
  const cardClasses = `
    ${baseClasses}
    ${delayClass}
    ${variantClasses[variant]}
    ${className}
  `.trim();
  
  return (
    <div
      className={cardClasses}
      onClick={clickable ? onClick : undefined}
      {...props}
    >
      {badge && (
        <div className={`absolute top-3 right-3 z-10 px-2 py-1 text-xs font-medium rounded ${badgeVariants[badgeVariant]}`}>
          {badge}
        </div>
      )}
      
      {image && (
        <div className="card-img-container h-48 overflow-hidden">
          <img 
            src={image} 
            alt={imageAlt} 
            className="w-full h-full object-cover transition-transform hover:scale-105" 
          />
        </div>
      )}
      
      <div className="p-4">
        {title && (
          <h3 className="text-lg font-semibold text-gray-900 mb-1">{title}</h3>
        )}
        
        {subtitle && (
          <p className="text-sm text-gray-600 mb-3">{subtitle}</p>
        )}
        
        {children}
      </div>
      
      {footer && (
        <div className="px-4 py-3 bg-gray-50 border-t border-gray-100">
          {footer}
        </div>
      )}
    </div>
  );
};

AnimatedCard.propTypes = {
  children: PropTypes.node,
  image: PropTypes.string,
  imageAlt: PropTypes.string,
  title: PropTypes.node,
  subtitle: PropTypes.node,
  badge: PropTypes.node,
  badgeVariant: PropTypes.oneOf(['primary', 'secondary', 'success', 'warning', 'danger', 'info']),
  footer: PropTypes.node,
  clickable: PropTypes.bool,
  onClick: PropTypes.func,
  className: PropTypes.string,
  variant: PropTypes.oneOf(['default', 'outline', 'elevated', 'flat']),
  delay: PropTypes.oneOf([0, 100, 200, 300, 400, 500])
};

export default AnimatedCard;
