import { FiAlertCircle } from "react-icons/fi";

interface EmptySearchResultProps {
  message?: string;
  subMessage?: string;
  className?: string;
}

const EmptySearchResult: React.FC<EmptySearchResultProps> = ({
  message = "검색 결과가 없습니다.",
  subMessage = "다른 키워드로 검색해보세요.",
  className = "",
}) => {
  return (
    <div
      className={`flex items-center justify-center py-8 text-center bg-gray-50 rounded-md ${className}`}
    >
      <div>
        <FiAlertCircle className="h-8 w-8 text-gray-400 mx-auto mb-2" />
        <p className="text-gray-500 text-sm">{message}</p>
        {subMessage && (
          <p className="text-gray-400 text-xs mt-1">{subMessage}</p>
        )}
      </div>
    </div>
  );
};

export default EmptySearchResult;
