import * as React from 'react';
import { cn } from '../../lib/utils';

export interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  options: Array<{
    value: string;
    label: string;
    group?: string;
  }>;
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, options, ...props }, ref) => {
    const groupedOptions = options.reduce((acc, option) => {
      const group = option.group || 'default';
      if (!acc[group]) {
        acc[group] = [];
      }
      acc[group].push(option);
      return acc;
    }, {} as Record<string, typeof options>);

    return (
      <select
        className={cn(
          'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
          className
        )}
        ref={ref}
        {...props}
      >
        {Object.entries(groupedOptions).map(([group, groupOptions]) => (
          <optgroup label={group} key={group}>
            {groupOptions.map((option) => (
              <option value={option.value} key={option.value}>
                {option.label}
              </option>
            ))}
          </optgroup>
        ))}
      </select>
    );
  }
);
Select.displayName = 'Select';

export { Select };
