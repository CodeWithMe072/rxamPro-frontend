import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { School, Sun, Moon, Laptop, Menu, X } from 'lucide-react';

export const PublicLayout = ({ children }) => {
  const { theme, toggleTheme } = useTheme();
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  return (
    <div className="min-h-screen bg-background text-on-background flex flex-col transition-colors duration-300">
      {/* Top Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-surface/80 dark:bg-surface-dim/80 backdrop-blur-xl border-b border-outline-variant/30 shadow-[0_20px_40px_rgba(0,0,0,0.05)] px-margin-mobile md:px-margin-desktop py-4 flex justify-between items-center">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-container text-white rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 rotate-3 hover:rotate-0 duration-300">
            <School className="w-6 h-6" />
          </div>
          <span className="font-h3 text-2xl font-extrabold text-primary dark:text-primary-fixed">ExamPro</span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex gap-8 items-center">
          <NavLink to="/" className={({ isActive }) => 
            `font-body text-base transition-colors ${isActive ? 'text-primary dark:text-primary-fixed border-b-2 border-primary' : 'text-on-surface-variant hover:text-primary dark:text-outline-variant'}`
          }>
            Home
          </NavLink>
          <NavLink to="/tests" className={({ isActive }) => 
            `font-body text-base transition-colors ${isActive ? 'text-primary dark:text-primary-fixed border-b-2 border-primary' : 'text-on-surface-variant hover:text-primary dark:text-outline-variant'}`
          }>
            Tests
          </NavLink>
          <NavLink to="/leaderboard" className={({ isActive }) => 
            `font-body text-base transition-colors ${isActive ? 'text-primary dark:text-primary-fixed border-b-2 border-primary' : 'text-on-surface-variant hover:text-primary dark:text-outline-variant'}`
          }>
            Leaderboard
          </NavLink>
        </div>

        {/* Actions */}
        <div className="flex gap-4 items-center">
          {/* Theme toggler */}
          <button 
            onClick={toggleTheme} 
            className="p-2 rounded-xl text-on-surface-variant hover:bg-surface-variant/50 transition-colors"
            title={`Theme: ${theme}`}
          >
            {theme === 'light' ? <Moon className="w-5 h-5" /> : theme === 'dark' ? <Laptop className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
          </button>

          {isAuthenticated ? (
            <div className="hidden md:flex items-center gap-3">
              <Link 
                to={user?.role === 'admin' ? '/admin' : '/dashboard'} 
                className="px-6 py-2 rounded-xl bg-primary text-on-primary font-button text-sm hover:opacity-95 active:scale-95 transition-all shadow-md"
              >
                Dashboard
              </Link>
              <button 
                onClick={logout} 
                className="px-4 py-2 rounded-xl text-error hover:bg-error-container/20 font-button text-sm transition-all"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="hidden md:flex gap-2 items-center">
              <Link to="/login" className="px-6 py-2 rounded-xl bg-primary text-on-primary font-button text-sm hover:opacity-95 active:scale-95 transition-all shadow-md">
                Login
              </Link>
            </div>
          )}

          {/* Mobile Menu Btn */}
          <button 
            className="md:hidden p-2 text-on-surface-variant"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </nav>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-surface/95 dark:bg-surface-dim/95 backdrop-blur-lg pt-24 px-6 flex flex-col gap-6 md:hidden">
          <Link to="/" onClick={() => setMobileMenuOpen(false)} className="text-xl font-bold border-b border-outline-variant/30 py-2">Home</Link>
          <Link to="/tests" onClick={() => setMobileMenuOpen(false)} className="text-xl font-bold border-b border-outline-variant/30 py-2">Available Tests</Link>
          <Link to="/leaderboard" onClick={() => setMobileMenuOpen(false)} className="text-xl font-bold border-b border-outline-variant/30 py-2">Leaderboard</Link>
          {isAuthenticated ? (
            <>
              <Link to={user?.role === 'admin' ? '/admin' : '/dashboard'} onClick={() => setMobileMenuOpen(false)} className="text-xl font-bold py-2 text-primary">Go to Dashboard</Link>
              <button onClick={() => { logout(); setMobileMenuOpen(false); }} className="text-xl font-bold py-2 text-left text-error">Logout</button>
            </>
          ) : (
            <div className="flex flex-col gap-3 mt-4">
              <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="w-full text-center py-3 rounded-xl bg-primary text-on-primary font-bold">Login</Link>
            </div>
          )}
        </div>
      )}

      {/* Page Content */}
      <main className="flex-grow pt-24">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-inverse-surface w-full py-margin-desktop text-inverse-primary border-t border-outline-variant/10 mt-auto">
        <div className="max-w-container-max mx-auto grid grid-cols-1 md:grid-cols-4 px-margin-mobile md:px-margin-desktop gap-gutter">
          <div className="flex flex-col gap-6">
            <div className="font-h4 text-2xl font-bold text-inverse-primary flex items-center gap-2">
              <School className="w-6 h-6" /> ExamPro
            </div>
            <p className="font-small text-sm text-surface-variant/80 leading-relaxed">
              Empowering students with the world's most realistic examination simulation platform. Level up your learning today.
            </p>
          </div>
          <div className="flex flex-col gap-4">
            <h5 className="font-button text-base text-secondary">Platform</h5>
            <ul className="flex flex-col gap-2">
              <li><Link to="/tests" className="font-small text-sm text-surface-variant hover:text-primary-fixed-dim transition-colors">Browse Tests</Link></li>
              <li><Link to="/tests" className="font-small text-sm text-surface-variant hover:text-primary-fixed-dim transition-colors">Live Mock Exams</Link></li>
              <li><Link to="/leaderboard" className="font-small text-sm text-surface-variant hover:text-primary-fixed-dim transition-colors">Global Ranking</Link></li>
            </ul>
          </div>
          <div className="flex flex-col gap-4">
            <h5 className="font-button text-base text-secondary">Resources</h5>
            <ul className="flex flex-col gap-2">
              <li><Link to="#" className="font-small text-sm text-surface-variant hover:text-primary-fixed-dim transition-colors">Help Center</Link></li>
              <li><Link to="#" className="font-small text-sm text-surface-variant hover:text-primary-fixed-dim transition-colors">API Docs</Link></li>
              <li><Link to="#" className="font-small text-sm text-surface-variant hover:text-primary-fixed-dim transition-colors">Student Stories</Link></li>
            </ul>
          </div>
          <div className="flex flex-col gap-4">
            <h5 className="font-button text-base text-secondary">Legal</h5>
            <ul className="flex flex-col gap-2">
              <li><Link to="#" className="font-small text-sm text-surface-variant hover:text-primary-fixed-dim transition-colors">Privacy Policy</Link></li>
              <li><Link to="#" className="font-small text-sm text-surface-variant hover:text-primary-fixed-dim transition-colors">Terms of Service</Link></li>
              <li><Link to="#" className="font-small text-sm text-surface-variant hover:text-primary-fixed-dim transition-colors">Refund Policy</Link></li>
            </ul>
          </div>
        </div>
        <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop mt-16 pt-8 border-t border-surface-variant/10 text-center">
          <p className="font-small text-sm text-surface-variant/60">© 2026 ExamPro SaaS Inc. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};
