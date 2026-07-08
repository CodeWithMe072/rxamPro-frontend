import React from 'react';
import { AlertCircle } from 'lucide-react';
import { Button } from '../Button';

export const ErrorState = ({
  title = 'An Error Occurred',
  description = 'Something went wrong while fetching the data. Please try again.',
  onRetry
}) => {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 border border-error/20 rounded-3xl bg-error-container/5 dark:bg-error-container/2">
      <div className="w-16 h-16 rounded-full bg-error-container/20 flex items-center justify-center text-error mb-6 border border-error/25">
        <AlertCircle className="w-8 h-8" />
      </div>
      <h3 className="font-h4 text-lg font-bold text-on-surface mb-2">{title}</h3>
      <p className="font-body text-sm text-on-surface-variant max-w-sm mb-6 leading-relaxed">
        {description}
      </p>
      {onRetry && (
        <Button onClick={onRetry} variant="danger" size="sm">
          Retry Connection
        </Button>
      )}
    </div>
  );
};
export default ErrorState;
