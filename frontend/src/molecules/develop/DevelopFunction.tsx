import { useEffect, useState, useRef, useCallback } from 'react';
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

import ActiveUsers from '../../components/apicomponent/ActiveUsers';
import { PRESENCE_ACTIONS, RESOURCE_TYPES } from '../../constants/websocket';
import SockJS from 'sockjs-client';
import { Client, StompSubscription } from '@stomp/stompjs';
import { useAuth } from '../../hooks/useAuth';

import { createJiraIssue } from '../../api/jiraAPI';
import SuccessModal from '../../components/icon/SuccessModal';
import RemoteCursor from '../../components/cursor/RemoteCursor';
import type { RemoteCursorData } from '../../types/cursor';
import { getUserIdFromToken } from '../../utils/tokenUtils';
import { getUserColor } from '../../utils/colorUtils';

interface User {
  id: string;
  name: string;
  color: string;
}

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
  userName: spec.userName || ''
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

// 구독 정보를 위한 인터페이스 정의
interface ModalSubscriptions {
  cursor: StompSubscription | null;
  presence: StompSubscription | null;
}

const DevelopFunc = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const { token } = useAuth();
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedFunc, setSelectedFunc] = useState<FunctionalSpec | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [activeUsers, setActiveUsers] = useState<User[]>([]);
  const [modalActiveUsers, setModalActiveUsers] = useState<User[]>([]);
  const stompClientRef = useRef<Client | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [activeUsersByFunc, setActiveUsersByFunc] = useState<{
    [key: string]: User[];
  }>({});
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [jiraLink, setJiraLink] = useState<string | null>(null);
  const [remoteCursors, setRemoteCursors] = useState<{
    [key: string]: RemoteCursorData;
  }>({});
  const [modalRemoteCursors, setModalRemoteCursors] = useState<{
    [key: string]: RemoteCursorData;
  }>({});
  const containerRef = useRef<HTMLDivElement>(null);
  const modalSubscriptionRef = useRef<ModalSubscriptions | null>(null);
  const mainPageCursorSubscription = useRef<StompSubscription | null>(null);

  const { specs, setSpecs } = useFunctionalSpecStore();
  const { refetch } = useGetFunctionalSpecs(Number(projectId));
  const createMutation = useCreateFunctionalSpec();
  const updateMutation = useUpdateFunctionalSpec();
  const deleteMutation = useDeleteFunctionalSpec();

  // 기능 명세별 구독 설정
  useEffect(() => {
    if (!isConnected || !stompClientRef.current || !specs.length) return;

    const subscriptions: { [key: string]: any } = {};

    // 각 기능 명세에 대한 구독 설정
    const setupSubscriptions = () => {
      if (!stompClientRef.current?.connected) {
        console.log('STOMP 연결이 아직 준비되지 않았습니다.');
        return;
      }

      specs.forEach(func => {
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
                    color: getUserColor(username),
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
    };

    // STOMP 연결이 완료된 후 구독 설정
    const originalOnConnect = stompClientRef.current.onConnect;
    stompClientRef.current.onConnect = frame => {
      if (originalOnConnect) {
        originalOnConnect.call(stompClientRef.current, frame);
      }
      setupSubscriptions();
    };

    // 이미 연결된 상태라면 바로 구독 설정
    if (stompClientRef.current.connected) {
      setupSubscriptions();
    }

    // 클린업 함수
    return () => {
      Object.values(subscriptions).forEach(subscription => {
        try {
          subscription?.unsubscribe();
        } catch (error) {
          console.error('구독 해제 중 에러:', error);
        }
      });
      // 원래의 onConnect 핸들러 복구
      if (stompClientRef.current) {
        stompClientRef.current.onConnect = originalOnConnect;
      }
    };
  }, [isConnected, specs]);

  // 마우스 이벤트 핸들러 - 메인 페이지용
  const handleNativeMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!containerRef.current || !stompClientRef.current?.connected || modalOpen) return;

      const rect = containerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      stompClientRef.current.publish({
        destination: `/pub/cursor/${projectId}/function`,
        body: JSON.stringify({
          userId: getUserIdFromToken(sessionStorage.getItem('accessToken')),
          x,
          y,
          pageType: 'function',
        }),
      });
    },
    [projectId, modalOpen]
  );

  // 모달 마우스 이벤트 핸들러
  const handleModalMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!modalOpen || !stompClientRef.current?.connected || !selectedFunc?.id) return;

      const modalElement = e.currentTarget;
      const rect = modalElement.getBoundingClientRect();
      const scrollTop = modalElement.scrollTop;
      const scrollLeft = modalElement.scrollLeft;
      
      // 스크롤 위치를 고려한 상대적 좌표 계산
      const x = e.clientX - rect.left + scrollLeft;
      const y = e.clientY - rect.top + scrollTop;

      stompClientRef.current.publish({
        destination: `/pub/cursor/${projectId}/function-detail/${selectedFunc.id}`,
        body: JSON.stringify({
          userId: getUserIdFromToken(sessionStorage.getItem('accessToken')),
          x,
          y,
          pageType: 'function-detail',
        }),
      });
    },
    [projectId, modalOpen, selectedFunc]
  );

  // 메인 페이지 커서 구독 설정
  useEffect(() => {
    if (!isConnected || modalOpen || !stompClientRef.current?.connected) {
      // 이전 구독이 있다면 정리
      if (mainPageCursorSubscription.current) {
        try {
          mainPageCursorSubscription.current.unsubscribe();
          mainPageCursorSubscription.current = null;
        } catch (error) {
          console.error('구독 해제 중 에러:', error);
        }
      }
      return;
    }

    try {
      // 메인 페이지 커서 구독
      mainPageCursorSubscription.current = stompClientRef.current.subscribe(
        `/sub/cursor/${projectId}/function`,
        message => {
          try {
            const cursorData = JSON.parse(message.body);
            const myUserId = getUserIdFromToken(sessionStorage.getItem('accessToken'));

            if (cursorData.userId === myUserId) return;

            setRemoteCursors(prev => ({
              ...prev,
              [cursorData.userId]: {
                ...cursorData,
                color: getUserColor(cursorData.userId),
                username: cursorData.userId,
              },
            }));
          } catch (error) {
            console.error('Failed to parse cursor message:', error);
          }
        }
      );

      return () => {
        if (mainPageCursorSubscription.current) {
          try {
            mainPageCursorSubscription.current.unsubscribe();
            mainPageCursorSubscription.current = null;
          } catch (error) {
            console.error('구독 해제 중 에러:', error);
          }
        }
      };
    } catch (error) {
      console.error('메인 페이지 커서 구독 설정 중 에러:', error);
      return () => {};
    }
  }, [isConnected, modalOpen, projectId, stompClientRef.current?.connected]);

  // 마우스 이벤트 리스너 등록
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener('mousemove', handleNativeMouseMove);
    return () => {
      container.removeEventListener('mousemove', handleNativeMouseMove);
    };
  }, [handleNativeMouseMove]);

  // 페이지 가시성 변경 감지
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && stompClientRef.current?.connected) {
        // 페이지가 숨겨질 때 커서 제거
        setRemoteCursors({});
      }
    };

    // 브라우저 창 닫기 감지
    const handleBeforeUnload = () => {
      if (stompClientRef.current?.connected) {
        setRemoteCursors({});
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  // 웹소켓 메시지 전송 함수
  const sendFuncSpecSocketMessage = useCallback((
    action: 'CREATE' | 'UPDATE' | 'DELETE',
    funcSpec: Partial<FunctionalSpec>
  ) => {
    if (!stompClientRef.current?.connected || !projectId) return;
    console.log("funcSpec", funcSpec);
    console.log('[📤 Sending to /pub/function/update]', {
      projectId: Number(projectId),
      action,
      functionalSpec: funcSpec,
    });

    stompClientRef.current.publish({
      destination: `/pub/function/update/${projectId}`,
      body: JSON.stringify({
        projectId: Number(projectId),
        action,
        functionalSpec: funcSpec,
      }),
    });
  }, [projectId]);

  // 웹소켓 연결 및 구독 설정
  const initStomp = useCallback(() => {
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
        stompClientRef.current = stompClient;

        // 기능 명세 실시간 변경사항 구독
        stompClient.subscribe(`/sub/function/${projectId}`, message => {
          try {
            const socketMessage = JSON.parse(message.body);
            console.log('[📥 Received from /sub/function]', socketMessage);
            const { action, functionalSpec } = socketMessage;

            // 상태 업데이트 함수 수정
            const updateSpecsState = (prevSpecs: FunctionalSpec[]): FunctionalSpec[] => {
              let newData = [...prevSpecs];

              switch (action) {
                case 'CREATE': {
                  const isDuplicate = newData.some(item => item.id === functionalSpec.id);
                  if (!isDuplicate) {
                    newData = [...newData, functionalSpec];
                  }
                  break;
                }
                case 'UPDATE': {
                  newData = newData.map(item =>
                    item.id === functionalSpec.id ? functionalSpec : item
                  );
                  break;
                }
                case 'DELETE': {
                  newData = newData.filter(item => item.id !== functionalSpec.id);
                  break;
                }
              }

              return newData;
            };

            setSpecs(updateSpecsState);
          } catch (error) {
            console.error('Failed to parse socket message:', error);
          }
        });

        try {
          // 페이지 입장 알림
          const pageResourceId = `${RESOURCE_TYPES.PAGE_FUNC}-${projectId}`;
          stompClient.publish({
            destination: '/pub/presence',
            body: JSON.stringify({
              resourceId: pageResourceId,
              action: PRESENCE_ACTIONS.ENTER,
            }),
          });

          // 페이지 사용자 목록 구독
          stompClient.subscribe(`/sub/presence/${pageResourceId}`, message => {
            try {
              const data = JSON.parse(message.body);
              const currentUsers = data.users;

              // presence 메시지를 통해 현재 활성 사용자 확인 및 커서 관리
              setRemoteCursors(prev => {
                const newCursors = { ...prev };
                // 현재 활성 사용자가 아닌 커서 제거
                Object.keys(newCursors).forEach(userId => {
                  if (!currentUsers.includes(userId)) {
                    delete newCursors[userId];
                  }
                });
                return newCursors;
              });

              setActiveUsers(
                currentUsers.map((username: string) => ({
                  id: username,
                  name: username,
                  color: getUserColor(username),
                }))
              );
            } catch (error) {
              console.error('Failed to parse presence message:', error);
            }
          });
        } catch (error) {
          console.error('STOMP 초기 구독 설정 중 에러:', error);
        }
      },
      onDisconnect: () => {
        console.log('STOMP 연결 해제');
        setIsConnected(false);
        stompClientRef.current = null;
      },
      onStompError: frame => {
        console.error('STOMP 에러:', frame);
      },
    });

    try {
      stompClient.activate();
    } catch (error) {
      console.error('STOMP 클라이언트 활성화 중 에러:', error);
    }
  }, [projectId, setSpecs]);

  // 웹소켓 연결 설정
  useEffect(() => {
    if (!projectId) return;

    initStomp();

    return () => {
      if (stompClientRef.current?.connected) {
        stompClientRef.current.deactivate();
      }
    };
  }, [projectId, initStomp]);

  useEffect(() => {
    if (!isConnected || !selectedFunc?.id) return;

    // STOMP 클라이언트가 연결되어 있는지 확인
    if (!stompClientRef.current?.connected) {
      console.log('STOMP 연결이 아직 준비되지 않았습니다.');
      return;
    }

    const funcResourceId = `${RESOURCE_TYPES.FUNC_SPEC}-${selectedFunc.id}`;

    if (modalOpen) {
      try {
        // 모달 열릴 때 구독 및 입장 메시지 전송
        stompClientRef.current.publish({
          destination: '/pub/presence',
          body: JSON.stringify({
            resourceId: funcResourceId,
            action: PRESENCE_ACTIONS.ENTER,
          }),
        });

        const subscription = stompClientRef.current.subscribe(
          `/sub/presence/${funcResourceId}`,
          message => {
            try {
              const data = JSON.parse(message.body);
              setModalActiveUsers(
                data.users.map((username: string) => ({
                  id: username,
                  name: username,
                  color: getUserColor(username),
                }))
              );
            } catch (error) {
              console.error('Failed to parse presence message:', error);
            }
          }
        );

        return () => {
          try {
            // 모달 닫힐 때 구독 해제 및 퇴장 메시지 전송
            if (subscription) {
              subscription.unsubscribe();
            }
            if (stompClientRef.current?.connected) {
              stompClientRef.current.publish({
                destination: '/pub/presence',
                body: JSON.stringify({
                  resourceId: funcResourceId,
                  action: PRESENCE_ACTIONS.LEAVE,
                }),
              });
            }
          } catch (error) {
            console.error('구독 해제 중 에러:', error);
          }
        };
      } catch (error) {
        console.error('STOMP 구독 설정 중 에러:', error);
      }
    }
  }, [modalOpen, selectedFunc, isConnected]);

  useEffect(() => {
    if (projectId) {
      refetch();
    }
  }, [projectId]);

  const filteredData = (Array.isArray(specs) ? specs : [])
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
    // 메인 페이지에서 퇴장
    stompClientRef.current?.publish({
      destination: '/pub/presence',
      body: JSON.stringify({
        resourceId: `${RESOURCE_TYPES.PAGE_FUNC}-${projectId}`,
        action: PRESENCE_ACTIONS.LEAVE,
      }),
    });

    // 메인 페이지 커서 구독 해제
    if (mainPageCursorSubscription.current) {
      mainPageCursorSubscription.current.unsubscribe();
    }

    // 메인 페이지 커서 초기화
    setRemoteCursors({});

    const fullFunc = specs.find(spec => spec.id === func.funcId);
    if (fullFunc) {
      setSelectedFunc(fullFunc);
      
      // 모달창 커서 구독 설정
      const cursorSubscription: StompSubscription | null = stompClientRef.current?.subscribe(
        `/sub/cursor/${projectId}/function-detail/${fullFunc.id}`,
        message => {
          try {
            const cursorData = JSON.parse(message.body);
            const myUserId = getUserIdFromToken(sessionStorage.getItem('accessToken'));

            // 자신의 커서는 표시하지 않음
            if (cursorData.userId === myUserId) return;

            setModalRemoteCursors(prev => ({
              ...prev,
              [cursorData.userId]: {
                ...cursorData,
                color: getUserColor(cursorData.userId),
                username: cursorData.userId,
              },
            }));
          } catch (error) {
            console.error('Failed to parse cursor message:', error);
          }
        }
      ) || null;

      // 새로운 기능 명세에 입장
      const newResourceId = `${RESOURCE_TYPES.FUNC_SPEC}-${fullFunc.id}`;
      stompClientRef.current?.publish({
        destination: '/pub/presence',
        body: JSON.stringify({
          resourceId: newResourceId,
          action: PRESENCE_ACTIONS.ENTER,
        }),
      });

      // 새로운 기능 명세의 presence 구독 설정
      const presenceSubscription: StompSubscription | null = stompClientRef.current?.subscribe(
        `/sub/presence/${newResourceId}`,
        message => {
          try {
            const data = JSON.parse(message.body);
            const users = data.users.map((username: string) => ({
              id: username,
              name: username,
              color: getUserColor(username),
            }));
            
            // 모달 활성 사용자 업데이트
            setModalActiveUsers(users);

            // 현재 활성 사용자가 아닌 커서 제거
            setModalRemoteCursors(prev => {
              const newCursors = { ...prev };
              Object.keys(newCursors).forEach(userId => {
                if (!data.users.includes(userId)) {
                  delete newCursors[userId];
                }
              });
              return newCursors;
            });
            
            // 기능 명세별 활성 사용자 목록 업데이트
            setActiveUsersByFunc(prev => ({
              ...prev,
              [fullFunc.id!.toString()]: users,
            }));
          } catch (error) {
            console.error('Failed to parse presence message:', error);
          }
        }
      ) || null;

      // 구독 정보 저장
      modalSubscriptionRef.current = {
        cursor: cursorSubscription,
        presence: presenceSubscription
      };
    }
    setModalOpen(true);
  };

  const handleSave = async (form: FuncDetail) => {
    if (!projectId) return;

    try {
      if (selectedFunc) {
        // 수정
        const updatedFunc = convertFromFuncDetail(form, selectedFunc);
        const savedFunc = await updateMutation.mutateAsync(updatedFunc);
        // 실시간 전파
        sendFuncSpecSocketMessage('UPDATE', savedFunc);
      } else {
        // 생성
        const newFunc = {
          projectId: Number(projectId),
          userId: Number(form.assignee),
          functionName: form.funcName,
          functionDescription: form.description,
          category: form.category,
          priority: priorityToNumber(form.priority),
          successCase: form.successCase,
          failCase: form.failCase,
          storyPoint: form.storyPoints,
        };
        const savedFunc = await createMutation.mutateAsync(newFunc);
        // 실시간 전파
        sendFuncSpecSocketMessage('CREATE', savedFunc);
      }
      setModalOpen(false);
      setSelectedFunc(null);
    } catch (error) {
      console.error('기능 명세 저장 중 에러:', error);
    }
  };

  const handleDelete = async () => {
    if (!selectedFunc?.id) return;
    
    if (window.confirm('정말로 이 기능을 삭제하시겠습니까?')) {
      try {
        await deleteMutation.mutateAsync(selectedFunc.id);
        // WebSocket으로 삭제 전파
        sendFuncSpecSocketMessage('DELETE', { id: selectedFunc.id });
        setModalOpen(false);
        setSelectedFunc(null);
      } catch (error) {
        console.error('기능 명세 삭제 중 에러:', error);
      }
    }
  };

  const handleModalClose = () => {
    // 모달 닫을 때 현재 기능 명세에서 퇴장
    if (selectedFunc?.id) {
      const resourceId = `${RESOURCE_TYPES.FUNC_SPEC}-${selectedFunc.id}`;
      stompClientRef.current?.publish({
        destination: '/pub/presence',
        body: JSON.stringify({
          resourceId: resourceId,
          action: PRESENCE_ACTIONS.LEAVE,
        }),
      });

      // 모든 구독 해제
      if (modalSubscriptionRef.current) {
        modalSubscriptionRef.current.cursor?.unsubscribe();
        modalSubscriptionRef.current.presence?.unsubscribe();
        modalSubscriptionRef.current = null;
      }

      // 기능 명세별 활성 사용자 목록에서 현재 사용자 제거
      setActiveUsersByFunc(prev => {
        const currentUsers = prev[selectedFunc.id!.toString()] || [];
        const myUserId = getUserIdFromToken(sessionStorage.getItem('accessToken'));
        return {
          ...prev,
          [selectedFunc.id!.toString()]: currentUsers.filter(user => user.id !== myUserId),
        };
      });

      // 모달 커서 초기화
      setModalRemoteCursors({});
    }

    // 메인 페이지로 돌아갈 때 메인 페이지 presence 다시 구독
    stompClientRef.current?.publish({
      destination: '/pub/presence',
      body: JSON.stringify({
        resourceId: `${RESOURCE_TYPES.PAGE_FUNC}-${projectId}`,
        action: PRESENCE_ACTIONS.ENTER,
      }),
    });

    setModalOpen(false);
    setSelectedFunc(null);
    setModalActiveUsers([]); // 모달 닫을 때 모달 활성 사용자 목록 초기화
  };

  if (!projectId) return null;

  return (
    <div
      ref={containerRef}
      className="mt-2 min-h-screen w-full flex flex-col bg-gray-50 relative"
    >
      {/* 메인 페이지 원격 커서 렌더링 */}
      {!modalOpen && Object.values(remoteCursors).map(cursor => (
        <RemoteCursor
          key={cursor.userId}
          x={cursor.x}
          y={cursor.y}
          username={cursor.username}
          color={cursor.color}
        />
      ))}
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
          <div className="ml-4 flex items-center gap-4">
            <ActiveUsers users={activeUsers} size="medium" />
            <div className="flex gap-2">
              <FuncAddButton onClick={handleAdd} />
              <JiraAddButton onClick={handleJiraAdd} />
            </div>
          </div>
        </div>
        <div className="w-full flex-1">
          <FuncTable
            data={filteredData}
            onRowClick={handleRowClick}
            selectedCategory={selectedCategory}
            activeUsersByFunc={activeUsersByFunc}
          />
        </div>
        {modalOpen && (
          <FuncDetailModal
            func={selectedFunc ? convertToFuncDetail(selectedFunc) : null}
            onClose={handleModalClose}
            onSave={handleSave}
            onDelete={handleDelete}
            activeUsers={modalActiveUsers}
            onMouseMove={handleModalMouseMove}
            remoteCursors={modalRemoteCursors}
            sendFuncSocketMessage={(action, funcDetail) => {
              if (!selectedFunc?.id) return;

              const updated = convertFromFuncDetail(funcDetail, selectedFunc);
              sendFuncSpecSocketMessage(action, updated);
            }}
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
    </div>
  );
};

export default DevelopFunc;
