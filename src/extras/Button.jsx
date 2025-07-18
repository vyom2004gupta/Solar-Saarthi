import React from "react";
import PropTypes from "prop-types";

function Button({
  children,
  variant = "primary",
  size = "medium",
  disabled = false,
  fullWidth = false,
  onClick,
  type = "button",
  className = "",
  icon: Icon,
  iconPosition = "left",
  ...props
}) {
  // Base classes
  const baseClasses =
    " font-medium transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 bg-transparent";

  // Variant classes
  const variantClasses = {
    primary: "text-green-600 hover:text-green-700 focus:ring-green-500",
    secondary: "text-gray-800 hover:text-gray-900 focus:ring-gray-500",
    outline:
      "border border-green-600 text-green-600 hover:bg-green-50 focus:ring-green-500",
    danger: "text-red-600 hover:text-red-700 focus:ring-red-500",
    text: "text-green-600 hover:text-green-700 focus:ring-green-500",
  };

  // Size classes
  const sizeClasses = {
    small: "px-3 py-1.5 text-sm",
    medium: "px-4 py-2 text-base",
    large: "px-6 py-3 text-lg",
  };

  // Disabled classes
  const disabledClasses = "opacity-50 cursor-not-allowed";

  // Full width class
  const fullWidthClass = fullWidth ? "w-full" : "";

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`${baseClasses} ${variantClasses[variant]} ${
        sizeClasses[size]
      } ${disabled ? disabledClasses : ""} ${fullWidthClass} ${className}`}
      {...props}
    >
      <span
        className={`flex items-center justify-center ${
          iconPosition === "right" ? "flex-row-reverse" : ""
        }`}
      >
        {Icon && (
          <span
            className={
              children ? (iconPosition === "left" ? "mr-2" : "ml-2") : ""
            }
          >
            <Icon size={size === "small" ? 16 : size === "large" ? 24 : 20} />
          </span>
        )}
        {children}
      </span>
    </button>
  );
}

Button.propTypes = {
  children: PropTypes.node,
  variant: PropTypes.oneOf([
    "primary",
    "secondary",
    "outline",
    "danger",
    "text",
  ]),
  size: PropTypes.oneOf(["small", "medium", "large"]),
  disabled: PropTypes.bool,
  fullWidth: PropTypes.bool,
  onClick: PropTypes.func,
  type: PropTypes.oneOf(["button", "submit", "reset"]),
  className: PropTypes.string,
  icon: PropTypes.elementType,
  iconPosition: PropTypes.oneOf(["left", "right"]),
};

export default Button;