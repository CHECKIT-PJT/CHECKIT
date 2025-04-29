import { useState, useEffect } from 'react';
import type {
  ApiDetail,
  PathVariable,
  RequestParam,
  ApiResponse,
  DtoItem,
} from '../../types/ApiDoc';

interface ApiDetailModalProps {
  api: ApiDetail | null;
  onClose: () => void;
  onSave: (api: ApiDetail) => void;
}

const blankApiDetail: ApiDetail = {
  apiName: '',
  endpoint: '',
  method: 'GET',
  category: '',
  description: '',
  header: '',
  pathVariables: [],
  requestParams: [],
  requestDto: { dtoName: '', dtoItems: [] },
  responseDto: { dtoName: '', dtoItems: [] },
  responses: [],
};

const dataTypes = [
  'string',
  'number',
  'boolean',
  'object',
  'array',
  'integer',
  'date',
  'datetime',
  'file',
  'email',
  'uuid',
  'enum',
];

const commonStatusCodes = [
  { code: 200, description: 'OK' },
  { code: 201, description: 'Created' },
  { code: 204, description: 'No Content' },
  { code: 400, description: 'Bad Request' },
  { code: 401, description: 'Unauthorized' },
  { code: 403, description: 'Forbidden' },
  { code: 404, description: 'Not Found' },
  { code: 422, description: 'Unprocessable Entity' },
  { code: 500, description: 'Internal Server Error' },
];

const emptyJsonBody = `{
  // Add your properties here
}`;

const ApiDetailModal = ({ api, onClose, onSave }: ApiDetailModalProps) => {
  const [tab, setTab] = useState<'RESOURCE' | 'QUERY' | 'HEADER'>('RESOURCE');
  const [form, setForm] = useState<ApiDetail>(api ?? blankApiDetail);

  const [showMethodDropdown, setShowMethodDropdown] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [showAddPathVar, setShowAddPathVar] = useState(false);
  const [showAddParam, setShowAddParam] = useState(false);
  const [showAddHeader, setShowAddHeader] = useState(false);
  const [showAddRequestDto, setShowAddRequestDto] = useState(false);
  const [showAddResponseDto, setShowAddResponseDto] = useState(false);

  const [newPathVar, setNewPathVar] = useState<PathVariable>({
    pathVariable: '',
    pathVariableDataType: 'string',
  });

  const [newParam, setNewParam] = useState<RequestParam>({
    requestParamName: '',
    requestParamDataType: 'string',
  });

  const [newHeader, setNewHeader] = useState<{ key: string; value: string }>({
    key: '',
    value: '',
  });

  const [newRequestDtoItem, setNewRequestDtoItem] = useState<DtoItem>({
    dtoItemName: '',
    dataTypeName: 'string',
    isList: false,
  });

  const [newResponseDtoItem, setNewResponseDtoItem] = useState<DtoItem>({
    dtoItemName: '',
    dataTypeName: 'string',
    isList: false,
  });

  const [statusCode, setStatusCode] = useState<number>(
    api?.responses && api.responses[0] ? api.responses[0].statusCode : 200
  );

  const [statusDescription, setStatusDescription] = useState(
    api?.responses && api.responses[0]
      ? api.responses[0].responseDescription
      : 'OK'
  );

  const [requestJson, setRequestJson] = useState(
    api?.responses && api.responses[0]
      ? api.responses[0].responseJson || emptyJsonBody
      : emptyJsonBody
  );

  const [responseJson, setResponseJson] = useState(
    api?.responses && api.responses[0]
      ? api.responses[0].responseJson || emptyJsonBody
      : emptyJsonBody
  );

  const [requestJsonError, setRequestJsonError] = useState('');
  const [responseJsonError, setResponseJsonError] = useState('');

  useEffect(() => {
    if (api) {
      setForm(api);
      setStatusCode(
        api.responses && api.responses[0] ? api.responses[0].statusCode : 200
      );
      setStatusDescription(
        api.responses && api.responses[0]
          ? api.responses[0].responseDescription
          : 'OK'
      );
      setRequestJson(
        api.responses && api.responses[0]
          ? api.responses[0].responseJson || emptyJsonBody
          : emptyJsonBody
      );
      setResponseJson(
        api.responses && api.responses[0]
          ? api.responses[0].responseJson || emptyJsonBody
          : emptyJsonBody
      );
    } else {
      setForm(blankApiDetail);
      setStatusCode(200);
      setStatusDescription('OK');
      setRequestJson(emptyJsonBody);
      setResponseJson(emptyJsonBody);
    }
  }, [api]);

  if (!form) return null;

  const methodColors = {
    GET: 'bg-emerald-500',
    POST: 'bg-sky-500',
    PUT: 'bg-blue-500',
    DELETE: 'bg-rose-500',
    PATCH: 'bg-amber-500',
  };

  const methodOptions = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];

  const methodColor =
    methodColors[form.method as keyof typeof methodColors] || 'bg-slate-500';

  const validateJson = (jsonStr: string): boolean => {
    if (!jsonStr || !jsonStr.trim()) return true;

    try {
      const jsonWithoutComments = jsonStr.replace(/\/\/.*$/gm, '');
      JSON.parse(jsonWithoutComments);
      return true;
    } catch (e) {
      return false;
    }
  };

  const handleSave = () => {
    let isValid = true;

    if (!validateJson(requestJson)) {
      setRequestJsonError('Invalid JSON format');
      isValid = false;
    } else {
      setRequestJsonError('');
    }

    if (!validateJson(responseJson)) {
      setResponseJsonError('Invalid JSON format');
      isValid = false;
    } else {
      setResponseJsonError('');
    }

    if (!isValid) return;

    const currentResponse: ApiResponse = {
      statusCode: statusCode,
      responseDescription: statusDescription || 'OK',
      responseJson: responseJson || '',
    };

    const otherResponses = form.responses
      ? form.responses.filter(r => r.statusCode !== currentResponse.statusCode)
      : [];

    const updatedForm = {
      ...form,
      responses: [currentResponse, ...otherResponses],
    };

    console.log('Saving form:', updatedForm); // Debug log
    onSave(updatedForm);
  };

  const handleAddPathVar = () => {
    if (newPathVar.pathVariable.trim() === '') return;
    setForm({
      ...form,
      pathVariables: [...form.pathVariables, { ...newPathVar }],
    });
    setNewPathVar({ pathVariable: '', pathVariableDataType: 'string' });
    setShowAddPathVar(false);
  };

  const handleAddParam = () => {
    if (newParam.requestParamName.trim() === '') return;
    setForm({
      ...form,
      requestParams: [...form.requestParams, { ...newParam }],
    });
    setNewParam({ requestParamName: '', requestParamDataType: 'string' });
    setShowAddParam(false);
  };

  const handleAddRequestDtoItem = () => {
    if (newRequestDtoItem.dtoItemName.trim() === '') return;
    setForm({
      ...form,
      requestDto: {
        ...form.requestDto,
        dtoItems: [...form.requestDto.dtoItems, { ...newRequestDtoItem }],
      },
    });
    setNewRequestDtoItem({
      dtoItemName: '',
      dataTypeName: 'string',
      isList: false,
    });
    setShowAddRequestDto(false);
  };

  const handleAddResponseDtoItem = () => {
    if (newResponseDtoItem.dtoItemName.trim() === '') return;
    setForm({
      ...form,
      responseDto: {
        ...form.responseDto,
        dtoItems: [...form.responseDto.dtoItems, { ...newResponseDtoItem }],
      },
    });
    setNewResponseDtoItem({
      dtoItemName: '',
      dataTypeName: 'string',
      isList: false,
    });
    setShowAddResponseDto(false);
  };

  const handleAddHeader = () => {
    if (newHeader.key.trim() === '' || newHeader.value.trim() === '') return;
    setForm({
      ...form,
      header: form.header
        ? `${form.header}\n${newHeader.key}: ${newHeader.value}`
        : `${newHeader.key}: ${newHeader.value}`,
    });
    setNewHeader({ key: '', value: '' });
    setShowAddHeader(false);
  };

  const removePathVar = (index: number) => {
    const newPathVars = [...form.pathVariables];
    newPathVars.splice(index, 1);
    setForm({ ...form, pathVariables: newPathVars });
  };

  const removeParam = (index: number) => {
    const newParams = [...form.requestParams];
    newParams.splice(index, 1);
    setForm({ ...form, requestParams: newParams });
  };

  const removeRequestDtoItem = (index: number) => {
    const newItems = [...form.requestDto.dtoItems];
    newItems.splice(index, 1);
    setForm({
      ...form,
      requestDto: {
        ...form.requestDto,
        dtoItems: newItems,
      },
    });
  };

  const removeResponseDtoItem = (index: number) => {
    const newItems = [...form.responseDto.dtoItems];
    newItems.splice(index, 1);
    setForm({
      ...form,
      responseDto: {
        ...form.responseDto,
        dtoItems: newItems,
      },
    });
  };

  const removeHeader = (index: number) => {
    if (!form.header) return;
    const headers = form.header.split('\n');
    headers.splice(index, 1);
    setForm({ ...form, header: headers.join('\n') });
  };

  const formatJson = (jsonStr: string, setJson: (value: string) => void) => {
    try {
      const jsonWithoutComments = jsonStr.replace(/\/\/.*$/gm, '');
      const obj = JSON.parse(jsonWithoutComments);
      setJson(JSON.stringify(obj, null, 2));
    } catch (e) {
      // If invalid JSON, do nothing
    }
  };

  const getStatusCodeColor = (code: number) => {
    const codeStr = String(code || 200);

    if (!codeStr || codeStr.length === 0) {
      return 'bg-gray-100 text-gray-700';
    }

    const firstDigit = codeStr.charAt(0);
    switch (firstDigit) {
      case '2':
        return 'bg-green-100 text-green-700';
      case '3':
        return 'bg-blue-100 text-blue-700';
      case '4':
        return 'bg-amber-100 text-amber-700';
      case '5':
        return 'bg-rose-100 text-rose-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const selectStatusCode = (status: { code: number; description: string }) => {
    setStatusCode(status.code);
    setStatusDescription(status.description);
    setShowStatusDropdown(false);
  };

  const statusCodeColor = getStatusCodeColor(statusCode);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-4/5 max-w-6xl flex flex-col shadow-2xl max-h-[90vh] overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-bold text-blue-700">
            {api ? 'Edit API Details' : 'Add New API'}
          </h2>
          <div className="flex gap-3">
            <button
              className="px-5 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-100 transition"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              className="px-5 py-2 bg-blue-600 text-white rounded-lg font-medium shadow hover:bg-blue-700 transition flex items-center gap-2"
              onClick={handleSave}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                <polyline points="17 21 17 13 7 13 7 21"></polyline>
                <polyline points="7 3 7 8 15 8"></polyline>
              </svg>
              {api ? 'Update' : 'Save'}
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto">
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

          <div className="flex flex-wrap gap-6 mb-6 p-4 bg-gray-50 rounded-xl">
            <div className="flex items-center relative">
              <span className="font-semibold text-gray-700 mr-2">Method:</span>
              <div className="dropdown relative">
                <span
                  className={`px-4 py-2 rounded-lg text-white font-bold ${methodColor} cursor-pointer`}
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
              <span className="font-semibold text-gray-700 mr-2">
                Category:
              </span>
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

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <div className="flex mb-1">
                <button
                  className={`px-6 py-2 font-medium rounded-t-lg transition focus:outline-none ${
                    tab === 'RESOURCE'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  onClick={() => setTab('RESOURCE')}
                >
                  RESOURCE
                </button>
                <button
                  className={`px-6 py-2 font-medium rounded-t-lg transition focus:outline-none ${
                    tab === 'QUERY'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  onClick={() => setTab('QUERY')}
                >
                  QUERY
                </button>
                <button
                  className={`px-6 py-2 font-medium rounded-t-lg transition focus:outline-none ${
                    tab === 'HEADER'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  onClick={() => setTab('HEADER')}
                >
                  HEADER
                </button>
              </div>

              <div className="border rounded-lg rounded-tl-none bg-white p-4 shadow-sm">
                {tab === 'RESOURCE' ? (
                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <span className="font-semibold text-gray-700">
                        KEY Parameters
                      </span>
                      <button
                        className="text-xs bg-blue-50 text-blue-600 px-3 py-1 rounded-lg hover:bg-blue-100 transition flex items-center gap-1"
                        onClick={() => setShowAddPathVar(!showAddPathVar)}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <line x1="12" y1="5" x2="12" y2="19"></line>
                          <line x1="5" y1="12" x2="19" y2="12"></line>
                        </svg>
                        Add
                      </button>
                    </div>

                    {form.pathVariables.length > 0 ? (
                      <div className="space-y-2 mb-3">
                        {form.pathVariables.map((pathVar, index) => (
                          <div
                            key={index}
                            className="flex justify-between items-center p-2 bg-gray-50 rounded"
                          >
                            <div className="flex gap-2 items-center">
                              <span className="font-mono text-blue-600">
                                {pathVar.pathVariable}
                              </span>
                              <span className="text-xs bg-gray-200 px-2 py-1 rounded">
                                {pathVar.pathVariableDataType}
                              </span>
                            </div>
                            <div className="flex gap-2">
                              <button
                                className="text-gray-500 hover:text-red-500"
                                onClick={() => removePathVar(index)}
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="16"
                                  height="16"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                >
                                  <path d="M3 6h18"></path>
                                  <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"></path>
                                </svg>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-gray-400 text-sm italic mb-3">
                        No parameters defined
                      </div>
                    )}

                    {showAddPathVar && (
                      <div className="p-3 border border-blue-100 rounded-lg bg-blue-50 mb-3">
                        <div className="grid grid-cols-2 gap-2 mb-2">
                          <input
                            className="p-2 border rounded"
                            placeholder="Name"
                            value={newPathVar.pathVariable}
                            onChange={e =>
                              setNewPathVar({
                                ...newPathVar,
                                pathVariable: e.target.value,
                              })
                            }
                          />
                          <select
                            className="p-2 border rounded"
                            value={newPathVar.pathVariableDataType}
                            onChange={e =>
                              setNewPathVar({
                                ...newPathVar,
                                pathVariableDataType: e.target.value,
                              })
                            }
                          >
                            {dataTypes.map(type => (
                              <option key={type} value={type}>
                                {type}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="flex justify-between items-center mt-2">
                          <div className="flex gap-2">
                            <button
                              className="px-3 py-1 bg-gray-200 text-gray-700 rounded"
                              onClick={() => setShowAddPathVar(false)}
                            >
                              Cancel
                            </button>
                            <button
                              className="px-3 py-1 bg-blue-500 text-white rounded"
                              onClick={handleAddPathVar}
                            >
                              Add
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : tab === 'QUERY' ? (
                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <span className="font-semibold text-gray-700">
                        NORMAL Parameters
                      </span>
                      <button
                        className="text-xs bg-blue-50 text-blue-600 px-3 py-1 rounded-lg hover:bg-blue-100 transition flex items-center gap-1"
                        onClick={() => setShowAddParam(!showAddParam)}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <line x1="12" y1="5" x2="12" y2="19"></line>
                          <line x1="5" y1="12" x2="19" y2="12"></line>
                        </svg>
                        Add
                      </button>
                    </div>

                    {form.requestParams.length > 0 ? (
                      <div className="space-y-2 mb-3">
                        {form.requestParams.map((param, index) => (
                          <div
                            key={index}
                            className="flex justify-between items-center p-2 bg-gray-50 rounded"
                          >
                            <div className="flex gap-2 items-center">
                              <span className="font-mono text-green-600">
                                {param.requestParamName}
                              </span>
                              <span className="text-xs bg-gray-200 px-2 py-1 rounded">
                                {param.requestParamDataType}
                              </span>
                            </div>
                            <div className="flex gap-2">
                              <button
                                className="text-gray-500 hover:text-red-500"
                                onClick={() => removeParam(index)}
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="16"
                                  height="16"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                >
                                  <path d="M3 6h18"></path>
                                  <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"></path>
                                </svg>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-gray-400 text-sm italic mb-3">
                        No parameters defined
                      </div>
                    )}

                    {showAddParam && (
                      <div className="p-3 border border-blue-100 rounded-lg bg-blue-50 mb-3">
                        <div className="grid grid-cols-2 gap-2 mb-2">
                          <input
                            className="p-2 border rounded"
                            placeholder="Name"
                            value={newParam.requestParamName}
                            onChange={e =>
                              setNewParam({
                                ...newParam,
                                requestParamName: e.target.value,
                              })
                            }
                          />
                          <select
                            className="p-2 border rounded"
                            value={newParam.requestParamDataType}
                            onChange={e =>
                              setNewParam({
                                ...newParam,
                                requestParamDataType: e.target.value,
                              })
                            }
                          >
                            {dataTypes.map(type => (
                              <option key={type} value={type}>
                                {type}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="flex justify-between items-center mt-2">
                          <div className="flex gap-2">
                            <button
                              className="px-3 py-1 bg-gray-200 text-gray-700 rounded"
                              onClick={() => setShowAddParam(false)}
                            >
                              Cancel
                            </button>
                            <button
                              className="px-3 py-1 bg-blue-500 text-white rounded"
                              onClick={handleAddParam}
                            >
                              Add
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <span className="font-semibold text-gray-700">
                        Headers
                      </span>
                      <button
                        className="text-xs bg-blue-50 text-blue-600 px-3 py-1 rounded-lg hover:bg-blue-100 transition flex items-center gap-1"
                        onClick={() => setShowAddHeader(!showAddHeader)}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <line x1="12" y1="5" x2="12" y2="19"></line>
                          <line x1="5" y1="12" x2="19" y2="12"></line>
                        </svg>
                        Add
                      </button>
                    </div>

                    {form.header && form.header.length > 0 ? (
                      <div className="space-y-2 mb-3">
                        {form.header.split('\n').map((header, index) => {
                          const [key, value] = header.split(': ');
                          return (
                            <div
                              key={index}
                              className="flex justify-between items-center p-2 bg-gray-50 rounded"
                            >
                              <div className="flex gap-2 items-center">
                                <span className="font-mono text-purple-600">
                                  {key}
                                </span>
                                <span className="text-gray-600">:</span>
                                <span className="text-gray-700">{value}</span>
                              </div>
                              <button
                                className="text-gray-500 hover:text-red-500"
                                onClick={() => removeHeader(index)}
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="16"
                                  height="16"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                >
                                  <path d="M3 6h18"></path>
                                  <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"></path>
                                </svg>
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-gray-400 text-sm italic mb-3">
                        No headers defined
                      </div>
                    )}

                    {showAddHeader && (
                      <div className="p-3 border border-blue-100 rounded-lg bg-blue-50 mb-3">
                        <div className="grid grid-cols-2 gap-2 mb-2">
                          <input
                            className="p-2 border rounded"
                            placeholder="Header Key"
                            value={newHeader.key}
                            onChange={e =>
                              setNewHeader({
                                ...newHeader,
                                key: e.target.value,
                              })
                            }
                          />
                          <input
                            className="p-2 border rounded"
                            placeholder="Header Value"
                            value={newHeader.value}
                            onChange={e =>
                              setNewHeader({
                                ...newHeader,
                                value: e.target.value,
                              })
                            }
                          />
                        </div>
                        <div className="flex justify-between items-center mt-2">
                          <div className="flex gap-2">
                            <button
                              className="px-3 py-1 bg-gray-200 text-gray-700 rounded"
                              onClick={() => setShowAddHeader(false)}
                            >
                              Cancel
                            </button>
                            <button
                              className="px-3 py-1 bg-blue-500 text-white rounded"
                              onClick={handleAddHeader}
                            >
                              Add
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-6">
              <div className="border rounded-xl p-4 bg-white shadow-sm">
                <div className="flex justify-between items-center mb-3">
                  <span className="font-semibold text-gray-700">
                    REQUEST BODY
                  </span>
                  <div className="flex gap-2">
                    <button
                      className="text-xs bg-gray-50 text-gray-600 px-3 py-1 rounded-lg hover:bg-gray-100 transition"
                      onClick={() => formatJson(requestJson, setRequestJson)}
                    >
                      Format
                    </button>
                  </div>
                </div>

                <div className="mb-2">
                  <textarea
                    className={`w-full h-48 font-mono text-sm p-3 border rounded-lg ${requestJsonError ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
                    value={requestJson}
                    onChange={e => {
                      setRequestJson(e.target.value);
                      if (requestJsonError) {
                        if (validateJson(e.target.value)) {
                          setRequestJsonError('');
                        }
                      }
                    }}
                    placeholder="Enter JSON request body"
                    spellCheck="false"
                  />
                  {requestJsonError && (
                    <div className="text-red-500 text-xs mt-1">
                      {requestJsonError}
                    </div>
                  )}
                </div>
              </div>

              <div className="border rounded-xl p-4 bg-white shadow-sm">
                <div className="flex justify-between items-center mb-3">
                  <span className="font-semibold text-gray-700">
                    RESPONSE BODY
                  </span>
                  <div className="flex gap-2">
                    <button
                      className="text-xs bg-gray-50 text-gray-600 px-3 py-1 rounded-lg hover:bg-gray-100 transition"
                      onClick={() => formatJson(responseJson, setResponseJson)}
                    >
                      Format
                    </button>
                  </div>
                </div>

                <div className="mb-2">
                  <textarea
                    className={`w-full h-48 font-mono text-sm p-3 border rounded-lg ${responseJsonError ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
                    value={responseJson}
                    onChange={e => {
                      setResponseJson(e.target.value);
                      if (responseJsonError) {
                        if (validateJson(e.target.value)) {
                          setResponseJsonError('');
                        }
                      }
                    }}
                    placeholder="Enter JSON response body"
                    spellCheck="false"
                  />
                  {responseJsonError && (
                    <div className="text-red-500 text-xs mt-1">
                      {responseJsonError}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApiDetailModal;
