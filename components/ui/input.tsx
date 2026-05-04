import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', ...props }, ref) => (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-foreground mb-1">
          {label}
        </label>
      )}
      <input
        ref={ref}
        className={`
          w-full px-3 py-2 border border-border bg-input rounded-lg
          text-foreground
          focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring
          disabled:opacity-50 disabled:cursor-not-allowed
          ${error ? 'border-destructive' : ''}
          ${className}
        `}
        {...props}
      />
      {error && <p className="text-sm text-destructive mt-1">{error}</p>}
    </div>
  )
);
          disabled:bg-gray-100 disabled:cursor-not-allowed
          ${error ? 'border-error focus:ring-error' : 'border-gray-300'}
          ${className}
        `}
        {...props}
      />
      {error && <p className="text-sm text-error mt-1">{error}</p>}
    </div>
  )
);

Input.displayName = 'Input';
