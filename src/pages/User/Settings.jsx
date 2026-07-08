import React, { useState, useRef } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { authService } from '../../services/auth.service';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { Dropdown } from '../../components/Dropdown';
import { Settings as SettingsIcon, ShieldAlert, KeyRound, BellRing, Mail, CheckCircle2, Lock, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

export const Settings = () => {
  const { theme, setManualTheme } = useTheme();

  // Wizard state: 'current_password' | 'otp_1' | 'new_password' | 'otp_2'
  const [step, setStep] = useState('current_password');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otp1, setOtp1] = useState(Array(8).fill(''));
  const [otp2, setOtp2] = useState(Array(8).fill(''));

  const otp1Refs = useRef([]);
  const otp2Refs = useRef([]);

  // ── OTP input event handlers ────────────────────────────────────────────────

  const handleOtpChange = (index, val, otpState, setOtpState, refs) => {
    const char = val.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(-1);
    const next = [...otpState];
    next[index] = char;
    setOtpState(next);
    if (char && index < 7) {
      refs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, e, otpState, refs) => {
    if (e.key === 'Backspace' && !otpState[index] && index > 0) {
      refs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e, setOtpState, refs) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 8);
    const next = Array(8).fill('');
    pasted.split('').forEach((c, i) => { next[i] = c; });
    setOtpState(next);
    const focusIdx = Math.min(pasted.length, 7);
    setTimeout(() => refs.current[focusIdx]?.focus(), 0);
  };

  // ── Step 1: Initiate ────────────────────────────────────────────────────────

  const handleVerifyCurrent = async (e) => {
    e.preventDefault();
    if (!currentPassword) {
      toast.error('Please enter your current password.');
      return;
    }
    setIsSubmitting(true);
    try {
      await authService.initiatePasswordChange(currentPassword);
      toast.success('Verification code sent to your email.');
      setStep('otp_1');
      setTimeout(() => otp1Refs.current[0]?.focus(), 100);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Incorrect current password.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Step 2: Verify OTP 1 ────────────────────────────────────────────────────

  const handleVerifyOtp1 = async (e) => {
    e.preventDefault();
    const code = otp1.join('');
    if (code.length < 8) {
      toast.error('Please enter the complete 8-character verification code.');
      return;
    }
    setIsSubmitting(true);
    try {
      await authService.verifyPasswordChangeOtp1(code);
      toast.success('Identity verified! Please choose your new password.');
      setStep('new_password');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid or expired code.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Step 3: Submit New Password ─────────────────────────────────────────────

  const handleSubmitNew = async (e) => {
    e.preventDefault();
    if (!newPassword || !confirmPassword) {
      toast.error('All fields are required.');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }
    setIsSubmitting(true);
    try {
      await authService.submitNewPassword(newPassword);
      toast.success('Confirmation code sent to your email.');
      setStep('otp_2');
      setTimeout(() => otp2Refs.current[0]?.focus(), 100);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit password.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Step 4: Verify OTP 2 ────────────────────────────────────────────────────

  const handleVerifyOtp2 = async (e) => {
    e.preventDefault();
    const code = otp2.join('');
    if (code.length < 8) {
      toast.error('Please enter the complete 8-character confirmation code.');
      return;
    }
    setIsSubmitting(true);
    try {
      await authService.verifyPasswordChangeOtp2(code);
      toast.success('Password changed successfully!');
      // Reset flow
      setStep('current_password');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setOtp1(Array(8).fill(''));
      setOtp2(Array(8).fill(''));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid or expired code.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <h1 className="font-h3 text-2xl md:text-3xl font-bold text-on-surface">System Settings</h1>
        <p className="font-body text-xs md:text-sm text-on-surface-variant">
          Adjust theme preferences, security locks, and alert toggles.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left Column: Preferences */}
        <section className="md:col-span-1 space-y-6">
          <Card variant="glass" className="p-6 border-white/20 relative z-20">
            <h3 className="font-h4 text-sm font-bold text-on-surface-variant mb-4 uppercase tracking-wider flex items-center gap-1.5">
              <SettingsIcon className="w-4 h-4 text-primary" /> Appearance
            </h3>
            
            <div className="space-y-3">
              <label className="block text-xs font-semibold text-on-surface-variant">Theme Selection</label>
              <Dropdown
                value={theme}
                onChange={setManualTheme}
                options={[
                  { value: 'light', label: 'Light Theme' },
                  { value: 'dark', label: 'Dark Theme' },
                  { value: 'system', label: 'System Default' }
                ]}
              />
            </div>
          </Card>

          <Card variant="glass" className="p-6 border-white/20">
            <h3 className="font-h4 text-sm font-bold text-on-surface-variant mb-4 uppercase tracking-wider flex items-center gap-1.5">
              <BellRing className="w-4 h-4 text-primary" /> Notifications
            </h3>
            
            <div className="space-y-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" defaultChecked className="rounded border-outline-variant text-primary focus:ring-primary/20 w-4 h-4 bg-transparent" />
                <span className="text-xs text-on-surface-variant font-medium">Exam reminders (email)</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" defaultChecked className="rounded border-outline-variant text-primary focus:ring-primary/20 w-4 h-4 bg-transparent" />
                <span className="text-xs text-on-surface-variant font-medium">Performance alerts</span>
              </label>
            </div>
          </Card>
        </section>

        {/* Right Column: Password change flow */}
        <section className="md:col-span-2">
          <Card variant="glass" className="border-white/20 p-6 md:p-8">
            <div className="flex items-center justify-between border-b border-outline-variant/30 pb-4 mb-6">
              <h3 className="font-h4 text-base md:text-lg font-bold text-on-surface flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-primary" /> Security & Password
              </h3>
              {step !== 'current_password' && (
                <button
                  onClick={() => {
                    if (step === 'otp_1') setStep('current_password');
                    else if (step === 'new_password') setStep('otp_1');
                    else if (step === 'otp_2') setStep('new_password');
                  }}
                  className="flex items-center gap-1 text-xs text-primary font-semibold hover:underline"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Back
                </button>
              )}
            </div>

            {/* ── STEP 1: Verify Current Password ── */}
            {step === 'current_password' && (
              <form onSubmit={handleVerifyCurrent} className="space-y-5">
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-on-surface-variant">Enter Current Password *</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant/40" />
                    <input
                      type="password"
                      required
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full h-11 pl-10 pr-4 bg-surface-container border border-outline-variant/30 rounded-xl text-on-surface text-sm focus:outline-none focus:border-primary"
                    />
                  </div>
                  <p className="text-[10px] text-on-surface-variant/75">
                    We need to verify your current password to authorize a change request.
                  </p>
                </div>
                <div className="flex justify-end pt-4 border-t border-outline-variant/20">
                  <Button type="submit" variant="gradient" isLoading={isSubmitting}>
                    Verify Password
                  </Button>
                </div>
              </form>
            )}

            {/* ── STEP 2: Verify OTP 1 ── */}
            {step === 'otp_1' && (
              <form onSubmit={handleVerifyOtp1} className="space-y-6">
                <div className="flex flex-col items-center gap-2 text-center py-2">
                  <div className="w-12 h-12 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
                    <Mail className="w-6 h-6 text-primary" />
                  </div>
                  <h4 className="text-sm font-bold text-on-surface">Enter Verification Code</h4>
                  <p className="text-xs text-on-surface-variant max-w-sm">
                    We sent an 8-character verification code to your email. Please enter it below to verify your identity.
                  </p>
                </div>

                <div 
                  className="flex gap-2 justify-center" 
                  onPaste={(e) => handleOtpPaste(e, setOtp1, otp1Refs)}
                >
                  {otp1.map((val, i) => (
                    <input
                      key={i}
                      ref={el => { otp1Refs.current[i] = el; }}
                      type="text"
                      inputMode="text"
                      maxLength={1}
                      value={val}
                      onChange={e => handleOtpChange(i, e.target.value, otp1, setOtp1, otp1Refs)}
                      onKeyDown={e => handleOtpKeyDown(i, e, otp1, otp1Refs)}
                      className="w-9 h-11 text-center text-lg font-bold uppercase tracking-widest bg-surface-container border-2 border-outline-variant/40 rounded-xl text-on-surface focus:border-primary focus:outline-none transition-colors font-mono"
                    />
                  ))}
                </div>

                <div className="flex justify-end pt-4 border-t border-outline-variant/20">
                  <Button type="submit" variant="gradient" isLoading={isSubmitting} disabled={otp1.join('').length < 8}>
                    Verify Code
                  </Button>
                </div>
              </form>
            )}

            {/* ── STEP 3: Enter New Password ── */}
            {step === 'new_password' && (
              <form onSubmit={handleSubmitNew} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block text-xs font-semibold text-on-surface-variant">New Password *</label>
                    <input
                      type="password"
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full h-11 px-4 bg-surface-container border border-outline-variant/30 rounded-xl text-on-surface text-sm focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-xs font-semibold text-on-surface-variant">Confirm New Password *</label>
                    <input
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full h-11 px-4 bg-surface-container border border-outline-variant/30 rounded-xl text-on-surface text-sm focus:outline-none focus:border-primary"
                    />
                  </div>
                </div>

                <p className="text-[10px] text-on-surface-variant/75 mt-1">
                  Choose a strong password containing at least 6 characters.
                </p>

                <div className="flex justify-end pt-4 border-t border-outline-variant/20">
                  <Button type="submit" variant="gradient" isLoading={isSubmitting}>
                    Request Update Code
                  </Button>
                </div>
              </form>
            )}

            {/* ── STEP 4: Verify OTP 2 ── */}
            {step === 'otp_2' && (
              <form onSubmit={handleVerifyOtp2} className="space-y-6">
                <div className="flex flex-col items-center gap-2 text-center py-2">
                  <div className="w-12 h-12 rounded-full bg-secondary/10 border border-secondary/20 flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6 text-secondary" />
                  </div>
                  <h4 className="text-sm font-bold text-on-surface">Enter Confirmation Code</h4>
                  <p className="text-xs text-on-surface-variant max-w-sm">
                    Enter the final 8-character confirmation code sent to your email to verify and apply the password update.
                  </p>
                </div>

                <div 
                  className="flex gap-2 justify-center" 
                  onPaste={(e) => handleOtpPaste(e, setOtp2, otp2Refs)}
                >
                  {otp2.map((val, i) => (
                    <input
                      key={i}
                      ref={el => { otp2Refs.current[i] = el; }}
                      type="text"
                      inputMode="text"
                      maxLength={1}
                      value={val}
                      onChange={e => handleOtpChange(i, e.target.value, otp2, setOtp2, otp2Refs)}
                      onKeyDown={e => handleOtpKeyDown(i, e, otp2, otp2Refs)}
                      className="w-9 h-11 text-center text-lg font-bold uppercase tracking-widest bg-surface-container border-2 border-outline-variant/40 rounded-xl text-on-surface focus:border-primary focus:outline-none transition-colors font-mono"
                    />
                  ))}
                </div>

                <div className="flex justify-end pt-4 border-t border-outline-variant/20">
                  <Button type="submit" variant="gradient" isLoading={isSubmitting} disabled={otp2.join('').length < 8}>
                    Confirm and Save
                  </Button>
                </div>
              </form>
            )}
          </Card>
        </section>

      </div>
    </div>
  );
};

export default Settings;
