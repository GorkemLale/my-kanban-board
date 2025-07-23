// src/components/Button/Button.js
import './Button.css';

function Button({ children, onClick, disabled = false, className = '' }) {
  return (
    <button
      className={`btn ${className}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}

export default Button;