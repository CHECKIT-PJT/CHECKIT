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
import { useAuth } from '../../hooks/useAuth';
import RemoteCursor from '../../components/cursor/RemoteCursor';
import type { RemoteCursorData } from '../../types/cursor';
import { getUserIdFromToken } from '../../utils/tokenUtils';

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
  const [isConnected, setIsConnected] = useState(false);
<<<<<<< HEAD
  const [activeUsersByApi, setActiveUsersByApi] = useState<{ [key: string]: User[] }>({});
  const [remoteCursors, setRemoteCursors] = useState<{ [key: string]: RemoteCursorData }>({});
  const containerRef = useRef<HTMLDivElement>(null);
=======
  const [activeUsersByApi, setActiveUsersByApi] = useState<{
    [key: string]: User[];
  }>({});
>>>>>>> 0422c4812aef9f30f9efb31f6630585a78b19ed1

  // API hooks
  const { data: apiListItems = [], isLoading } = useGetApiSpecs(
    Number(projectId)
  );
  const createApiSpec = useCreateApiSpec();
  const deleteApiSpec = useDeleteApiSpec();

  // 사용자별 고유 색상 생성 함수
  const getRandomColor = (seed: string) => {
    const colors = [
      '#2563EB',
      '#DC2626',
      '#059669',
      '#7C3AED',
      '#DB2777',
      '#2563EB',
      '#EA580C',
      '#0D9488',
      '#4F46E5',
      '#BE185D',
    ];
    const index = seed
      .split('')
      .reduce((acc, char) => acc + char.charCodeAt(0), 0);
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

<<<<<<< HEAD
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
                  [api.apiSpecId!.toString()]: data.users.map((username: string) => ({
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

  // 마우스 이벤트 핸들러
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!containerRef.current || !stompClientRef.current?.connected) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    stompClientRef.current.publish({
      destination: `/pub/cursor/${projectId}/api`,
      body: JSON.stringify({
        userId: getUserIdFromToken(sessionStorage.getItem('accessToken')),
        x,
        y,
        pageType: 'api'
      })
    });
  }, [projectId]);

  // 마우스 이벤트 리스너 등록
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener('mousemove', handleMouseMove);
    return () => {
      container.removeEventListener('mousemove', handleMouseMove);
    };
  }, [handleMouseMove]);

  // 웹소켓 연결 시 커서 구독 추가
=======
>>>>>>> 0422c4812aef9f30f9efb31f6630585a78b19ed1
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
            setActiveUsers(
              data.users.map((username: string) => ({
                id: username,
                name: username,
                color: getRandomColor(username),
              }))
            );
          } catch (error) {
            console.error('Failed to parse presence message:', error);
          }
        });

<<<<<<< HEAD
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
                color: getRandomColor(cursorData.userId),
                username: cursorData.userId
              }
            }));
          } catch (error) {
            console.error('Failed to parse cursor message:', error);
          }
        });
=======
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
                          color: getRandomColor(username),
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
>>>>>>> 0422c4812aef9f30f9efb31f6630585a78b19ed1
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
        stompClientRef.current.deactivate();
      }
    };
  }, [projectId]);

  useEffect(() => {
    if (!isConnected || !selectedApi?.id) return;

    const apiResourceId = `${RESOURCE_TYPES.API_SPEC}-${selectedApi.id}`;

    if (modalOpen) {
      // 모달 열릴 때 구독 및 입장 메시지 전송
      sendPresenceMessage(apiResourceId, PRESENCE_ACTIONS.ENTER);

      const subscription = stompClientRef.current?.subscribe(
        `/sub/presence/${apiResourceId}`,
        message => {
          try {
            const data = JSON.parse(message.body);
            setModalActiveUsers(
              data.users.map((username: string) => ({
                id: username,
                name: username,
                color: getRandomColor(username),
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
        sendPresenceMessage(apiResourceId, PRESENCE_ACTIONS.LEAVE);
      };
    }
  }, [modalOpen, selectedApi, isConnected]);

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
    // 이전 API에서 퇴장
    if (selectedApi?.id) {
      const prevResourceId = `${RESOURCE_TYPES.API_SPEC}-${selectedApi.id}`;
      sendPresenceMessage(prevResourceId, PRESENCE_ACTIONS.LEAVE);
    }

    const fullApi = apiListItems.find(
      (api: { id: number | null }) => api.id === apiItem.apiSpecId
    );
    if (fullApi) {
      setSelectedApi(fullApi);
      // 새로운 API에 입장
      const newResourceId = `${RESOURCE_TYPES.API_SPEC}-${fullApi.id}`;
      sendPresenceMessage(newResourceId, PRESENCE_ACTIONS.ENTER);
    }
    setModalOpen(true);
  };

  const handleModalClose = () => {
    // 모달 닫을 때 현재 API에서 퇴장
    if (selectedApi?.id) {
      const resourceId = `${RESOURCE_TYPES.API_SPEC}-${selectedApi.id}`;
      sendPresenceMessage(resourceId, PRESENCE_ACTIONS.LEAVE);
    }
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
          queryClient.invalidateQueries({
            queryKey: ['apiSpecs', Number(projectId)],
          });
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
            queryClient.invalidateQueries({
              queryKey: ['apiSpecs', Number(projectId)],
            });
          },
        }
      );
    }
  };

  if (isLoading) {
    return <div>로딩 중...</div>;
  }

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
        />
      )}
    </div>
  );
};

export default DevelopApi;
