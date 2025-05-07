import { FiX, FiExternalLink } from "react-icons/fi";

export interface SpringBootVersion {
  version: string;
  releaseDate: string;
  springVersion: string;
  javaCompatibility: string;
}

interface VersionInfoPopupProps {
  version: SpringBootVersion;
  onClose: () => void;
  className?: string;
}

const VersionInfoPopup: React.FC<VersionInfoPopupProps> = ({
  version,
  onClose,
  className = "",
}) => {
  return (
    <div className={`mt-2 p-3 bg-gray-50 rounded-md text-sm ${className}`}>
      <div className="flex justify-between items-start">
        <h4 className="font-medium">Spring Boot {version.version}</h4>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600"
          aria-label="닫기"
        >
          <FiX className="h-4 w-4" />
        </button>
      </div>
      <div className="mt-2 space-y-1 text-gray-600">
        <p>릴리스 일자: {version.releaseDate}</p>
        <p>Spring Framework: {version.springVersion}</p>
        <p>Java 호환성: {version.javaCompatibility}</p>
        <a
          href="https://github.com/spring-projects/spring-boot/releases"
          target="_blank"
          rel="noopener noreferrer"
          className="text-indigo-600 hover:text-indigo-800 inline-flex items-center mt-1"
        >
          <span>릴리스 노트</span>
          <FiExternalLink className="h-3 w-3 ml-1" />
        </a>
      </div>
    </div>
  );
};

export default VersionInfoPopup;
