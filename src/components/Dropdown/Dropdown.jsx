import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, Check } from 'lucide-react';
import clsx from 'clsx';

export const Dropdown = ({
  options = [], // [{ value: '...', label: '...' }]
  value,
  onChange,
  className = '',
  placeholder = 'Select option',
  size = 'md' // 'sm' | 'md'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [menuStyle, setMenuStyle] = useState({});

  const triggerRef = useRef(null);
  const menuRef = useRef(null);
  const inputRef = useRef(null);

  const selectedOption = options.find(opt => opt.value === value);

  // Filter options based on search query
  const filteredOptions = options.filter(opt =>
    opt.label && typeof opt.label === 'string' &&
    opt.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  console.log('Dropdown Debug: placeholder =', placeholder, 'options =', options, 'filteredOptions =', filteredOptions);


  // Position the portal menu relative to the trigger button
  const updateMenuPosition = () => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const menuHeight = Math.min(240, filteredOptions.length * 44 + 16);
    const openUpward = spaceBelow < menuHeight + 8 && rect.top > menuHeight;

    setMenuStyle({
      position: 'fixed',
      top: openUpward ? rect.top - menuHeight - 4 : rect.bottom + 4,
      left: rect.left,
      width: rect.width,
      zIndex: 9999,
    });
  };

  // Open / reposition on scroll or resize
  useEffect(() => {
    if (!isOpen) return;
    updateMenuPosition();
    window.addEventListener('scroll', updateMenuPosition, true);
    window.addEventListener('resize', updateMenuPosition);
    return () => {
      window.removeEventListener('scroll', updateMenuPosition, true);
      window.removeEventListener('resize', updateMenuPosition);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, filteredOptions.length]);

  // Close when clicking outside trigger or menu
  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e) => {
      if (
        triggerRef.current && !triggerRef.current.contains(e.target) &&
        menuRef.current && !menuRef.current.contains(e.target)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Auto-focus search input when opened
  useEffect(() => {
    if (isOpen) {
      setSearchQuery('');
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const handleSelect = (optionValue) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  const isSmall = size === 'sm';

  const menu = isOpen && (
    <div
      ref={menuRef}
      style={menuStyle}
      className="rounded-[16px] bg-surface-container-highest border border-outline-variant/30 shadow-[0_10px_30px_rgba(0,0,0,0.18)] overflow-hidden p-2 max-h-60 overflow-y-auto"
    >
      {filteredOptions.length > 0 ? (
        <div className="space-y-1">
          {filteredOptions.map((option) => {
            const isSelected = option.value === value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => handleSelect(option.value)}
                className={clsx(
                  'w-full rounded-lg text-left font-semibold transition-colors cursor-pointer flex items-center justify-between',
                  isSmall ? 'px-3 py-2 text-xs' : 'px-4 py-3 text-sm',
                  isSelected
                    ? 'bg-primary text-on-primary font-medium'
                    : 'text-on-surface hover:bg-surface-container'
                )}
              >
                <span className="truncate">{option.label}</span>
                {isSelected && (
                  <div className="w-4 h-4 rounded-full bg-on-primary/15 flex items-center justify-center flex-shrink-0 ml-2">
                    <Check className="w-2.5 h-2.5 text-on-primary" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      ) : (
        <div className="px-4 py-3 text-xs text-on-surface-variant text-center">
          No options found (options: {options.length}, query: "{searchQuery}")
        </div>
      )}
    </div>
  );

  return (
    <div ref={triggerRef} className={clsx('relative w-full', className)}>
      <div className="relative group">
        {isOpen ? (
          <div className={clsx(
            'relative w-full border border-primary bg-surface-container flex items-center justify-between px-3 shadow-sm transition-all',
            isSmall ? 'h-9 rounded-lg' : 'h-12 rounded-xl'
          )}>
            <input
              ref={inputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search..."
              className={clsx(
                'w-full bg-transparent border-none focus:outline-none text-on-surface placeholder:text-on-surface-variant/50',
                isSmall ? 'text-xs' : 'text-sm'
              )}
            />
            <ChevronDown
              onClick={() => setIsOpen(false)}
              className="w-4 h-4 text-primary rotate-180 transition-transform duration-200 ml-2 flex-shrink-0 cursor-pointer"
            />
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className={clsx(
              'w-full px-3 border border-outline-variant/30 bg-surface-container hover:bg-primary/[0.06] hover:border-primary hover:border-2 text-on-surface font-semibold flex items-center justify-between focus:ring-2 focus:ring-primary/20 outline-none cursor-pointer text-left transition-all',
              isSmall ? 'h-9 rounded-lg text-[11px]' : 'h-12 rounded-xl text-xs'
            )}
          >
            <span className={clsx(
              'truncate font-normal text-on-surface-variant',
              isSmall ? 'text-xs' : 'text-sm'
            )}>
              {selectedOption ? selectedOption.label : placeholder}
            </span>
            <ChevronDown className="w-4 h-4 text-on-surface-variant group-hover:text-primary transition-transform duration-200 ml-2 flex-shrink-0" />
          </button>
        )}
      </div>

      {/* Portal: renders outside all containers so overflow:hidden never clips it */}
      {typeof document !== 'undefined' && createPortal(menu, document.body)}
    </div>
  );
};

export default Dropdown;
