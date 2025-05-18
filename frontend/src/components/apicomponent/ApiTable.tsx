import type { ApiDocListItem } from '../../types/apiDocs';
import ActiveUsers from './ActiveUsers';

interface User {
  id: string;
  name: string;
  color: string;
}

interface ApiTableProps {
  data: ApiDocListItem[];
  onRowClick: (api: ApiDocListItem) => void;
  selectedDomain: string;
  activeUsersByApi: { [key: string]: User[] };
}

const ApiTable = ({
  data,
  onRowClick,
  selectedDomain,
  activeUsersByApi,
}: ApiTableProps) => {
  const filteredData =
    selectedDomain === 'ALL'
      ? data
      : data.filter(api => api.category === selectedDomain);

  return (
    <table className="w-full h-full border-collapse">
      <thead>
        <tr className="bg-gray-100 border-b-2 border-gray-300">
          <th className="py-3 px-2 text-sm">ID</th>
          <th className="py-3 px-2 text-sm">참여자</th>
          <th className="py-3 px-2 text-sm">API명</th>
          <th className="py-3 px-2 text-sm">경로</th>
          <th className="py-3 px-2 text-sm">메소드</th>
          <th className="py-3 px-2 text-sm">카테고리</th>
          <th className="py-3 px-2 text-sm">설명</th>
        </tr>
      </thead>
      <tbody>
        {filteredData.map((api, index) => (
          <tr
            key={api.apiSpecId ?? `api-${index}`}
            className="cursor-pointer bg-white border-b border-gray-200 hover:bg-slate-50 transition"
            onClick={() => onRowClick(api)}
          >
            <td className="py-4 px-2 text-center text-sm">{index + 1}</td>
            <td className="py-4 px-2 flex justify-center">
              <ActiveUsers
                users={activeUsersByApi[api.apiSpecId?.toString() || ''] || []}
                size="small"
              />
            </td>
            <td className="py-4 px-2 text-sm">{api.apiName}</td>
            <td className="py-4 px-2 text-sm font-mono">{api.endpoint}</td>
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
            <td className="py-4 px-2 text-center text-sm">
              <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-xs">
                {api.category.toUpperCase()}
              </span>
            </td>
            <td className="py-4 px-2 text-sm text-gray-600">
              {api.description}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default ApiTable;
