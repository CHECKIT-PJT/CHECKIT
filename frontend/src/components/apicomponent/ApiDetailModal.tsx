import { useState, useEffect } from 'react';
import {
  ApiDetail,
  PathVariable,
  RequestParam,
  ApiResponse,
  Dto,
  DtoItem,
} from '../../types/apiDocs';
import DtoEditor from './DtoEditor';
import { FaRegTrashAlt, FaRegSave } from 'react-icons/fa';
import { FiTrash } from 'react-icons/fi';
import DtoEditorReq from './DtoEditorReq';
import ApiHeader from './ApiHeader';
import {
  convertToApiSpecRequest,
  validateApiSpecRequest,
} from '../../utils/apiUtils';

interface ApiDetailModalProps {
  api: ApiDetail | null;
  onClose: () => void;
  onSave: (apiSpecRequest: any) => void;
  onDelete?: () => void;
}

// 빈 API 상세 정보
const blankApiDetail: ApiDetail = {
  id: null,
  apiName: '',
  endpoint: '',
  method: 'GET',
  category: '',
  description: '',
  statusCode: 200,
  header: '',
  pathVariables: [],
  requestParams: [],
  requestDto: { id: null, dtoName: '', fields: [], dtoType: 'REQUEST' },
  responseDto: { id: null, dtoName: '', fields: [], dtoType: 'RESPONSE' },
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
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const [newPathVar, setNewPathVar] = useState<PathVariable>({
    id: null,
    pathVariable: '',
    pathVariableDataType: 'string',
  });

  console.log('api', api);

  const [newParam, setNewParam] = useState<RequestParam>({
    id: null,
    requestParamName: '',
    requestParamDataType: 'string',
  });

  const [newHeader, setNewHeader] = useState<{ key: string; value: string }>({
    key: '',
    value: '',
  });

  const [statusCode, setStatusCode] = useState<number>(
    api?.statusCode ||
      (api?.responses && api.responses[0] ? api.responses[0].statusCode : 200)
  );

  const [statusDescription, setStatusDescription] = useState(
    api?.responses && api.responses[0]
      ? api.responses[0].responseDescription
      : 'OK'
  );

  useEffect(() => {
    if (api) {
      const dtoList = api.dtoList || [];

      // dtoList에서 REQUEST/RESPONSE dto 분리
      const requestDto = dtoList.find(dto => dto.dtoType === 'REQUEST') || {
        id: null,
        dtoName: '',
        fields: [],
        dtoType: 'REQUEST',
      };

      const responseDto = dtoList.find(dto => dto.dtoType === 'RESPONSE') || {
        id: null,
        dtoName: '',
        fields: [],
        dtoType: 'RESPONSE',
      };

      // form 상태에 request/responseDto를 dtoList로부터 명확히 주입
      setForm({
        ...api,
        requestDto,
        responseDto,
        pathVariables: api.pathVariables ?? [],
        requestParams: api.requestParams ?? [],
        responses: api.responses ?? [],
        header: api.header ?? '',
      });

      setShowDto(dtoList.length > 0);

      setStatusCode(api.statusCode ?? api.responses?.[0]?.statusCode ?? 200);
      setStatusDescription(api.responses?.[0]?.responseDescription ?? 'OK');
    } else {
      setForm(blankApiDetail);
      setShowDto(false);
      setStatusCode(200);
      setStatusDescription('OK');
    }
  }, [api]);

  const handleSave = () => {
    // 기본 유효성 검사
    const errors: string[] = [];

    if (!form.apiName.trim()) {
      errors.push('API 이름을 입력해주세요.');
    }

    if (!form.endpoint.trim()) {
      errors.push('Endpoint를 입력해주세요.');
    }

    if (!form.category.trim()) {
      errors.push('카테고리를 입력해주세요.');
    }

    // 유효성 검사 실패 시 에러 표시
    if (errors.length > 0) {
      setValidationErrors(errors);
      return;
    }

    // 에러가 없으면 초기화
    setValidationErrors([]);

    // 현재 응답 상태 설정
    const currentResponse: ApiResponse = {
      statusCode: statusCode,
      responseDescription: statusDescription || 'OK',
    };

    const otherResponses = form.responses
      ? form.responses.filter(r => r.statusCode !== currentResponse.statusCode)
      : [];

    // 폼 데이터 업데이트
    const updatedForm = {
      ...form,
      statusCode: statusCode,
      responses: [currentResponse, ...otherResponses],
    };

    // API 요청용 객체로 변환
    const apiSpecRequest = convertToApiSpecRequest(updatedForm);

    // 최종 유효성 검사
    if (!validateApiSpecRequest(apiSpecRequest)) {
      setValidationErrors(['API 정보를 다시 확인해주세요.']);
      return;
    }

    console.log('Saving form:', updatedForm);
    console.log('API Request:', apiSpecRequest);

    // API 요청 형식만 전달
    onSave(apiSpecRequest);
  };

  const handleAddPathVar = () => {
    if (newPathVar.pathVariable.trim() === '') return;
    setForm({
      ...form,
      pathVariables: [...form.pathVariables, { ...newPathVar }],
    });
    setNewPathVar({
      id: null,
      pathVariable: '',
      pathVariableDataType: 'string',
    });
    setShowAddPathVar(false);
  };

  const handleAddParam = () => {
    if (newParam.requestParamName.trim() === '') return;
    setForm({
      ...form,
      requestParams: [...form.requestParams, { ...newParam }],
    });
    setNewParam({
      id: null,
      requestParamName: '',
      requestParamDataType: 'string',
    });
    setShowAddParam(false);
  };

  const handleAddHeader = () => {
    if (newHeader.key.trim() === '' || newHeader.value.trim() === '') return;
    setForm({
      ...form,
      header: `${newHeader.key}: ${newHeader.value}`,
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

  const removeHeader = () => {
    setForm({ ...form, header: '' });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-[90%] max-h-[80vh] flex flex-col shadow-2xl overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-bold text-blue-700">
            {api && api.id ? 'API 수정 하기' : 'API 추가 하기'}
          </h2>
          <div className="flex gap-3">
            <button
              className="px-5 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-100 transition"
              onClick={onClose}
            >
              Cancel
            </button>

            {api && api.id !== 0 && onDelete && (
              <button
                className="px-5 py-2 bg-red-600 text-white rounded-lg font-medium shadow hover:bg-red-700 transition flex items-center gap-2"
                onClick={onDelete}
              >
                <FaRegTrashAlt className="w-4 h-4" />
                Delete
              </button>
            )}

            <button
              className="px-5 py-2 bg-blue-600 text-white rounded-lg font-medium shadow hover:bg-blue-700 transition flex items-center gap-2"
              onClick={handleSave}
            >
              <FaRegSave className="w-4 h-4" />
              Save
            </button>
          </div>
        </div>

        {validationErrors.length > 0 && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mx-6 mt-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  다음 오류를 확인해주세요:
                </h3>
                <div className="mt-2 text-sm text-red-700">
                  <ul className="list-disc pl-5 space-y-1">
                    {validationErrors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="p-6 overflow-y-auto flex-grow">
          <ApiHeader
            form={form}
            setForm={setForm}
            statusCode={statusCode}
            setStatusCode={setStatusCode}
            statusDescription={statusDescription}
            setStatusDescription={setStatusDescription}
          />

          <div className="grid grid-cols-1 gap-6 mb-6">
            <div className="flex border border-gray-200 rounded-lg shadow-sm">
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
                        Headers (1개만 설정 가능)
                      </span>
                      {!showAddHeader && !form.header && (
                        <button
                          className="text-xs text-blue-600 hover:text-blue-800 transition flex items-center gap-1"
                          onClick={() => setShowAddHeader(true)}
                        >
                          + Add
                        </button>
                      )}
                    </div>

                    {form.header ? (
                      <div className="space-y-1 mb-2">
                        <div className="flex justify-between items-center p-1.5 bg-gray-50 rounded text-xs">
                          <div className="flex gap-1 items-center overflow-hidden">
                            {(() => {
                              const [key, value] = form.header.split(': ');
                              return (
                                <>
                                  <span className="font-mono text-purple-600 truncate">
                                    {key}
                                  </span>
                                  <span className="text-gray-600">:</span>
                                  <span className="text-gray-700 truncate">
                                    {value}
                                  </span>
                                </>
                              );
                            })()}
                          </div>
                          <button
                            className="text-gray-400 hover:text-red-500 p-0.5 flex-shrink-0"
                            onClick={removeHeader}
                          >
                            <FiTrash className="w-3 h-3" />
                          </button>
                        </div>
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
                        requestDto: {
                          id: null,
                          dtoName: '',
                          fields: [],
                          dtoType: 'REQUEST',
                        },
                        responseDto: {
                          id: null,
                          dtoName: '',
                          fields: [],
                          dtoType: 'RESPONSE',
                        },
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
                dtoType={form.requestDto.dtoType || 'REQUEST'}
                onDtoTypeChange={type =>
                  setForm({
                    ...form,
                    requestDto: {
                      ...form.requestDto,
                      dtoType: type as 'REQUEST' | 'RESPONSE',
                    },
                  })
                }
                title="REQUEST DTO"
                dtoName={form.requestDto.dtoName}
                dtoItems={form.requestDto.fields}
                onDtoNameChange={name =>
                  setForm({
                    ...form,
                    requestDto: { ...form.requestDto, dtoName: name },
                  })
                }
                onDtoItemsChange={items =>
                  setForm({
                    ...form,
                    requestDto: { ...form.requestDto, fields: items },
                  })
                }
                isRequestBody={true}
                onUseDtoChange={useDto => {
                  if (!useDto) {
                    setForm({
                      ...form,
                      requestDto: {
                        id: null,
                        dtoName: '',
                        fields: [],
                        dtoType: 'REQUEST',
                      },
                    });
                  }
                }}
              />

              <DtoEditor
                title="RESPONSE DTO"
                dtoName={form.responseDto.dtoName}
                dtoItems={form.responseDto.fields}
                dtoType="RESPONSE"
                onDtoNameChange={name =>
                  setForm({
                    ...form,
                    responseDto: { ...form.responseDto, dtoName: name },
                  })
                }
                onDtoItemsChange={items =>
                  setForm({
                    ...form,
                    responseDto: { ...form.responseDto, fields: items },
                  })
                }
                onUseDtoChange={useDto => {
                  if (!useDto) {
                    setForm({
                      ...form,
                      responseDto: {
                        id: null,
                        dtoName: '',
                        fields: [],
                        dtoType: 'RESPONSE',
                      },
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
