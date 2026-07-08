import React from 'react';
import { Inbox } from 'lucide-react';
import { Button } from '../Button';

export const EmptyState = ({
  title = 'No Data Found',
  description = 'There is currently no information to display here.',
  icon: Icon = Inbox,
  actionText,
  onActionClick
}) => {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-outline-variant/30 rounded-3xl bg-surface/50 dark:bg-surface-dim/30">
      <div className="w-16 h-16 rounded-full bg-surface-container dark:bg-surface-container-low flex items-center justify-center text-on-surface-variant mb-6">
        <Icon className="w-8 h-8" />
      </div>
      <h3 className="font-h4 text-lg font-bold text-on-surface mb-2">{title}</h3>
      <p className="font-body text-sm text-on-surface-variant max-w-sm mb-6 leading-relaxed">
        {description}
      </p>
      {actionText && onActionClick && (
        <Button onClick={onActionClick} variant="outline" size="sm">
          {actionText}
        </Button>
      )}
    </div>
  );
};
export default EmptyState;
