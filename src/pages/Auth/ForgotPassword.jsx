import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'react-router-dom';
import { authService } from '../../services/auth.service';
import { ForgotPasswordSchema } from '../../schemas/auth.schema';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { KeyRound } from 'lucide-react';
import toast from 'react-hot-toast';

export const ForgotPassword = () => {
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm({
    resolver: zodResolver(ForgotPasswordSchema),
    defaultValues: { email: '' }
  });

  const onSubmit = async (data) => {
    try {
      await authService.forgotPassword(data.email);
      toast.success('Password reset link sent to your email.');
      reset();
    } catch (error) {
      toast.error('Failed to send reset link. Please try again.');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <main className="w-full max-w-[420px] relative z-10">
        <Card variant="glass" className="p-8 md:p-10 flex flex-col items-center border border-white/30">
          
          <div className="flex flex-col items-center mb-8 text-center">
            <div className="w-16 h-16 bg-primary-container text-white rounded-2xl flex items-center justify-center mb-6 shadow-xl shadow-primary/20 rotate-3 transition-transform hover:rotate-0 duration-300">
              <KeyRound className="w-9 h-9" />
            </div>
            <h1 className="font-h3 text-2xl font-bold text-primary mb-1">Reset Password</h1>
            <p className="font-body text-xs text-on-surface-variant max-w-[280px]">
              Enter your email and we'll send you instructions to reset your password.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="w-full space-y-6">
            
            <Input 
              label="Email Address"
              type="email"
              error={errors.email?.message}
              {...register('email')}
            />

            <Button 
              type="submit"
              variant="gradient"
              isLoading={isSubmitting}
              fullWidth
            >
              Send Reset Link
            </Button>
          </form>

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
export default ForgotPassword;
