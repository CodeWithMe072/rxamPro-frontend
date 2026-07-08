import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { LoginSchema } from '../../schemas/auth.schema';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { School, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';

export const Login = () => {
  const { login } = useAuth();
  const { uiStrings } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(LoginSchema),
    defaultValues: { identifier: '', password: '' }
  });

  const from = location.state?.from?.pathname || '/dashboard';

  const onSubmit = async (data) => {
    try {
      const user = await login(data.identifier, data.password);
      toast.success(`Welcome back, ${user.name}!`);
      if (user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate(from, { replace: true });
      }
    } catch (error) {
      toast.error(error.message || 'Login failed. Please check your credentials.');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <main className="w-full max-w-[420px] relative z-10">
        <Card variant="glass" className="p-8 md:p-10 flex flex-col items-center border border-white/30">
          
          <div className="flex flex-col items-center mb-8 text-center">
            <div className="w-16 h-16 bg-primary-container text-white rounded-2xl flex items-center justify-center mb-6 shadow-xl shadow-primary/20 rotate-3 transition-transform hover:rotate-0 duration-300">
              <School className="w-9 h-9" />
            </div>
            <h1 className="font-h3 text-2xl font-bold text-primary mb-1">
              {uiStrings['portal_title'] || 'ExamPro'}
            </h1>
            <p className="font-body text-xs text-on-surface-variant max-w-[280px]">
              {uiStrings['login_welcome'] || 'Access the examination portal with your candidate credentials.'}
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="w-full space-y-6">
            
            <Input 
              label="Username or Email"
              type="text"
              error={errors.identifier?.message}
              {...register('identifier')}
            />

            <Input 
              label="Password"
              type={showPassword ? 'text' : 'password'}
              error={errors.password?.message}
              rightElement={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-on-surface-variant hover:text-primary transition-colors focus:outline-none"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              }
              {...register('password')}
            />

            <div className="flex items-center justify-between w-full text-xs">
              <label className="flex items-center gap-2.5 cursor-pointer group">
                <div className="relative w-10 h-6 bg-outline-variant/50 rounded-full transition-colors group-hover:bg-outline-variant">
                  <input 
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className={`absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-all shadow-sm ${
                    rememberMe ? 'translate-x-4 bg-primary' : ''
                  }`} />
                </div>
                <span className="text-on-surface-variant font-medium">Remember me</span>
              </label>
              
              <Link 
                to="/forgot-password" 
                className="text-primary dark:text-primary-fixed font-bold hover:underline"
              >
                Forgot?
              </Link>
            </div>

            <Button 
              type="submit"
              variant="gradient"
              isLoading={isSubmitting}
              fullWidth
            >
              Sign In
            </Button>
          </form>

        </Card>

        <div className="mt-8 flex justify-center gap-6 text-xs text-on-surface-variant font-semibold">
          <Link to="#" className="hover:text-primary transition-colors">Privacy Policy</Link>
          <Link to="#" className="hover:text-primary transition-colors">Terms of Service</Link>
          <Link to="#" className="hover:text-primary transition-colors">Help Center</Link>
        </div>
      </main>
    </div>
  );
};
export default Login;
