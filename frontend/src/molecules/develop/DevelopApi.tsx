import { useState, useEffect } from 'react';
import ApiTable from '../../components/apicomponent/ApiTable';
import ApiDetailModal from '../../components/apicomponent/ApiDetailModal';
import type {
  ApiDocListItem,
  ApiDetail,
  ApiSpecRequest,
} from '../../types/apiDocs';
import ApiAddButton from '../../components/apicomponent/ApiAddButton';
import {
  useGetApiSpecs,
  useCreateApiSpec,
  useDeleteApiSpec,
} from '../../api/apiAPI';
import { useParams } from 'react-router-dom';

// API 세부 정보를 목록 형식으로 변환하는 유틸리티 함수
const convertDetailToListItem = (apiDetail: ApiDetail): ApiDocListItem => {
  return {
    apiSpecId: apiDetail.id,
    apiName: apiDetail.apiName,
    endpoint: apiDetail.endpoint,
    method: apiDetail.method,
    category: apiDetail.category,
    description: apiDetail.description,
    header: apiDetail.header,
  };
};

const DevelopApi = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedApi, setSelectedApi] = useState<ApiDetail | null>(null);
  const [selectedDomain, setSelectedDomain] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // API hooks
  const { data: apiListItems = [], isLoading } = useGetApiSpecs(
    Number(projectId)
  );
  const createApiSpec = useCreateApiSpec();
  const deleteApiSpec = useDeleteApiSpec();

  // 필터링 로직 (카테고리만 검색)
  const filteredData = apiListItems.filter((api: { category: string }) => {
    const matchesDomain =
      selectedDomain === 'ALL' || api.category === selectedDomain;
    const matchesSearch = api.category
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    return matchesDomain && matchesSearch;
  });

  const handleAdd = () => {
    setSelectedApi({
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
      responses: [
        {
          statusCode: 200,
          responseDescription: 'OK',
        },
      ],
    });
    setModalOpen(true);
  };

  const handleRowClick = (apiItem: ApiDocListItem) => {
    const fullApi = apiListItems.find(
      (api: { id: number | null }) => api.id === apiItem.apiSpecId
    );
    if (fullApi) setSelectedApi(fullApi);
    setModalOpen(true);
  };

  const handleSave = (apiSpecRequest: ApiSpecRequest) => {
    if (!projectId) return;

    createApiSpec.mutate(
      {
        projectId: Number(projectId),
        apiSpec: apiSpecRequest,
      },
      {
        onSuccess: () => {
          setModalOpen(false);
          setSelectedApi(null);
        },
      }
    );
  };

  const handleDelete = () => {
    if (!selectedApi?.id || !projectId) return;

    if (window.confirm('정말로 이 API를 삭제하시겠습니까?')) {
      deleteApiSpec.mutate(
        {
          projectId: Number(projectId),
          apiSpecId: selectedApi.id,
        },
        {
          onSuccess: () => {
            setModalOpen(false);
            setSelectedApi(null);
          },
        }
      );
    }
  };

  if (isLoading) {
    return <div>로딩 중...</div>;
  }

  return (
    <div className="mt-2 w-full flex flex-col bg-gray-50">
      <div className="flex-1 flex flex-col justify-center items-center w-full">
        <div className="w-full flex justify-between items-center my-4">
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
