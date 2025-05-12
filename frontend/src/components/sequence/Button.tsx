interface ButtonProps {
  label: string;
  onClick: () => void;
  variant?: "primary" | "secondary" | "outline";
  icon?: React.ReactNode;
  className?: string;
}

/**
 * 버튼 컴포넌트
 */
const Button: React.FC<ButtonProps> = ({
  label,
  onClick,
  variant = "primary",
  icon,
  className = "",
}) => {
  // 버튼 스타일 변형에 따른 클래스 결정
  const getVariantClasses = () => {
    switch (variant) {
      case "primary":
        return "bg-blue-600 hover:bg-blue-700 text-white";
      case "secondary":
        return "bg-gray-100 hover:bg-gray-200 text-gray-800";
      case "outline":
        return "bg-white hover:bg-gray-50 text-gray-800 border border-gray-300";
      default:
        return "bg-blue-600 hover:bg-blue-700 text-white";
    }
  };

  return (
    <button
      className={`px-4 py-2 rounded-md flex items-center justify-center transition-colors ${getVariantClasses()} ${className}`}
      onClick={onClick}
      type="button"
    >
      {icon && <span className="mr-2">{icon}</span>}
      {label}
    </button>
  );
};

export default Button;
