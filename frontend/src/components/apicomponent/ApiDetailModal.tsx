import { useState, useEffect } from 'react';
import type {
  ApiDetail,
  PathVariable,
  RequestParam,
  ApiResponse,
} from '../../types/ApiDoc';
import DtoEditor from './DtoEditor';
import { FaRegTrashAlt, FaRegSave } from 'react-icons/fa';
import { FiTrash } from 'react-icons/fi';
import DtoEditorReq from './DtoEditorReq';
import ApiHeader from './ApiHeader';

interface ApiDetailModalProps {
  api: ApiDetail | null;
  onClose: () => void;
  onSave: (api: ApiDetail) => void;
  onDelete?: () => void;
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

const emptyJsonBody = `{
  // Add your properties here
}`;

const ApiDetailModal = ({
  api,
  onClose,
  onSave,
  onDelete,
}: ApiDetailModalProps) => {
  const [tab, setTab] = useState<'RESOURCE' | 'HEADER' | 'QUERY'>('RESOURCE');
  const [form, setForm] = useState<ApiDetail>(api ?? blankApiDetail);
  const [showDto, setShowDto] = useState(false);
  const [showAddPathVar, setShowAddPathVar] = useState(false);
  const [showAddParam, setShowAddParam] = useState(false);
  const [showAddHeader, setShowAddHeader] = useState(false);

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

  const [statusCode, setStatusCode] = useState<number>(
    api?.responses && api.responses[0] ? api.responses[0].statusCode : 200
  );

  const [statusDescription, setStatusDescription] = useState(
    api?.responses && api.responses[0]
      ? api.responses[0].responseDescription
      : 'OK'
  );

  useEffect(() => {
    if (api) {
      const hasRequestDto = Boolean(
        api.requestDto &&
          (api.requestDto.dtoName || api.requestDto.dtoItems.length > 0)
      );
      const hasResponseDto = Boolean(
        api.responseDto &&
          (api.responseDto.dtoName || api.responseDto.dtoItems.length > 0)
      );
      setShowDto(hasRequestDto || hasResponseDto);
    }
  }, [api]);

  if (!form) return null;

  const handleSave = () => {
    let isValid = true;

    if (!isValid) return;

    const currentResponse: ApiResponse = {
      statusCode: statusCode,
      responseDescription: statusDescription || 'OK',
    };

    const otherResponses = form.responses
      ? form.responses.filter(r => r.statusCode !== currentResponse.statusCode)
      : [];

    const updatedForm = {
      ...form,
      responses: [currentResponse, ...otherResponses],
    };

    console.log('Saving form:', updatedForm);
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

  const removeHeader = (index: number) => {
    if (!form.header) return;
    const headers = form.header.split('\n');
    headers.splice(index, 1);
    setForm({ ...form, header: headers.join('\n') });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-[90%] flex flex-col shadow-2xl max-h-[90vh] overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-bold text-blue-700">
            {api ? 'API 수정 하기' : 'API 추가 하기'}
          </h2>
          <div className="flex gap-3">
            <button
              className="px-5 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-100 transition"
              onClick={onClose}
            >
              Cancel
            </button>

            <button
              className="px-5 py-2 bg-red-600 text-white rounded-lg font-medium shadow hover:bg-red-700 transition flex items-center gap-2"
              onClick={onDelete}
            >
              <FaRegTrashAlt className="w-4 h-4" />
              Delete
            </button>

            <button
              className="px-5 py-2 bg-blue-600 text-white rounded-lg font-medium shadow hover:bg-blue-700 transition flex items-center gap-2"
              onClick={handleSave}
            >
              <FaRegSave className="w-4 h-4" />
              Save
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto">
          <ApiHeader form={form} setForm={setForm} />

          <div className="grid grid-cols-4 gap-6 mb-6">
            {/* Left side takes 3 columns */}
            <div className="col-span-3 flex border border-gray-200 rounded-lg shadow-sm">
              {/* Left side tabs */}
              <div className="border-r border-gray-200">
                <div className="flex flex-col">
                  <button
                    className={`text-xs px-3 py-2 font-medium transition text-left focus:outline-none ${
                      tab === 'RESOURCE'
                        ? 'bg-blue-50 text-blue-600 border-l-2 border-blue-500'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                    onClick={() => setTab('RESOURCE')}
                  >
                    RESOURCE
                  </button>

                  <button
                    className={`text-xs px-3 py-2 font-medium transition text-left focus:outline-none ${
                      tab === 'HEADER'
                        ? 'bg-blue-50 text-blue-600 border-l-2 border-blue-500'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                    onClick={() => setTab('HEADER')}
                  >
                    HEADER
                  </button>

                  <button
                    className={`text-xs px-3 py-2 font-medium transition text-left focus:outline-none ${
                      tab === 'QUERY'
                        ? 'bg-blue-50 text-blue-600 border-l-2 border-blue-500'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                    onClick={() => setTab('QUERY')}
                  >
                    QUERY
                  </button>
                </div>
              </div>

              {/* Content area */}
              <div className="text-xs p-3 flex-1">
                {tab === 'RESOURCE' ? (
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium text-gray-700 text-xs">
                        KEY Parameters
                      </span>
                      {!showAddPathVar && (
                        <button
                          className="text-xs text-blue-600 hover:text-blue-800 transition flex items-center gap-1"
                          onClick={() => setShowAddPathVar(true)}
                        >
                          + Add
                        </button>
                      )}
                    </div>

                    {form.pathVariables.length > 0 ? (
                      <div className="space-y-4 mb-2">
                        {form.pathVariables.map((pathVar, index) => (
                          <div
                            key={index}
                            className="flex justify-between items-center p-1 bg-gray-50 rounded text-xs"
                          >
                            <div className="flex gap-2 items-center">
                              <span className=" text-blue-600">
                                {pathVar.pathVariable}
                              </span>
                              <span className="bg-gray-200 px-2 py-1 rounded">
                                {pathVar.pathVariableDataType}
                              </span>
                            </div>
                            <button
                              className="text-gray-400 hover:text-red-500 p-1"
                              onClick={() => removePathVar(index)}
                            >
                              <FiTrash className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-gray-400 text-xs italic" />
                    )}

                    {showAddPathVar && (
                      <div className="p-2 border border-blue-100 rounded bg-blue-50 mb-2 text-xs w-full">
                        <div className="flex gap-2 flex-wrap">
                          <input
                            className="p-2 border rounded flex-1 min-w-[120px] text-xs"
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
                            className="px-2 py-2 border rounded text-xs min-w-[100px]"
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
                          <div className="flex gap-2 ml-auto justify-between w-full">
                            <button
                              className="px-4 py-2 bg-gray-200 text-gray-700 rounded text-xs whitespace-nowrap"
                              onClick={() => setShowAddPathVar(false)}
                            >
                              Cancel
                            </button>
                            <button
                              className="px-6 py-2 bg-blue-500 text-white rounded text-xs whitespace-nowrap"
                              onClick={handleAddPathVar}
                            >
                              Add
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : tab === 'HEADER' ? (
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium text-gray-700 text-xs">
                        Headers
                      </span>
                      {!showAddHeader && (
                        <button
                          className="text-xs text-blue-600 hover:text-blue-800 transition flex items-center gap-1"
                          onClick={() => setShowAddHeader(true)}
                        >
                          + Add
                        </button>
                      )}
                    </div>

                    {form.header && form.header.length > 0 ? (
                      <div className="space-y-1 mb-2">
                        {form.header.split('\n').map((header, index) => {
                          const [key, value] = header.split(': ');
                          return (
                            <div
                              key={index}
                              className="flex justify-between items-center p-1.5 bg-gray-50 rounded text-xs"
                            >
                              <div className="flex gap-1 items-center overflow-hidden">
                                <span className="font-mono text-purple-600 truncate">
                                  {key}
                                </span>
                                <span className="text-gray-600">:</span>
                                <span className="text-gray-700 truncate">
                                  {value}
                                </span>
                              </div>
                              <button
                                className="text-gray-400 hover:text-red-500 p-0.5 flex-shrink-0"
                                onClick={() => removeHeader(index)}
                              >
                                <FiTrash className="w-3 h-3" />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-gray-400 text-xs italic" />
                    )}

                    {showAddHeader && (
                      <div className="p-2 border border-blue-100 rounded bg-blue-50 mb-2 text-xs w-full">
                        <div className="flex gap-2 flex-wrap">
                          <input
                            className="p-1.5 border rounded flex-1 text-xs"
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
                            className="p-1.5 border rounded flex-1 text-xs"
                            placeholder="Header Value"
                            value={newHeader.value}
                            onChange={e =>
                              setNewHeader({
                                ...newHeader,
                                value: e.target.value,
                              })
                            }
                          />
                          <div className="flex gap-2 ml-auto justify-between w-full">
                            <button
                              className="px-4 py-1 bg-gray-200 text-gray-700 rounded text-xs whitespace-nowrap"
                              onClick={() => setShowAddHeader(false)}
                            >
                              Cancel
                            </button>
                            <button
                              className="px-6 py-1 bg-blue-500 text-white rounded text-xs whitespace-nowrap"
                              onClick={handleAddHeader}
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
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium text-gray-700 text-xs">
                        Query Parameters
                      </span>
                      {!showAddParam && (
                        <button
                          className="text-xs text-blue-600 hover:text-blue-800 transition flex items-center gap-1"
                          onClick={() => setShowAddParam(true)}
                        >
                          + Add
                        </button>
                      )}
                    </div>

                    {form.requestParams.length > 0 ? (
                      <div className="space-y-2 mb-2">
                        {form.requestParams.map((param, index) => (
                          <div
                            key={index}
                            className="flex justify-between items-center p-1.5 bg-gray-50 rounded text-xs"
                          >
                            <div className="flex gap-2 items-center">
                              <span className="text-blue-600">
                                {param.requestParamName}
                              </span>
                              <span className="bg-gray-200 px-2 py-1 rounded">
                                {param.requestParamDataType}
                              </span>
                            </div>
                            <button
                              className="text-gray-400 hover:text-red-500 p-1"
                              onClick={() => removeParam(index)}
                            >
                              <FiTrash className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-gray-400 text-xs italic" />
                    )}

                    {showAddParam && (
                      <div className="p-2 border border-blue-100 rounded bg-blue-50 mb-2 text-xs w-full">
                        <div className="flex gap-2 flex-wrap">
                          <input
                            className="p-2 border rounded flex-1 text-xs"
                            placeholder="Parameter Name"
                            value={newParam.requestParamName}
                            onChange={e =>
                              setNewParam({
                                ...newParam,
                                requestParamName: e.target.value,
                              })
                            }
                          />
                          <select
                            className="px-2 py-2 border rounded text-xs"
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
                          <div className="flex gap-2 ml-auto justify-between w-full">
                            <button
                              className="px-4 py-2 bg-gray-200 text-gray-700 rounded text-xs whitespace-nowrap"
                              onClick={() => setShowAddParam(false)}
                            >
                              Cancel
                            </button>
                            <button
                              className="px-6 py-2 bg-blue-500 text-white rounded text-xs whitespace-nowrap"
                              onClick={handleAddParam}
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
          </div>
          <hr className="mb-4" />
          <div>
            <label className="inline-flex items-center cursor-pointer">
              <span className="ms-2 font-semibold text-gray-700 mr-5">
                DTO 설정하기
              </span>
              <div className="relative">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={showDto}
                  onChange={() => {
                    if (showDto) {
                      setForm({
                        ...form,
                        requestDto: { dtoName: '', dtoItems: [], dtoType: '' },
                        responseDto: { dtoName: '', dtoItems: [] },
                      });
                    }
                    setShowDto(!showDto);
                  }}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </div>
            </label>
          </div>
          {showDto && (
            <div className="grid grid-cols-2 gap-4 mt-6">
              <DtoEditorReq
                dtoType={form.requestDto.dtoType || ''}
                onDtoTypeChange={type =>
                  setForm({
                    ...form,
                    requestDto: { ...form.requestDto, dtoType: type },
                  })
                }
                title="REQUEST DTO"
                dtoName={form.requestDto.dtoName}
                dtoItems={form.requestDto.dtoItems}
                onDtoNameChange={name =>
                  setForm({
                    ...form,
                    requestDto: { ...form.requestDto, dtoName: name },
                  })
                }
                onDtoItemsChange={items =>
                  setForm({
                    ...form,
                    requestDto: { ...form.requestDto, dtoItems: items },
                  })
                }
                isRequestBody={true}
                onUseDtoChange={useDto => {
                  if (!useDto) {
                    setForm({
                      ...form,
                      requestDto: { dtoName: '', dtoItems: [], dtoType: '' },
                    });
                  }
                }}
              />

              <DtoEditor
                title="RESPONSE DTO"
                dtoName={form.responseDto.dtoName}
                dtoItems={form.responseDto.dtoItems}
                onDtoNameChange={name =>
                  setForm({
                    ...form,
                    responseDto: { ...form.responseDto, dtoName: name },
                  })
                }
                onDtoItemsChange={items =>
                  setForm({
                    ...form,
                    responseDto: { ...form.responseDto, dtoItems: items },
                  })
                }
                onUseDtoChange={useDto => {
                  if (!useDto) {
                    setForm({
                      ...form,
                      responseDto: { dtoName: '', dtoItems: [] },
                    });
                  }
                }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ApiDetailModal;
