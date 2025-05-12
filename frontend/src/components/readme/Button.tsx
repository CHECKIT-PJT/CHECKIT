import { ReactNode, MouseEvent } from "react";

type ButtonVariant = "icon" | "primary" | "success" | "secondary" | "iconRound";

interface ButtonProps {
  onClick?: (event: MouseEvent<HTMLButtonElement>) => void;
  variant?: ButtonVariant;
  className?: string;
  title?: string;
  children: ReactNode;
}

const variantClasses: Record<ButtonVariant, string> = {
  icon: "p-1 rounded hover:bg-gray-200",
  primary:
    "flex items-center space-x-1 px-3 py-1.5 rounded-md bg-blue-600 text-white hover:bg-blue-500",
  success:
    "flex items-center space-x-1 px-3 py-1.5 rounded-md bg-green-600 text-white hover:bg-green-500",
  secondary:
    "flex items-center space-x-1 px-3 py-1.5 rounded-md bg-gray-200 text-gray-700 hover:bg-gray-300",
  iconRound: "p-1.5 rounded-full hover:bg-gray-200",
};

export const Button = ({
  onClick,
  variant = "primary",
  className = "",
  title,
  children,
}: ButtonProps) => {
  return (
    <button
      onClick={onClick}
      className={`transition-all ${variantClasses[variant]} ${className}`}
      title={title}
    >
      {children}
    </button>
  );
};

export default Button;
