import { AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FormFieldErrorProps {
  error?: string;
  className?: string;
  showIcon?: boolean;
}

export function FormFieldError({ error, className, showIcon = true }: FormFieldErrorProps) {
  if (!error) return null;

  return (
    <div className={cn("flex items-center gap-2 text-sm text-destructive mt-1.5 animate-in fade-in slide-in-from-top-1", className)}>
      {showIcon && <AlertCircle className="w-4 h-4 flex-shrink-0" />}
      <span className="leading-tight">{error}</span>
    </div>
  );
}

