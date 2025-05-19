import { useState, useEffect, useRef } from 'react';
import {
  ApiDetail,
  PathVariable,
  RequestParam,
  ApiResponse,
  Dto,
  DtoItem,
  ApiSpecRequest,
  QueryStringRequest,
} from '../../types/apiDocs';
import DtoEditor from './DtoEditor';
import { FaRegTrashAlt, FaRegSave } from 'react-icons/fa';
import { FiTrash, FiEdit2 } from 'react-icons/fi';
import DtoEditorReq from './DtoEditorReq';
import ApiHeader from './ApiHeader';
import {
  convertToApiSpecRequest,
  validateApiSpecRequest,
} from '../../utils/apiUtils';
import ActiveUsers from './ActiveUsers';
import RemoteCursor from '../cursor/RemoteCursor';
import type { RemoteCursorData } from '../../types/cursor';
import { PiList } from 'react-icons/pi';

interface User {
  id: string;
  name: string;
  color: string;
}

interface ApiDetailModalProps {
  api: ApiDetail | null;
  onClose: () => void;
  onSave: (apiSpecRequest: ApiSpecRequest) => void;
  onDelete?: () => void;
  activeUsers: User[];
  onMouseMove?: (e: React.MouseEvent<HTMLDivElement>) => void;
  remoteCursors: { [key: string]: RemoteCursorData };
  onSpecUpdate: (updatedSpec: Partial<ApiDetail>) => void;
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
  queryStrings: [],
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
  activeUsers,
  onMouseMove,
  remoteCursors,
  onSpecUpdate,
}: ApiDetailModalProps) => {
  const [tab, setTab] = useState<'RESOURCE' | 'HEADER' | 'QUERY'>('RESOURCE');
  const [form, setForm] = useState<ApiDetail>(api ?? blankApiDetail);
  const [showDto, setShowDto] = useState(false);
  const [showAddPathVar, setShowAddPathVar] = useState(false);
  const [showAddParam, setShowAddParam] = useState(false);
  const [showAddHeader, setShowAddHeader] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // DTO Editor states
  const [showAddRequestDto, setShowAddRequestDto] = useState(false);
  const [showAddResponseDto, setShowAddResponseDto] = useState(false);
  const [editingRequestIndex, setEditingRequestIndex] = useState<number | null>(
    null
  );
  const [editingResponseIndex, setEditingResponseIndex] = useState<
    number | null
  >(null);
  const [draggedRequestItem, setDraggedRequestItem] = useState<number | null>(
    null
  );
  const [draggedResponseItem, setDraggedResponseItem] = useState<number | null>(
    null
  );
  const [newRequestDtoItem, setNewRequestDtoItem] = useState<DtoItem>({
    id: 0,
    dtoItemName: '',
    dataType: 'String',
    isList: false,
  });
  const [newResponseDtoItem, setNewResponseDtoItem] = useState<DtoItem>({
    id: 0,
    dtoItemName: '',
    dataType: 'String',
    isList: false,
  });
  const [useRequestDto, setUseRequestDto] = useState(false);
  const [useResponseDto, setUseResponseDto] = useState(false);

  const [newPathVar, setNewPathVar] = useState<PathVariable>({
    id: null,
    pathVariable: '',
    pathVariableDataType: 'string',
  });

  const [newParam, setNewParam] = useState<QueryStringRequest>({
    id: null,
    queryStringVariable: '',
    queryStringDataType: 'string',
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
  // 실시간 업데이트를 위한 디바운스 타이머
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 폼 데이터가 변경될 때마다 실시간 업데이트 전송
  const handleFormChange = (updatedForm: ApiDetail) => {
    setForm(updatedForm);

    // 이전 타이머 취소
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // 500ms 후에 업데이트 전송
    debounceTimerRef.current = setTimeout(() => {
      // API 요청용 객체로 변환
      const apiSpecRequest = convertToApiSpecRequest(updatedForm);

      // 현재 응답 상태 설정
      const currentResponse: ApiResponse = {
        statusCode: statusCode,
        responseDescription: statusDescription || 'OK',
      };

      const otherResponses = updatedForm.responses
        ? updatedForm.responses.filter(
            r => r.statusCode !== currentResponse.statusCode
          )
        : [];

      // 최종 업데이트할 데이터 생성
      const finalUpdatedForm = {
        ...updatedForm,
        statusCode: statusCode,
        responses: [currentResponse, ...otherResponses],
        queryStrings: updatedForm.queryStrings.map(param => ({
          id: param.id,
          queryStringVariable: param.queryStringVariable,
          queryStringDataType: param.queryStringDataType,
        })),
      };

      onSpecUpdate(finalUpdatedForm);
    }, 500);
  };

  useEffect(() => {
    if (api) {
      const dtoList = api.dtoList || [];

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
        queryStrings: api.queryStrings ?? [],
        responses: api.responses ?? [],
        header: api.header ?? '',
      });

      // DTO 값이 있으면 showDto를 true로 설정
      const hasDto =
        dtoList.length > 0 ||
        requestDto.fields.length > 0 ||
        responseDto.fields.length > 0;
      setShowDto(hasDto);

      // DTO 값이 있으면 useRequestDto와 useResponseDto도 true로 설정
      setUseRequestDto(
        requestDto.fields.length > 0 || Boolean(requestDto.dtoName)
      );
      setUseResponseDto(
        responseDto.fields.length > 0 || Boolean(responseDto.dtoName)
      );

      setStatusCode(api.statusCode ?? api.responses?.[0]?.statusCode ?? 200);
      setStatusDescription(api.responses?.[0]?.responseDescription ?? 'OK');
    } else {
      setForm(blankApiDetail);
      setShowDto(false);
      setUseRequestDto(false);
      setUseResponseDto(false);
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

    // API 요청 형식만 전달
    onSave(apiSpecRequest);
    onClose(); // 저장 후 모달 닫기
  };

  const handleAddPathVar = () => {
    if (newPathVar.pathVariable.trim() === '') return;
    handleFormChange({
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
    if (newParam.queryStringVariable.trim() === '') return;
    handleFormChange({
      ...form,
      queryStrings: [
        ...form.queryStrings,
        {
          id: newParam.id,
          queryStringVariable: newParam.queryStringVariable,
          queryStringDataType: newParam.queryStringDataType,
        },
      ],
    });
    setNewParam({
      id: null,
      queryStringVariable: '',
      queryStringDataType: 'string',
    });
    setShowAddParam(false);
  };

  const handleAddHeader = () => {
    if (newHeader.key.trim() === '' || newHeader.value.trim() === '') return;
    handleFormChange({
      ...form,
      header: `${newHeader.key}: ${newHeader.value}`,
    });
    setNewHeader({ key: '', value: '' });
    setShowAddHeader(false);
  };

  const removePathVar = (index: number) => {
    const newPathVars = [...form.pathVariables];
    newPathVars.splice(index, 1);
    handleFormChange({ ...form, pathVariables: newPathVars });
  };

  const removeParam = (index: number) => {
    const newParams = [...form.queryStrings];
    newParams.splice(index, 1);
    handleFormChange({ ...form, queryStrings: newParams });
  };

  const removeHeader = () => {
    handleFormChange({ ...form, header: '' });
  };

  // DTO Editor functions
  const handleRequestDragStart = (index: number) => {
    setDraggedRequestItem(index);
  };

  const handleResponseDragStart = (index: number) => {
    setDraggedResponseItem(index);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleRequestDrop = (targetIndex: number) => {
    if (draggedRequestItem === null) return;

    const items = [...form.requestDto.fields];
    const [draggedItemContent] = items.splice(draggedRequestItem, 1);
    items.splice(targetIndex, 0, draggedItemContent);

    setForm({
      ...form,
      requestDto: { ...form.requestDto, fields: items },
    });
    setDraggedRequestItem(null);
  };

  const handleResponseDrop = (targetIndex: number) => {
    if (draggedResponseItem === null) return;

    const items = [...form.responseDto.fields];
    const [draggedItemContent] = items.splice(draggedResponseItem, 1);
    items.splice(targetIndex, 0, draggedItemContent);

    setForm({
      ...form,
      responseDto: { ...form.responseDto, fields: items },
    });
    setDraggedResponseItem(null);
  };

  const handleRequestEdit = (index: number) => {
    setEditingRequestIndex(index);
    setNewRequestDtoItem({ ...form.requestDto.fields[index] });
    setShowAddRequestDto(true);
  };

  const handleResponseEdit = (index: number) => {
    setEditingResponseIndex(index);
    setNewResponseDtoItem({ ...form.responseDto.fields[index] });
    setShowAddResponseDto(true);
  };

  const handleAddRequestDtoItem = () => {
    if (newRequestDtoItem.dtoItemName.trim() === '') return;

    if (editingRequestIndex !== null) {
      const newItems = [...form.requestDto.fields];
      newItems[editingRequestIndex] = { ...newRequestDtoItem };
      setForm({
        ...form,
        requestDto: { ...form.requestDto, fields: newItems },
      });
      setEditingRequestIndex(null);
    } else {
      setForm({
        ...form,
        requestDto: {
          ...form.requestDto,
          fields: [...form.requestDto.fields, { ...newRequestDtoItem }],
        },
      });
    }

    setNewRequestDtoItem({
      id: 0,
      dtoItemName: '',
      dataType: 'String',
      isList: false,
    });
    setShowAddRequestDto(false);
  };

  const handleAddResponseDtoItem = () => {
    if (newResponseDtoItem.dtoItemName.trim() === '') return;

    if (editingResponseIndex !== null) {
      const newItems = [...form.responseDto.fields];
      newItems[editingResponseIndex] = { ...newResponseDtoItem };
      setForm({
        ...form,
        responseDto: { ...form.responseDto, fields: newItems },
      });
      setEditingResponseIndex(null);
    } else {
      setForm({
        ...form,
        responseDto: {
          ...form.responseDto,
          fields: [...form.responseDto.fields, { ...newResponseDtoItem }],
        },
      });
    }

    setNewResponseDtoItem({
      id: 0,
      dtoItemName: '',
      dataType: 'String',
      isList: false,
    });
    setShowAddResponseDto(false);
  };

  const removeRequestDtoItem = (index: number) => {
    const newItems = [...form.requestDto.fields];
    newItems.splice(index, 1);
    setForm({
      ...form,
      requestDto: { ...form.requestDto, fields: newItems },
    });
  };

  const removeResponseDtoItem = (index: number) => {
    const newItems = [...form.responseDto.fields];
    newItems.splice(index, 1);
    setForm({
      ...form,
      responseDto: { ...form.responseDto, fields: newItems },
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm">
      <div
        className="bg-white rounded-2xl w-3/4 max-w-6xl flex flex-col shadow-2xl max-h-[80vh] overflow-hidden relative"
        onMouseMove={onMouseMove}
      >
        {/* 원격 커서 렌더링 */}
        <div
          className="fixed pointer-events-none"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            overflow: 'hidden',
            transform: 'translate(0, 0)',
          }}
        >
          {Object.values(remoteCursors).map(cursor => {
            // 스크롤 위치에 따른 커서 위치 조정
            const adjustedY = cursor.y;
            const adjustedX = cursor.x;

            return (
              <RemoteCursor
                key={cursor.userId}
                x={adjustedX}
                y={adjustedY}
                username={cursor.username}
                color={cursor.color}
              />
            );
          })}
        </div>
        <div className="flex justify-between items-center p-6 border-b">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-bold text-blue-700">
              {api && api.id ? 'API 수정 하기' : 'API 추가 하기'}
            </h2>
            <ActiveUsers users={activeUsers} size="small" />
          </div>
          <div className="flex gap-3">
            <button
              className="px-5 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-100 transition"
              onClick={onClose}
            >
              Cancel
            </button>

            {api && api.id !== null && onDelete && (
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
            setForm={handleFormChange}
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

                    {form.queryStrings.length > 0 ? (
                      <div className="space-y-2 mb-2">
                        {form.queryStrings.map((param, index) => (
                          <div
                            key={index}
                            className="flex justify-between items-center p-1.5 bg-gray-50 rounded text-xs"
                          >
                            <div className="flex gap-2 items-center">
                              <span className="text-blue-600">
                                {param.queryStringVariable}
                              </span>
                              <span className="bg-gray-200 px-2 py-1 rounded">
                                {param.queryStringDataType}
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
                            value={newParam.queryStringVariable}
                            onChange={e =>
                              setNewParam({
                                ...newParam,
                                queryStringVariable: e.target.value,
                              })
                            }
                          />
                          <select
                            className="px-2 py-2 border rounded text-xs"
                            value={newParam.queryStringDataType}
                            onChange={e =>
                              setNewParam({
                                ...newParam,
                                queryStringDataType: e.target.value,
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
                      // DTO를 끄면 모든 DTO 관련 값들을 초기화
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
                      setUseRequestDto(false);
                      setUseResponseDto(false);
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
              {/* Request DTO Editor */}
              <div className="border rounded-xl p-4 bg-white shadow-sm">
                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-700">
                      REQUEST DTO
                    </span>
                    <label className="flex items-center text-xs text-gray-600 bg-gray-100 rounded-lg px-2 py-1">
                      <input
                        type="checkbox"
                        className="mr-1"
                        checked={useRequestDto}
                        onChange={e => {
                          setUseRequestDto(e.target.checked);
                          if (!e.target.checked) {
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
                      Use DTO
                    </label>
                  </div>
                  {useRequestDto && (
                    <button
                      className="text-xs bg-blue-50 text-blue-600 px-3 py-1 rounded-lg hover:bg-blue-100 transition flex items-center gap-1"
                      onClick={() => setShowAddRequestDto(!showAddRequestDto)}
                    >
                      + Add Field
                    </button>
                  )}
                </div>

                {useRequestDto && (
                  <>
                    <div className="mb-4">
                      <input
                        className="w-full border-b-2 border-blue-100 text-base px-2 py-2 text-gray-700 focus:outline-none focus:border-blue-300 transition-colors"
                        value={form.requestDto.dtoName}
                        onChange={e =>
                          setForm({
                            ...form,
                            requestDto: {
                              ...form.requestDto,
                              dtoName: e.target.value,
                            },
                          })
                        }
                        placeholder="DTO Name"
                      />
                    </div>

                    {form.requestDto.fields.length > 0 ? (
                      <div className="space-y-2 mb-3">
                        {form.requestDto.fields.map((item, index) => (
                          <div
                            key={index}
                            draggable
                            onDragStart={() => handleRequestDragStart(index)}
                            onDragOver={handleDragOver}
                            onDrop={() => handleRequestDrop(index)}
                            className={`flex justify-between items-center p-2 bg-gray-50 rounded cursor-move ${
                              draggedRequestItem === index ? 'opacity-50' : ''
                            }`}
                          >
                            <PiList className="w-4 h-4 text-gray-400 mr-3" />
                            <div className="flex gap-4 items-center flex-1">
                              <span className="text-blue-600 font-medium">
                                {item.dtoItemName}
                              </span>
                              <span className="text-xs bg-gray-200 px-3 py-1 rounded font-medium">
                                {item.dataType}
                                {item.isList ? '[ ]' : ''}
                              </span>
                            </div>
                            <div className="flex gap-2">
                              <button
                                className="text-gray-500 hover:text-blue-500"
                                onClick={() => handleRequestEdit(index)}
                              >
                                <FiEdit2 className="w-4 h-4" />
                              </button>
                              <button
                                className="text-gray-500 hover:text-red-500"
                                onClick={() => removeRequestDtoItem(index)}
                              >
                                <FiTrash className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center text-gray-500 text-sm" />
                    )}

                    {showAddRequestDto && (
                      <div className="p-3 border border-blue-100 rounded-lg bg-blue-50 mb-2">
                        <div className="grid grid-cols-11 gap-2 mb-2">
                          <input
                            className="p-2 border rounded col-span-5 text-base"
                            placeholder="Field Name"
                            value={newRequestDtoItem.dtoItemName}
                            onChange={e =>
                              setNewRequestDtoItem({
                                ...newRequestDtoItem,
                                dtoItemName: e.target.value,
                              })
                            }
                          />
                          <select
                            className="p-2 border rounded col-span-4 text-base"
                            value={newRequestDtoItem.dataType}
                            onChange={e =>
                              setNewRequestDtoItem({
                                ...newRequestDtoItem,
                                dataType: e.target.value,
                              })
                            }
                          >
                            {dataTypes.map(type => (
                              <option key={type} value={type}>
                                {type}
                              </option>
                            ))}
                          </select>
                          <label className="flex items-center gap-1 px-1 col-span-2">
                            <input
                              type="checkbox"
                              checked={newRequestDtoItem.isList}
                              onChange={e =>
                                setNewRequestDtoItem({
                                  ...newRequestDtoItem,
                                  isList: e.target.checked,
                                })
                              }
                              className="w-3 h-3"
                            />
                            <span className="text-xs">Is List</span>
                          </label>
                        </div>
                        <div className="flex justify-end gap-2">
                          <button
                            className="px-2 py-1 bg-gray-200 text-gray-700 rounded text-xs"
                            onClick={() => {
                              setShowAddRequestDto(false);
                              setEditingRequestIndex(null);
                            }}
                          >
                            Cancel
                          </button>
                          <button
                            className="px-2 py-1 bg-blue-500 text-white rounded text-xs"
                            onClick={handleAddRequestDtoItem}
                          >
                            {editingRequestIndex !== null ? 'Update' : 'Add'}
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Response DTO Editor */}
              <div className="border rounded-xl p-4 bg-white shadow-sm">
                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-700">
                      RESPONSE DTO
                    </span>
                    <label className="flex items-center text-xs text-gray-600 bg-gray-100 rounded-lg px-2 py-1">
                      <input
                        type="checkbox"
                        className="mr-1"
                        checked={useResponseDto}
                        onChange={e => {
                          setUseResponseDto(e.target.checked);
                          if (!e.target.checked) {
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
                      Use DTO
                    </label>
                  </div>
                  {useResponseDto && (
                    <button
                      className="text-xs bg-blue-50 text-blue-600 px-3 py-1 rounded-lg hover:bg-blue-100 transition flex items-center gap-1"
                      onClick={() => setShowAddResponseDto(!showAddResponseDto)}
                    >
                      + Add Field
                    </button>
                  )}
                </div>

                {useResponseDto && (
                  <>
                    <div className="mb-4">
                      <input
                        className="w-full border-b-2 border-blue-100 text-base px-2 py-2 text-gray-700 focus:outline-none focus:border-blue-300 transition-colors"
                        value={form.responseDto.dtoName}
                        onChange={e =>
                          setForm({
                            ...form,
                            responseDto: {
                              ...form.responseDto,
                              dtoName: e.target.value,
                            },
                          })
                        }
                        placeholder="DTO Name"
                      />
                    </div>

                    {form.responseDto.fields.length > 0 ? (
                      <div className="space-y-2 mb-3">
                        {form.responseDto.fields.map((item, index) => (
                          <div
                            key={index}
                            draggable
                            onDragStart={() => handleResponseDragStart(index)}
                            onDragOver={handleDragOver}
                            onDrop={() => handleResponseDrop(index)}
                            className={`flex justify-between items-center p-2 bg-gray-50 rounded cursor-move ${
                              draggedResponseItem === index ? 'opacity-50' : ''
                            }`}
                          >
                            <PiList className="w-4 h-4 text-gray-400 mr-3" />
                            <div className="flex gap-4 items-center flex-1">
                              <span className="text-blue-600 font-medium">
                                {item.dtoItemName}
                              </span>
                              <span className="text-xs bg-gray-200 px-3 py-1 rounded font-medium">
                                {item.dataType}
                                {item.isList ? '[ ]' : ''}
                              </span>
                            </div>
                            <div className="flex gap-2">
                              <button
                                className="text-gray-500 hover:text-blue-500"
                                onClick={() => handleResponseEdit(index)}
                              >
                                <FiEdit2 className="w-4 h-4" />
                              </button>
                              <button
                                className="text-gray-500 hover:text-red-500"
                                onClick={() => removeResponseDtoItem(index)}
                              >
                                <FiTrash className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center text-gray-500 text-sm" />
                    )}

                    {showAddResponseDto && (
                      <div className="p-3 border border-blue-100 rounded-lg bg-blue-50 mb-2">
                        <div className="grid grid-cols-11 gap-2 mb-2">
                          <input
                            className="p-2 border rounded col-span-5 text-base"
                            placeholder="Field Name"
                            value={newResponseDtoItem.dtoItemName}
                            onChange={e =>
                              setNewResponseDtoItem({
                                ...newResponseDtoItem,
                                dtoItemName: e.target.value,
                              })
                            }
                          />
                          <select
                            className="p-2 border rounded col-span-4 text-base"
                            value={newResponseDtoItem.dataType}
                            onChange={e =>
                              setNewResponseDtoItem({
                                ...newResponseDtoItem,
                                dataType: e.target.value,
                              })
                            }
                          >
                            {dataTypes.map(type => (
                              <option key={type} value={type}>
                                {type}
                              </option>
                            ))}
                          </select>
                          <label className="flex items-center gap-1 px-1 col-span-2">
                            <input
                              type="checkbox"
                              checked={newResponseDtoItem.isList}
                              onChange={e =>
                                setNewResponseDtoItem({
                                  ...newResponseDtoItem,
                                  isList: e.target.checked,
                                })
                              }
                              className="w-3 h-3"
                            />
                            <span className="text-xs">Is List</span>
                          </label>
                        </div>
                        <div className="flex justify-end gap-2">
                          <button
                            className="px-2 py-1 bg-gray-200 text-gray-700 rounded text-xs"
                            onClick={() => {
                              setShowAddResponseDto(false);
                              setEditingResponseIndex(null);
                            }}
                          >
                            Cancel
                          </button>
                          <button
                            className="px-2 py-1 bg-blue-500 text-white rounded text-xs"
                            onClick={handleAddResponseDtoItem}
                          >
                            {editingResponseIndex !== null ? 'Update' : 'Add'}
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ApiDetailModal;
