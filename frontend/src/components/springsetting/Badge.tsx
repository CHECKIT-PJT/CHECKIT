import { IconType } from "react-icons";

type BadgeVariant =
  | "primary"
  | "success"
  | "warning"
  | "error"
  | "info"
  | "default";

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  icon?: IconType;
  className?: string;
}

const Badge: React.FC<BadgeProps> = ({
  children,
  variant = "default",
  icon: Icon,
  className = "",
}) => {
  const variantClasses: Record<BadgeVariant, string> = {
    primary: "bg-indigo-100 text-indigo-800",
    success: "bg-green-100 text-green-800",
    warning: "bg-yellow-100 text-yellow-800",
    error: "bg-red-100 text-red-800",
    info: "bg-blue-100 text-blue-800",
    default: "bg-gray-100 text-gray-800",
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${variantClasses[variant]} ${className}`}
    >
      {Icon && <Icon className="mr-1" />}
      {children}
    </span>
  );
};

export default Badge;
