import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { AlertCircle, Home, ArrowLeft } from 'lucide-react';

export const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4">
      <main className="w-full max-w-md text-center relative z-10 space-y-6">
        <Card variant="glass" className="p-8 md:p-10 flex flex-col items-center border border-white/30">
          
          <div className="w-20 h-20 bg-error/10 text-error rounded-full flex items-center justify-center mb-6 border border-error/20 animate-bounce">
            <AlertCircle className="w-10 h-10" />
          </div>

          <h1 className="text-6xl font-extrabold text-primary font-mono tracking-wider mb-2">404</h1>
          <h2 className="font-h3 text-xl font-bold text-on-surface mb-2">Page Not Found</h2>
          <p className="font-body text-xs md:text-sm text-on-surface-variant mb-8 leading-relaxed">
            The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 w-full">
            <Button 
              variant="outline" 
              onClick={() => navigate(-1)}
              fullWidth
              className="flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" /> Go Back
            </Button>
            <Button 
              variant="gradient" 
              onClick={() => navigate('/')}
              fullWidth
              className="flex items-center justify-center gap-2"
            >
              <Home className="w-4 h-4" /> Go Home
            </Button>
          </div>

        </Card>
      </main>
    </div>
  );
};
export default NotFound;
