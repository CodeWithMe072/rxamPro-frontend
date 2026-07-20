import React, { useState, useEffect, useRef } from 'react';
import { notificationService } from '../services/notification.service';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { 
  School, LayoutDashboard, ClipboardList, History, 
  Trophy, User, Settings, LogOut, Sun, Moon, 
  Laptop, Search, Bell, Menu, ChevronLeft, ChevronRight 
} from 'lucide-react';

export const SidebarLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const [notifications, setNotifications] = useState([]);
  const [showNotificationsDropdown, setShowNotificationsDropdown] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (!user) return;
    
    // Request camera and microphone permissions early when the user lands on the website
    const requestPermissionsEarly = async () => {
      if (sessionStorage.getItem('media_permissions_requested')) return;
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        stream.getTracks().forEach(track => track.stop());
        sessionStorage.setItem('media_permissions_requested', 'true');
      } catch (err) {
        console.warn('Early media permissions check failed/denied:', err);
      }
    };
    
    const timer = setTimeout(requestPermissionsEarly, 1000);
    return () => clearTimeout(timer);
  }, [user]);

  useEffect(() => {
    if (!user) return;
    
    // Fetch initial notifications
    const fetchNotifications = async () => {
      try {
        const data = await notificationService.getNotifications();
        setNotifications(data || []);
      } catch (err) {
        console.error('Failed to fetch notifications:', err);
      }
    };
    fetchNotifications();

    // Establish real-time SSE stream
    const token = localStorage.getItem('token');
    if (!token) return;

    const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    const streamUrl = `${backendUrl}/notifications/stream?token=${token}`;
    
    const eventSource = new EventSource(streamUrl);

    eventSource.onmessage = (event) => {
      try {
        const newNotif = JSON.parse(event.data);
        setNotifications(prev => {
          if (prev.some(n => n._id === newNotif._id)) return prev;
          return [newNotif, ...prev];
        });
      } catch (err) {
        console.error('Failed to parse SSE notification:', err);
      }
    };

    eventSource.onerror = (err) => {
      console.error('EventSource connection error:', err);
    };

    return () => {
      eventSource.close();
    };
  }, [user]);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowNotificationsDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const handleNotificationClick = async (notif) => {
    try {
      await notificationService.markAsRead(notif._id);
      setNotifications(prev => prev.map(n => n._id === notif._id ? { ...n, isRead: true } : n));
      setShowNotificationsDropdown(false);
      if (notif.link) {
        navigate(notif.link);
      }
    } catch (err) {
      console.error('Failed to mark notification read:', err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (err) {
      console.error('Failed to mark all notifications read:', err);
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Available Tests', path: '/tests', icon: ClipboardList },
    { name: 'Previous Attempts', path: '/attempts', icon: History },
    { name: 'Leaderboard', path: '/leaderboard', icon: Trophy }
  ];

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/tests?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const getBreadcrumbs = () => {
    const paths = location.pathname.split('/').filter(p => p);
    return [
      { name: 'Home', path: '/' },
      ...paths.map((p, i) => ({
        name: p.charAt(0).toUpperCase() + p.slice(1).replace('-', ' '),
        path: '/' + paths.slice(0, i + 1).join('/')
      }))
    ];
  };

  const activeUser = user || {
    name: 'Alex Rivera',
    email: 'alex.rivera@exampro.com',
    role: 'student'
  };

  const SidebarContent = ({ onItemClick }) => (
    <div className="flex flex-col h-full relative">
      {/* Brand & Header */}
      <div className="mb-8 px-2 flex justify-between items-center">
        <Link to="/" onClick={onItemClick} className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-container text-white rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 rotate-3">
            <School className="w-6 h-6" />
          </div>
          {!sidebarCollapsed && (
            <span className="font-h4 text-xl font-bold text-primary dark:text-primary-fixed">ExamPro</span>
          )}
        </Link>
        <button 
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="hidden md:flex absolute -right-7 top-5 w-6 h-6 bg-surface-container border border-outline-variant/30 rounded-full items-center justify-center text-on-surface-variant hover:text-primary shadow-md hover:scale-110 transition-all z-50 cursor-pointer"
        >
          {sidebarCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* User profile capsule */}
      <div className={`mb-8 flex items-center transition-all ${
        sidebarCollapsed 
          ? 'justify-center bg-transparent border-transparent p-0' 
          : 'p-3 bg-surface-container-low dark:bg-surface-dim rounded-2xl gap-3 border border-outline-variant/20'
      }`}>
        <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center font-bold overflow-hidden flex-shrink-0 border-2 border-primary/20 shadow-sm">
          {activeUser.avatar && !activeUser.avatar.includes('lh3.googleusercontent.com/aida-public') ? (
            /* Real uploaded avatar */
            <img 
              className="w-full h-full object-cover" 
              alt={activeUser.name}
              src={activeUser.avatar}
            />
          ) : (
            /* Initial-letter empty state */
            <span className="text-sm font-bold text-primary select-none">
              {(activeUser.name || 'U').charAt(0).toUpperCase()}
            </span>
          )}
        </div>
        {!sidebarCollapsed && (
          <div className="min-w-0">
            <p className="font-small text-sm font-bold text-on-surface truncate">{activeUser.name}</p>
            <p className="text-[10px] text-on-surface-variant uppercase tracking-wider">{activeUser.batch?.name || 'Standard Plan'}</p>
          </div>
        )}
      </div>

      {/* Nav List */}
      <nav className="flex-grow space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink 
              key={item.path}
              to={item.path}
              onClick={onItemClick}
              className={({ isActive }) => 
                `flex items-center transition-all ${
                  sidebarCollapsed 
                    ? 'w-12 h-12 justify-center rounded-full mx-auto' 
                    : 'gap-3 px-4 py-3 rounded-xl font-bold'
                } ${
                  isActive 
                    ? 'bg-primary-container text-on-primary-container shadow-md shadow-primary/10' 
                    : 'text-on-surface-variant hover:bg-surface-variant/50 hover:text-on-surface'
                }`
              }
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {!sidebarCollapsed && <span className="font-small text-sm">{item.name}</span>}
            </NavLink>
          );
        })}
      </nav>

      {/* Bottom Actions */}
      <div className="mt-auto pt-4 border-t border-outline-variant/20 space-y-1">
        <NavLink 
          to="/profile"
          onClick={onItemClick}
          className={({ isActive }) => 
            `flex items-center transition-all ${
              sidebarCollapsed 
                ? 'w-12 h-12 justify-center rounded-full mx-auto' 
                : 'gap-3 px-4 py-3 rounded-xl font-bold'
            } ${
              isActive 
                ? 'bg-primary-container text-on-primary-container' 
                : 'text-on-surface-variant hover:bg-surface-variant/50 hover:text-on-surface'
            }`
          }
        >
          <User className="w-5 h-5 flex-shrink-0" />
          {!sidebarCollapsed && <span className="font-small text-sm">Profile</span>}
        </NavLink>
        <NavLink 
          to="/settings"
          onClick={onItemClick}
          className={({ isActive }) => 
            `flex items-center transition-all ${
              sidebarCollapsed 
                ? 'w-12 h-12 justify-center rounded-full mx-auto' 
                : 'gap-3 px-4 py-3 rounded-xl font-bold'
            } ${
              isActive 
                ? 'bg-primary-container text-on-primary-container' 
                : 'text-on-surface-variant hover:bg-surface-variant/50 hover:text-on-surface'
            }`
          }
        >
          <Settings className="w-5 h-5 flex-shrink-0" />
          {!sidebarCollapsed && <span className="font-small text-sm">Settings</span>}
        </NavLink>
        <button 
          onClick={logout}
          className={`flex items-center transition-all text-error hover:bg-error-container/20 cursor-pointer ${
            sidebarCollapsed 
              ? 'w-12 h-12 justify-center rounded-full mx-auto' 
              : 'w-full gap-3 px-4 py-3 rounded-xl font-bold'
          }`}
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {!sidebarCollapsed && <span className="font-small text-sm">Logout</span>}
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background text-on-background flex transition-colors duration-300">
      {/* Desktop Sidebar */}
      <aside className={`hidden md:block fixed left-0 top-0 h-screen bg-surface-container dark:bg-surface-container-low border-r border-outline-variant/30 z-40 transition-all duration-300 p-4 shadow-lg ${
        sidebarCollapsed ? 'w-20' : 'w-64'
      }`}>
        <SidebarContent />
      </aside>

      {/* Mobile Drawer Sidebar */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setMobileSidebarOpen(false)}></div>
          <aside className="relative w-64 bg-surface-container dark:bg-surface-container-low p-4 h-full flex flex-col z-10 border-r border-outline-variant/30 shadow-2xl">
            <SidebarContent onItemClick={() => setMobileSidebarOpen(false)} />
          </aside>
        </div>
      )}

      {/* Main Content Pane */}
      <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${
        sidebarCollapsed ? 'md:ml-20' : 'md:ml-64'
      }`}>
        {/* Top Header bar */}
        <header className="sticky top-0 w-full z-30 bg-surface/80 dark:bg-surface-dim/80 backdrop-blur-md border-b border-outline-variant/30 flex justify-between items-center px-4 md:px-6 py-3 shadow-sm">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setMobileSidebarOpen(true)}
              className="md:hidden p-2 rounded-xl text-on-surface-variant hover:bg-surface-variant/50"
            >
              <Menu className="w-5 h-5" />
            </button>
            
            {/* Breadcrumbs */}
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-on-surface-variant">
              {getBreadcrumbs().map((b, i) => (
                <React.Fragment key={b.path}>
                  {i > 0 && <span className="text-outline-variant">/</span>}
                  <Link to={b.path} className="hover:text-primary transition-colors font-medium">
                    {b.name}
                  </Link>
                </React.Fragment>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-6">
            {/* Search Bar */}
            <form onSubmit={handleSearchSubmit} className="hidden lg:flex items-center bg-surface-container-high dark:bg-surface-container-highest rounded-full px-4 py-1.5 w-72 border border-outline-variant/20 focus-within:ring-2 focus-within:ring-primary/20">
              <Search className="w-4 h-4 text-outline mr-2" />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search available tests..." 
                className="bg-transparent border-none text-xs focus:outline-none w-full text-on-surface placeholder:text-outline"
              />
            </form>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <button 
                onClick={toggleTheme}
                className="p-2 rounded-xl text-on-surface-variant hover:bg-surface-variant/50 transition-colors"
                title={`Theme: ${theme}`}
              >
                {theme === 'light' ? <Moon className="w-5 h-5" /> : theme === 'dark' ? <Laptop className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
              </button>
              <div className="relative" ref={dropdownRef}>
                <button 
                  onClick={() => setShowNotificationsDropdown(!showNotificationsDropdown)}
                  className="p-2 rounded-xl text-on-surface-variant hover:bg-surface-variant/50 transition-colors relative cursor-pointer"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 px-1 py-0.5 min-w-[14px] h-[14px] bg-error text-white font-bold text-[8px] rounded-full flex items-center justify-center ring-2 ring-surface border-none">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {showNotificationsDropdown && (
                  <div className="absolute right-0 mt-3 w-80 max-h-[400px] bg-surface-container-highest border border-outline-variant/30 rounded-2xl shadow-2xl overflow-hidden z-50 flex flex-col">
                    <div className="px-4 py-3 bg-surface-container-high border-b border-outline-variant/20 flex items-center justify-between">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-on-surface">Notifications</h4>
                      {unreadCount > 0 && (
                        <button 
                          onClick={handleMarkAllRead} 
                          className="text-[10px] text-primary hover:underline font-bold cursor-pointer"
                        >
                          Mark all read
                        </button>
                      )}
                    </div>

                    <div className="flex-1 overflow-y-auto divide-y divide-outline-variant/10 max-h-[320px]">
                      {notifications.length === 0 ? (
                        <div className="p-8 text-center text-on-surface-variant/60 text-xs font-medium">
                          No notifications yet
                        </div>
                      ) : (
                        notifications.map(notif => (
                          <button
                            key={notif._id}
                            onClick={() => handleNotificationClick(notif)}
                            className={`w-full text-left px-4 py-3 hover:bg-surface-variant/30 transition-colors flex flex-col gap-1 border-none cursor-pointer ${
                              !notif.isRead ? 'bg-primary/5' : ''
                            }`}
                          >
                            <div className="flex justify-between items-start w-full">
                              <span className={`text-xs font-bold ${!notif.isRead ? 'text-primary' : 'text-on-surface'}`}>
                                {notif.title}
                              </span>
                              {!notif.isRead && (
                                <span className="w-1.5 h-1.5 bg-primary rounded-full mt-1.5 flex-shrink-0"></span>
                              )}
                            </div>
                            <p className="text-[11px] text-on-surface-variant leading-relaxed">
                              {notif.message}
                            </p>
                            <span className="text-[9px] text-on-surface-variant/60 font-medium">
                              {new Date(notif.createdAt).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Inner page container */}
        <main className="p-4 sm:p-6 md:p-8 max-w-container-max w-full mx-auto flex-grow">
          {children}
        </main>
      </div>
    </div>
  );
};
