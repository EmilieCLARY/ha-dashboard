import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const widgetVariants = cva(
  'relative flex flex-col border-2 whitespace-normal shadow-md dark:shadow-secondary/50 rounded-3xl overflow-hidden transition-all',
  {
    variants: {
      size: {
        sm: 'size-48',
        md: 'w-96 h-48',
        lg: 'size-96',
        full: 'w-full h-full',
      },
      design: {
        default: 'p-5',
        mumbai: 'p-4',
        compact: 'p-3',
      },
      variant: {
        default: 'bg-background text-foreground border-border',
        secondary: 'bg-secondary text-secondary-foreground border-secondary',
        accent: 'bg-accent text-accent-foreground border-accent',
        glass:
          'bg-background/80 backdrop-blur-sm text-foreground border-border/50',
        temperature:
          'bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950/30 dark:to-red-950/30 text-foreground border-orange-200 dark:border-orange-800',
        humidity:
          'bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-950/30 dark:to-blue-950/30 text-foreground border-cyan-200 dark:border-cyan-800',
        battery:
          'bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 text-foreground border-green-200 dark:border-green-800',
        light:
          'bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-950/30 dark:to-amber-950/30 text-foreground border-yellow-200 dark:border-yellow-800',
        energy:
          'bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-950/30 dark:to-purple-950/30 text-foreground border-violet-200 dark:border-violet-800',
        weather:
          'bg-gradient-to-br from-sky-50 to-blue-50 dark:from-sky-950/30 dark:to-blue-950/30 text-foreground border-sky-200 dark:border-sky-800',
        system:
          'bg-gradient-to-br from-slate-50 to-gray-50 dark:from-slate-950/30 dark:to-gray-950/30 text-foreground border-slate-200 dark:border-slate-800',
        destructive:
          'bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-950/30 dark:to-rose-950/30 text-foreground border-red-200 dark:border-red-800',
      },
    },
    defaultVariants: {
      size: 'full',
      design: 'default',
      variant: 'default',
    },
  }
);

export interface WidgetProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof widgetVariants> {
  asChild?: boolean;
}

const Widget = React.forwardRef<HTMLDivElement, WidgetProps>(
  ({ className, size, design, variant, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(widgetVariants({ size, design, variant, className }))}
      {...props}
    />
  )
);
Widget.displayName = 'Widget';

const WidgetHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'flex flex-none items-center justify-between gap-2',
      className
    )}
    {...props}
  />
));
WidgetHeader.displayName = 'WidgetHeader';

const WidgetTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h5
    ref={ref}
    className={cn(
      'text-sm font-semibold leading-none tracking-tight text-muted-foreground',
      className
    )}
    {...props}
  />
));
WidgetTitle.displayName = 'WidgetTitle';

const WidgetContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex flex-1 items-center justify-center', className)}
    {...props}
  />
));
WidgetContent.displayName = 'WidgetContent';

const WidgetFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'flex flex-none items-center justify-between text-xs text-muted-foreground',
      className
    )}
    {...props}
  />
));
WidgetFooter.displayName = 'WidgetFooter';

export {
  Widget,
  WidgetHeader,
  WidgetTitle,
  WidgetContent,
  WidgetFooter,
  widgetVariants,
};
