import type { ApiDocListItem } from '../../types/apiDocs';

interface ApiTableProps {
  data: ApiDocListItem[];
  onRowClick: (api: ApiDocListItem) => void;
  selectedDomain: string;
}

const ApiTable = ({ data, onRowClick, selectedDomain }: ApiTableProps) => {
  // Filter data based on selected domain
  const filteredData =
    selectedDomain === 'ALL'
      ? data
      : data.filter(api => api.category === selectedDomain);

  return (
    <table className="w-full h-full border-collapse">
      <thead>
        <tr className="bg-gray-100 border-b-2 border-gray-300">
          <th className="py-3 px-2 text-sm">ID</th>
          <th className="py-3 px-2 text-sm">API명</th>
          <th className="py-3 px-2 text-sm">경로</th>
          <th className="py-3 px-2 text-sm">메소드</th>
          <th className="py-3 px-2 text-sm">카테고리</th>
          <th className="py-3 px-2 text-sm ">설명</th>
        </tr>
      </thead>
      <tbody>
        {filteredData.map((api, index) => (
          <tr
            key={api.apiSpecId ?? `api-${index}`}
            className="cursor-pointer bg-white border-b border-gray-200 hover:bg-slate-50 transition s"
            onClick={() => onRowClick(api)}
          >
            <td className="py-4 px-2 text-center text-sm">{api.apiSpecId}</td>
            <td className="py-4 px-2 text-center text-sm">{api.apiName}</td>
            <td className="py-4 px-2 text-sm">{api.endpoint}</td>
            <td className="py-4 px-2 text-center text-sm">
              <span
                className={`px-3 py-1 rounded text-white font-bold text-xs ${
                  api.method === 'GET'
                    ? 'bg-emerald-500'
                    : api.method === 'POST'
                      ? 'bg-sky-500'
                      : api.method === 'PUT'
                        ? 'bg-amber-500'
                        : api.method === 'DELETE'
                          ? 'bg-rose-500'
                          : 'bg-slate-400'
                }`}
              >
                {api.method}
              </span>
            </td>
            <td className="py-4 px-2 text-center">
              <span className="px-4 py-2 rounded font-bold bg-white text-cyan-900 text-sm">
                {api.category}
              </span>
            </td>
            <td
              className="py-4 px-2 truncate text-sm max-w-[200px]"
              title={api.description}
            >
              {api.description.length > 30
                ? `${api.description.substring(0, 30)}...`
                : api.description}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default ApiTable;
