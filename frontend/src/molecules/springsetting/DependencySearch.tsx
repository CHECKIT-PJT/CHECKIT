import React from "react";
import { FiSearch } from "react-icons/fi";
import Badge from "../../components/springsetting/Badge";

interface DependencySearchProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCount: number;
}

const DependencySearch: React.FC<DependencySearchProps> = ({
  searchQuery,
  setSearchQuery,
  selectedCount,
}) => {
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-medium text-gray-900">의존성 추가</h2>
        <Badge variant="primary">{selectedCount}개 선택됨</Badge>
      </div>

      {/* 검색 필드 */}
      <div className="relative mb-4">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <FiSearch className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="의존성 검색..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>
    </div>
  );
};

export default DependencySearch;
