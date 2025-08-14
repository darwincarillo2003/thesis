import React, { useState, useEffect } from 'react';
import { CheckCircle, X } from 'lucide-react';
import '../../../sass/SuccessPop/SuccessNotif.scss';

const SuccessNotif = ({ 
  isVisible, 
  message = "Operation completed successfully!", 
  duration = 4000,
  onClose 
}) => {
  const [isShowing, setIsShowing] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setIsShowing(true);
      // Small delay to trigger animation
      setTimeout(() => setIsAnimating(true), 10);
      
      // Auto-hide after duration
      const timer = setTimeout(() => {
        handleClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [isVisible, duration]);

  const handleClose = () => {
    setIsAnimating(false);
    // Wait for animation to complete before hiding
    setTimeout(() => {
      setIsShowing(false);
      if (onClose) {
        onClose();
      }
    }, 300);
  };

  if (!isShowing) return null;

  return (
    <div className={`success-notif ${isAnimating ? 'success-notif--show' : ''}`}>
      <div className="success-notif__content">
        <div className="success-notif__icon">
          <CheckCircle size={24} />
        </div>
        <div className="success-notif__message">
          {message}
        </div>
        <button 
          className="success-notif__close"
          onClick={handleClose}
          aria-label="Close notification"
        >
          <X size={18} />
        </button>
      </div>
    </div>
  );
};

export default SuccessNotif;
