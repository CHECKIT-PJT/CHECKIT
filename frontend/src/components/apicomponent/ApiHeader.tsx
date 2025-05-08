import { useState } from 'react';
import type { ApiDetail } from '../../types/ApiDoc';

interface ApiHeaderProps {
  form: ApiDetail;
  setForm: (form: ApiDetail) => void;
}

const methodOptions = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];

const commonStatusCodes = [
  { code: 200, description: 'OK' },
  { code: 201, description: 'Created' },
  { code: 400, description: 'Bad Request' },
  { code: 401, description: 'Unauthorized' },
  { code: 403, description: 'Forbidden' },
  { code: 404, description: 'Not Found' },
  { code: 500, description: 'Internal Server Error' },
];

const getStatusCodeColor = (code: number) => {
  if (code >= 200 && code < 300) return 'bg-green-100 text-green-800';
  if (code >= 400 && code < 500) return 'bg-yellow-100 text-yellow-800';
  if (code >= 500) return 'bg-red-100 text-red-800';
  return 'bg-gray-100 text-gray-800';
};

const methodColor = (method: string) => {
  const colors = {
    GET: 'bg-green-500',
    POST: 'bg-blue-500',
    PUT: 'bg-yellow-500',
    DELETE: 'bg-red-500',
    PATCH: 'bg-purple-500',
  };
  return colors[method as keyof typeof colors] || 'bg-gray-500';
};

const ApiHeader = ({ form, setForm }: ApiHeaderProps) => {
  const [showMethodDropdown, setShowMethodDropdown] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [statusCode, setStatusCode] = useState(200);
  const [statusDescription, setStatusDescription] = useState('OK');

  const selectStatusCode = (status: { code: number; description: string }) => {
    setStatusCode(status.code);
    setStatusDescription(status.description);
    setShowStatusDropdown(false);
  };

  const statusCodeColor = getStatusCodeColor(statusCode);

  return (
    <div className="">
      <div className="mb-6">
        <div className="text-lg font-semibold text-gray-700 mb-2">
          API Details
        </div>
        <input
          className="w-full border-b-2 border-blue-200 text-xl font-semibold mb-3 px-2 py-2 focus:outline-none focus:border-blue-500 transition-colors"
          value={form.apiName}
          onChange={e => setForm({ ...form, apiName: e.target.value })}
          placeholder="API Name"
        />
        <input
          className="w-full border-b-2 border-blue-100 text-base px-2 py-2 text-gray-700 focus:outline-none focus:border-blue-300 transition-colors"
          value={form.description}
          onChange={e => setForm({ ...form, description: e.target.value })}
          placeholder="API Description"
        />
      </div>
      <div className="flex-wrap gap-6 mb-6 p-4 bg-gray-50 rounded-xl text-sm flex items-center">
        <span className="font-semibold text-gray-700 mr-2">Method:</span>
        <div className="dropdown relative ">
          <span
            className={`px-4 py-2 rounded-lg text-white font-bold ${methodColor(form.method)} cursor-pointer`}
            onClick={() => setShowMethodDropdown(!showMethodDropdown)}
          >
            {form.method}
          </span>
          {showMethodDropdown && (
            <div className="absolute mt-1 bg-white shadow-lg rounded-lg z-10 border border-gray-200 py-1 min-w-[100px]">
              {methodOptions.map(method => (
                <div
                  key={method}
                  className={`px-4 py-2 cursor-pointer hover:bg-gray-100 ${
                    method === form.method ? 'font-bold bg-gray-50' : ''
                  }`}
                  onClick={() => {
                    setForm({ ...form, method });
                    setShowMethodDropdown(false);
                  }}
                >
                  {method}
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="flex items-center">
          <span className="font-semibold text-gray-700 mr-2">URL:</span>
          <input
            className="bg-blue-50 text-blue-600 font-mono px-3 py-2 rounded-lg border border-blue-100 focus:outline-none focus:border-blue-300"
            value={form.endpoint}
            onChange={e => setForm({ ...form, endpoint: e.target.value })}
            placeholder="/path/to/endpoint"
          />
        </div>

        <div className="flex items-center relative">
          <span className="font-semibold text-gray-700 mr-2">Status:</span>
          <div className="flex gap-2">
            <div
              className={`${statusCodeColor} px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:border-blue-300 w-20 text-center font-bold cursor-pointer flex justify-center items-center`}
              onClick={() => setShowStatusDropdown(!showStatusDropdown)}
            >
              {statusCode}
            </div>
            <input
              className="bg-gray-50 text-gray-700 px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:border-blue-300 w-40"
              value={statusDescription}
              onChange={e => setStatusDescription(e.target.value)}
              placeholder="OK"
              readOnly
            />
            {showStatusDropdown && (
              <div className="absolute top-full left-16 mt-1 bg-white shadow-lg rounded-lg z-10 border border-gray-200 py-1 w-64">
                {commonStatusCodes.map(status => (
                  <div
                    key={status.code}
                    className={`px-4 py-2 cursor-pointer hover:bg-gray-100 flex`}
                    onClick={() => selectStatusCode(status)}
                  >
                    <span
                      className={`px-2 rounded mr-2 ${getStatusCodeColor(status.code)}`}
                    >
                      {status.code}
                    </span>
                    <span>{status.description}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center">
          <span className="font-semibold text-gray-700 mr-2">Category:</span>
          <input
            className="bg-white text-gray-700 px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:border-blue-300 w-40"
            value={form.category}
            onChange={e =>
              setForm({ ...form, category: e.target.value.toUpperCase() })
            }
            placeholder="CATEGORY"
          />
        </div>
      </div>
    </div>
  );
};

export default ApiHeader;
