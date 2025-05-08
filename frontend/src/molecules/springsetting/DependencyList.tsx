import React from "react";
import { FiInfo, FiAlertCircle } from "react-icons/fi";
import Checkbox from "../../components/springsetting/checkbox";

// 의존성 타입 정의
interface Dependency {
  id: string;
  name: string;
  description: string;
  selected: boolean;
}

interface DependencyListProps {
  filteredDependencies: Dependency[];
  toggleDependency: (id: string) => void;
  showDependencyInfo: string | null;
  toggleDependencyInfo: (id: string) => void;
}

const DependencyList: React.FC<DependencyListProps> = ({
  filteredDependencies,
  toggleDependency,
  showDependencyInfo,
  toggleDependencyInfo,
}) => {
  return (
    <div>
      {/* 의존성 목록 */}
      <div className="border border-gray-200 rounded-md overflow-hidden">
        <ul className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
          {filteredDependencies.map((dependency) => (
            <li key={dependency.id} className="px-4 py-3 hover:bg-gray-50">
              <div className="flex items-start">
                <div className="flex-shrink-0 pt-0.5">
                  <Checkbox
                    checked={dependency.selected}
                    onChange={() => toggleDependency(dependency.id)}
                  />
                </div>
                <div className="ml-3 flex-1">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-900">
                      {dependency.name}
                    </span>
                    <button
                      onClick={() => toggleDependencyInfo(dependency.id)}
                      className="text-gray-400 hover:text-indigo-600"
                    >
                      <FiInfo className="h-4 w-4" />
                    </button>
                  </div>
                  {showDependencyInfo === dependency.id && (
                    <div className="mt-2 text-xs text-gray-600">
                      {dependency.description}
                    </div>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {filteredDependencies.length === 0 && (
        <div className="mt-4 flex items-center justify-center py-8 text-center bg-gray-50 rounded-md">
          <div>
            <FiAlertCircle className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500 text-sm">검색 결과가 없습니다.</p>
            <p className="text-gray-400 text-xs mt-1">
              다른 키워드로 검색해보세요.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default DependencyList;
