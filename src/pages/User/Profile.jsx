import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { Award, ShieldCheck, Mail, User, ShieldAlert, School } from 'lucide-react';
import toast from 'react-hot-toast';

export const Profile = () => {
  const { user, updateProfile } = useAuth();
  
  const activeUser = user || {
    name: 'Alex Rivera',
    email: 'alex.rivera@exampro.com',
    role: 'student'
  };

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    defaultValues: {
      name: activeUser.name,
      email: activeUser.email,
      phone: '+1 (555) 019-2834'
    }
  });

  const onSubmit = async (data) => {
    try {
      // Simulate API submit delay
      await new Promise(resolve => setTimeout(resolve, 800));
      updateProfile({ name: data.name, email: data.email });
      toast.success('Profile details updated successfully.');
    } catch (e) {
      toast.error('Failed to update profile details.');
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <h1 className="font-h3 text-2xl md:text-3xl font-bold text-on-surface">Student Profile</h1>
        <p className="font-body text-xs md:text-sm text-on-surface-variant">
          Manage your personal details, email credentials, and view exam stats.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Profile Card */}
        <Card variant="glass" className="md:col-span-1 flex flex-col items-center text-center p-6 border-white/20">
          <div className="w-24 h-24 rounded-full bg-primary-container text-on-primary flex items-center justify-center font-bold overflow-hidden border-4 border-white/30 shadow-xl mb-4">
            <img 
              className="w-full h-full object-cover" 
              alt={activeUser.name} 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCS_KwNtxSXnAS0xAJOx1lWKyJXSgkgZ4hZoM2yi812ob88aFcZ8Pq9yrzR1svJ-oVwvZrBsX3698bwN_qTS4GnXTXxm6w75NY-n6FH1qMAAvL2R3V2cpH-qR1si5QA9uM8Lza_ydhlt8F-EFg-vVc7B76SMq2V1BMztj5QyzIBLmRUX62XzFNYZ3jnZ_e-XNAkVsSpA9o4Bf9-BhtrNgW5XvhFU4ENH1sfODu5qG8j5ej0qk0ph-GgKuuQ7-eWuVKumQHDCkID7H0"
            />
          </div>
          <h3 className="font-h4 text-lg font-bold text-on-surface">{activeUser.name}</h3>
          <p className="text-xs text-on-surface-variant font-medium mt-1 truncate w-full">{activeUser.email}</p>
          
          <div className="w-full mt-6 pt-6 border-t border-outline-variant/20 flex flex-col gap-3 text-left">
            <div className="flex items-center gap-3 text-xs text-on-surface-variant">
              <Award className="w-5 h-5 text-primary flex-shrink-0" />
              <span>2 Certifications Earned</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-on-surface-variant">
              <ShieldCheck className="w-5 h-5 text-secondary flex-shrink-0" />
              <span>Identity Verified</span>
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input 
                label="Full Name"
                type="text"
                error={errors.name?.message}
                {...register('name', { required: 'Name is required' })}
              />
              <Input 
                label="Phone Number"
                type="text"
                error={errors.phone?.message}
                {...register('phone')}
              />
            </div>

            <Input 
              label="Email Address"
              type="email"
              error={errors.email?.message}
              {...register('email', { required: 'Email is required' })}
            />

            <div className="flex justify-end gap-4 pt-4 border-t border-outline-variant/20">
              <Button type="submit" variant="gradient" isLoading={isSubmitting}>
                Save Profile Changes
              </Button>
            </div>
          </form>
        </Card>

      </div>
    </div>
  );
};
export default Profile;
