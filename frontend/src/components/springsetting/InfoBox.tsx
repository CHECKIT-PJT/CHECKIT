// components/springsetting/InfoBox.tsx
import React from "react";
import {
  FiInfo,
  FiAlertTriangle,
  FiCheckCircle,
  FiXCircle,
} from "react-icons/fi";

type InfoBoxVariant = "info" | "warning" | "success" | "error" | "default";

interface InfoBoxProps {
  children: React.ReactNode;
  variant?: InfoBoxVariant;
  title?: string;
  className?: string;
}

const InfoBox: React.FC<InfoBoxProps> = ({
  children,
  variant = "info",
  title,
  className = "",
}) => {
  // 변형에 따른 스타일 클래스
  const variantClasses = {
    info: "bg-blue-50 text-blue-800",
    warning: "bg-yellow-50 text-yellow-800",
    success: "bg-green-50 text-green-800",
    error: "bg-red-50 text-red-800",
    default: "bg-gray-50 text-gray-800",
  };

  // 변형에 따른 아이콘 색상
  const iconColors = {
    info: "text-blue-500",
    warning: "text-yellow-500",
    success: "text-green-500",
    error: "text-red-500",
    default: "text-gray-500",
  };

  // 아이콘 렌더링
  const renderIcon = () => {
    switch (variant) {
      case "info":
        return (
          <FiInfo
            className={`h-5 w-5 ${iconColors[variant]} flex-shrink-0 mt-0.5`}
          />
        );
      case "warning":
        return (
          <FiAlertTriangle
            className={`h-5 w-5 ${iconColors[variant]} flex-shrink-0 mt-0.5`}
          />
        );
      case "success":
        return (
          <FiCheckCircle
            className={`h-5 w-5 ${iconColors[variant]} flex-shrink-0 mt-0.5`}
          />
        );
      case "error":
        return (
          <FiXCircle
            className={`h-5 w-5 ${iconColors[variant]} flex-shrink-0 mt-0.5`}
          />
        );
      default:
        return (
          <FiInfo
            className={`h-5 w-5 ${iconColors.default} flex-shrink-0 mt-0.5`}
          />
        );
    }
  };

  return (
    <div
      className={`p-3 rounded-md flex ${variantClasses[variant]} ${className}`}
    >
      {renderIcon()}
      <div className="ml-3">
        {title && <h3 className="text-sm font-medium">{title}</h3>}
        <div className={`${title ? "mt-1" : ""} text-sm`}>{children}</div>
      </div>
    </div>
  );
};

export default InfoBox;
