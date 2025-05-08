import { useState } from 'react';
import DomainButton from '../../components/button/DomainButton';
import FuncTable from '../../components/funccomponent/FuncTable';
import FuncDetailModal from '../../components/funccomponent/FuncDetailModal';
import type { FuncListItem, FuncDetail } from '../../types/FuncDoc';
import FuncAddButton from '../../components/funccomponent/FuncAddButton';

// 예시 데이터 직접 선언
const exampleFuncList: FuncListItem[] = [
  {
    funcId: 1,
    funcName: '회원가입 기능',
    category: 'MEMBER',
    assignee: '홍길동',
    storyPoints: 5,
    priority: 'HIGH',
  },
  {
    funcId: 2,
    funcName: '로그인 기능',
    category: 'MEMBER',
    assignee: '김철수',
    storyPoints: 3,
    priority: 'HIGH',
  },
  {
    funcId: 3,
    funcName: 'API 문서 조회',
    category: 'APIDOCS',
    assignee: '이영희',
    storyPoints: 8,
    priority: 'MEDIUM',
  },
  {
    funcId: 4,
    funcName: '기능 목록 관리',
    category: 'INITIALIZER',
    assignee: '박지성',
    storyPoints: 5,
    priority: 'LOW',
  },
];

const exampleFuncDetail: FuncDetail = {
  funcName: '회원가입 기능',
  category: 'MEMBER',
  assignee: '홍길동',
  storyPoints: 5,
  priority: 'HIGH',
  description:
    '새로운 사용자가 시스템에 회원가입할 수 있는 기능. 이메일, 비밀번호, 이름 등의 정보를 입력받아 회원으로 등록한다.',
  successCase: '유효한 이메일과 비밀번호로 회원가입 시 성공',
  failCase: '이미 사용 중인 이메일 주소로 가입 시도 시 실패',
};

const categoryList = ['APIDOCS', 'MEMBER', 'INITIALIZER'];

const DevelopFunc = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedFunc, setSelectedFunc] = useState<FuncDetail | null>(null);
  const [data, setData] = useState<FuncListItem[]>(exampleFuncList);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredData = data.filter(func => {
    const matchesCategory =
      selectedCategory === 'ALL' || func.category === selectedCategory;
    const matchesSearch = func.category
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleAdd = () => {
    setSelectedFunc(null);
    setModalOpen(true);
  };

  const handleRowClick = (func: FuncListItem) => {
    setSelectedFunc({
      funcName: func.funcName,
      category: func.category,
      assignee: func.assignee,
      storyPoints: func.storyPoints,
      priority: func.priority,
      description: '',
      successCase: '',
      failCase: '',
    });
    setModalOpen(true);
  };

  // 저장(등록/수정)
  const handleSave = (form: FuncDetail) => {
    if (selectedFunc) {
      // 수정 - 같은 이름을 가진 기능을 찾아 업데이트
      setData(prev =>
        prev.map(item =>
          item.funcName === selectedFunc.funcName
            ? {
                ...item,
                funcName: form.funcName,
                category: form.category,
                assignee: form.assignee,
                storyPoints: form.storyPoints,
                priority: form.priority,
              }
            : item
        )
      );
    } else {
      // 추가
      setData(prev => [
        ...prev,
        {
          funcId: prev.length + 1,
          funcName: form.funcName,
          category: form.category,
          assignee: form.assignee,
          storyPoints: form.storyPoints,
          priority: form.priority,
        },
      ]);
    }
    setModalOpen(false);
  };

  const handleDelete = () => {
    if (!selectedFunc) return;

    // 삭제 확인
    if (window.confirm('정말로 이 기능을 삭제하시겠습니까?')) {
      setData(prev =>
        prev.filter(item => item.funcName !== selectedFunc.funcName)
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
            <FuncAddButton onClick={handleAdd} />
          </div>
        </div>
        <div className="w-full h-full flex-1 flex justify-center items-start">
          <FuncTable
            data={filteredData}
            onRowClick={handleRowClick}
            selectedCategory={selectedCategory}
          />
        </div>
      </div>
      {modalOpen && (
        <FuncDetailModal
          func={selectedFunc}
          onClose={() => setModalOpen(false)}
          onSave={handleSave}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
};

export default DevelopFunc;
