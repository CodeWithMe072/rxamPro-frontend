import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { Award, ShieldCheck, Mail, User, ShieldAlert, School, Camera, RefreshCw, CheckCircle2, AtSign, Clock, Check, X, Loader2 } from 'lucide-react';
import { authService } from '../../services/auth.service';
import { testService } from '../../services/test.service';
import toast from 'react-hot-toast';
import { Modal } from '../../components/Modal';

export const Profile = () => {
  const { user, updateProfile } = useAuth();
  const [isRefreshingUser, setIsRefreshingUser] = useState(false);
  const [isOptionsModalOpen, setIsOptionsModalOpen] = useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);
  const [isEmailOtpModalOpen, setIsEmailOtpModalOpen] = useState(false);
  const [otpValues, setOtpValues] = useState(Array(6).fill(''));
  const [resendCooldown, setResendCooldown] = useState(0);
  const [pendingEmail, setPendingEmail] = useState('');
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const otpRefs = useRef([]);
  const cooldownRef = useRef(null);

  // --- Username change state ---
  const [usernameInput, setUsernameInput] = useState('');
  const [usernameStatus, setUsernameStatus] = useState(null); // null | 'checking' | 'available' | 'taken' | 'invalid' | 'self'
  const [usernameMsg, setUsernameMsg] = useState('');
  const [isSavingUsername, setIsSavingUsername] = useState(false);
  const usernameDebounceRef = useRef(null);

  const startCooldown = () => {
    setResendCooldown(60);
    if (cooldownRef.current) clearInterval(cooldownRef.current);
    cooldownRef.current = setInterval(() => {
      setResendCooldown(prev => {
        if (prev <= 1) {
          clearInterval(cooldownRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  useEffect(() => {
    return () => {
      if (cooldownRef.current) clearInterval(cooldownRef.current);
    };
  }, []);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imgAspect, setImgAspect] = useState(1);
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [dashboardStats, setDashboardStats] = useState(null);
  
  const activeUser = user || {
    name: 'Alex Rivera',
    email: 'alex.rivera@exampro.com',
    role: 'student',
    phone: '',
    avatar: ''
  };

  // Derived early so all username helpers have access to it
  const isBlocked = activeUser.profileBlockedUntil && new Date(activeUser.profileBlockedUntil) > new Date();

  // Sync username input when user loads
  useEffect(() => {
    setUsernameInput(activeUser.username || '');
  }, [activeUser.username]);

  // Fetch fresh user from server on page mount so phone (set by admin) is always current
  useEffect(() => {
    const syncUser = async () => {
      try {
        const fresh = await authService.getMe();
        if (fresh) updateProfile(fresh);
      } catch (e) {
        // silently ignore — stale data from context is still shown
      }
    };
    syncUser();
  }, []);

  // Fetch stats on mount if student
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const statsData = await testService.getStudentDashboard();
        setDashboardStats(statsData);
      } catch (err) {
        console.error('Failed to load student stats:', err);
      }
    };
    if (activeUser.role === 'student') {
      fetchStats();
    }
  }, [activeUser.role]);

  // Manual refresh handler for the phone field
  const handleRefreshPhone = async () => {
    setIsRefreshingUser(true);
    try {
      const fresh = await authService.getMe();
      if (fresh) updateProfile(fresh);
    } catch (e) {
      toast.error('Could not refresh profile data.');
    } finally {
      setIsRefreshingUser(false);
    }
  };

  // 14-day cooldown helpers (disabled for management)
  const isManagement = ['admin', 'sub-admin', 'staff'].includes(activeUser.role);
  const getUsernameCooldownDaysLeft = () => {
    if (isManagement) return 0;
    if (!activeUser.usernameLastChangedAt) return 0;
    const daysSince = (Date.now() - new Date(activeUser.usernameLastChangedAt).getTime()) / (1000 * 60 * 60 * 24);
    return daysSince < 14 ? Math.ceil(14 - daysSince) : 0;
  };
  const cooldownDaysLeft = getUsernameCooldownDaysLeft();
  const usernameChangeLocked = cooldownDaysLeft > 0;

  const checkUsername = useCallback(async (value) => {
    const clean = value.trim().toLowerCase();
    if (!clean || clean.length < 3) {
      setUsernameStatus(clean.length > 0 ? 'invalid' : null);
      setUsernameMsg(clean.length > 0 ? 'At least 3 characters required.' : '');
      return;
    }
    if (!/^[a-z0-9_-]+$/.test(clean)) {
      setUsernameStatus('invalid');
      setUsernameMsg('Only letters, numbers, _ and - allowed.');
      return;
    }
    if (clean === (activeUser.username || '').toLowerCase()) {
      setUsernameStatus('self');
      setUsernameMsg('This is your current username.');
      return;
    }
    setUsernameStatus('checking');
    setUsernameMsg('Checking availability…');
    try {
      const result = await authService.checkUsernameAvailability(clean);
      setUsernameStatus(result.available ? 'available' : 'taken');
      setUsernameMsg(result.message);
    } catch {
      setUsernameStatus(null);
      setUsernameMsg('');
    }
  }, [activeUser.username]);

  const handleUsernameInputChange = (e) => {
    const val = e.target.value;
    setUsernameInput(val);
    if (usernameDebounceRef.current) clearTimeout(usernameDebounceRef.current);
    usernameDebounceRef.current = setTimeout(() => checkUsername(val), 500);
  };

  const handleSaveUsername = async () => {
    if (usernameChangeLocked || isBlocked) return;
    if (usernameStatus !== 'available') {
      toast.error('Please choose a valid, available username first.');
      return;
    }
    setIsSavingUsername(true);
    try {
      const updatedUser = await authService.updateUsername(usernameInput.trim().toLowerCase());
      updateProfile(updatedUser);
      toast.success('Username updated successfully!');
      setUsernameStatus('self');
      setUsernameMsg('This is your current username.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update username.');
    } finally {
      setIsSavingUsername(false);
    }
  };

  const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm({
    defaultValues: {
      name: activeUser.name,
      email: activeUser.email,
      phone: activeUser.phone || ''
    }
  });

  useEffect(() => {
    setValue('name', activeUser.name);
    setValue('email', activeUser.email);
    setValue('phone', activeUser.phone || '');
  }, [activeUser, setValue]);

  const onSubmit = async (data) => {
    try {
      const response = await authService.updateProfile({ 
        name: data.name, 
        email: data.email,
        phone: data.phone
      });
      
      if (response.requiresEmailVerification) {
        setPendingEmail(data.email);
        setOtpValues(Array(6).fill(''));
        setIsEmailOtpModalOpen(true);
        startCooldown();
        setTimeout(() => otpRefs.current[0]?.focus(), 100);
        toast.success(response.message || 'Verification code sent to your new email.');
      } else {
        updateProfile(response.data.user);
        toast.success('Profile details updated successfully.');
      }
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to update profile details.');
    }
  };

  const handleVerifyOtp = async (e) => {
    if (e) e.preventDefault();
    const otp = otpValues.join('');
    if (otp.length !== 6) {
      toast.error('Please enter all 6 digits of the verification code.');
      return;
    }

    setIsVerifyingOtp(true);
    try {
      const updatedUser = await authService.verifyEmailChangeOtp(otp);
      updateProfile(updatedUser);
      toast.success('Email address updated successfully.');
      setIsEmailOtpModalOpen(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Verification failed.');
      if (err.response?.data?.message?.includes('locked') || err.response?.status === 403) {
        setIsEmailOtpModalOpen(false);
        try {
          const latestUser = await authService.getMe();
          updateProfile(latestUser);
        } catch (meErr) {
          console.error(meErr);
        }
      }
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendCooldown > 0) return;
    setIsVerifyingOtp(true);
    try {
      const response = await authService.updateProfile({ 
        name: activeUser.name,
        email: pendingEmail,
        phone: activeUser.phone
      });
      toast.success('New verification code sent!');
      setOtpValues(Array(6).fill(''));
      startCooldown();
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to resend code.');
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  const handleOtpChange = (index, val) => {
    const num = val.replace(/\D/g, '').slice(-1);
    const next = [...otpValues];
    next[index] = num;
    setOtpValues(next);
    if (num && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpValues[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const next = [...otpValues];
    for (let i = 0; i < 6; i++) {
      next[i] = pasted[i] || '';
    }
    setOtpValues(next);
    const focusIdx = Math.min(pasted.length, 5);
    setTimeout(() => otpRefs.current[focusIdx]?.focus(), 0);
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image size must be less than 2MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.src = reader.result;
      img.onload = () => {
        const aspect = img.naturalWidth / img.naturalHeight;
        setImgAspect(aspect);

        // Center it by default inside 240px circular container
        const viewSize = 240;
        let initialX = 0;
        let initialY = 0;
        if (aspect > 1) {
          const renderWidth = viewSize * aspect;
          initialX = (viewSize - renderWidth) / 2;
        } else {
          const renderHeight = viewSize / aspect;
          initialY = (viewSize - renderHeight) / 2;
        }

        setSelectedImage(reader.result);
        setZoom(1);
        setPosition({ x: initialX, y: initialY });
        setIsCropModalOpen(true);
      };
    };
    reader.readAsDataURL(file);
  };

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUpOrLeave = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e) => {
    if (e.touches.length !== 1) return;
    const touch = e.touches[0];
    setIsDragging(true);
    setDragStart({ x: touch.clientX - position.x, y: touch.clientY - position.y });
  };

  const handleTouchMove = (e) => {
    if (!isDragging || e.touches.length !== 1) return;
    const touch = e.touches[0];
    setPosition({
      x: touch.clientX - dragStart.x,
      y: touch.clientY - dragStart.y
    });
  };

  const handleSaveCrop = () => {
    if (!selectedImage) return;
    const viewSize = 240; // Circular container size is 240px (w-60)
    const canvasSize = 300; // Output JPEG resolution
    const factor = canvasSize / viewSize;

    const img = new Image();
    img.src = selectedImage;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = canvasSize;
      canvas.height = canvasSize;
      const ctx = canvas.getContext('2d');

      let renderWidth = viewSize;
      let renderHeight = viewSize;
      if (imgAspect > 1) {
        renderWidth = viewSize * imgAspect;
      } else {
        renderHeight = viewSize / imgAspect;
      }

      const finalWidth = renderWidth * zoom * factor;
      const finalHeight = renderHeight * zoom * factor;
      const finalLeft = position.x * factor;
      const finalTop = position.y * factor;

      ctx.clearRect(0, 0, canvasSize, canvasSize);
      ctx.drawImage(img, finalLeft, finalTop, finalWidth, finalHeight);

      canvas.toBlob(async (blob) => {
        if (!blob) return;
        const file = new File([blob], 'avatar.jpg', { type: 'image/jpeg' });
        const loadId = toast.loading('Uploading profile picture...');
        try {
          const response = await authService.updateProfile({ avatarFile: file });
          updateProfile(response.data.user);
          toast.success('Profile picture updated successfully.', { id: loadId });
          setIsCropModalOpen(false);
        } catch (err) {
          toast.error(err.response?.data?.message || 'Failed to upload profile picture.', { id: loadId });
        }
      }, 'image/jpeg', 0.95);
    };
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <h1 className="font-h3 text-2xl md:text-3xl font-bold text-on-surface">
          {activeUser.role.charAt(0).toUpperCase() + activeUser.role.slice(1)} Profile
        </h1>
        <p className="font-body text-xs md:text-sm text-on-surface-variant">
          {activeUser.role === 'student' 
            ? 'Manage your personal details, email credentials, and view exam stats.' 
            : 'Manage your personal details, credentials, and account settings.'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Profile Card */}
        <Card variant="glass" className="md:col-span-1 flex flex-col items-center text-center p-6 border-white/20">
          <div className="w-24 h-24 rounded-full bg-primary-container text-on-primary flex items-center justify-center font-bold overflow-hidden border-4 border-white/30 shadow-xl mb-4 relative group">
            <img 
              className="w-full h-full object-cover" 
              alt={activeUser.name} 
              src={activeUser.avatar || 'https://lh3.googleusercontent.com/aida-public/AB6AXuCS_KwNtxSXnAS0xAJOx1lWKyJXSgkgZ4hZoM2yi812ob88aFcZ8Pq9yrzR1svJ-oVwvZrBsX3698bwN_qTS4GnXTXxm6w75NY-n6FH1qMAAvL2R3V2cpH-qR1si5QA9uM8Lza_ydhlt8F-EFg-vVc7B76SMq2V1BMztj5QyzIBLmRUX62XzFNYZ3jnZ_e-XNAkVsSpA9o4Bf9-BhtrNgW5XvhFU4ENH1sfODu5qG8j5ej0qk0ph-GgKuuQ7-eWuVKumQHDCkID7H0'}
            />
            <button 
              type="button"
              onClick={() => {
                if (isBlocked) {
                  toast.error('Profile modifications are locked.');
                  return;
                }
                setIsOptionsModalOpen(true);
              }}
              className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex flex-col items-center justify-center text-white text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-all cursor-pointer duration-300 rounded-full border-none outline-none"
            >
              <Camera className="w-5 h-5 mb-1 text-white" />
              Update Pic
            </button>
          </div>
          <h3 className="font-h4 text-lg font-bold text-on-surface">{activeUser.name}</h3>
          <p className="text-xs text-on-surface-variant font-medium mt-1 truncate w-full">{activeUser.email}</p>
          <p className="text-xs text-primary/80 font-bold mt-1 truncate w-full">@{activeUser.username}</p>
          
          <div className="w-full mt-6 pt-6 border-t border-outline-variant/20 flex flex-col gap-3 text-left">
            <div className="flex items-center gap-3 text-xs text-on-surface-variant">
              <Award className="w-5 h-5 text-primary flex-shrink-0" />
              <span>{dashboardStats?.certificationsCount || 0} Certifications Earned</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-on-surface-variant">
              {activeUser.avatar && !activeUser.avatar.includes('lh3.googleusercontent.com/aida-public') ? (
                <>
                  <ShieldCheck className="w-5 h-5 text-secondary flex-shrink-0" />
                  <span>Identity Verified</span>
                </>
              ) : (
                <>
                  <ShieldAlert className="w-5 h-5 text-warning flex-shrink-0" />
                  <span>Verification Pending (Photo Needed)</span>
                </>
              )}
            </div>
            {activeUser.role === 'student' && (
              <div className="flex items-center gap-3 text-xs text-on-surface-variant">
                <School className="w-5 h-5 text-tertiary flex-shrink-0" />
                <span>Batch: {activeUser.batch?.name || 'No Batch Assigned'}</span>
              </div>
            )}
          </div>
        </Card>

        {/* Profile Edit Form */}
        <Card variant="glass" className="md:col-span-2 border-white/20 p-6 md:p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <h3 className="font-h4 text-base md:text-lg font-bold text-on-surface border-b border-outline-variant/30 pb-3 flex items-center gap-2">
              <User className="w-5 h-5 text-primary" /> Profile Settings
            </h3>

            {isBlocked && (
              <div className="bg-error/15 text-error border border-error/30 p-4 rounded-xl text-xs font-semibold flex items-center gap-2 mb-4">
                <ShieldAlert className="w-5 h-5 flex-shrink-0 animate-bounce" />
                <span>
                  Your profile modifications are locked until {new Date(activeUser.profileBlockedUntil).toLocaleString()} due to entering incorrect verification codes.
                </span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input 
                label="Full Name"
                type="text"
                disabled={isBlocked}
                error={errors.name?.message}
                {...register('name', { required: 'Name is required' })}
              />
              {/* Username — editable with 14-day cooldown */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-0.5 flex items-center gap-1.5">
                  <AtSign className="w-3 h-3" /> Username
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={usernameInput}
                    onChange={handleUsernameInputChange}
                    disabled={usernameChangeLocked || isBlocked}
                    maxLength={30}
                    placeholder="your_username"
                    className={`w-full px-4 py-2.5 pr-10 rounded-xl bg-surface-container border-2 text-sm text-on-surface placeholder:text-on-surface-variant/40 outline-none transition-all
                      ${ usernameChangeLocked || isBlocked ? 'opacity-60 cursor-not-allowed border-outline-variant/30' : 
                         usernameStatus === 'available' ? 'border-secondary/70 focus:border-secondary' :
                         usernameStatus === 'taken' || usernameStatus === 'invalid' ? 'border-error/70 focus:border-error' :
                         'border-outline-variant/40 focus:border-primary' }`}
                  />
                  {/* Status icon */}
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    {usernameStatus === 'checking' && <Loader2 className="w-4 h-4 text-on-surface-variant animate-spin" />}
                    {usernameStatus === 'available' && <Check className="w-4 h-4 text-secondary" />}
                    {(usernameStatus === 'taken' || usernameStatus === 'invalid') && <X className="w-4 h-4 text-error" />}
                    {usernameStatus === 'self' && <CheckCircle2 className="w-4 h-4 text-primary/60" />}
                  </span>
                </div>

                {/* Status message */}
                {usernameMsg && (
                  <p className={`text-[11px] font-semibold mt-0.5 flex items-center gap-1 ${
                    usernameStatus === 'available' ? 'text-secondary' :
                    usernameStatus === 'taken' || usernameStatus === 'invalid' ? 'text-error' :
                    'text-on-surface-variant'
                  }`}>
                    {usernameMsg}
                  </p>
                )}

                {/* Cooldown badge */}
                {usernameChangeLocked && (
                  <p className="text-[11px] text-warning font-semibold flex items-center gap-1 mt-0.5">
                    <Clock className="w-3 h-3" /> Next change in {cooldownDaysLeft} day{cooldownDaysLeft !== 1 ? 's' : ''}
                  </p>
                )}

                {/* Save username button */}
                {!usernameChangeLocked && !isBlocked && (
                  <button
                    type="button"
                    onClick={handleSaveUsername}
                    disabled={isSavingUsername || usernameStatus !== 'available'}
                    className={`mt-1.5 self-start inline-flex items-center gap-1.5 text-[11px] font-bold px-3 py-1.5 rounded-lg transition-all border
                      ${ usernameStatus === 'available' && !isSavingUsername
                          ? 'bg-secondary/10 border-secondary/40 text-secondary hover:bg-secondary/20 cursor-pointer'
                          : 'bg-surface-container border-outline-variant/20 text-on-surface-variant/40 cursor-not-allowed' }`}
                  >
                    {isSavingUsername ? <><Loader2 className="w-3 h-3 animate-spin" /> Saving…</> : <><Check className="w-3 h-3" /> Save Username</>}
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Phone — read-only for students, editable for management */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-0.5 flex items-center justify-between">
                  <span>Phone Number</span>
                  {activeUser.role === 'student' && (
                    <button
                      type="button"
                      onClick={handleRefreshPhone}
                      disabled={isRefreshingUser}
                      title="Refresh from server"
                      className="text-on-surface-variant/50 hover:text-primary transition-colors disabled:opacity-40"
                    >
                      <RefreshCw className={`w-3 h-3 ${isRefreshingUser ? 'animate-spin' : ''}`} />
                    </button>
                  )}
                </label>
                <div className="relative">
                  {activeUser.role === 'student' ? (
                    <input
                      type="text"
                      value={activeUser.phone || ''}
                      readOnly
                      disabled
                      placeholder="Not set by management yet"
                      className="w-full px-4 py-2.5 rounded-xl bg-surface-container border-2 border-outline-variant/20 text-sm text-on-surface cursor-not-allowed outline-none placeholder:text-on-surface-variant/40"
                    />
                  ) : (
                    <input
                      type="text"
                      disabled={isBlocked}
                      placeholder="Enter phone number"
                      {...register('phone')}
                      className={`w-full px-4 py-2.5 rounded-xl bg-surface-container border-2 text-sm text-on-surface outline-none placeholder:text-on-surface-variant/40 focus:border-primary
                        ${isBlocked ? 'opacity-60 cursor-not-allowed border-outline-variant/30' : 'border-outline-variant/20'}`}
                    />
                  )}
                </div>
                <p className="text-[11px] text-on-surface-variant/60 font-medium flex items-center gap-1 mt-0.5">
                  <ShieldCheck className="w-3 h-3" />
                  {activeUser.role === 'student' 
                    ? 'Set by management — contact admin to update.' 
                    : 'Enter your active contact number.'}
                </p>
              </div>

              <Input 
                label="Email Address"
                type="email"
                disabled={isBlocked}
                error={errors.email?.message}
                {...register('email', { required: 'Email is required' })}
              />
            </div>

            <div className="flex justify-end gap-4 pt-4 border-t border-outline-variant/20">
              <Button type="submit" variant="gradient" isLoading={isSubmitting} disabled={isBlocked}>
                Save Profile Changes
              </Button>
            </div>
          </form>
        </Card>

      </div>

      {/* Hidden file input element */}
      <input 
        type="file" 
        accept="image/*" 
        className="hidden" 
        id="avatar-input-file" 
        onChange={(e) => {
          handleAvatarChange(e);
          setIsOptionsModalOpen(false);
        }} 
      />

      {/* Google-style Profile Picture Options Modal */}
      <Modal
        isOpen={isOptionsModalOpen}
        onClose={() => setIsOptionsModalOpen(false)}
        title="Change profile picture"
        size="md"
        showCloseButton={true}
        closeOnOverlayClick={true}
      >
        <div className="flex flex-col items-center justify-center p-2 space-y-8">
          {/* Centered Circular Avatar Preview */}
          <div className="w-44 h-44 rounded-full border-4 border-outline-variant/30 shadow-xl overflow-hidden bg-surface-container flex items-center justify-center">
            <img 
              className="w-full h-full object-cover" 
              alt={activeUser.name} 
              src={activeUser.avatar || 'https://lh3.googleusercontent.com/aida-public/AB6AXuCS_KwNtxSXnAS0xAJOx1lWKyJXSgkgZ4hZoM2yi812ob88aFcZ8Pq9yrzR1svJ-oVwvZrBsX3698bwN_qTS4GnXTXxm6w75NY-n6FH1qMAAvL2R3V2cpH-qR1si5QA9uM8Lza_ydhlt8F-EFg-vVc7B76SMq2V1BMztj5QyzIBLmRUX62XzFNYZ3jnZ_e-XNAkVsSpA9o4Bf9-BhtrNgW5XvhFU4ENH1sfODu5qG8j5ej0qk0ph-GgKuuQ7-eWuVKumQHDCkID7H0'}
            />
          </div>

          <div className="text-center space-y-2">
            <h4 className="font-h4 text-sm font-bold text-on-surface">Manage your photo</h4>
            <p className="text-xs text-on-surface-variant font-medium max-w-[280px]">
              A picture helps people recognize you and lets you verify your identity during proctored sessions.
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-4 w-full pt-4 border-t border-outline-variant/20">
            <Button 
              type="button" 
              variant="outline" 
              fullWidth
              onClick={() => {
                setIsOptionsModalOpen(false);
                setIsPreviewModalOpen(true);
              }}
              className="h-auto min-h-[44px]"
            >
              View Profile Picture
            </Button>
            <Button 
              type="button" 
              variant="gradient" 
              fullWidth
              onClick={() => {
                document.getElementById('avatar-input-file')?.click();
              }}
              className="h-auto min-h-[44px]"
            >
              Change Profile Picture
            </Button>
          </div>
        </div>
      </Modal>

      {/* Full-size Photo Preview Lightbox Modal */}
      <Modal
        isOpen={isPreviewModalOpen}
        onClose={() => setIsPreviewModalOpen(false)}
        title="View profile picture"
        size="md"
        showCloseButton={true}
        closeOnOverlayClick={true}
      >
        <div className="flex flex-col items-center justify-center p-2 space-y-6">
          <div className="max-w-[360px] max-h-[360px] rounded-2xl overflow-hidden border border-outline-variant/30 shadow-2xl bg-black/40">
            <img 
              className="w-full h-full object-contain" 
              alt={activeUser.name} 
              src={activeUser.avatar || 'https://lh3.googleusercontent.com/aida-public/AB6AXuCS_KwNtxSXnAS0xAJOx1lWKyJXSgkgZ4hZoM2yi812ob88aFcZ8Pq9yrzR1svJ-oVwvZrBsX3698bwN_qTS4GnXTXxm6w75NY-n6FH1qMAAvL2R3V2cpH-qR1si5QA9uM8Lza_ydhlt8F-EFg-vVc7B76SMq2V1BMztj5QyzIBLmRUX62XzFNYZ3jnZ_e-XNAkVsSpA9o4Bf9-BhtrNgW5XvhFU4ENH1sfODu5qG8j5ej0qk0ph-GgKuuQ7-eWuVKumQHDCkID7H0'}
            />
          </div>
          
          <div className="flex justify-end w-full pt-4 border-t border-outline-variant/20">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setIsPreviewModalOpen(false)}
              className="px-6"
            >
              Close
            </Button>
          </div>
        </div>
      </Modal>

      {/* Interactive Circular Crop Modal */}
      <Modal
        isOpen={isCropModalOpen}
        onClose={() => {
          setIsCropModalOpen(false);
          setIsOptionsModalOpen(true);
        }}
        title="Crop your profile picture"
        size="md"
        showCloseButton={true}
        closeOnOverlayClick={false}
      >
        <div className="flex flex-col items-center justify-center p-2 space-y-6">
          <div className="text-center space-y-1">
            <h4 className="font-h4 text-sm font-bold text-on-surface">Position and size</h4>
            <p className="text-xs text-on-surface-variant font-medium">
              Drag the photo to center it inside the circle, and use the slider to adjust zoom.
            </p>
          </div>

          {/* Circular Viewport Box */}
          <div 
            className="w-60 h-60 rounded-full overflow-hidden relative border-4 border-white dark:border-outline-variant/30 shadow-2xl bg-black/40 cursor-grab active:cursor-grabbing select-none"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUpOrLeave}
            onMouseLeave={handleMouseUpOrLeave}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleMouseUpOrLeave}
          >
            {selectedImage && (
              <img 
                src={selectedImage}
                alt="Crop viewport preview"
                style={{
                  transform: `translate(${position.x}px, ${position.y}px) scale(${zoom})`,
                  transformOrigin: '0 0'
                }}
                className={`absolute left-0 top-0 max-w-none select-none pointer-events-none ${
                  imgAspect > 1 ? 'w-auto h-full' : 'w-full h-auto'
                }`}
              />
            )}
            
            {/* Viewport visual boundary hint */}
            <div className="absolute inset-0 rounded-full pointer-events-none border border-white/20" />
          </div>

          {/* Zoom Slider */}
          <div className="w-full space-y-2 px-4 max-w-[280px]">
            <div className="flex justify-between text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">
              <span>Zoom Slider</span>
              <span>{zoom.toFixed(2)}x</span>
            </div>
            <input 
              type="range"
              min="1"
              max="3"
              step="0.02"
              value={zoom}
              onChange={(e) => setZoom(parseFloat(e.target.value))}
              className="w-full accent-primary cursor-pointer h-1 bg-outline-variant/30 rounded-lg appearance-none"
            />
          </div>

          {/* Action buttons */}
          <div className="flex gap-4 w-full pt-4 border-t border-outline-variant/20">
            <Button 
              type="button" 
              variant="outline" 
              fullWidth
              onClick={() => {
                setIsCropModalOpen(false);
                setIsOptionsModalOpen(true);
              }}
              className="h-auto min-h-[44px] py-2.5"
            >
              Cancel
            </Button>
            <Button 
              type="button" 
              variant="gradient" 
              fullWidth
              onClick={handleSaveCrop}
              className="h-auto min-h-[44px] py-2.5"
            >
              Save & Apply
            </Button>
          </div>
        </div>
      </Modal>

      {/* Email OTP Verification Modal */}
      <Modal
        isOpen={isEmailOtpModalOpen}
        onClose={() => setIsEmailOtpModalOpen(false)}
        title={<span className="flex items-center gap-2"><Mail className="w-5 h-5 text-secondary" /> Verify Email</span>}
        size="md"
        showCloseButton={true}
        closeOnOverlayClick={false}
      >
        <div className="flex flex-col items-center justify-center p-2 space-y-6">
          {/* Success icon & status */}
          <div className="flex flex-col items-center gap-2 py-2">
            <div className="w-14 h-14 rounded-full bg-secondary/10 border border-secondary/30 flex items-center justify-center">
              <Mail className="w-7 h-7 text-secondary" />
            </div>
            <p className="text-xs text-on-surface-variant text-center max-w-xs">
              Check <strong className="text-on-surface">{pendingEmail}</strong> — we sent a 6-digit code.
            </p>
            <p className="text-[10px] text-error font-semibold text-center max-w-xs">
              Warning: 3 incorrect attempts will lock updates for 24 hours.
            </p>
          </div>

          {/* OTP boxes */}
          <div className="flex gap-2 justify-center" onPaste={handleOtpPaste}>
            {otpValues.map((val, i) => (
              <input
                key={i}
                ref={el => { otpRefs.current[i] = el; }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={val}
                onChange={e => handleOtpChange(i, e.target.value)}
                onKeyDown={e => handleOtpKeyDown(i, e)}
                className="w-10 h-12 text-center text-lg font-bold bg-surface-container border-2 border-outline-variant/40 rounded-xl text-on-surface focus:border-primary focus:outline-none transition-colors font-mono"
              />
            ))}
          </div>

          {/* Resend Cooldown */}
          <div className="text-center">
            <button
              type="button"
              onClick={handleResendOtp}
              disabled={resendCooldown > 0 || isVerifyingOtp}
              className="inline-flex items-center gap-1.5 text-xs text-primary disabled:text-on-surface-variant/50 disabled:cursor-not-allowed transition-colors"
            >
              <RefreshCw className={`w-3 h-3 ${isVerifyingOtp ? 'animate-spin' : ''}`} />
              {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend code'}
            </button>
          </div>

          <div className="flex justify-between gap-3 pt-4 border-t border-outline-variant/20 w-full">
            <Button type="button" variant="outline" onClick={() => setIsEmailOtpModalOpen(false)}
              className="text-on-surface-variant">
              ← Cancel
            </Button>
            <Button type="button" variant="gradient" onClick={handleVerifyOtp} disabled={isVerifyingOtp || otpValues.join('').length < 6}>
              {isVerifyingOtp ? 'Verifying…' : <><CheckCircle2 className="w-4 h-4" /> Verify & Update</>}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Profile;
