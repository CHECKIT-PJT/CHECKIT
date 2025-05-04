import type { FuncListItem } from '../../types/FuncDoc';

interface FuncTableProps {
  data: FuncListItem[];
  onRowClick: (func: FuncListItem) => void;
  selectedCategory: string;
}

const FuncTable = ({ data, onRowClick, selectedCategory }: FuncTableProps) => {
  // Filter data based on selected category
  const filteredData =
    selectedCategory === 'ALL'
      ? data
      : data.filter(func => func.category === selectedCategory);

  // Priority color mapping
  const priorityColors = {
    HIGH: 'bg-rose-500',
    MEDIUM: 'bg-amber-500',
    LOW: 'bg-emerald-500',
  };

  return (
    <table className="w-full h-full border-collapse text-sm">
      <thead>
        <tr className="bg-gray-100 border-b-2 border-gray-300">
          <th className="py-3 px-2">ID</th>
          <th className="py-3 px-2">카테고리</th>
          <th className="py-3 px-2">기능</th>
          <th className="py-3 px-2">담당자</th>
          <th className="py-3 px-2">스토리포인트</th>
          <th className="py-3 px-2">우선순위</th>
        </tr>
      </thead>
      <tbody>
        {filteredData.map(func => (
          <tr
            key={func.funcId}
            className="cursor-pointer bg-white border-b border-gray-200 hover:bg-slate-50 transition"
            onClick={() => onRowClick(func)}
          >
            <td className="py-4 px-2 text-center">{func.funcId}</td>
            <td className="py-4 px-2 text-center">
              <span className="px-4 py-2 rounded font-bold bg-white text-cyan-900">
                {func.category}
              </span>
            </td>
            <td className="py-4 px-2 text-center">{func.funcName}</td>
            <td className="py-4 px-2 text-center">{func.assignee}</td>
            <td className="py-4 px-2 text-center">{func.storyPoints}</td>
            <td className="py-4 px-2 text-center">
              <span
                className={`px-3 py-1 rounded text-white font-bold text-sm ${
                  priorityColors[
                    func.priority as keyof typeof priorityColors
                  ] || 'bg-slate-400'
                }`}
              >
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
