import React, { useEffect, useRef } from 'react';
import { ShieldX, Mail, LogOut } from 'lucide-react';

/**
 * BannedModal — shown globally when the API returns a 403 "banned" response.
 * The user cannot dismiss it by clicking outside; they must click "Understood, Sign Out".
 * On click → the parent calls logout() which clears session and redirects to /login.
 */
export const BannedModal = ({ onConfirm }) => {
  const btnRef = useRef(null);

  // Focus the button on mount for keyboard accessibility
  useEffect(() => {
    const timer = setTimeout(() => btnRef.current?.focus(), 200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="banned-title"
      aria-describedby="banned-desc"
    >
      {/* Blurred dark backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

      {/* Modal card */}
      <div className="relative z-10 w-full max-w-md animate-[fadeInScale_0.3s_ease]">
        <div className="rounded-3xl overflow-hidden border border-error/30 shadow-2xl shadow-error/20 bg-surface">

          {/* Top accent bar */}
          <div className="h-1.5 w-full bg-gradient-to-r from-error via-error/70 to-error/30" />

          <div className="p-8 flex flex-col items-center text-center gap-6">

            {/* Icon */}
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-error/10 border-2 border-error/30 flex items-center justify-center">
                <ShieldX className="w-10 h-10 text-error" />
              </div>
              {/* Pulsing ring */}
              <span className="absolute inset-0 rounded-full border-2 border-error/40 animate-ping" />
            </div>

            {/* Text */}
            <div className="space-y-2">
              <h2
                id="banned-title"
                className="text-2xl font-bold text-on-surface tracking-tight"
              >
                Account Suspended
              </h2>
              <p
                id="banned-desc"
                className="text-sm text-on-surface-variant leading-relaxed max-w-xs"
              >
                Your account has been <span className="text-error font-semibold">suspended</span> by
                management. You cannot access the portal until the suspension is lifted.
              </p>
            </div>

            {/* Contact info */}
            <div className="w-full flex items-center gap-3 bg-surface-container rounded-2xl px-4 py-3 border border-outline-variant/20">
              <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Mail className="w-4 h-4 text-primary" />
              </div>
              <div className="text-left">
                <p className="text-[11px] text-on-surface-variant uppercase tracking-wider font-bold">Need help?</p>
                <p className="text-xs text-on-surface font-medium">Contact your institute administrator to resolve this issue.</p>
              </div>
            </div>

            {/* CTA button */}
            <button
              ref={btnRef}
              onClick={onConfirm}
              className="w-full flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl bg-error text-white font-bold text-sm tracking-wide hover:bg-error/90 active:scale-[0.98] transition-all shadow-lg shadow-error/30 focus:outline-none focus:ring-2 focus:ring-error/50 focus:ring-offset-2 focus:ring-offset-surface cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              Understood, Sign Out
            </button>

            <p className="text-[11px] text-on-surface-variant/60">
              You will be redirected to the login page.
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeInScale {
          from { opacity: 0; transform: scale(0.92) translateY(12px); }
          to   { opacity: 1; transform: scale(1)    translateY(0);     }
        }
      `}</style>
    </div>
  );
};

export default BannedModal;
