import React, { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant: 'github' | 'gitlab';
  children: React.ReactNode;
  className?: string;
}

const Button: React.FC<ButtonProps> = ({
  variant,
  children,
  className = '',
  ...props
}) => {
  const baseClasses =
    'flex items-center justify-center w-full py-3 px-4 rounded-lg font-medium text-base transition-all duration-300 ease-in-out transform hover:-translate-y-0.5 hover:shadow-md';

  const variantClasses = {
    github: 'bg-[#24292e] text-white hover:bg-[#1a1e22]',
    gitlab: 'bg-[#004c99] text-white bg-opacity-50',
  };

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
