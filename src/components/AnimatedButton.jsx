import React from 'react';
import PropTypes from 'prop-types';
import '../index.scss';

/**
 * AnimatedButton - A reusable button component with animation effects
 * Variants: primary, secondary, outline, text
 * Sizes: small, medium, large
 */
const AnimatedButton = ({
  children,
  variant = 'primary',
  size = 'medium',
  icon,
  iconPosition = 'left',
  disabled = false,
  fullWidth = false,
  animate = true,
  className = '',
  onClick,
  type = 'button',
  ...props
}) => {
  // Base classes for all buttons
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded transition-all focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  // Size variations
  const sizeClasses = {
    small: 'text-sm px-3 py-1.5',
    medium: 'text-base px-4 py-2',
    large: 'text-lg px-6 py-3'
  };
  
  // Variant styles
  const variantClasses = {
    primary: 'bg-primary text-white hover:bg-primary-dark focus:ring-primary',
    secondary: 'bg-gray-100 text-gray-800 hover:bg-gray-200 focus:ring-gray-300',
    outline: 'border border-primary text-primary hover:bg-primary hover:text-white focus:ring-primary',
    text: 'text-primary hover:bg-gray-100 focus:ring-primary'
  };
  
  // Animation classes
  const animationClass = animate ? 'hover-lift' : '';
  
  // Disabled state
  const disabledClasses = disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer';
  
  // Full width
  const widthClass = fullWidth ? 'w-full' : '';
  
  // Combined classes
  const buttonClasses = [
    baseClasses,
    sizeClasses[size],
    variantClasses[variant],
    animationClass,
    disabledClasses,
    widthClass,
    className
  ].join(' ');
  
  return (
    <button
      type={type}
      className={buttonClasses}
      disabled={disabled}
      onClick={onClick}
      {...props}
    >
      {icon && iconPosition === 'left' && (
        <span className="mr-2">{icon}</span>
      )}
      {children}
      {icon && iconPosition === 'right' && (
        <span className="ml-2">{icon}</span>
      )}
    </button>
  );
};

AnimatedButton.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf(['primary', 'secondary', 'outline', 'text']),
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  icon: PropTypes.node,
  iconPosition: PropTypes.oneOf(['left', 'right']),
  disabled: PropTypes.bool,
  fullWidth: PropTypes.bool,
  animate: PropTypes.bool,
  className: PropTypes.string,
  onClick: PropTypes.func,
  type: PropTypes.oneOf(['button', 'submit', 'reset'])
};

export default AnimatedButton;
