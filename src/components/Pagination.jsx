import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ChevronDown, Check } from 'lucide-react';

/**
 * Reusable server-side Pagination component with a custom-styled dropdown.
 *
 * Props:
 *  - pagination: { total, page, limit, totalPages, hasNext, hasPrev }
 *  - onPageChange(newPage): called when user clicks a page/prev/next
 *  - onLimitChange(newLimit): called when user changes page size
 *  - pageSizeOptions: array of numbers e.g. [10, 20, 50] (optional)
 */

/** Custom per-page dropdown — no native <select> */
const PerPageDropdown = ({ value, options, onChange }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    if (open) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      {/* Trigger button */}
      <button
        onClick={() => setOpen(prev => !prev)}
        className="
          flex items-center gap-2 h-8 px-3
          bg-surface-container border border-outline-variant/30
          rounded-lg text-on-surface text-xs font-bold
          hover:border-primary/50 hover:bg-surface-container-high
          focus:outline-none focus:border-primary
          transition-all duration-150 cursor-pointer select-none
        "
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span>{value}</span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-on-surface-variant transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Floating panel */}
      {open && (
        <div
          className="
            absolute bottom-full mb-2 right-0
            min-w-[90px] z-50
            bg-surface-container-high
            border border-outline-variant/30
            rounded-xl shadow-2xl shadow-black/40
            overflow-hidden
            animate-in fade-in slide-in-from-bottom-2 duration-150
          "
          role="listbox"
        >
          {options.map(opt => {
            const isSelected = opt === value;
            return (
              <button
                key={opt}
                role="option"
                aria-selected={isSelected}
                onClick={() => { onChange(opt); setOpen(false); }}
                className={`
                  w-full flex items-center justify-between
                  px-4 py-2.5 text-xs font-semibold
                  transition-colors duration-100 cursor-pointer
                  ${isSelected
                    ? 'bg-primary text-on-primary'
                    : 'text-on-surface hover:bg-primary/10 hover:text-primary'
                  }
                `}
              >
                <span>{opt}</span>
                {isSelected && <Check className="w-3.5 h-3.5 flex-shrink-0" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export const Pagination = ({
  pagination,
  onPageChange,
  onLimitChange,
  pageSizeOptions = [10, 20, 50]
}) => {
  if (!pagination || pagination.totalPages <= 1) return null;

  const { total, page, limit, totalPages, hasNext, hasPrev } = pagination;

  const start = (page - 1) * limit + 1;
  const end   = Math.min(page * limit, total);

  // Build visible page numbers (max 7 buttons with ellipsis)
  const buildPageNumbers = () => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    const pages = [];
    if (page <= 4) {
      pages.push(1, 2, 3, 4, 5, '...', totalPages);
    } else if (page >= totalPages - 3) {
      pages.push(1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
    } else {
      pages.push(1, '...', page - 1, page, page + 1, '...', totalPages);
    }
    return pages;
  };

  const pageNumbers = buildPageNumbers();

  const btnBase =
    'h-9 min-w-[36px] px-2 rounded-lg text-xs font-bold transition-all duration-150 flex items-center justify-center select-none';
  const btnActive   = 'bg-primary text-on-primary shadow-md';
  const btnDefault  = 'text-on-surface-variant hover:bg-primary/10 hover:text-primary';
  const btnDisabled = 'text-on-surface-variant/30 cursor-not-allowed';

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-outline-variant/20 mt-4">

      {/* Showing X – Y of Z */}
      <span className="text-xs text-on-surface-variant font-semibold">
        Showing <span className="text-on-surface">{start}–{end}</span> of{' '}
        <span className="text-on-surface">{total}</span> results
      </span>

      {/* Page number buttons */}
      <div className="flex items-center gap-1">
        {/* Prev */}
        <button
          onClick={() => hasPrev && onPageChange(page - 1)}
          disabled={!hasPrev}
          className={`${btnBase} ${hasPrev ? btnDefault : btnDisabled}`}
          aria-label="Previous page"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {pageNumbers.map((p, idx) =>
          p === '...'
            ? <span key={`ellipsis-${idx}`} className="text-xs text-on-surface-variant px-1 select-none">…</span>
            : (
              <button
                key={p}
                onClick={() => p !== page && onPageChange(p)}
                className={`${btnBase} ${p === page ? btnActive : btnDefault}`}
                aria-label={`Page ${p}`}
                aria-current={p === page ? 'page' : undefined}
              >
                {p}
              </button>
            )
        )}

        {/* Next */}
        <button
          onClick={() => hasNext && onPageChange(page + 1)}
          disabled={!hasNext}
          className={`${btnBase} ${hasNext ? btnDefault : btnDisabled}`}
          aria-label="Next page"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Custom per-page selector */}
      {onLimitChange && (
        <div className="flex items-center gap-2 text-xs text-on-surface-variant font-semibold">
          <span>Per page:</span>
          <PerPageDropdown
            value={limit}
            options={pageSizeOptions}
            onChange={onLimitChange}
          />
        </div>
      )}
    </div>
  );
};

export default Pagination;
