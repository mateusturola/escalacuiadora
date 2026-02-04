import { forwardRef, InputHTMLAttributes } from 'react';
import Input, { InputProps } from './ui/Input';
import { formatPhone } from '@/lib/utils';

export interface PhoneInputProps extends Omit<InputProps, 'onChange'> {
  onChange: (value: string) => void;
}

const PhoneInput = forwardRef<HTMLInputElement, PhoneInputProps>(
  ({ value, onChange, ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const formatted = formatPhone(e.target.value);
      onChange(formatted);
    };

    const phoneIcon = (
      <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
      </svg>
    );

    return (
      <Input
        ref={ref}
        type="tel"
        value={value}
        onChange={handleChange}
        icon={phoneIcon}
        placeholder="(00) 00000-0000"
        maxLength={15}
        {...props}
      />
    );
  }
);

PhoneInput.displayName = 'PhoneInput';

export default PhoneInput;
