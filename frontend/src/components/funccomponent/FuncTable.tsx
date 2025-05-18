import type { FuncListItem } from '../../types/FuncDoc';
import {
  FaAnglesUp,
  FaAngleUp,
  FaEquals,
  FaAngleDown,
  FaAnglesDown,
} from 'react-icons/fa6';
import { FaEquals as FaEqualsOld } from 'react-icons/fa';
import ActiveUsers from '../apicomponent/ActiveUsers';

interface User {
  id: string;
  name: string;
  color: string;
}

interface FuncTableProps {
  data: FuncListItem[];
  onRowClick: (func: FuncListItem) => void;
  selectedCategory: string;
  activeUsersByFunc: { [key: string]: User[] };
}

const FuncTable = ({
  data,
  onRowClick,
  selectedCategory,
  activeUsersByFunc,
}: FuncTableProps) => {
  const filteredData =
    selectedCategory === 'ALL'
      ? data
      : data.filter(func => func.category === selectedCategory);

  const priorityColors = {
    // HIGHEST: 'bg-red-600',
    // HIGH: 'bg-rose-500',
    // MEDIUM: 'bg-amber-500',
    // LOW: 'bg-emerald-500',
    // LOWEST: 'bg-teal-500',
  };

  const priorityIcons = {
    HIGHEST: <FaAnglesUp className="inline mr-1 text-red-500" />,
    HIGH: <FaAngleUp className="inline mr-1 text-rose-500" />,
    MEDIUM: <FaEqualsOld className="inline mr-1 text-amber-500" />,
    LOW: <FaAngleDown className="inline mr-1 text-emerald-500" />,
    LOWEST: <FaAnglesDown className="inline mr-1 text-teal-500" />,
  };

  return (
    <table className="w-full h-full border-collapse text-sm">
      <thead>
        <tr className="bg-gray-100 border-b-2 border-gray-300">
          <th className="py-3 px-2">ID</th>
          <th className="py-3 px-2">참여자</th>
          <th className="py-3 px-2">카테고리</th>
          <th className="py-3 px-2">기능</th>
          <th className="py-3 px-2">담당자</th>
          <th className="py-3 px-2">스토리포인트</th>
          <th className="py-3 px-2">우선순위</th>
        </tr>
      </thead>
      <tbody>
        {filteredData.map((func, index) => (
          <tr
            key={func.funcId}
            onClick={() => onRowClick(func)}
            className="cursor-pointer bg-white border-b border-gray-200 hover:bg-slate-50 transition"
          >
            <td className="py-4 px-2 text-center">{index + 1}</td>
            <td className="py-4 px-2 flex justify-center">
              <ActiveUsers
                users={activeUsersByFunc[func.funcId?.toString() || ''] || []}
                size="small"
              />
            </td>
            <td className="py-4 px-2 text-center">
              <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-xs">
                {func.category.toUpperCase()}
              </span>
            </td>
            <td className="py-4 px-2">{func.funcName}</td>
            <td className="py-4 px-2 text-center">{func.assignee}</td>
            <td className="py-4 px-2 text-center">{func.storyPoints}</td>
            <td className="py-4 px-2 text-center">
              <span className="flex items-center justify-center">
                {priorityIcons[func.priority as keyof typeof priorityIcons]}
                {func.priority}
              </span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default FuncTable;
