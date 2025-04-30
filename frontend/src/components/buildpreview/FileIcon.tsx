import { CiFileOn } from "react-icons/ci";

interface FileIconProps {
  size?: number;
  className?: string;
}

/**
 * 파일 아이콘 컴포넌트
 */
const FileIcon: React.FC<FileIconProps> = ({
  size = 14,
  className = "",
  ...rest
}) => {
  return (
    <CiFileOn size={size} className={`text-gray-500 ${className}`} {...rest} />
  );
};

export default FileIcon;
