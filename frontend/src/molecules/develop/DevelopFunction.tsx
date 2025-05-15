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
import { Client } from '@stomp/stompjs';
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
  const containerRef = useRef<HTMLDivElement>(null);

  const { specs } = useFunctionalSpecStore();
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

  // 마우스 이벤트 핸들러
  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!containerRef.current || !stompClientRef.current?.connected) return;

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
    [projectId]
  );

  // 마우스 이벤트 리스너 등록
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener('mousemove', handleMouseMove);
    return () => {
      container.removeEventListener('mousemove', handleMouseMove);
    };
  }, [handleMouseMove]);

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
        // 커서 위치 구독
        stompClient.subscribe(`/sub/cursor/${projectId}/function`, message => {
          try {
            const cursorData = JSON.parse(message.body);
            const myUserId = getUserIdFromToken(token);

            // 자신의 커서는 표시하지 않음
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
        });
        // 기능 명세별 구독 설정
        if (specs.length > 0) {
          specs.forEach(func => {
            if (func.id) {
              const funcResourceId = `${RESOURCE_TYPES.FUNC_SPEC}-${func.id}`;
              stompClient.subscribe(
                `/sub/presence/${funcResourceId}`,
                message => {
                  try {
                    const data = JSON.parse(message.body);
                    setActiveUsersByFunc(prev => ({
                      ...prev,
                      [func.id!.toString()]: data.users.map(
                        (username: string) => ({
                          id: username,
                          name: username,
                          color: getUserColor(username),
                        })
                      ),
                    }));
                  } catch (error) {
                    console.error('Failed to parse presence message:', error);
                  }
                }
              );
            }
          });
        }
      },
      onDisconnect: () => {
        console.log('STOMP 연결 해제');
        setIsConnected(false);

        // 연결이 끊어질 때 페이지에서 퇴장 처리
        const pageResourceId = `${RESOURCE_TYPES.PAGE_FUNC}-${projectId}`;
        stompClient.publish({
          destination: '/pub/presence',
          body: JSON.stringify({
            resourceId: pageResourceId,
            action: PRESENCE_ACTIONS.LEAVE,
          }),
        });

        // 현재 보고 있는 기능 명세 상세 페이지가 있다면 퇴장 처리
        if (selectedFunc?.id) {
          const funcResourceId = `${RESOURCE_TYPES.FUNC_SPEC}-${selectedFunc.id}`;
          stompClient.publish({
            destination: '/pub/presence',
            body: JSON.stringify({
              resourceId: funcResourceId,
              action: PRESENCE_ACTIONS.LEAVE,
            }),
          });
        }

        // 연결 해제 후 사용자 목록 초기화
        setActiveUsers([]);
        setModalActiveUsers([]);
        setActiveUsersByFunc({});
        setRemoteCursors({});
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
        stompClientRef.current.publish({
          destination: '/pub/presence',
          body: JSON.stringify({
            resourceId: pageResourceId,
            action: PRESENCE_ACTIONS.LEAVE,
          }),
        });
        setRemoteCursors({}); // 페이지 나갈 때 커서 초기화
        stompClientRef.current.deactivate();
      }
    };
  }, [projectId]);

  useEffect(() => {
    if (!isConnected || !selectedFunc?.id) return;

    const funcResourceId = `${RESOURCE_TYPES.FUNC_SPEC}-${selectedFunc.id}`;

    if (modalOpen) {
      // 모달 열릴 때 구독 및 입장 메시지 전송
      stompClientRef.current?.publish({
        destination: '/pub/presence',
        body: JSON.stringify({
          resourceId: funcResourceId,
          action: PRESENCE_ACTIONS.ENTER,
        }),
      });

      const subscription = stompClientRef.current?.subscribe(
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
        // 모달 닫힐 때 구독 해제 및 퇴장 메시지 전송
        subscription?.unsubscribe();
        stompClientRef.current?.publish({
          destination: '/pub/presence',
          body: JSON.stringify({
            resourceId: funcResourceId,
            action: PRESENCE_ACTIONS.LEAVE,
          }),
        });
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
      stompClientRef.current?.publish({
        destination: '/pub/presence',
        body: JSON.stringify({
          resourceId: prevResourceId,
          action: PRESENCE_ACTIONS.LEAVE,
        }),
      });
    }

    const spec = specs.find(s => s.id === func.funcId);
    if (spec) {
      setSelectedFunc(spec);
      // 새로운 기능에 입장
      const newResourceId = `${RESOURCE_TYPES.FUNC_SPEC}-${spec.id}`;
      stompClientRef.current?.publish({
        destination: '/pub/presence',
        body: JSON.stringify({
          resourceId: newResourceId,
          action: PRESENCE_ACTIONS.ENTER,
        }),
      });
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
    if (selectedFunc?.id) {
      const resourceId = `${RESOURCE_TYPES.FUNC_SPEC}-${selectedFunc.id}`;
      stompClientRef.current?.publish({
        destination: '/pub/presence',
        body: JSON.stringify({
          resourceId: resourceId,
          action: PRESENCE_ACTIONS.LEAVE,
        }),
      });
    }
    setModalOpen(false);
    setSelectedFunc(null);
  };

  if (!projectId) return null;

  return (
    <div
      ref={containerRef}
      className="mt-2 min-h-screen w-full flex flex-col bg-gray-50 relative"
    >
      {/* 원격 커서 렌더링 */}
      {Object.values(remoteCursors).map(cursor => (
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
