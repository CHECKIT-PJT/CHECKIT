import { useState, useEffect, useRef, useCallback } from 'react';
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
import ActiveUsers from '../../components/apicomponent/ActiveUsers';
import { useQueryClient } from '@tanstack/react-query';
import { PRESENCE_ACTIONS, RESOURCE_TYPES } from '../../constants/websocket';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';
import type { StompSubscription } from '@stomp/stompjs';
import { useAuth } from '../../hooks/useAuth';
import RemoteCursor from '../../components/cursor/RemoteCursor';
import type { RemoteCursorData } from '../../types/cursor';
import { getUserIdFromToken } from '../../utils/tokenUtils';
import { getUserColor } from '../../utils/colorUtils';

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

interface User {
  id: string;
  name: string;
  color: string;
}

// 구독 정보를 위한 인터페이스 정의
interface ModalSubscriptions {
  cursor: StompSubscription | null;
  presence: StompSubscription | null;
}

const DevelopApi = () => {
  const queryClient = useQueryClient();
  const { projectId } = useParams<{ projectId: string }>();
  const { token } = useAuth();
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedApi, setSelectedApi] = useState<ApiDetail | null>(null);
  const [selectedDomain, setSelectedDomain] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeUsers, setActiveUsers] = useState<User[]>([]);
  const [modalActiveUsers, setModalActiveUsers] = useState<User[]>([]);
  const stompClientRef = useRef<Client | null>(null);
  const modalSubscriptionRef = useRef<ModalSubscriptions | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [activeUsersByApi, setActiveUsersByApi] = useState<{
    [key: string]: User[];
  }>({});
  const [remoteCursors, setRemoteCursors] = useState<{
    [key: string]: RemoteCursorData;
  }>({});
  const [modalRemoteCursors, setModalRemoteCursors] = useState<{
    [key: string]: RemoteCursorData;
  }>({});
  const containerRef = useRef<HTMLDivElement>(null);
  const mainPageCursorSubscription = useRef<StompSubscription | null>(null);

  // API hooks
  const { data: apiListItems = [], isLoading } = useGetApiSpecs(
    Number(projectId)
  );
  const createApiSpec = useCreateApiSpec();
  const deleteApiSpec = useDeleteApiSpec();

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
    if (!isConnected || !stompClientRef.current || !apiListItems.length) return;

    const subscriptions: { [key: string]: any } = {};

    // 각 API 명세에 대한 구독 설정
    const setupSubscriptions = () => {
      if (!stompClientRef.current?.connected) {
        console.log('STOMP 연결이 아직 준비되지 않았습니다.');
        return;
      }

      apiListItems.forEach((api: ApiDocListItem) => {
        if (api.apiSpecId) {
          const apiResourceId = `${RESOURCE_TYPES.API_SPEC}-${api.apiSpecId}`;

          // 구독 설정
          const subscription = stompClientRef.current!.subscribe(
            `/sub/presence/${apiResourceId}`,
            message => {
              try {
                const data = JSON.parse(message.body);
                setActiveUsersByApi(prev => ({
                  ...prev,
                  [api.apiSpecId!.toString()]: data.users.map(
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

          subscriptions[api.apiSpecId.toString()] = subscription;
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
  }, [isConnected, apiListItems]);

  // 마우스 이벤트 핸들러 - 메인 페이지용
  const handleNativeMouseMove = useCallback(
    (e: MouseEvent) => {
      if (
        !containerRef.current ||
        !stompClientRef.current?.connected ||
        modalOpen
      )
        return;

      const rect = containerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      stompClientRef.current.publish({
        destination: `/pub/cursor/${projectId}/api`,
        body: JSON.stringify({
          userId: getUserIdFromToken(sessionStorage.getItem('accessToken')),
          x,
          y,
          pageType: 'api',
        }),
      });
    },
    [projectId, modalOpen]
  );

  // 모달 마우스 이벤트 핸들러
  const handleModalMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!modalOpen || !stompClientRef.current?.connected || !selectedApi?.id)
        return;

      const modalElement = e.currentTarget;
      const rect = modalElement.getBoundingClientRect();
      const scrollTop = modalElement.scrollTop;
      const scrollLeft = modalElement.scrollLeft;
      
      // 스크롤 위치를 고려한 상대적 좌표 계산
      const x = e.clientX - rect.left + scrollLeft;
      const y = e.clientY - rect.top + scrollTop;

      stompClientRef.current.publish({
        destination: `/pub/cursor/${projectId}/api-detail/${selectedApi.id}`,
        body: JSON.stringify({
          userId: getUserIdFromToken(sessionStorage.getItem('accessToken')),
          x,
          y,
          pageType: 'api-detail',
        }),
      });
    },
    [projectId, modalOpen, selectedApi]
  );

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

  // 웹소켓 연결 시 커서 구독 추가
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

        // 페이지 입장 알림
        const pageResourceId = `${RESOURCE_TYPES.PAGE_API}-${projectId}`;
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
        stompClient.subscribe(`/sub/cursor/${projectId}/api`, message => {
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

        // API 명세별 구독 설정
        if (apiListItems.length > 0) {
          apiListItems.forEach((api: ApiDocListItem) => {
            if (api.apiSpecId) {
              const apiResourceId = `${RESOURCE_TYPES.API_SPEC}-${api.apiSpecId}`;
              stompClient.subscribe(
                `/sub/presence/${apiResourceId}`,
                message => {
                  try {
                    const data = JSON.parse(message.body);
                    setActiveUsersByApi(prev => ({
                      ...prev,
                      [api.apiSpecId!.toString()]: data.users.map(
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
        const pageResourceId = `${RESOURCE_TYPES.PAGE_API}-${projectId}`;
        sendPresenceMessage(pageResourceId, PRESENCE_ACTIONS.LEAVE);

        // 현재 보고 있는 API 상세 페이지가 있다면 퇴장 처리
        if (selectedApi?.id) {
          const apiResourceId = `${RESOURCE_TYPES.API_SPEC}-${selectedApi.id}`;
          sendPresenceMessage(apiResourceId, PRESENCE_ACTIONS.LEAVE);
        }

        // 연결 해제 후 사용자 목록 초기화
        setActiveUsers([]);
        setModalActiveUsers([]);
        setActiveUsersByApi({});
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
        const pageResourceId = `${RESOURCE_TYPES.PAGE_API}-${projectId}`;
        sendPresenceMessage(pageResourceId, PRESENCE_ACTIONS.LEAVE);
        setRemoteCursors({}); // 페이지 나갈 때 커서 초기화
        stompClientRef.current.deactivate();
      }
    };
  }, [projectId]);

  // 모달 열릴 때 구독 설정
  useEffect(() => {
    if (!isConnected || !selectedApi?.id) return;

    const apiResourceId = `${RESOURCE_TYPES.API_SPEC}-${selectedApi.id}`;

    if (modalOpen) {
      // 모달 열릴 때 메인 페이지 커서 초기화
      setRemoteCursors({});
      // 모달 커서도 초기화
      setModalRemoteCursors({});

      // 모달 커서 구독 - 상세 페이지 구조에 맞게 수정
      const cursorSubscription: StompSubscription | null =
        stompClientRef.current?.subscribe(
          `/sub/cursor/${projectId}/api-detail/${selectedApi.id}`,
          message => {
            try {
              const cursorData = JSON.parse(message.body);
              const myUserId = getUserIdFromToken(
                sessionStorage.getItem('accessToken')
              );

              // 자신의 커서는 표시하지 않음
              if (cursorData.userId === myUserId) return;

              // 모달창 내의 커서 상태 업데이트
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

      // presence 구독 및 입장 메시지 전송
      stompClientRef.current?.publish({
        destination: '/pub/presence',
        body: JSON.stringify({
          resourceId: apiResourceId,
          action: PRESENCE_ACTIONS.ENTER,
        }),
      });

      const presenceSubscription: StompSubscription | null =
        stompClientRef.current?.subscribe(
          `/sub/presence/${apiResourceId}`,
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
        ) || null;

      return () => {
        // 모달 닫힐 때 구독 해제 및 퇴장 메시지 전송
        cursorSubscription?.unsubscribe();
        presenceSubscription?.unsubscribe();
        stompClientRef.current?.publish({
          destination: '/pub/presence',
          body: JSON.stringify({
            resourceId: apiResourceId,
            action: PRESENCE_ACTIONS.LEAVE,
          }),
        });
        setModalRemoteCursors({}); // 모달 커서 초기화
      };
    }
  }, [modalOpen, selectedApi, isConnected, projectId]);

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
    // 메인 페이지에서 퇴장
    stompClientRef.current?.publish({
      destination: '/pub/presence',
      body: JSON.stringify({
        resourceId: `${RESOURCE_TYPES.PAGE_API}-${projectId}`,
        action: PRESENCE_ACTIONS.LEAVE,
      }),
    });

    // 메인 페이지 커서 구독 해제
    if (mainPageCursorSubscription.current) {
      mainPageCursorSubscription.current.unsubscribe();
    }

    // 메인 페이지 커서 초기화
    setRemoteCursors({});

    const fullApi = apiListItems.find(
      (api: { id: number | null }) => api.id === apiItem.apiSpecId
    );
    if (fullApi) {
      setSelectedApi(fullApi);

      // 모달창 커서 구독 설정
      const cursorSubscription: StompSubscription | null =
        stompClientRef.current?.subscribe(
          `/sub/cursor/${projectId}/api-detail/${fullApi.id}`,
          message => {
            try {
              const cursorData = JSON.parse(message.body);
              const myUserId = getUserIdFromToken(
                sessionStorage.getItem('accessToken')
              );

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

      // 새로운 API에 입장
      const newResourceId = `${RESOURCE_TYPES.API_SPEC}-${fullApi.id}`;
      if (stompClientRef.current?.connected) {
        stompClientRef.current.publish({
          destination: '/pub/presence',
          body: JSON.stringify({
            resourceId: newResourceId,
            action: PRESENCE_ACTIONS.ENTER,
          }),
        });
      }

      // 새로운 API의 presence 구독 설정
      const presenceSubscription: StompSubscription | null =
        stompClientRef.current?.subscribe(
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

              // API 별 활성 사용자 목록 업데이트
              setActiveUsersByApi(prev => ({
                ...prev,
                [fullApi.id!.toString()]: users,
              }));
            } catch (error) {
              console.error('Failed to parse presence message:', error);
            }
          }
        ) || null;

      // 구독 정보 저장
      modalSubscriptionRef.current = {
        cursor: cursorSubscription,
        presence: presenceSubscription,
      };
    }
    setModalOpen(true);
  };

  // 메인 페이지 커서 구독 설정
  useEffect(() => {
    if (!isConnected || modalOpen) return;

    // 메인 페이지 커서 구독
    mainPageCursorSubscription.current = stompClientRef.current?.subscribe(
      `/sub/cursor/${projectId}/api`,
      message => {
        try {
          const cursorData = JSON.parse(message.body);
          const myUserId = getUserIdFromToken(
            sessionStorage.getItem('accessToken')
          );

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
        mainPageCursorSubscription.current.unsubscribe();
      }
    };
  }, [isConnected, modalOpen, projectId]);

  const handleModalClose = () => {
    // 모달 닫을 때 현재 API에서 퇴장
    if (selectedApi?.id) {
      const resourceId = `${RESOURCE_TYPES.API_SPEC}-${selectedApi.id}`;
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

      // API 별 활성 사용자 목록에서 현재 사용자 제거
      setActiveUsersByApi(prev => {
        const currentUsers = prev[selectedApi.id!.toString()] || [];
        const myUserId = getUserIdFromToken(
          sessionStorage.getItem('accessToken')
        );
        return {
          ...prev,
          [selectedApi.id!.toString()]: currentUsers.filter(
            user => user.id !== myUserId
          ),
        };
      });

      // 모달 커서 초기화
      setModalRemoteCursors({});
      setModalActiveUsers([]); // 모달 활성 사용자 목록 초기화
    }

    // 메인 페이지로 돌아갈 때 메인 페이지 presence 다시 구독
    stompClientRef.current?.publish({
      destination: '/pub/presence',
      body: JSON.stringify({
        resourceId: `${RESOURCE_TYPES.PAGE_API}-${projectId}`,
        action: PRESENCE_ACTIONS.ENTER,
      }),
    });

    setModalOpen(false);
    setSelectedApi(null);
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

  return (
    <div
      ref={containerRef}
      className="mt-2 min-h-screen w-full flex flex-col bg-gray-50 relative"
    >
      {/* 메인 페이지 원격 커서 렌더링 */}
      {!modalOpen &&
        Object.values(remoteCursors).map(cursor => (
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
            <ApiAddButton onClick={handleAdd} />
          </div>
        </div>
        <div className="w-full h-full flex-1 flex justify-center items-start">
          <ApiTable
            data={filteredData}
            onRowClick={handleRowClick}
            selectedDomain={selectedDomain}
            activeUsersByApi={activeUsersByApi}
          />
        </div>
      </div>
      {modalOpen && (
        <ApiDetailModal
          api={selectedApi}
          onClose={handleModalClose}
          onSave={handleSave}
          onDelete={handleDelete}
          activeUsers={modalActiveUsers}
          onMouseMove={handleModalMouseMove}
          remoteCursors={modalRemoteCursors}
        />
      )}
    </div>
  );
};

export default DevelopApi;
