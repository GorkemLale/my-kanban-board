// src/components/Button/Button.js
import './Button.css';

function Button({ children, onClick, disabled = false, className = '', style={} }) {  // sona style={} ekleyerek style destekleme ekledim.
  return (
    <button
      className={`btn ${className}`}
      onClick={onClick}
      disabled={disabled}
      style={style}  // style prop'unu ekledik.  style'a ek olarak. 
    >
      {children}
    </button>
  );
}

export default Button;