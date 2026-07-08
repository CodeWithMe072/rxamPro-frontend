import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, X } from 'lucide-react';
import clsx from 'clsx';

export const DatePicker = ({
  value = '', // YYYY-MM-DD
  onChange,
  placeholder = 'Select Date',
  label = '',
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Initialize view month/year to selected value or current date
  const initialDate = value ? new Date(value) : new Date();
  const [viewMonth, setViewMonth] = useState(initialDate.getMonth());
  const [viewYear, setViewYear] = useState(initialDate.getFullYear());

  // Keep view month in sync with value updates if the modal is closed
  useEffect(() => {
    if (value && !isOpen) {
      const d = new Date(value);
      setViewMonth(d.getMonth());
      setViewYear(d.getFullYear());
    }
  }, [value, isOpen]);

  // Close calendar popover on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  const weekdays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  // Helper calendar calculations
  const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(viewYear - 1);
    } else {
      setViewMonth(viewMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(viewYear + 1);
    } else {
      setViewMonth(viewMonth + 1);
    }
  };

  const handleSelectDay = (day) => {
    // Format date as YYYY-MM-DD local date string
    const yyyy = viewYear;
    const mm = String(viewMonth + 1).padStart(2, '0');
    const dd = String(day).padStart(2, '0');
    onChange(`${yyyy}-${mm}-${dd}`);
    setIsOpen(false);
  };

  const handleClear = () => {
    onChange('');
    setIsOpen(false);
  };

  const handleToday = () => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    onChange(`${yyyy}-${mm}-${dd}`);
    setIsOpen(false);
  };

  // Build calendar days list
  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDay = getFirstDayOfMonth(viewYear, viewMonth);

  const daysGrid = [];
  // Add padding days from prev month
  const prevMonthDaysCount = getDaysInMonth(viewYear, viewMonth - 1);
  for (let i = firstDay - 1; i >= 0; i--) {
    daysGrid.push({ day: prevMonthDaysCount - i, currentMonth: false });
  }
  // Add current month days
  for (let i = 1; i <= daysInMonth; i++) {
    daysGrid.push({ day: i, currentMonth: true });
  }
  // Add padding days from next month to round out grid to multiple of 7
  const remainingCells = 42 - daysGrid.length;
  for (let i = 1; i <= remainingCells; i++) {
    daysGrid.push({ day: i, currentMonth: false });
  }

  // Format label for main button display
  const getFormattedDisplayDate = () => {
    if (!value) return placeholder;
    const dateObj = new Date(value);
    return dateObj.toLocaleDateString(undefined, { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const isSelected = (day, isCurrentMonth) => {
    if (!value || !isCurrentMonth) return false;
    const d = new Date(value);
    return d.getDate() === day && d.getMonth() === viewMonth && d.getFullYear() === viewYear;
  };

  const isToday = (day, isCurrentMonth) => {
    if (!isCurrentMonth) return false;
    const today = new Date();
    return today.getDate() === day && today.getMonth() === viewMonth && today.getFullYear() === viewYear;
  };

  return (
    <div ref={dropdownRef} className={clsx("relative inline-block", className)}>
      <div className="flex items-center gap-1.5">
        {label && <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{label}</span>}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="h-10 px-3 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white flex items-center justify-between gap-3 focus:ring-2 focus:ring-secondary/20 outline-none cursor-pointer transition-all hover:border-slate-700 min-w-32"
        >
          <span className="truncate">{getFormattedDisplayDate()}</span>
          <CalendarIcon className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
        </button>
      </div>

      {isOpen && (
        <div className="absolute z-50 mt-2 w-64 rounded-2xl bg-slate-950/95 border border-slate-850 p-4 shadow-[0_15px_40px_rgba(0,0,0,0.5)] backdrop-blur-md animate-fadeIn text-white">
          {/* Header controls */}
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold font-sans">
              {months[viewMonth]} {viewYear}
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handlePrevMonth}
                className="w-6 h-6 rounded-lg bg-slate-900 border border-slate-850 hover:bg-slate-800 flex items-center justify-center cursor-pointer transition-colors"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={handleNextMonth}
                className="w-6 h-6 rounded-lg bg-slate-900 border border-slate-850 hover:bg-slate-800 flex items-center justify-center cursor-pointer transition-colors"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Weekday headers */}
          <div className="grid grid-cols-7 gap-1 text-center mb-1">
            {weekdays.map(d => (
              <span key={d} className="text-[10px] font-bold text-slate-500 uppercase tracking-wider py-1">
                {d}
              </span>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium">
            {daysGrid.map(({ day, currentMonth }, idx) => {
              const selected = isSelected(day, currentMonth);
              const today = isToday(day, currentMonth);
              
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => currentMonth && handleSelectDay(day)}
                  disabled={!currentMonth}
                  className={clsx(
                    "w-7 h-7 rounded-lg flex items-center justify-center cursor-pointer transition-all",
                    !currentMonth && "text-slate-700 pointer-events-none",
                    currentMonth && !selected && !today && "text-slate-300 hover:bg-slate-800",
                    today && !selected && "text-secondary border border-secondary/30 font-bold",
                    selected && "bg-secondary text-slate-950 font-bold shadow-sm shadow-secondary/20"
                  )}
                >
                  {day}
                </button>
              );
            })}
          </div>

          {/* Footer Controls */}
          <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-900 text-[10px] font-bold uppercase tracking-wider">
            <button
              type="button"
              onClick={handleClear}
              className="text-error hover:text-error/80 cursor-pointer transition-colors"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={handleToday}
              className="text-secondary hover:text-secondary/80 cursor-pointer transition-colors"
            >
              Today
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
export default DatePicker;
