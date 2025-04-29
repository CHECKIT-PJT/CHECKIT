import { useState } from 'react';
import DomainButton from '../../components/button/DomainButton';
import ApiTable from '../../components/apicomponent/ApiTable';
import ApiDetailModal from '../../components/apicomponent/ApiDetailModal';
import type { ApiDocListItem, ApiDetail } from '../../types/ApiDoc';
import ApiAddButton from '../../components/button/ApiAddButton';

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
    ],
  },
  responses: [
    {
      statusCode: 200,
      responseJson: '{ "id": 1, "username": "testuser" }',
      responseDescription: '요청 성공',
    },
    {
      statusCode: 404,
      responseJson: '{ "error": "Not Found" }',
      responseDescription: '사용자를 찾을 수 없음',
    },
  ],
};

const domainList = [
  'APIDOCS',
  'MEMBER',
  'REQUIREMENTDOCS',
  'INITIALIZER',
  'JIRA',
];

const DevelopApi = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedApi, setSelectedApi] = useState<ApiDetail | null>(null);
  const [data, setData] = useState<ApiDocListItem[]>(exampleApiDocList);
  const [selectedDomain, setSelectedDomain] = useState('ALL');

  const filteredData = data.filter(api => {
    if (selectedDomain === 'ALL') return true;
    return api.category === selectedDomain;
  });

  const handleAdd = () => {
    setSelectedApi(null);
    setModalOpen(true);
  };

  const handleRowClick = (api: ApiDocListItem) => {
    setSelectedApi({
      ...exampleApiDetail,
      ...api,
    });
    setModalOpen(true);
  };

  // 저장(등록/수정)
  const handleSave = (form: ApiDetail) => {
    if (selectedApi) {
      // 수정
      setData(prev =>
        prev.map(item =>
          item.apiSpecId === (form as any).apiSpecId
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
      // 추가
      setData(prev => [
        ...prev,
        {
          apiSpecId: prev.length + 1,
          apiName: form.apiName,
          endpoint: form.endpoint,
          method: form.method,
          category: form.category,
          description: form.description,
          header: form.header,
        },
      ]);
    }
    setModalOpen(false);
  };

  return (
    <div className="mt-5 min-h-screen w-full flex flex-col bg-gray-50">
      <DomainButton
        domains={domainList}
        selectedDomain={selectedDomain}
        onSelect={setSelectedDomain}
      />
      <div className="flex-1 flex flex-col justify-center items-center w-full">
        <div className="w-full text-right mb-4">
          <ApiAddButton onClick={handleAdd} />
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
        />
      )}
    </div>
  );
};

export default DevelopApi;
