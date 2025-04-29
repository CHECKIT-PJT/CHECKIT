import React from 'react';

interface CustomInputBoxProps {
  width?: string;
  height?: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
  type?: string;
}

const CustomInputBox = ({
  width = 'w-full',
  height = 'h-10',
  placeholder,
  value,
  onChange,
  className = '',
  type = 'text',
}: CustomInputBoxProps) => {
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={`
        ${width}
        ${height}
        px-4
        rounded-lg
        border-2
        border-gray-300
        focus:border-blue-500
        focus:outline-none
        transition-colors
        duration-200
        bg-white
        text-gray-800
        placeholder-gray-400
        ${className}
      `}
    />
  );
};

export default CustomInputBox;
