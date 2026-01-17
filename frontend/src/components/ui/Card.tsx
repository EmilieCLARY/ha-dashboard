import React from 'react';
import { clsx } from 'clsx';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  subtitle?: string;
  footer?: React.ReactNode;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hover?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  title,
  subtitle,
  footer,
  padding = 'md',
  hover = false,
  className,
  ...props
}) => {
  const paddingStyles = {
    none: '',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
  };

  return (
    <div
      className={clsx(
        'bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700',
        hover && 'hover:shadow-lg transition-shadow',
        className
      )}
      {...props}
    >
      {(title || subtitle) && (
        <div className={clsx('border-b border-gray-200 dark:border-gray-700', paddingStyles[padding])}>
          {title && (
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {title}
            </h3>
          )}
          {subtitle && (
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {subtitle}
            </p>
          )}
        </div>
      )}
      
      <div className={paddingStyles[padding]}>{children}</div>
      
      {footer && (
        <div className={clsx('border-t border-gray-200 dark:border-gray-700', paddingStyles[padding])}>
          {footer}
        </div>
      )}
    </div>
  );
};
