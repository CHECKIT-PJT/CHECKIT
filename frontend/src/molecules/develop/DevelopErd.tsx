import { useEffect, useRef, useState, useCallback } from 'react';
import '@dineug/erd-editor';
import { ErdEditorElement } from '../../types/erd-editor';
import ToggleButton from '../../components/button/ToggleButton';
import axiosInstance from '../../api/axiosInstance';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';
import { useParams } from 'react-router-dom';
import ActiveUsers from '../../components/apicomponent/ActiveUsers';
import { PRESENCE_ACTIONS, RESOURCE_TYPES } from '../../constants/websocket';
import RemoteCursor from '../../components/cursor/RemoteCursor';
import type { RemoteCursorData } from '../../types/cursor';
import { getUserIdFromToken } from '../../utils/tokenUtils';
import { getUserColor } from '../../utils/colorUtils';

interface User {
  id: string;
  name: string;
  color: string;
}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'erd-editor': React.DetailedHTMLProps<
        React.HTMLAttributes<ErdEditorElement>,
        ErdEditorElement
      >;
    }
  }
}

interface ErdMessage {
  type: string;
  payload: string; // JSON string
}

const DevelopErd = () => {
  const { projectId } = useParams();
  const stompClientRef = useRef<Client | null>(null);
  const saveInterval = useRef<number | null>(null);
  const isInternalUpdate = useRef(false);
  const [activeUsers, setActiveUsers] = useState<User[]>([]);
  const [remoteCursors, setRemoteCursors] = useState<{
    [key: string]: RemoteCursorData;
  }>({});
  const containerRef = useRef<HTMLDivElement>(null);

  const sendPresenceMessage = (resourceId: string, action: string) => {
    if (stompClientRef.current?.connected) {
      stompClientRef.current.publish({
        destination: '/pub/presence',
        body: JSON.stringify({ resourceId, action }),
      });
    }
  };

  const saveToServer = async (jsonString: string) => {
    try {
      await axiosInstance.post(
        `/api/erd/${projectId}`,
        { erdJson: jsonString },
        {
          headers: { 'Content-Type': 'application/json' },
        }
      );
      console.log('DB 저장 완료');
    } catch (err) {
      console.error('DB 저장 실패:', err);
    }
  };

  const handleManualSave = () => {
    const editor = document.getElementById(
      'erd-editor'
    ) as ErdEditorElement | null;
    if (editor?.value) {
      saveToServer(editor.value);
    } else {
      console.error('❌ editor.value 사용 불가');
    }
  };

  // 마우스 이벤트 핸들러
  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!containerRef.current || !stompClientRef.current?.connected) return;

      const rect = containerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      stompClientRef.current.publish({
        destination: `/pub/cursor/${projectId}/erd`,
        body: JSON.stringify({
          userId: getUserIdFromToken(sessionStorage.getItem('accessToken')),
          x,
          y,
          pageType: 'erd',
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
        setActiveUsers([]);
      }
    };

    // 브라우저 창 닫기 감지
    const handleBeforeUnload = () => {
      if (stompClientRef.current?.connected) {
        setRemoteCursors({});
        setActiveUsers([]);
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

        // ERD 페이지 입장 알림
        const pageResourceId = `page-erd-${projectId}`;
        stompClient.publish({
          destination: '/pub/presence',
          body: JSON.stringify({
            resourceId: pageResourceId,
            action: PRESENCE_ACTIONS.ENTER,
          }),
        });

        // ERD 페이지 사용자 목록 구독
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
        stompClient.subscribe(`/sub/cursor/${projectId}/erd`, message => {
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

        // ERD 실시간 수정 구독
        stompClient.subscribe(`/sub/erd/${projectId}`, message => {
          const parsed = JSON.parse(message.body);

          const myUserId = getUserIdFromToken(token);

          if (parsed.userId === myUserId) {
            // 내가 보낸 메시지는 무시
            return;
          }

          const editor = document.getElementById(
            'erd-editor'
          ) as ErdEditorElement | null;
          if (editor && parsed.payload && editor.value !== parsed.payload) {
            isInternalUpdate.current = true;
            editor.value = parsed.payload; // 실시간 반영
          } else {
            console.error('editor.value와 parsed.payload값이 같습니다.');
          }
        });
      },
      onDisconnect: () => {
        console.log('STOMP 연결 해제');

        // 연결이 끊어질 때 페이지에서 퇴장 처리
        const pageResourceId = `page-erd-${projectId}`;
        sendPresenceMessage(pageResourceId, PRESENCE_ACTIONS.LEAVE);

        // 연결 해제 후 사용자 목록 초기화
        setActiveUsers([]);
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
    const handleUnload = () => {
      const editor = document.getElementById(
        'erd-editor'
      ) as ErdEditorElement | null;
      if (editor?.value) {
        navigator.sendBeacon(
          `/api/erd/${projectId}`,
          JSON.stringify({ erdJson: editor.value })
        );
      }
    };
    window.addEventListener('beforeunload', handleUnload);

    const initEditor = async () => {
      await customElements.whenDefined('erd-editor');
      const editor = document.getElementById(
        'erd-editor'
      ) as ErdEditorElement | null;
      if (!editor) {
        console.error(' editor not found');
        return;
      }

      editor.style.width = '100%';
      editor.style.height = '100%';
      editor.setPresetTheme({
        appearance: 'light',
        grayColor: 'slate',
        accentColor: 'blue',
      });

      try {
        const res = await axiosInstance.get(`/api/erd/${projectId}`);
        if (res.data.erdJson) {
          isInternalUpdate.current = true;
          editor.value = res.data.erdJson;
        }
      } catch (err) {
        console.error('초기 데이터 불러오기 실패:', err);
      }

      // 실시간 변경 감지 (내가 수정할 때)
      editor.addEventListener('change', event => {
        if (isInternalUpdate.current) {
          isInternalUpdate.current = false;
          return;
        }

        const newData = (event.target as ErdEditorElement).value;

        if (stompClientRef.current?.connected) {
          stompClientRef.current.publish({
            destination: `/pub/erd/update/${projectId}`,
            body: newData,
          });
        } else {
          console.warn('❗ STOMP 연결 안 됨: publish 생략됨');
        }

        saveToServer(newData);
      });

      // 수동 저장 버튼 누를 때
      editor.addEventListener('save', ((e: CustomEvent) => {
        const data = (e.target as ErdEditorElement).value;
        saveToServer(data);
      }) as EventListener);
    };

    initEditor();
    initStomp();

    return () => {
      if (stompClientRef.current?.connected) {
        const pageResourceId = `page-erd-${projectId}`;
        sendPresenceMessage(pageResourceId, PRESENCE_ACTIONS.LEAVE);
        setRemoteCursors({}); // 페이지 나갈 때 커서 초기화
        stompClientRef.current.deactivate();
      }
      window.removeEventListener('beforeunload', handleUnload);
    };
  }, [projectId]);

  return (
    <div
      ref={containerRef}
      className="flex flex-col items-center w-full h-full relative"
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
      <div className="flex justify-between w-[90%] mb-2 mt-2">
        <div className="flex items-center gap-4">
          <ToggleButton />
        </div>
        <div className="flex items-center gap-4">
          <ActiveUsers users={activeUsers} size="medium" />
          <button
            onClick={handleManualSave}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
          >
            저장하기
          </button>
        </div>
      </div>
      <div className="w-[90%] h-[500px]">
        <erd-editor
          id="erd-editor"
          enableThemeBuilder="true"
          systemDarkMode="false"
          style={{ width: '100%', height: '100%' }}
        />
      </div>
    </div>
  );
};

export default DevelopErd;
