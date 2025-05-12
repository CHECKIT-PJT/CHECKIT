import { FiCheck } from "react-icons/fi";

export interface Dependency {
  id: string;
  name: string;
  selected: boolean;
}

interface DependencyItemProps {
  dependency: Dependency;
  onToggle: (id: string) => void;
  className?: string;
}

const DependencyItem: React.FC<DependencyItemProps> = ({
  dependency,
  onToggle,
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
          </div>
        </div>
      </div>
    </li>
  );
};

export default DependencyItem;
