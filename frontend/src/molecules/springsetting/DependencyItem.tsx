import { FiInfo, FiCheck } from "react-icons/fi";

export interface Dependency {
  id: string;
  name: string;
  description: string;
  selected: boolean;
}

interface DependencyItemProps {
  dependency: Dependency;
  onToggle: (id: string) => void;
  showInfo: boolean;
  onToggleInfo: () => void;
  className?: string;
}

const DependencyItem: React.FC<DependencyItemProps> = ({
  dependency,
  onToggle,
  showInfo,
  onToggleInfo,
  className = "",
}) => {
  return (
    <li className={`px-4 py-3 hover:bg-gray-50 ${className}`}>
      <div className="flex items-start">
        <div className="flex-shrink-0 pt-0.5">
          <button
            onClick={() => onToggle(dependency.id)}
            className={`h-5 w-5 rounded border flex items-center justify-center ${
              dependency.selected
                ? "bg-indigo-600 border-indigo-600 text-white"
                : "border-gray-300 text-transparent"
            }`}
            aria-pressed={dependency.selected}
            aria-label={`${dependency.name} ${dependency.selected ? "선택됨" : "선택하기"}`}
          >
            {dependency.selected && <FiCheck className="h-3 w-3" />}
          </button>
        </div>
        <div className="ml-3 flex-1">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-900">
              {dependency.name}
            </span>
            <button
              onClick={onToggleInfo}
              className="text-gray-400 hover:text-indigo-600"
              aria-label={`${dependency.name} 정보 ${showInfo ? "숨기기" : "보기"}`}
            >
              <FiInfo className="h-4 w-4" />
            </button>
          </div>
          {showInfo && (
            <div className="mt-2 text-xs text-gray-600">
              {dependency.description}
            </div>
          )}
        </div>
      </div>
    </li>
  );
};

export default DependencyItem;
