import { useEffect, useState, useRef } from 'react';
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
<<<<<<< HEAD
import ActiveUsers from '../../components/apicomponent/ActiveUsers';
import { PRESENCE_ACTIONS, RESOURCE_TYPES } from '../../constants/websocket';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';
import { useAuth } from '../../hooks/useAuth';

interface User {
  id: string;
  name: string;
  color: string;
}
=======
import { createJiraIssue } from '../../api/jiraAPI';
import SuccessModal from '../../components/icon/SuccessModal';
>>>>>>> 5ec68854fdd7b0c6829464a44d1a912b29e25d85

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
  const { token } = useAuth();
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedFunc, setSelectedFunc] = useState<FunctionalSpec | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
<<<<<<< HEAD
  const [activeUsers, setActiveUsers] = useState<User[]>([]);
  const [modalActiveUsers, setModalActiveUsers] = useState<User[]>([]);
  const stompClientRef = useRef<Client | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [activeUsersByFunc, setActiveUsersByFunc] = useState<{ [key: string]: User[] }>({});
=======
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [jiraLink, setJiraLink] = useState<string | null>(null);
>>>>>>> 5ec68854fdd7b0c6829464a44d1a912b29e25d85

  const { specs } = useFunctionalSpecStore();
  const { refetch } = useGetFunctionalSpecs(Number(projectId));
  const createMutation = useCreateFunctionalSpec();
  const updateMutation = useUpdateFunctionalSpec();
  const deleteMutation = useDeleteFunctionalSpec();

  // 사용자별 고유 색상 생성 함수
  const getRandomColor = (seed: string) => {
    const colors = [
      '#2563EB', '#DC2626', '#059669', '#7C3AED', '#DB2777',
      '#2563EB', '#EA580C', '#0D9488', '#4F46E5', '#BE185D'
    ];
    const index = seed.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[index % colors.length];
  };

  const sendPresenceMessage = (resourceId: string, action: string) => {
    if (stompClientRef.current?.connected) {
      stompClientRef.current.publish({
        destination: '/pub/presence',
        body: JSON.stringify({ resourceId, action }),
      });
    }
  };

  // 기능 명세별 구독 설정
  useEffect(() => {
    if (!isConnected || !stompClientRef.current || !specs.length) return;

    const subscriptions: { [key: string]: any } = {};

    // 각 기능 명세에 대한 구독 설정
    specs.forEach((func) => {
      if (func.id) {
        const funcResourceId = `${RESOURCE_TYPES.FUNC_SPEC}-${func.id}`;
        
        // 구독 설정
        const subscription = stompClientRef.current!.subscribe(
          `/sub/presence/${funcResourceId}`,
          message => {
            try {
              const data = JSON.parse(message.body);
              setActiveUsersByFunc(prev => ({
                ...prev,
                [func.id!.toString()]: data.users.map((username: string) => ({
                  id: username,
                  name: username,
                  color: getRandomColor(username),
                })),
              }));
            } catch (error) {
              console.error('Failed to parse presence message:', error);
            }
          }
        );

        subscriptions[func.id.toString()] = subscription;
      }
    });

    // 클린업 함수
    return () => {
      Object.values(subscriptions).forEach(subscription => {
        subscription.unsubscribe();
      });
    };
  }, [isConnected, specs]);

  const initStomp = () => {
    const token = sessionStorage.getItem('accessToken');
    const sock = new SockJS(
      `${import.meta.env.VITE_API_BASE_URL}/ws/erd?token=${token}`
    );

    const stompClient = new Client({
      webSocketFactory: () => sock,
      connectHeaders: {
        Authorization: `Bearer ${token || ''}`,
      },
      reconnectDelay: 5000,
      onConnect: () => {
        console.log('STOMP 연결 성공');
        setIsConnected(true);

        // 페이지 입장 알림
        const pageResourceId = `${RESOURCE_TYPES.PAGE_FUNC}-${projectId}`;
        stompClient.publish({
          destination: '/pub/presence',
          body: JSON.stringify({ 
            resourceId: pageResourceId, 
            action: PRESENCE_ACTIONS.ENTER 
          }),
        });

        // 페이지 사용자 목록 구독
        stompClient.subscribe(`/sub/presence/${pageResourceId}`, message => {
          try {
            const data = JSON.parse(message.body);
            setActiveUsers(data.users.map((username: string) => ({
              id: username,
              name: username,
              color: getRandomColor(username),
            })));
          } catch (error) {
            console.error('Failed to parse presence message:', error);
          }
        });
      },
      onDisconnect: () => {
        console.log('STOMP 연결 해제');
        setIsConnected(false);

        // 연결이 끊어질 때 페이지에서 퇴장 처리
        const pageResourceId = `${RESOURCE_TYPES.PAGE_FUNC}-${projectId}`;
        sendPresenceMessage(pageResourceId, PRESENCE_ACTIONS.LEAVE);

        // 현재 보고 있는 기능 명세 상세 페이지가 있다면 퇴장 처리
        if (selectedFunc?.id) {
          const funcResourceId = `${RESOURCE_TYPES.FUNC_SPEC}-${selectedFunc.id}`;
          sendPresenceMessage(funcResourceId, PRESENCE_ACTIONS.LEAVE);
        }

        // 연결 해제 후 사용자 목록 초기화
        setActiveUsers([]);
        setModalActiveUsers([]);
        setActiveUsersByFunc({});
      },
      onStompError: frame => {
        console.error('STOMP 에러:', frame);
      },
    });

    stompClient.activate();
    stompClientRef.current = stompClient;
  };

  useEffect(() => {
    initStomp();

    return () => {
      if (stompClientRef.current?.connected) {
        const pageResourceId = `${RESOURCE_TYPES.PAGE_FUNC}-${projectId}`;
        sendPresenceMessage(pageResourceId, PRESENCE_ACTIONS.LEAVE);
        stompClientRef.current.deactivate();
      }
    };
  }, [projectId]);

  useEffect(() => {
    if (!isConnected || !selectedFunc?.id) return;

    const funcResourceId = `${RESOURCE_TYPES.FUNC_SPEC}-${selectedFunc.id}`;

    if (modalOpen) {
      // 모달 열릴 때 구독 및 입장 메시지 전송
      sendPresenceMessage(funcResourceId, PRESENCE_ACTIONS.ENTER);
      
      const subscription = stompClientRef.current?.subscribe(
        `/sub/presence/${funcResourceId}`,
        message => {
          try {
            const data = JSON.parse(message.body);
            setModalActiveUsers(data.users.map((username: string) => ({
              id: username,
              name: username,
              color: getRandomColor(username),
            })));
          } catch (error) {
            console.error('Failed to parse presence message:', error);
          }
        }
      );

      return () => {
        // 모달 닫힐 때 구독 해제 및 퇴장 메시지 전송
        subscription?.unsubscribe();
        sendPresenceMessage(funcResourceId, PRESENCE_ACTIONS.LEAVE);
      };
    }
  }, [modalOpen, selectedFunc, isConnected]);

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
    // 이전 기능에서 퇴장
    if (selectedFunc?.id) {
      const prevResourceId = `${RESOURCE_TYPES.FUNC_SPEC}-${selectedFunc.id}`;
      sendPresenceMessage(prevResourceId, PRESENCE_ACTIONS.LEAVE);
    }

    const spec = specs.find(s => s.id === func.funcId);
    if (spec) {
      setSelectedFunc(spec);
      // 새로운 기능에 입장
      const newResourceId = `${RESOURCE_TYPES.FUNC_SPEC}-${spec.id}`;
      sendPresenceMessage(newResourceId, PRESENCE_ACTIONS.ENTER);
    }
    setModalOpen(true);
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

  const handleModalClose = () => {
    // 모달 닫을 때 현재 기능에서 퇴장
    if (selectedFunc?.id) {
      const resourceId = `${RESOURCE_TYPES.FUNC_SPEC}-${selectedFunc.id}`;
      sendPresenceMessage(resourceId, PRESENCE_ACTIONS.LEAVE);
    }
    setModalOpen(false);
    setSelectedFunc(null);
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
<<<<<<< HEAD
          <div className="ml-4 flex items-center gap-4">
            <ActiveUsers users={activeUsers} size="medium" />
            <div className="flex gap-2">
              <FuncAddButton onClick={handleAdd} />
              <JiraAddButton onClick={handleAdd} />
            </div>
=======
          <div className="ml-4 flex gap-2">
            <FuncAddButton onClick={handleAdd} />
            <JiraAddButton onClick={handleJiraAdd} />
>>>>>>> 5ec68854fdd7b0c6829464a44d1a912b29e25d85
          </div>
        </div>
        <div className="w-full flex-1 flex justify-center items-start overflow-y-auto">
          <FuncTable
            data={filteredData}
            onRowClick={handleRowClick}
            selectedCategory={selectedCategory}
            activeUsersByFunc={activeUsersByFunc}
          />
        </div>
      </div>
      {modalOpen && (
        <FuncDetailModal
          func={selectedFunc ? convertToFuncDetail(selectedFunc) : null}
          onClose={handleModalClose}
          onSave={handleSave}
          onDelete={handleDelete}
          activeUsers={modalActiveUsers}
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
