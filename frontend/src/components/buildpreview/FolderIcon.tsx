import { FcOpenedFolder } from "react-icons/fc";
import { IconColor } from "../../types";

interface FolderIconProps {
  size?: number;
  color?: IconColor;
  className?: string;
}

/**
 * 폴더 아이콘 컴포넌트
 */
const FolderIcon: React.FC<FolderIconProps> = ({
  size = 16,
  color = "blue",
  className = "",
  ...rest
}) => {
  const colorClasses = {
    blue: "text-blue-500",
    yellow: "text-yellow-500",
  };

  return (
    <FcOpenedFolder
      size={size}
      className={`${colorClasses[color]} ${className}`}
      {...rest}
    />
  );
};

export default FolderIcon;
