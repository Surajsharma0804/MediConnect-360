import React, { useEffect, useRef, ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { FocusManager, KeyboardNavigation, ScreenReaderAnnouncer } from '../../utils/accessibility';
import { X } from 'lucide-react';
import AccessibleButton from './AccessibleButton';

interface AccessibleModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  initialFocus?: React.RefObject<HTMLElement>;
  className?: string;
}

const AccessibleModal: React.FC<AccessibleModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  closeOnOverlayClick = true,
  closeOnEscape = true,
  initialFocus,
  className = ''
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const cleanupFocusTrap = useRef<(() => void) | null>(null);

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl'
  };

  useEffect(() => {
    if (isOpen) {
      // Announce modal opening
      ScreenReaderAnnouncer.announce(`Dialog opened: ${title}`, 'assertive');
      
      // Save current focus and set up focus trap
      if (modalRef.current) {
        cleanupFocusTrap.current = FocusManager.trapFocus(modalRef.current);
        
        // Focus initial element or title
        const focusTarget = initialFocus?.current || titleRef.current;
        if (focusTarget) {
          setTimeout(() => focusTarget.focus(), 100);
        }
      }

      // Prevent body scroll
      document.body.style.overflow = 'hidden';
      
      // Handle escape key
      const handleKeyDown = (event: KeyboardEvent) => {
        if (closeOnEscape) {
          KeyboardNavigation.handleEscape(event, onClose);
        }
      };
      
      document.addEventListener('keydown', handleKeyDown);
      
      return () => {
        document.removeEventListener('keydown', handleKeyDown);
        document.body.style.overflow = '';
        
        if (cleanupFocusTrap.current) {
          cleanupFocusTrap.current();
        }
        
        // Restore focus
        FocusManager.popFocus();
        
        // Announce modal closing
        ScreenReaderAnnouncer.announce('Dialog closed');
      };
    }
  }, [isOpen, title, closeOnEscape, onClose, initialFocus]);

  if (!isOpen) return null;

  const handleOverlayClick = (event: React.MouseEvent) => {
    if (closeOnOverlayClick && event.target === event.currentTarget) {
      onClose();
    }
  };

  const modalContent = (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50 transition-opacity"
        aria-hidden="true"
      />
      
      {/* Modal */}
      <div
        ref={modalRef}
        className={`
          relative bg-white rounded-lg shadow-xl
          w-full ${sizeClasses[size]}
          max-h-[90vh] overflow-y-auto
          ${className}
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2
            ref={titleRef}
            id="modal-title"
            className="text-xl font-semibold text-gray-900"
            tabIndex={-1}
          >
            {title}
          </h2>
          
          <AccessibleButton
            variant="ghost"
            size="sm"
            onClick={onClose}
            aria-label="Close dialog"
            announceOnClick="Dialog closed"
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </AccessibleButton>
        </div>
        
        {/* Content */}
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default AccessibleModal;