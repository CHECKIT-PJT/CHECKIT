import { useEffect, useRef } from 'react';
import '@dineug/erd-editor';
import { ErdEditorElement } from '../../types/erd-editor';
import ToggleButton from '../../components/button/ToggleButton';
import axiosInstance from '../../api/axiosInstance';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';
import { useParams } from 'react-router-dom';

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

        stompClientRef.current?.publish({
          destination: `/pub/erd/update/${projectId}`,
          body: newData,
        });

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
      stompClientRef.current?.deactivate();
      window.removeEventListener('beforeunload', handleUnload);
    };
  }, [projectId]);

  return (
    <div className="flex flex-col items-center w-full h-full">
      <div className="flex justify-between w-[90%] mb-2">
        <ToggleButton />
        <button
          onClick={handleManualSave}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          저장하기
        </button>
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

function getUserIdFromToken(token: string | null): string | null {
  if (!token) return null;
  try {
    const payload = token.split('.')[1];
    const decoded = JSON.parse(atob(payload));
    return decoded.userName;
  } catch (err) {
    console.error('JWT 파싱 실패', err);
    return null;
  }
}

export default DevelopErd;
