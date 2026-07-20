import React, { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import clsx from 'clsx';

export const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md', // 'sm' | 'md' | 'lg' | 'xl' | '2xl'
  showCloseButton = true,
  closeOnOverlayClick = true
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const sizes = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeOnOverlayClick ? onClose : undefined}
            className="absolute inset-0 bg-slate-950/40 backdrop-blur-md"
          />

          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 15 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 15 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className={clsx(
              "relative w-full glass-card rounded-[24px] p-6 z-10 overflow-hidden flex flex-col max-h-[90vh]",
              sizes[size]
            )}
          >
            <div className="flex justify-between items-center mb-6">
              {title && <h3 className="font-h4 text-xl font-bold text-on-surface">{title}</h3>}
              {showCloseButton && (
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-xl hover:bg-surface-variant/50 text-on-surface-variant transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            <div className="overflow-y-auto flex-grow pr-1 no-scrollbar">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export const Drawer = ({
  isOpen,
  onClose,
  title,
  children,
  position = 'right', // 'left' | 'right'
  showCloseButton = true
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const slideVariants = {
    left: {
      initial: { x: '-100%' },
      animate: { x: 0 },
      exit: { x: '-100%' }
    },
    right: {
      initial: { x: '100%' },
      animate: { x: 0 },
      exit: { x: '100%' }
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm"
          />

          <motion.div
            variants={slideVariants[position]}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            className={clsx(
              "relative w-full max-w-md h-full bg-surface dark:bg-surface-dim border-outline-variant/20 shadow-2xl z-10 p-6 flex flex-col",
              position === 'right' ? 'ml-auto border-l' : 'mr-auto border-r'
            )}
          >
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-outline-variant/30">
              {title && <h3 className="font-h4 text-lg font-bold text-on-surface">{title}</h3>}
              {showCloseButton && (
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-xl hover:bg-surface-variant/50 text-on-surface-variant transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            <div className="overflow-y-auto flex-grow">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
