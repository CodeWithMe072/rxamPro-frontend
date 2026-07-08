import React, { useEffect, useRef, useState, useCallback } from 'react';
import { testService } from '../../services/test.service';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { Badge } from '../../components/Badge';
import { Loader } from '../../components/Loader';
import { useAuth } from '../../context/AuthContext';
import { Dropdown } from '../../components/Dropdown';
import { DatePicker } from '../../components/DatePicker';
import { Users, Search, ShieldAlert, UserPlus, UserCheck, ShieldX, Trash2, School, Filter, Mail, RefreshCw, CheckCircle2, Activity } from 'lucide-react';
import toast from 'react-hot-toast';

export const UserManagement = () => {
  const { user: activeUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [batches, setBatches] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBatchFilter, setSelectedBatchFilter] = useState('');
  const [searchCriteria, setSearchCriteria] = useState('both'); // 'both' | 'name' | 'email'
  
  // Date Filtering states
  const [dateOperator, setDateOperator] = useState('all'); // 'all' | 'before' | 'after' | 'between'
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Tab control: 'students' | 'staff' | 'sub-admins'
  const [activeTab, setActiveTab] = useState('students');

  // Add User modal state
  const [showAddModal, setShowAddModal]   = useState(false);
  const [modalStep, setModalStep]          = useState('form'); // 'form' | 'otp'
  const [isSubmitting, setIsSubmitting]    = useState(false);
  const [newUserData, setNewUserData]      = useState({ name: '', username: '', email: '', phone: '', role: 'student', batchId: '' });
  const [otpValues, setOtpValues]          = useState(Array(8).fill(''));
  const [resendCooldown, setResendCooldown]= useState(0);
  const otpRefs                            = useRef([]);
  const cooldownRef                        = useRef(null);

  const fileInputRef                       = useRef(null);
  const [showImportSummary, setShowImportSummary] = useState(false);
  const [importSummary, setImportSummary]   = useState(null);

  const [showAttemptsModal, setShowAttemptsModal] = useState(false);
  const [selectedUserForAttempts, setSelectedUserForAttempts] = useState(null);
  const [userAttemptsList, setUserAttemptsList] = useState([]);
  const [loadingAttempts, setLoadingAttempts] = useState(false);
  const [showSnapshotsModal, setShowSnapshotsModal] = useState(false);
  const [selectedAttemptForSnapshots, setSelectedAttemptForSnapshots] = useState(null);

  const handleViewAttempts = async (userObj) => {
    setSelectedUserForAttempts(userObj);
    setShowAttemptsModal(true);
    setLoadingAttempts(true);
    try {
      const data = await testService.getUserAttempts(userObj.id);
      setUserAttemptsList(data);
    } catch (e) {
      toast.error('Failed to load student attempts log.');
    } finally {
      setLoadingAttempts(false);
    }
  };

  const handleFileImport = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset input value so same file can be uploaded again if needed
    e.target.value = '';

    const loadId = toast.loading('Uploading and importing user directory...');
    try {
      const response = await testService.importUsers(file);
      toast.success(response.message || 'Bulk import completed successfully!', { id: loadId });
      setImportSummary(response.data);
      setShowImportSummary(true);
      fetchUsersAndBatches(); // Refresh directories
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Failed to complete bulk import.';
      toast.error(errMsg, { id: loadId });
    }
  };

  const fetchUsersAndBatches = async () => {
    setIsLoading(true);
    try {
      const [usersData, batchesData] = await Promise.all([
        testService.getUsers(),
        testService.getBatches()
      ]);
      setUsers(usersData);
      setBatches(batchesData);
    } catch (e) {
      toast.error('Failed to load user and batch directories.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsersAndBatches();
  }, []);

  // Reset all filters whenever the active tab changes
  useEffect(() => {
    setSearchQuery('');
    setSelectedBatchFilter('');
    setSearchCriteria('both');
    setDateOperator('all');
    setStartDate('');
    setEndDate('');
  }, [activeTab]);


  const handleRoleChange = async (userId, newRole) => {
    try {
      await testService.updateUserRole(userId, newRole);
      toast.success(`Role updated successfully.`);
      fetchUsersAndBatches();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to update role.');
    }
  };

  const handleBatchUpdate = async (userId, batchId) => {
    try {
      await testService.updateUserRole(userId, { batchId });
      toast.success('Student batch updated successfully.');
      fetchUsersAndBatches();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to update student batch.');
    }
  };

  const handleBanToggle = async (userId) => {
    try {
      await testService.toggleUserBan(userId);
      toast.success('User moderation status updated.');
      fetchUsersAndBatches();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to moderate user status.');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to permanently delete this user account?')) {
      return;
    }
    try {
      await testService.deleteUser(userId);
      toast.success('User account deleted successfully.');
      fetchUsersAndBatches();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to delete user.');
    }
  };

  const closeAddModal = useCallback(() => {
    setShowAddModal(false);
    setModalStep('form');
    setNewUserData({ name: '', username: '', email: '', phone: '', role: 'student', batchId: '' });
    setOtpValues(Array(8).fill(''));
    setResendCooldown(0);
    if (cooldownRef.current) clearInterval(cooldownRef.current);
  }, []);

  const startCooldown = useCallback(() => {
    setResendCooldown(60);
    cooldownRef.current = setInterval(() => {
      setResendCooldown(prev => {
        if (prev <= 1) { clearInterval(cooldownRef.current); return 0; }
        return prev - 1;
      });
    }, 1000);
  }, []);

  /** Step 1 — validate + send OTP */
  const handleInitiateCreate = async (e) => {
    e.preventDefault();
    if (newUserData.role === 'student' && !newUserData.batchId) {
      toast.error('Batch selection is required for Student accounts.');
      return;
    }
    setIsSubmitting(true);
    try {
      await testService.initiateCreateUser(newUserData);
      toast.success(`Verification code sent to ${newUserData.email}`);
      setModalStep('otp');
      startCooldown();
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send verification code.');
    } finally {
      setIsSubmitting(false);
    }
  };

  /** Step 2 — verify OTP and create account */
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    const otp = otpValues.join('');
    if (otp.length < 8) { toast.error('Please enter all 8 characters of the verification code.'); return; }
    setIsSubmitting(true);
    try {
      await testService.verifyUserOtp(newUserData.email, otp);
      toast.success('Account created! Credentials emailed to the user.');
      closeAddModal();
      fetchUsersAndBatches();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid or expired code.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendCooldown > 0) return;
    setIsSubmitting(true);
    try {
      await testService.resendUserOtp(newUserData.email);
      toast.success('New verification code sent!');
      setOtpValues(Array(8).fill(''));
      startCooldown();
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to resend code.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOtpChange = (index, val) => {
    const char = val.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(-1);
    const next = [...otpValues];
    next[index] = char;
    setOtpValues(next);
    if (char && index < 7) otpRefs.current[index + 1]?.focus();
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpValues[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 8);
    const next = Array(8).fill('');
    pasted.split('').forEach((c, i) => { next[i] = c; });
    setOtpValues(next);
    const focusIdx = Math.min(pasted.length, 7);
    setTimeout(() => otpRefs.current[focusIdx]?.focus(), 0);
  };

  // Helper checks based on role boundaries
  const canManageUserRole = (targetRole, targetId) => {
    if (targetId === activeUser?.id) return false;
    if (activeUser?.role === 'admin') return true;
    if (activeUser?.role === 'sub-admin') {
      return targetRole === 'student' || targetRole === 'staff';
    }
    if (activeUser?.role === 'staff') {
      return targetRole === 'student';
    }
    return false;
  };

  const canModerateUser = (targetRole, targetId) => {
    if (targetId === activeUser?.id) return false;
    if (activeUser?.role === 'admin') return true;
    if (activeUser?.role === 'sub-admin') {
      return targetRole === 'student' || targetRole === 'staff';
    }
    if (activeUser?.role === 'staff') {
      return targetRole === 'student';
    }
    return false;
  };

  const getAvailableRolesForUser = (targetRole) => {
    if (activeUser?.role === 'admin') {
      return ['student', 'staff', 'sub-admin', 'admin'];
    }
    if (activeUser?.role === 'sub-admin') {
      return ['student', 'staff'];
    }
    if (activeUser?.role === 'staff' && targetRole === 'student') {
      return ['student'];
    }
    return [targetRole];
  };

  const getRolesForCreation = () => {
    if (activeUser?.role === 'admin') {
      return ['student', 'staff', 'sub-admin'];
    }
    if (activeUser?.role === 'sub-admin') {
      return ['student', 'staff'];
    }
    if (activeUser?.role === 'staff') {
      return ['student'];
    }
    return [];
  };

  // Raw split lists
  const rawStudents = users.filter(u => u.role === 'student');
  const rawStaff = users.filter(u => u.role === 'staff');
  const rawSubAdmins = users.filter(u => u.role === 'sub-admin');

  // Combined Multi-Filter logic helper
  const filterUser = (u) => {
    // 1. Search Query & Criteria Filter
    const query = searchQuery.toLowerCase().trim();
    if (query) {
      let matchesSearch = false;
      if (searchCriteria === 'name') {
        matchesSearch = u.name.toLowerCase().includes(query);
      } else if (searchCriteria === 'email') {
        matchesSearch = u.email.toLowerCase().includes(query);
      } else {
        matchesSearch = u.name.toLowerCase().includes(query) || u.email.toLowerCase().includes(query);
      }
      if (!matchesSearch) return false;
    }

    // 2. Batch Filter (Only applies to student roles)
    if (u.role === 'student' && selectedBatchFilter) {
      if (u.batch?.id !== selectedBatchFilter) return false;
    }

    // 3. Date Joined Filter
    if (dateOperator !== 'all' && u.joinedAtRaw) {
      const userTime = new Date(u.joinedAtRaw).getTime();
      
      if (dateOperator === 'before' && startDate) {
        const limitTime = new Date(startDate).setHours(23, 59, 59, 999);
        if (userTime > limitTime) return false;
      } else if (dateOperator === 'after' && startDate) {
        const limitTime = new Date(startDate).setHours(0, 0, 0, 0);
        if (userTime < limitTime) return false;
      } else if (dateOperator === 'between' && startDate && endDate) {
        const startTime = new Date(startDate).setHours(0, 0, 0, 0);
        const endTime = new Date(endDate).setHours(23, 59, 59, 999);
        if (userTime < startTime || userTime > endTime) return false;
      }
    }

    return true;
  };

  // Perform active filter lists
  const displayStudents = rawStudents.filter(u => filterUser(u));
  const displayStaff = rawStaff.filter(u => filterUser(u));
  const displaySubAdmins = rawSubAdmins.filter(u => filterUser(u));

  if (isLoading) {
    return <Loader size="lg" className="min-h-[60vh]" />;
  }

  // Determine what tabs to show
  const isStaff = activeUser?.role === 'staff';
  const isSubAdmin = activeUser?.role === 'sub-admin';
  const isAdmin = activeUser?.role === 'admin';

  const showAddButton = isAdmin || isSubAdmin || isStaff;

  // Label changes with the active tab
  const tabAddLabel = activeTab === 'staff' ? 'Add Staff'
    : activeTab === 'sub-admins' ? 'Add Sub-Admin'
    : 'Add Student';

  // Default role pre-filled in the modal based on current tab
  const tabDefaultRole = activeTab === 'staff' ? 'staff'
    : activeTab === 'sub-admins' ? 'sub-admin'
    : 'student';

  return (
    <div className="space-y-6 text-on-background pt-2">
      
      {/* Top Header Row for Independent Actions */}
      <div className="flex justify-between items-center">
        <div>
          <span className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">User Directory</span>
        </div>
        {showAddButton && (
          <div className="flex items-center gap-3">
            <Button 
              onClick={() => fileInputRef.current?.click()}
              variant="outline"
              size="sm"
              className="flex items-center justify-center gap-1.5 h-10 px-4 cursor-pointer"
            >
              <Users className="w-4 h-4" /> Import Directory
            </Button>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileImport} 
              accept=".csv,.xlsx,.xls,.json" 
              className="hidden" 
            />
            <Button 
              onClick={() => { setNewUserData(prev => ({ ...prev, role: tabDefaultRole })); setShowAddModal(true); }}
              variant="gradient"
              size="sm"
              className="flex items-center justify-center gap-1.5 h-10 px-4"
            >
              <UserPlus className="w-4 h-4" /> {tabAddLabel}
            </Button>
          </div>
        )}
      </div>

      {/* Borderless Top Filter Bar */}
      <div className="flex flex-wrap items-center gap-4 py-2 bg-transparent border-none outline-none shadow-none">
        {/* Search */}
        <div className="relative w-full sm:w-56">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/50 w-4 h-4" />
          <input 
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              searchCriteria === 'name' 
                ? "Search by name..." 
                : searchCriteria === 'email' 
                ? "Search by email..." 
                : "Search by name/email..."
            }
            className="w-full h-10 pl-10 pr-4 bg-surface-container border border-outline-variant/30 rounded-xl font-body text-xs focus:ring-2 focus:ring-secondary/20 text-on-surface placeholder:text-on-surface-variant/50"
          />
        </div>

        {/* Search Criteria Selector */}
        <div className="w-full sm:w-36">
          <Dropdown
            options={[
              { value: 'both', label: 'Name & Email' },
              { value: 'name', label: 'Name Only' },
              { value: 'email', label: 'Email Only' }
            ]}
            value={searchCriteria}
            onChange={(val) => setSearchCriteria(val)}
            placeholder="Search Target"
            size="sm"
            className="w-full text-left"
          />
        </div>

        {/* Batch Filter (Only shown on Students tab) */}
        {activeTab === 'students' && (
          <div className="w-full sm:w-40 flex items-center gap-2">
            <Filter className="w-4 h-4 text-on-surface-variant flex-shrink-0" />
            <Dropdown
              options={[{ value: '', label: 'All Batches' }, ...batches.map(b => ({ value: b._id, label: b.name }))] }
              value={selectedBatchFilter}
              onChange={(val) => setSelectedBatchFilter(val)}
              placeholder="All Batches"
              size="sm"
              className="w-full text-left"
            />
          </div>
        )}

        {/* Date Operator Selector */}
        <div className="w-full sm:w-40">
          <Dropdown
            options={[
              { value: 'all', label: 'All Dates' },
              { value: 'before', label: 'Joined Before' },
              { value: 'after', label: 'Joined After' },
              { value: 'between', label: 'Joined Between' }
            ]}
            value={dateOperator}
            onChange={(val) => {
              setDateOperator(val);
              if (val === 'all') {
                setStartDate('');
                setEndDate('');
              }
            }}
            placeholder="Joined Date"
            size="sm"
            className="w-full text-left"
          />
        </div>

        {/* Dynamic Date Inputs (Clean, borderless wrapper) */}
        {dateOperator !== 'all' && (
          <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto py-1">
            <DatePicker
              value={startDate}
              onChange={(val) => setStartDate(val)}
              placeholder="Select Start Date"
              label={dateOperator === 'between' ? "From" : "Date"}
            />
            {dateOperator === 'between' && (
              <DatePicker
                value={endDate}
                onChange={(val) => setEndDate(val)}
                placeholder="Select End Date"
                label="To"
              />
            )}
          </div>
        )}
      </div>

      {/* Tabs Layout */}
      {!isStaff && (
        <div className="flex border-b border-outline-variant/20 gap-6 text-sm font-semibold pt-2">
          <button
            onClick={() => setActiveTab('students')}
            className={`pb-3 transition-colors relative cursor-pointer ${activeTab === 'students' ? 'text-secondary border-b-2 border-secondary' : 'text-on-surface-variant hover:text-on-surface'}`}
          >
            Students ({rawStudents.length})
          </button>
          <button
            onClick={() => setActiveTab('staff')}
            className={`pb-3 transition-colors relative cursor-pointer ${activeTab === 'staff' ? 'text-secondary border-b-2 border-secondary' : 'text-on-surface-variant hover:text-on-surface'}`}
          >
            Staff ({rawStaff.length})
          </button>
          {isAdmin && (
            <button
              onClick={() => setActiveTab('sub-admins')}
              className={`pb-3 transition-colors relative cursor-pointer ${activeTab === 'sub-admins' ? 'text-secondary border-b-2 border-secondary' : 'text-on-surface-variant hover:text-on-surface'}`}
            >
              Sub-Admins ({rawSubAdmins.length})
            </button>
          )}
        </div>
      )}

      {/* Tables based on selection */}
      <section>
        <Card variant="solid" className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            {activeTab === 'students' && (
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-surface-container-high border-b border-outline-variant/20 text-on-surface-variant font-bold uppercase tracking-wider">
                    <th className="py-4 px-3 w-[28%]">Student Details</th>
                    <th className="py-4 px-2 w-[22%]">Email Address</th>
                    <th className="py-4 px-2 w-[14%] text-center">Role Status</th>
                    <th className="py-4 px-2 w-[18%] text-center">Batch Assignment</th>
                    <th className="py-4 px-2 w-[10%] text-center">Joined Date</th>
                    <th className="py-4 px-2 w-[10%] text-center">Security Status</th>
                    <th className="py-4 px-2 w-[8%] text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/20">
                  {displayStudents.map((u) => (
                    <tr key={u.id} className="hover:bg-surface-variant/10">
                      <td className="py-4 px-3 font-semibold flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center font-bold text-xs text-secondary border border-outline-variant/30">
                          {u.name.charAt(0)}
                        </div>
                        <div>
                          <span className="text-on-surface">{u.name}</span>
                          {u.role === 'student' && (
                            <div className="text-[10px] text-on-surface-variant font-medium flex items-center gap-0.5 mt-0.5">
                              <School className="w-3 h-3 text-secondary" /> {u.batch?.name || 'Unassigned'}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-2 font-mono text-on-surface-variant">{u.email}</td>
                      <td className="py-4 px-2 text-center">
                        {canManageUserRole(u.role, u.id) ? (
                          <Dropdown
                            options={getAvailableRolesForUser(u.role).map(r => ({ value: r, label: r.toUpperCase() }))}
                            value={u.role}
                            onChange={(val) => handleRoleChange(u.id, val)}
                            className="w-32 mx-auto inline-block text-left"
                          />
                        ) : (
                          <Badge variant="outline">STUDENT</Badge>
                        )}
                      </td>
                      <td className="py-4 px-2 text-center">
                        <Dropdown
                          options={[{ value: '', label: 'No Batch' }, ...batches.map(b => ({ value: b._id, label: b.name }))] }
                          value={u.batch?.id || ''}
                          onChange={(val) => handleBatchUpdate(u.id, val)}
                          className="w-40 mx-auto inline-block text-left"
                        />
                      </td>
                      <td className="py-4 px-2 text-center font-medium text-on-surface-variant">{u.joinedAt}</td>
                      <td className="py-4 px-2 text-center">
                        <span className={`inline-flex items-center gap-1 text-xs font-bold ${u.isBanned ? 'text-error animate-pulse' : 'text-secondary'}`}>
                          {u.isBanned ? <ShieldAlert className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                          {u.isBanned ? 'Banned' : 'Active'}
                        </span>
                      </td>
                      <td className="py-4 px-2 flex items-center justify-end gap-1.5 h-16">
                        {canModerateUser(u.role, u.id) && (
                          <>
                            <Button 
                              onClick={() => handleBanToggle(u.id)}
                              variant="ghost" 
                              size="sm" 
                              className={u.isBanned ? "text-secondary hover:bg-secondary/10 px-2 h-9" : "text-error hover:bg-error-container/20 px-2 h-9"}
                              title={u.isBanned ? "Unban user" : "Ban user"}
                            >
                              {u.isBanned ? <UserCheck className="w-4 h-4" /> : <ShieldX className="w-4 h-4" />}
                            </Button>
                            <Button 
                              onClick={() => handleDeleteUser(u.id)}
                              variant="ghost" 
                              size="sm" 
                              className="text-error hover:bg-error-container/20 px-2 h-9"
                              title="Delete user account"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                            {u.role === 'student' && (
                              <Button 
                                onClick={() => handleViewAttempts(u)}
                                variant="ghost" 
                                size="sm" 
                                className="text-primary hover:bg-primary/10 px-2 h-9"
                                title="View candidate attempts & proctoring logs"
                              >
                                <Activity className="w-4 h-4" />
                              </Button>
                            )}
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {activeTab === 'staff' && (
              <table className="w-full text-left border-collapse text-xs md:text-sm">
                <thead>
                  <tr className="bg-surface-container-high border-b border-outline-variant/20 text-on-surface-variant font-bold uppercase tracking-wider">
                    <th className="py-4 px-2 w-[25%]">Name</th>
                    <th className="py-4 px-2 w-[30%]">Email Address</th>
                    <th className="py-4 px-2 w-[15%] text-center">Role Status</th>
                    <th className="py-4 px-2 w-[10%] text-center">Joined Date</th>
                    <th className="py-4 px-2 w-[12%] text-center">Security Status</th>
                    <th className="py-4 px-2 w-[8%] text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/20">
                  {displayStaff.map((u) => (
                    <tr key={u.id} className="hover:bg-surface-variant/10">
                      <td className="py-4 px-2 font-semibold flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center font-bold text-xs text-secondary border border-outline-variant/30">
                          {u.name.charAt(0)}
                        </div>
                        <span className="text-on-surface">{u.name}</span>
                      </td>
                      <td className="py-4 px-2 font-mono text-on-surface-variant">{u.email}</td>
                      <td className="py-4 px-2 text-center">
                        {canManageUserRole(u.role, u.id) ? (
                          <Dropdown
                            options={getAvailableRolesForUser(u.role).map(r => ({ value: r, label: r.toUpperCase() }))}
                            value={u.role}
                            onChange={(val) => handleRoleChange(u.id, val)}
                            className="w-32 mx-auto inline-block text-left"
                          />
                        ) : (
                          <Badge variant="outline">STAFF</Badge>
                        )}
                      </td>
                      <td className="py-4 px-2 text-center font-medium text-on-surface-variant">{u.joinedAt}</td>
                      <td className="py-4 px-2 text-center">
                        <span className={`inline-flex items-center gap-1 text-xs font-bold ${u.isBanned ? 'text-error animate-pulse' : 'text-secondary'}`}>
                          {u.isBanned ? <ShieldAlert className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                          {u.isBanned ? 'Banned' : 'Active'}
                        </span>
                      </td>
                      <td className="py-4 px-2 flex items-center justify-end gap-1.5 h-16">
                        {canModerateUser(u.role, u.id) && (
                          <>
                            <Button 
                              onClick={() => handleBanToggle(u.id)}
                              variant="ghost" 
                              size="sm" 
                              className={u.isBanned ? "text-secondary hover:bg-secondary/10 px-2 h-9" : "text-error hover:bg-error-container/20 px-2 h-9"}
                              title={u.isBanned ? "Unban user" : "Ban user"}
                            >
                              {u.isBanned ? <UserCheck className="w-4 h-4" /> : <ShieldX className="w-4 h-4" />}
                            </Button>
                            <Button 
                              onClick={() => handleDeleteUser(u.id)}
                              variant="ghost" 
                              size="sm" 
                              className="text-error hover:bg-error-container/20 px-2 h-9"
                              title="Delete user account"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {activeTab === 'sub-admins' && (
              <table className="w-full text-left border-collapse text-xs md:text-sm">
                <thead>
                  <tr className="bg-surface-container-high border-b border-outline-variant/20 text-on-surface-variant font-bold uppercase tracking-wider">
                    <th className="py-4 px-2 w-[25%]">Name</th>
                    <th className="py-4 px-2 w-[30%]">Email Address</th>
                    <th className="py-4 px-2 w-[15%] text-center">Role Status</th>
                    <th className="py-4 px-2 w-[10%] text-center">Joined Date</th>
                    <th className="py-4 px-2 w-[12%] text-center">Security Status</th>
                    <th className="py-4 px-2 w-[8%] text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/20">
                  {displaySubAdmins.map((u) => (
                    <tr key={u.id} className="hover:bg-surface-variant/10">
                      <td className="py-4 px-2 font-semibold flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center font-bold text-xs text-secondary border border-outline-variant/30">
                          {u.name.charAt(0)}
                        </div>
                        <span className="text-on-surface">{u.name}</span>
                      </td>
                      <td className="py-4 px-2 font-mono text-on-surface-variant">{u.email}</td>
                      <td className="py-4 px-2 text-center">
                        {canManageUserRole(u.role, u.id) ? (
                          <Dropdown
                            options={getAvailableRolesForUser(u.role).map(r => ({ value: r, label: r.toUpperCase() }))}
                            value={u.role}
                            onChange={(val) => handleRoleChange(u.id, val)}
                            className="w-32 mx-auto inline-block text-left"
                          />
                        ) : (
                          <Badge variant="outline">SUB-ADMIN</Badge>
                        )}
                      </td>
                      <td className="py-4 px-2 text-center font-medium text-on-surface-variant">{u.joinedAt}</td>
                      <td className="py-4 px-2 text-center">
                        <span className={`inline-flex items-center gap-1 text-xs font-bold ${u.isBanned ? 'text-error animate-pulse' : 'text-secondary'}`}>
                          {u.isBanned ? <ShieldAlert className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                          {u.isBanned ? 'Banned' : 'Active'}
                        </span>
                      </td>
                      <td className="py-4 px-2 flex items-center justify-end gap-1.5 h-16">
                        {canModerateUser(u.role, u.id) && (
                          <>
                            <Button 
                              onClick={() => handleBanToggle(u.id)}
                              variant="ghost" 
                              size="sm" 
                              className={u.isBanned ? "text-secondary hover:bg-secondary/10 px-2 h-9" : "text-error hover:bg-error-container/20 px-2 h-9"}
                              title={u.isBanned ? "Unban user" : "Ban user"}
                            >
                              {u.isBanned ? <UserCheck className="w-4 h-4" /> : <ShieldX className="w-4 h-4" />}
                            </Button>
                            <Button 
                              onClick={() => handleDeleteUser(u.id)}
                              variant="ghost" 
                              size="sm" 
                              className="text-error hover:bg-error-container/20 px-2 h-9"
                              title="Delete user account"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </Card>
      </section>

      {/* ── Add User Modal ─────────────────────────────────────────── */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <Card variant="solid" className="w-full max-w-lg p-6 border border-outline-variant/30 shadow-2xl">

            {/* Header */}
            <div className="flex justify-between items-center border-b border-outline-variant/20 pb-4 mb-5">
              <div>
                <h2 className="text-base font-bold flex items-center gap-2 text-on-surface">
                  {modalStep === 'otp'
                    ? <><Mail className="w-5 h-5 text-secondary" /> Verify Email</>
                    : <><UserPlus className="w-5 h-5 text-secondary" /> {tabAddLabel}</>}
                </h2>
                <p className="text-xs text-on-surface-variant mt-0.5">
                  {modalStep === 'otp'
                    ? `Enter the 8-character code sent to ${newUserData.email}`
                    : 'Fill in details. A verification code will be sent first.'}
                </p>
              </div>
              <button onClick={closeAddModal} className="text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer text-lg">✕</button>
            </div>

            {/* ── STEP 1: Form ── */}
            {modalStep === 'form' && (
              <form onSubmit={handleInitiateCreate} className="space-y-3 text-xs font-semibold">
                {/* Row: Full name + Username */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-on-surface-variant">Full Name *</label>
                    <input type="text" required value={newUserData.name}
                      onChange={e => setNewUserData({ ...newUserData, name: e.target.value })}
                      placeholder="Jane Smith"
                      className="w-full h-10 px-3 bg-surface-container border border-outline-variant/30 rounded-lg text-on-surface font-normal focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-on-surface-variant">Username *</label>
                    <input type="text" required value={newUserData.username}
                      onChange={e => setNewUserData({ ...newUserData, username: e.target.value.toLowerCase().replace(/\s/g,'') })}
                      placeholder="jane_smith"
                      className="w-full h-10 px-3 bg-surface-container border border-outline-variant/30 rounded-lg text-on-surface font-normal focus:outline-none focus:border-primary"
                    />
                  </div>
                </div>

                {/* Row: Email + Phone */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-on-surface-variant">Email Address *</label>
                    <input type="email" required value={newUserData.email}
                      onChange={e => setNewUserData({ ...newUserData, email: e.target.value })}
                      placeholder="jane@school.com"
                      className="w-full h-10 px-3 bg-surface-container border border-outline-variant/30 rounded-lg text-on-surface font-normal focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-on-surface-variant">Phone Number</label>
                    <input type="tel" value={newUserData.phone}
                      onChange={e => setNewUserData({ ...newUserData, phone: e.target.value })}
                      placeholder="+91 98765 43210"
                      className="w-full h-10 px-3 bg-surface-container border border-outline-variant/30 rounded-lg text-on-surface font-normal focus:outline-none focus:border-primary"
                    />
                  </div>
                </div>

                {/* Role */}
                <div className="space-y-1">
                  <label className="text-on-surface-variant">Account Role *</label>
                  <Dropdown
                    options={getRolesForCreation().map(r => ({ value: r, label: r.charAt(0).toUpperCase() + r.slice(1) }))}
                    value={newUserData.role}
                    onChange={val => setNewUserData({ ...newUserData, role: val, batchId: '' })}
                    placeholder="Select Role"
                  />
                </div>

                {/* Batch (students only) */}
                {newUserData.role === 'student' && (
                  <div className="space-y-1">
                    <label className="text-on-surface-variant">Assign Batch *</label>
                    <Dropdown
                      options={batches.map(b => ({ value: b._id, label: b.name }))}
                      value={newUserData.batchId}
                      onChange={val => setNewUserData({ ...newUserData, batchId: val })}
                      placeholder="Select Batch"
                    />
                  </div>
                )}

                {/* Info strip */}
                <div className="flex items-start gap-2 bg-primary/8 border border-primary/20 rounded-xl p-3 mt-1">
                  <Mail className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                  <p className="text-on-surface-variant text-[11px] leading-relaxed">
                    A verification code will be sent to verify their email address. Once verified, a welcome email containing their temporary password credentials will be sent automatically.
                  </p>
                </div>

                <div className="flex justify-end gap-3 pt-2 border-t border-outline-variant/20">
                  <Button type="button" variant="outline" onClick={closeAddModal} className="text-on-surface-variant">Cancel</Button>
                  <Button type="submit" variant="gradient" disabled={isSubmitting}>
                    {isSubmitting ? 'Sending Code…' : 'Send Verification Code'}
                  </Button>
                </div>
              </form>
            )}

            {/* ── STEP 2: OTP ── */}
            {modalStep === 'otp' && (
              <form onSubmit={handleVerifyOtp} className="space-y-5">
                {/* Success icon */}
                <div className="flex flex-col items-center gap-2 py-2">
                  <div className="w-14 h-14 rounded-full bg-secondary/10 border border-secondary/30 flex items-center justify-center">
                    <Mail className="w-7 h-7 text-secondary" />
                  </div>
                  <p className="text-xs text-on-surface-variant text-center max-w-xs">
                    Check <strong className="text-on-surface">{newUserData.email}</strong> — we sent an 8-character code (letters + numbers).
                  </p>
                </div>

                {/* OTP boxes */}
                <div className="flex gap-2 justify-center" onPaste={handleOtpPaste}>
                  {otpValues.map((val, i) => (
                    <input
                      key={i}
                      ref={el => { otpRefs.current[i] = el; }}
                      type="text"
                      inputMode="text"
                      maxLength={1}
                      value={val}
                      onChange={e => handleOtpChange(i, e.target.value)}
                      onKeyDown={e => handleOtpKeyDown(i, e)}
                      className="w-10 h-12 text-center text-lg font-bold uppercase tracking-widest bg-surface-container border-2 border-outline-variant/40 rounded-xl text-on-surface focus:border-primary focus:outline-none transition-colors font-mono"
                    />
                  ))}
                </div>

                {/* Resend */}
                <div className="text-center">
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={resendCooldown > 0 || isSubmitting}
                    className="inline-flex items-center gap-1.5 text-xs text-primary disabled:text-on-surface-variant/50 disabled:cursor-not-allowed transition-colors"
                  >
                    <RefreshCw className="w-3 h-3" />
                    {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend code'}
                  </button>
                </div>

                <div className="flex justify-between gap-3 pt-2 border-t border-outline-variant/20">
                  <Button type="button" variant="outline" onClick={() => { setModalStep('form'); setOtpValues(Array(8).fill('')); }}
                    className="text-on-surface-variant">
                    ← Back
                  </Button>
                  <Button type="submit" variant="gradient" disabled={isSubmitting || otpValues.join('').length < 8}>
                    {isSubmitting ? 'Verifying…' : <><CheckCircle2 className="w-4 h-4" /> Create Account</>}
                  </Button>
                </div>
              </form>
            )}
          </Card>
        </div>
      )}

      {/* ── IMPORT SUMMARY OVERLAY MODAL ── */}
      {showImportSummary && importSummary && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-6">
          <Card variant="glass" className="w-full max-w-lg p-6 border-white/20 max-h-[90vh] flex flex-col justify-between">
            <div className="overflow-y-auto pr-1">
              <h3 className="font-h3 text-xl font-bold text-on-surface mb-2">Import Results Summary</h3>
              <p className="text-xs text-on-surface-variant mb-4">
                The student/staff directory import process completed.
              </p>

              <div className="grid grid-cols-3 gap-4 mb-4 text-center font-bold text-xs">
                <div className="bg-surface-container-low p-3 rounded-xl border border-outline-variant/30 text-on-surface">
                  <div className="text-on-surface-variant font-medium">Total Rows</div>
                  <div className="text-lg text-primary mt-1">{importSummary.total}</div>
                </div>
                <div className="bg-secondary/10 p-3 rounded-xl border border-secondary/30 text-secondary">
                  <div className="text-secondary font-medium">Success</div>
                  <div className="text-lg text-secondary mt-1">{importSummary.successCount}</div>
                </div>
                <div className="bg-error/10 p-3 rounded-xl border border-error/30 text-error">
                  <div className="text-error font-medium">Failed</div>
                  <div className="text-lg text-error mt-1">{importSummary.failedCount}</div>
                </div>
              </div>

              {importSummary.errors && importSummary.errors.length > 0 && (
                <div className="space-y-2 mt-4">
                  <span className="text-xs font-bold text-error uppercase tracking-wider">Error Details:</span>
                  <div className="max-h-60 overflow-y-auto border border-outline-variant/20 rounded-xl divide-y divide-outline-variant/10 text-xs font-medium bg-surface-container/50">
                    {importSummary.errors.map((err, idx) => (
                      <div key={idx} className="p-3 flex justify-between gap-4">
                        <span className="text-on-surface-variant font-mono">Row {err.row}</span>
                        {err.email && <span className="text-on-surface-variant truncate font-mono">{err.email}</span>}
                        <span className="text-error text-right">{err.error}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-4 border-t border-outline-variant/20 mt-4">
              <Button onClick={() => setShowImportSummary(false)} variant="gradient" className="px-8">
                Done
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* ── STUDENT ATTEMPTS HISTORY MODAL ── */}
      {showAttemptsModal && selectedUserForAttempts && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-6">
          <Card variant="glass" className="w-full max-w-3xl p-6 border-white/20 max-h-[85vh] flex flex-col justify-between">
            <div className="overflow-y-auto pr-1">
              <h3 className="font-h3 text-xl font-bold text-on-surface mb-1">
                Attempts Log: {selectedUserForAttempts.name}
              </h3>
              <p className="text-xs text-on-surface-variant mb-6 font-medium">
                Email: {selectedUserForAttempts.email} · Roster history log.
              </p>

              {loadingAttempts ? (
                <div className="py-12 flex justify-center"><Loader size="md" /></div>
              ) : userAttemptsList.length === 0 ? (
                <div className="text-center py-12 text-on-surface-variant/60 font-medium text-xs">
                  This candidate has not attempted any exams yet.
                </div>
              ) : (
                <div className="border border-outline-variant/20 rounded-xl overflow-hidden text-xs">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-surface-container-highest text-on-surface-variant border-b border-outline-variant/20 font-bold uppercase tracking-wider text-[10px]">
                        <th className="py-3 px-4">Exam Config</th>
                        <th className="py-3 px-2 text-center">Score</th>
                        <th className="py-3 px-2 text-center">Accuracy</th>
                        <th className="py-3 px-2 text-center">Duration</th>
                        <th className="py-3 px-2 text-center">Webcam Snaps</th>
                        <th className="py-3 px-4 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant/10 text-on-surface font-medium">
                      {userAttemptsList.map((att) => {
                        const snapCount = att.snapshots?.length || 0;
                        return (
                          <tr key={att._id} className="hover:bg-surface-container-low/40">
                            <td className="py-3.5 px-4 font-semibold">{att.testId?.title || 'Model Exam'}</td>
                            <td className="py-3.5 px-2 text-center font-bold text-primary">
                              {att.score} / {att.testId?.totalMarks || 100}
                            </td>
                            <td className="py-3.5 px-2 text-center font-bold text-secondary">{att.accuracy}%</td>
                            <td className="py-3.5 px-2 text-center font-mono text-on-surface-variant">
                              {Math.round(att.timeTaken / 60) || 1} min
                            </td>
                            <td className="py-3.5 px-2 text-center">
                              {snapCount > 0 ? (
                                <Badge variant="tertiary" className="font-bold font-mono">{snapCount} captured</Badge>
                              ) : (
                                <span className="text-[10px] text-on-surface-variant/40">None</span>
                              )}
                            </td>
                            <td className="py-3.5 px-4 text-center">
                              {snapCount > 0 && (
                                <Button 
                                  onClick={() => {
                                    setSelectedAttemptForSnapshots(att);
                                    setShowSnapshotsModal(true);
                                  }}
                                  variant="outline" 
                                  size="sm" 
                                  className="h-8 px-3 text-[10px] cursor-pointer"
                                >
                                  Review Snaps
                                </Button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-4 border-t border-outline-variant/20 mt-6">
              <Button onClick={() => { setShowAttemptsModal(false); setUserAttemptsList([]); }} variant="outline" className="px-8">
                Close
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* ── PROCTORING WEBCAM SNAPSHOTS MODAL ── */}
      {showSnapshotsModal && selectedAttemptForSnapshots && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center p-6" style={{ zIndex: 9999 }}>
          <Card variant="glass" className="w-full max-w-2xl p-6 border-white/20 max-h-[85vh] flex flex-col justify-between">
            <div className="overflow-y-auto pr-1">
              <h3 className="font-h3 text-xl font-bold text-on-surface mb-1">
                Proctoring Webcam Snapshots
              </h3>
              <p className="text-xs text-on-surface-variant mb-6 font-medium">
                Active monitoring capture log for exam attempt: <strong>{selectedAttemptForSnapshots.testId?.title}</strong>
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {selectedAttemptForSnapshots.snapshots.map((snap, idx) => (
                  <div key={idx} className="bg-surface-container rounded-2xl overflow-hidden border border-outline-variant/20">
                    <img 
                      src={snap.image} 
                      alt={`Proctoring Snapshot ${idx + 1}`} 
                      className="w-full h-40 object-cover" 
                    />
                    <div className="p-3 text-[10px] font-semibold text-on-surface-variant">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-error uppercase tracking-wider">{snap.reason}</span>
                        <span className="font-mono">{new Date(snap.timestamp).toLocaleTimeString()}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-outline-variant/20 mt-6">
              <Button onClick={() => setShowSnapshotsModal(false)} variant="gradient" className="px-8">
                Done
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
