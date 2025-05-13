import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import FuncTable from '../../components/funccomponent/FuncTable';
import FuncDetailModal from '../../components/funccomponent/FuncDetailModal';
import type { FuncDetail, FuncListItem } from '../../types/FuncDoc';
import FuncAddButton from '../../components/funccomponent/FuncAddButton';
import {
  useGetFunctionalSpecs,
  useCreateFunctionalSpec,
  useUpdateFunctionalSpec,
  useDeleteFunctionalSpec,
} from '../../api/functionAPI';
import useFunctionalSpecStore from '../../stores/functionStore';
import type { FunctionalSpec } from '../../stores/functionStore';
import JiraAddButton from '../../components/funccomponent/JiraAddButton';
import { createJiraIssue } from '../../api/jiraAPI';
import SuccessModal from '../../components/icon/SuccessModal';

const priorityToNumber = (priority: string): number => {
  switch (priority) {
    case 'HIGHEST':
      return 1;
    case 'HIGH':
      return 2;
    case 'MEDIUM':
      return 3;
    case 'LOW':
      return 4;
    case 'LOWEST':
      return 5;
    default:
      return 3;
  }
};

const numberToPriority = (priority: number): string => {
  switch (priority) {
    case 1:
      return 'HIGHEST';
    case 2:
      return 'HIGH';
    case 3:
      return 'MEDIUM';
    case 4:
      return 'LOW';
    case 5:
      return 'LOWEST';
    default:
      return 'MEDIUM';
  }
};

const convertToFuncListItem = (spec: FunctionalSpec): FuncListItem => ({
  funcId: spec.id || 0,
  funcName: spec.functionName,
  category: spec.category,
  assignee: spec.userName || '',
  storyPoints: spec.storyPoint,
  priority: numberToPriority(spec.priority),
  userId: spec.userId,
});

const convertToFuncDetail = (spec: FunctionalSpec): FuncDetail => ({
  funcName: spec.functionName,
  category: spec.category,
  assignee: spec.userId?.toString() || '',
  storyPoints: spec.storyPoint,
  priority: numberToPriority(spec.priority),
  description: spec.functionDescription,
  successCase: spec.successCase,
  failCase: spec.failCase,
});

const convertFromFuncDetail = (
  detail: FuncDetail,
  spec: FunctionalSpec
): FunctionalSpec => ({
  ...spec,
  functionName: detail.funcName,
  category: detail.category,
  functionDescription: detail.description,
  priority: priorityToNumber(detail.priority),
  successCase: detail.successCase,
  failCase: detail.failCase,
  storyPoint: detail.storyPoints,
  userId: Number(detail.assignee),
});

const DevelopFunc = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedFunc, setSelectedFunc] = useState<FunctionalSpec | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [jiraLink, setJiraLink] = useState<string | null>(null);

  const { specs } = useFunctionalSpecStore();
  const { refetch } = useGetFunctionalSpecs(Number(projectId));
  const createMutation = useCreateFunctionalSpec();
  const updateMutation = useUpdateFunctionalSpec();
  const deleteMutation = useDeleteFunctionalSpec();

  useEffect(() => {
    if (projectId) {
      refetch();
    }
  }, [projectId]);

  const filteredData = specs
    .filter(spec => {
      const matchesCategory =
        selectedCategory === 'ALL' || spec.category === selectedCategory;
      const matchesSearch = spec.category
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    })
    .map(convertToFuncListItem);

  const handleAdd = () => {
    setSelectedFunc(null);
    setModalOpen(true);
  };

  const handleJiraAdd = async () => {
    if (!projectId) return;
    try {
      const jiraLink = await createJiraIssue(Number(projectId));
      setShowSuccessModal(true);
      setJiraLink(jiraLink);
    } catch (error) {
      console.error('Jira 이슈 등록 실패:', error);
    }
  };

  const handleRowClick = (func: FuncListItem) => {
    const spec = specs.find(s => s.id === func.funcId);
    if (spec) {
      setSelectedFunc(spec);
      setModalOpen(true);
    }
  };

  const handleSave = (form: FuncDetail) => {
    if (!projectId) return;

    if (selectedFunc) {
      updateMutation.mutate(convertFromFuncDetail(form, selectedFunc));
    } else {
      createMutation.mutate({
        projectId: Number(projectId),
        userId: Number(form.assignee),
        functionName: form.funcName,
        functionDescription: form.description,
        category: form.category,
        priority: priorityToNumber(form.priority),
        successCase: form.successCase,
        failCase: form.failCase,
        storyPoint: form.storyPoints,
      });
    }
    setModalOpen(false);
  };

  const handleDelete = () => {
    if (!selectedFunc?.id) return;
    if (window.confirm('정말로 이 기능을 삭제하시겠습니까?')) {
      deleteMutation.mutate(selectedFunc.id);
      setModalOpen(false);
    }
  };

  if (!projectId) return null;

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
          <div className="ml-4 flex gap-2">
            <FuncAddButton onClick={handleAdd} />
            <JiraAddButton onClick={handleJiraAdd} />
          </div>
        </div>
        <div className="w-full flex-1 flex justify-center items-start overflow-y-auto">
          <FuncTable
            data={filteredData}
            onRowClick={handleRowClick}
            selectedCategory={selectedCategory}
          />
        </div>
      </div>
      {modalOpen && (
        <FuncDetailModal
          func={selectedFunc ? convertToFuncDetail(selectedFunc) : null}
          onClose={() => setModalOpen(false)}
          onSave={handleSave}
          onDelete={handleDelete}
        />
      )}
      <SuccessModal
        visible={showSuccessModal}
        onClose={() => {
          setShowSuccessModal(false);
          setJiraLink(null);
        }}
        title="이슈 등록 완료"
        description="프로젝트에 성공적으로 등록되었습니다."
        link={jiraLink || undefined}
      />
    </div>
  );
};

export default DevelopFunc;
