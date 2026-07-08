import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { authService } from '../../services/auth.service';
import { ResetPasswordSchema } from '../../schemas/auth.schema';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { Lock } from 'lucide-react';
import toast from 'react-hot-toast';

export const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(ResetPasswordSchema),
    defaultValues: { password: '', confirmPassword: '' }
  });

  const onSubmit = async (data) => {
    if (!token) {
      toast.error('Reset token is missing in URL.');
      return;
    }

    try {
      await authService.resetPassword(token, data.password);
      toast.success('Password successfully reset! Please login.');
      navigate('/login');
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Token is invalid or has expired. Please request a new link.';
      toast.error(errorMsg);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <main className="w-full max-w-[420px] relative z-10">
        <Card variant="glass" className="p-8 md:p-10 flex flex-col items-center border border-white/30">
          
          <div className="flex flex-col items-center mb-8 text-center">
            <div className="w-16 h-16 bg-primary-container text-white rounded-2xl flex items-center justify-center mb-6 shadow-xl shadow-primary/20 rotate-3 transition-transform hover:rotate-0 duration-300">
              <Lock className="w-9 h-9" />
            </div>
            <h1 className="font-h3 text-2xl font-bold text-primary mb-1">Set New Password</h1>
            <p className="font-body text-xs text-on-surface-variant max-w-[280px]">
              Enter your new secure password below to update your account credentials.
            </p>
          </div>

          {!token ? (
            <div className="w-full text-center space-y-4">
              <div className="p-4 bg-error-container/20 text-error rounded-xl text-xs font-semibold">
                Invalid Request: Password reset token is missing. Please initiate a new password reset.
              </div>
              <Link to="/forgot-password" className="block text-xs font-bold text-primary hover:underline">
                Request new link
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="w-full space-y-6">
              
              <Input 
                label="New Password"
                type="password"
                error={errors.password?.message}
                {...register('password')}
              />

              <Input 
                label="Confirm New Password"
                type="password"
                error={errors.confirmPassword?.message}
                {...register('confirmPassword')}
              />

              <Button 
                type="submit"
                variant="gradient"
                isLoading={isSubmitting}
                fullWidth
              >
                Reset Password
              </Button>
            </form>
          )}

          <p className="mt-8 text-xs text-on-surface-variant font-medium">
            Remembered your password?{' '}
            <Link to="/login" className="text-primary dark:text-primary-fixed font-bold hover:underline">
              Sign In
            </Link>
          </p>

        </Card>
      </main>
    </div>
  );
};

export default ResetPassword;
