import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock } from 'lucide-react';
import clsx from 'clsx';
import { Dropdown } from '../Dropdown';

export const DatePicker = ({
  value = '', // Can be YYYY-MM-DD or YYYY-MM-DDTHH:mm
  onChange,
  placeholder = 'Select Date & Time',
  label = '',
  className = '',
  showTime = false,
  minDate = '',
  size = 'md' // 'sm' | 'md'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Parse input value into local date parts (timezone-proof)
  const parseValue = (val) => {
    if (!val) return { date: null, hours: 12, minutes: 0 };
    
    // Normalize to string format YYYY-MM-DDTHH:mm if it's a Date
    let strVal = val;
    if (val instanceof Date) {
      const yyyy = val.getFullYear();
      const mm = String(val.getMonth() + 1).padStart(2, '0');
      const dd = String(val.getDate()).padStart(2, '0');
      const hh = String(val.getHours()).padStart(2, '0');
      const min = String(val.getMinutes()).padStart(2, '0');
      strVal = `${yyyy}-${mm}-${dd}T${hh}:${min}`;
    } else if (typeof val !== 'string') {
      strVal = String(val);
    }

    // Try manual parsing first (timezone-safe)
    const parts = strVal.includes('T') ? strVal.split('T') : strVal.split(' ');
    const datePart = parts[0]; // YYYY-MM-DD
    const timePart = parts[1]; // HH:mm
    
    const dateSeparator = datePart.includes('-') ? '-' : '/';
    const dateParts = datePart.split(dateSeparator);
    
    if (dateParts.length === 3) {
      const year = parseInt(dateParts[0]);
      const month = parseInt(dateParts[1]) - 1; // 0-indexed month
      const day = parseInt(dateParts[2]);
      
      const dateObj = new Date(year, month, day);
      if (!isNaN(dateObj.getTime())) {
        let hours = 12;
        let minutes = 0;
        if (timePart) {
          const timeParts = timePart.split(':');
          hours = parseInt(timeParts[0]) || 0;
          minutes = parseInt(timeParts[1]) || 0;
        }
        return {
          date: dateObj,
          hours,
          minutes
        };
      }
    }
    
    // Native fallback if manual parsing fails
    const fallbackDate = new Date(strVal);
    if (!isNaN(fallbackDate.getTime())) {
      const localDate = new Date(fallbackDate.getFullYear(), fallbackDate.getMonth(), fallbackDate.getDate());
      return {
        date: localDate,
        hours: fallbackDate.getHours(),
        minutes: fallbackDate.getMinutes()
      };
    }
    
    return { date: null, hours: 12, minutes: 0 };
  };

  const { date: selectedDate, hours: selectedHours, minutes: selectedMinutes } = parseValue(value);

  // Calendar navigation state (view month and year)
  const initialDate = selectedDate || new Date();
  const [viewMonth, setViewMonth] = useState(initialDate.getMonth());
  const [viewYear, setViewYear] = useState(initialDate.getFullYear());
  const [tempHours, setTempHours] = useState(selectedHours);
  const [tempMinutes, setTempMinutes] = useState(selectedMinutes);

  // Parse minDate prop to local midnight Date object for comparison
  const parseMinDate = (minVal) => {
    if (!minVal) return null;
    const { date } = parseValue(minVal);
    if (!date) return null;
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  };
  const minDateObj = parseMinDate(minDate);

  const hourOptions = Array.from({ length: 24 }).map((_, i) => ({
    value: i,
    label: String(i).padStart(2, '0')
  }));

  const minuteOptions = Array.from({ length: 60 }).map((_, i) => ({
    value: i,
    label: String(i).padStart(2, '0')
  }));

  // Sync state with value updates
  useEffect(() => {
    if (value) {
      const { date, hours, minutes } = parseValue(value);
      if (date && !isOpen) {
        setViewMonth(date.getMonth());
        setViewYear(date.getFullYear());
      }
      setTempHours(hours);
      setTempMinutes(minutes);
    }
  }, [value, isOpen]);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Ignore click events that originate from within a dropdown portal
      if (event.target.closest('[data-dropdown-portal="true"]')) {
        return;
      }
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Calendar math helpers
  const getDaysInMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year, month) => {
    return new Date(year, month, 1).getDay();
  };

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const weekdays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(prev => prev - 1);
    } else {
      setViewMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(prev => prev + 1);
    } else {
      setViewMonth(prev => prev + 1);
    }
  };

  const formatOutput = (date, h, m) => {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    
    if (showTime) {
      const hh = String(h).padStart(2, '0');
      const min = String(m).padStart(2, '0');
      return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
    }
    return `${yyyy}-${mm}-${dd}`;
  };

  const handleSelectDay = (day) => {
    const newDate = new Date(viewYear, viewMonth, day);
    const formatted = formatOutput(newDate, tempHours, tempMinutes);
    onChange(formatted);
    if (!showTime) {
      setIsOpen(false);
    }
  };

  const handleTimeChange = (type, val) => {
    const numVal = Number(val);
    let h = tempHours;
    let m = tempMinutes;
    if (type === 'hours') {
      h = Math.min(23, Math.max(0, numVal));
      setTempHours(h);
    } else {
      m = Math.min(59, Math.max(0, numVal));
      setTempMinutes(m);
    }

    if (selectedDate) {
      const formatted = formatOutput(selectedDate, h, m);
      onChange(formatted);
    }
  };

  const handleClear = () => {
    onChange('');
    setIsOpen(false);
  };

  const handleToday = () => {
    const today = new Date();
    const formatted = formatOutput(today, today.getHours(), today.getMinutes());
    onChange(formatted);
    setIsOpen(false);
  };

  // Format label for display
  const getFormattedDisplayDate = () => {
    if (!value) return placeholder;
    const { date, hours, minutes } = parseValue(value);
    if (!date) return placeholder;
    
    const monthsShort = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const formattedDate = `${monthsShort[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
    if (showTime) {
      const hh = String(hours).padStart(2, '0');
      const mm = String(minutes).padStart(2, '0');
      return `${formattedDate}, ${hh}:${mm}`;
    }
    return formattedDate;
  };

  const isSelected = (day, isCurrentMonth) => {
    if (!selectedDate || !isCurrentMonth) return false;
    return selectedDate.getDate() === day && selectedDate.getMonth() === viewMonth && selectedDate.getFullYear() === viewYear;
  };

  const isToday = (day, isCurrentMonth) => {
    if (!isCurrentMonth) return false;
    const today = new Date();
    return today.getDate() === day && today.getMonth() === viewMonth && today.getFullYear() === viewYear;
  };

  // Build calendar days grid
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
  // Add padding days from next month to round out grid to 42 cells
  const remainingCells = 42 - daysGrid.length;
  for (let i = 1; i <= remainingCells; i++) {
    daysGrid.push({ day: i, currentMonth: false });
  }

  const isSmall = size === 'sm';

  return (
    <div ref={dropdownRef} className={clsx("relative inline-block w-full text-left", className)}>
      <div className="flex flex-col gap-1.5 w-full">
        {label && <span className="text-[10px] text-on-surface-variant/80 font-bold uppercase tracking-wider">{label}</span>}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={clsx(
            "w-full px-3 border border-outline-variant/30 bg-surface-container hover:bg-primary/[0.06] hover:border-primary text-on-surface font-semibold flex items-center justify-between focus:ring-2 focus:ring-primary/20 outline-none cursor-pointer text-left transition-all",
            isSmall ? 'h-9 rounded-lg text-[11px]' : 'h-12 rounded-xl text-xs'
          )}
        >
          <span className={clsx("truncate font-normal text-on-surface-variant", isSmall ? 'text-xs' : 'text-sm')}>
            {getFormattedDisplayDate()}
          </span>
          <CalendarIcon className="w-4 h-4 text-on-surface-variant ml-2 flex-shrink-0" />
        </button>
      </div>

      {isOpen && (
        <div className="absolute left-0 sm:left-auto right-0 sm:right-auto z-50 mt-2 w-72 rounded-[16px] bg-surface-container-highest border border-outline-variant/30 p-4 shadow-[0_15px_40px_rgba(0,0,0,0.3)] backdrop-blur-md animate-fadeIn text-on-surface">
          {/* Header Month/Year Selector */}
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-on-surface">
              {months[viewMonth]} {viewYear}
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handlePrevMonth}
                className="w-7 h-7 rounded-lg bg-surface-container-low border border-outline-variant/20 hover:bg-surface-container flex items-center justify-center cursor-pointer transition-colors"
              >
                <ChevronLeft className="w-4 h-4 text-on-surface" />
              </button>
              <button
                type="button"
                onClick={handleNextMonth}
                className="w-7 h-7 rounded-lg bg-surface-container-low border border-outline-variant/20 hover:bg-surface-container flex items-center justify-center cursor-pointer transition-colors"
              >
                <ChevronRight className="w-4 h-4 text-on-surface" />
              </button>
            </div>
          </div>

          {/* Weekdays */}
          <div className="grid grid-cols-7 gap-1 text-center mb-1">
            {weekdays.map(d => (
              <span key={d} className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider py-1">
                {d}
              </span>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold">
            {daysGrid.map(({ day, currentMonth }, idx) => {
              const selected = isSelected(day, currentMonth);
              const today = isToday(day, currentMonth);
              
              // Check if date is disabled by minDate
              let isDisabled = !currentMonth;
              if (currentMonth && minDateObj) {
                const cellDate = new Date(viewYear, viewMonth, day);
                if (cellDate < minDateObj) {
                  isDisabled = true;
                }
              }
              
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => !isDisabled && handleSelectDay(day)}
                  disabled={isDisabled}
                  className={clsx(
                    "w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer transition-all",
                    isDisabled && "text-on-surface-variant/20 pointer-events-none opacity-30",
                    !isDisabled && !selected && !today && "text-on-surface hover:bg-surface-container",
                    !isDisabled && today && !selected && "text-primary border border-primary/30 font-bold",
                    !isDisabled && selected && "bg-primary text-on-primary font-bold shadow-sm"
                  )}
                >
                  {day}
                </button>
              );
            })}
          </div>

          {/* Time Picker Controls (Sleek scrollable style) */}
          {showTime && (
            <div className="flex items-center justify-between gap-4 mt-4 pt-3 border-t border-outline-variant/20 bg-surface-container-low/30 p-2 rounded-xl">
              <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
                <Clock className="w-3.5 h-3.5 text-primary" /> Time
              </span>
              <div className="flex items-center gap-1.5">
                <div className="w-20">
                  <Dropdown
                    options={hourOptions}
                    value={tempHours}
                    onChange={(val) => handleTimeChange('hours', val)}
                    size="sm"
                  />
                </div>
                <span className="text-xs font-bold text-on-surface-variant">:</span>
                <div className="w-20">
                  <Dropdown
                    options={minuteOptions}
                    value={tempMinutes}
                    onChange={(val) => handleTimeChange('minutes', val)}
                    size="sm"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Footer buttons */}
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-outline-variant/20 text-[10px] font-bold uppercase tracking-wider">
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
              className="text-primary hover:text-primary/80 cursor-pointer transition-colors"
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
