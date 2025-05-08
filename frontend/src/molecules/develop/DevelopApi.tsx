import { useState, useEffect } from 'react';
import DomainButton from '../../components/button/DomainButton';
import ApiTable from '../../components/apicomponent/ApiTable';
import ApiDetailModal from '../../components/apicomponent/ApiDetailModal';
import type { ApiDocListItem, ApiDetail } from '../../types/ApiDoc';
import ApiAddButton from '../../components/apicomponent/ApiAddButton';

// 예시 데이터 직접 선언
const exampleApiDocList: ApiDocListItem[] = [
  {
    apiSpecId: 1,
    apiName: 'User API',
    endpoint: '/api/user/info',
    method: 'GET',
    category: 'User',
    description: '사용자 정보를 조회합니다.',
    header: 'Authorization: Bearer {token}',
  },
  {
    apiSpecId: 2,
    apiName: 'Post API',
    endpoint: '/api/post',
    method: 'POST',
    category: 'Post',
    description: '게시글 생성',
    header: 'Authorization: Bearer {token}',
  },
];

const exampleApiDetail: ApiDetail = {
  apiName: 'User API',
  endpoint: '/api/user/info',
  method: 'GET',
  category: 'User',
  description: '사용자 정보를 조회합니다.',
  header: 'Authorization: Bearer {token}',
  pathVariables: [{ pathVariable: 'userId', pathVariableDataType: 'Long' }],
  requestParams: [
    { requestParamName: 'active', requestParamDataType: 'Boolean' },
  ],
  requestDto: {
    dtoName: 'UserRequestDto',
    dtoItems: [
      { dtoItemName: 'username', dataTypeName: 'String', isList: false },
      { dtoItemName: 'roles', dataTypeName: 'String', isList: true },
    ],
  },
  responseDto: {
    dtoName: 'UserResponseDto',
    dtoItems: [
      { dtoItemName: 'id', dataTypeName: 'Long', isList: false },
      { dtoItemName: 'username', dataTypeName: 'String', isList: false },
      { dtoItemName: 'email', dataTypeName: 'String', isList: false },
      { dtoItemName: 'roles', dataTypeName: 'String', isList: true },
    ],
  },
  responses: [
    {
      statusCode: 200,
      responseDescription: '요청 성공',
    },
    {
      statusCode: 404,
      responseDescription: '사용자를 찾을 수 없음',
    },
  ],
};

const DevelopApi = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedApi, setSelectedApi] = useState<ApiDetail | null>(null);
  const [data, setData] = useState<ApiDocListItem[]>(exampleApiDocList);
  const [selectedDomain, setSelectedDomain] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredData = data.filter(api => {
    const matchesDomain =
      selectedDomain === 'ALL' || api.category === selectedDomain;
    const matchesSearch = api.category
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    return matchesDomain && matchesSearch;
  });

  const handleAdd = () => {
    setSelectedApi({
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
    });
    setModalOpen(true);
  };

  const handleRowClick = (api: ApiDocListItem) => {
    const apiDetail =
      api.apiName === exampleApiDetail.apiName
        ? exampleApiDetail
        : {
            apiName: api.apiName,
            endpoint: api.endpoint,
            method: api.method,
            category: api.category,
            description: api.description,
            header: api.header,
            pathVariables: [],
            requestParams: [],
            requestDto: { dtoName: '', dtoItems: [] },
            responseDto: { dtoName: '', dtoItems: [] },
            responses: [],
          };

    setSelectedApi({
      apiName: api.apiName,
      endpoint: api.endpoint,
      method: api.method,
      category: api.category,
      description: api.description,
      header: api.header,
      pathVariables: apiDetail.pathVariables,
      requestParams: apiDetail.requestParams,
      requestDto: apiDetail.requestDto,
      responseDto: apiDetail.responseDto,
      responses: apiDetail.responses,
    });
    setModalOpen(true);
  };

  const handleSave = (form: ApiDetail) => {
    const newApiItem: ApiDocListItem = {
      apiSpecId: Date.now(),
      apiName: form.apiName,
      endpoint: form.endpoint,
      method: form.method,
      category: form.category,
      description: form.description,
      header: form.header,
    };

    if (selectedApi) {
      setData(prev =>
        prev.map(item =>
          item.apiSpecId === (selectedApi as any).apiSpecId
            ? {
                ...item,
                apiName: form.apiName,
                endpoint: form.endpoint,
                method: form.method,
                category: form.category,
                description: form.description,
                header: form.header,
              }
            : item
        )
      );
    } else {
      setData(prev => [...prev, newApiItem]);
    }

    setModalOpen(false);
    setSelectedApi(null);
  };

  const handleDelete = () => {
    if (!selectedApi) return;

    if (window.confirm('정말로 이 API를 삭제하시겠습니까?')) {
      setData(prev =>
        prev.filter(item => item.apiSpecId !== (selectedApi as any).apiSpecId)
      );
      setModalOpen(false);
    }
  };

  return (
    <div className="mt-2 min-h-screen w-full flex flex-col bg-gray-50">
      <div className="flex-1 flex flex-col justify-center items-center w-full">
        <div className="w-full flex justify-between items-center mb-4">
          <div className="flex-1 max-w-md">
            <input
              type="text"
              placeholder="카테고리로 검색"
              className="text-sm w-full px-4 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="ml-4">
            <ApiAddButton onClick={handleAdd} />
          </div>
        </div>
        <div className="w-full h-full flex-1 flex justify-center items-start">
          <ApiTable
            data={filteredData}
            onRowClick={handleRowClick}
            selectedDomain={selectedDomain}
          />
        </div>
      </div>
      {modalOpen && (
        <ApiDetailModal
          api={selectedApi}
          onClose={() => setModalOpen(false)}
          onSave={handleSave}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
};

export default DevelopApi;
