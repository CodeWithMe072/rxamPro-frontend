import React, { useState } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { 
  School, LayoutDashboard, FileText, Upload, 
  BarChart3, Users, Settings, LogOut, Sun, Moon, 
  Laptop, Search, Bell, Menu, ChevronLeft, ChevronRight,
  UserCog, Palette, User
} from 'lucide-react';

export const AdminLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const activeAdmin = user || {
    name: 'Sarah Connor',
    email: 'sarah.c@admin.exampro.com',
    role: 'admin'
  };

  const adminNavItems = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { name: 'Manage Tests', path: '/admin/tests', icon: FileText },
    { name: 'Manage Batches', path: '/admin/batches', icon: School },
    { name: 'Upload Config', path: '/admin/upload', icon: Upload },
    { name: 'Analytics Panel', path: '/admin/analytics', icon: BarChart3 },
    { name: 'User Management', path: '/admin/users', icon: Users, roleLimit: ['admin', 'sub-admin', 'staff'] },
    { name: 'Theme Settings',  path: '/admin/theme', icon: Palette, roleLimit: ['admin'] }
  ].filter(item => !item.roleLimit || item.roleLimit.includes(activeAdmin.role));

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/admin/tests?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const getBreadcrumbs = () => {
    const paths = location.pathname.split('/').filter(p => p);
    return [
      { name: 'Admin Hub', path: '/admin' },
      ...paths.slice(1).map((p, i) => ({
        name: p.charAt(0).toUpperCase() + p.slice(1).replace('-', ' '),
        path: '/admin/' + paths.slice(1, i + 2).join('/')
      }))
    ];
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full text-on-surface relative">
      {/* Brand & Header */}
      <div className="mb-8 px-2 flex justify-between items-center">
        <Link to="/admin" className="flex items-center gap-3">
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
          {activeAdmin.avatar ? (
            <img className="w-full h-full object-cover" alt={activeAdmin.name} src={activeAdmin.avatar} />
          ) : (
            <span className="text-sm font-bold text-primary select-none">
              {(activeAdmin.name || 'A').charAt(0).toUpperCase()}
            </span>
          )}
        </div>
        {!sidebarCollapsed && (
          <div className="min-w-0">
            <p className="font-small text-sm font-bold text-on-surface truncate">{activeAdmin.name}</p>
            <p className="text-[10px] text-on-surface-variant uppercase tracking-wider">{activeAdmin.role}</p>
          </div>
        )}
      </div>

      {/* Nav List */}
      <nav className="flex-grow space-y-1">
        {adminNavItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink 
              key={item.path}
              to={item.path}
              end={item.path === '/admin'}
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

        {/* Profile */}
        <NavLink
          to="/admin/profile"
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
          <User className="w-5 h-5 flex-shrink-0" />
          {!sidebarCollapsed && <span className="font-small text-sm">Profile</span>}
        </NavLink>

        {/* Settings */}
        <NavLink
          to="/admin/settings"
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
          <Settings className="w-5 h-5 flex-shrink-0" />
          {!sidebarCollapsed && <span className="font-small text-sm">Settings</span>}
        </NavLink>

        {/* Student View (admin only) */}
        {activeAdmin.role === 'admin' && (
          <Link
            to="/dashboard"
            className={`flex items-center transition-all text-primary dark:text-primary-fixed hover:bg-surface-variant/50 cursor-pointer ${
              sidebarCollapsed
                ? 'w-12 h-12 justify-center rounded-full mx-auto'
                : 'gap-3 px-4 py-3 rounded-xl font-bold'
            }`}
          >
            <School className="w-5 h-5 flex-shrink-0" />
            {!sidebarCollapsed && <span className="font-small text-sm">Student View</span>}
          </Link>
        )}

        {/* Logout */}
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
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileSidebarOpen(false)}></div>
          <aside className="relative w-64 bg-surface-container dark:bg-surface-container-low p-4 h-full flex flex-col z-10 border-r border-outline-variant/30 shadow-2xl">
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main Content Pane */}
      <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 bg-background ${
        sidebarCollapsed ? 'md:ml-20' : 'md:ml-64'
      }`}>
        {/* Top Header bar */}
        <header className="sticky top-0 w-full z-30 bg-surface-container/80 backdrop-blur-md border-b border-outline-variant/20 flex justify-between items-center px-4 md:px-6 py-3 shadow-sm">
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
                  {i > 0 && <span className="text-outline-variant/40">/</span>}
                  <Link to={b.path} className="hover:text-primary transition-colors font-medium">
                    {b.name}
                  </Link>
                </React.Fragment>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-6">
            {/* Search Bar */}
            <form onSubmit={handleSearchSubmit} className="hidden lg:flex items-center bg-surface-container border border-outline-variant/50 rounded-full px-4 py-1.5 w-72 focus-within:ring-2 focus-within:ring-primary/20">
              <Search className="w-4 h-4 text-on-surface-variant/60 mr-2" />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tests..." 
                className="bg-transparent border-none text-xs focus:outline-none w-full text-on-surface placeholder:text-on-surface-variant/40"
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
              <button className="p-2 rounded-xl text-on-surface-variant hover:bg-surface-variant/50 transition-colors relative">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-primary rounded-full ring-2 ring-surface-container border-none"></span>
              </button>
            </div>
          </div>
        </header>

        {/* Inner page container */}
        <main className="p-4 sm:p-6 md:p-8 max-w-container-max w-full mx-auto flex-grow text-on-surface">
          {children}
        </main>
      </div>
    </div>
  );
};
