// import { useEffect, useRef, useState } from 'react';
// import '@dineug/erd-editor';
// import { ErdEditorElement } from '@dineug/erd-editor';
// import ToggleButton from '../../components/button/ToggleButton';

// interface Theme {
//   canvas: string;
//   table: string;
//   tableActive: string;
//   focus: string;
//   keyPK: string;
//   keyFK: string;
//   keyPFK: string;
//   font: string;
//   fontActive: string;
//   fontPlaceholder: string;
//   contextmenu: string;
//   contextmenuActive: string;
//   edit: string;
//   columnSelect: string;
//   columnActive: string;
//   minimapShadow: string;
//   scrollbarThumb: string;
//   scrollbarThumbActive: string;
//   menubar: string;
//   visualization: string;
// }

// /* eslint-disable @typescript-eslint/no-namespace */
// declare global {
//   namespace JSX {
//     interface IntrinsicElements {
//       'erd-editor': React.DetailedHTMLProps<
//         React.HTMLAttributes<ErdEditorElement>,
//         ErdEditorElement
//       >;
//     }
//   }
// }
// /* eslint-enable @typescript-eslint/no-namespace */

// const DevelopErd = () => {
//   const ref = useRef<HTMLDivElement>(null);
//   const [erdData, setErdData] = useState<any>(null);

//   useEffect(() => {
//     if (ref.current && !ref.current.querySelector('erd-editor')) {
//       const erd = document.createElement('erd-editor') as ErdEditorElement;

//       erd.style.width = '100%';
//       erd.style.height = '100%';

//       erd.setPresetTheme({
//         appearance: 'light',
//         grayColor: 'slate',
//         accentColor: 'blue',
//       });

//       erd.setAttribute('enableThemeBuilder', 'true');
//       erd.setAttribute('systemDarkMode', 'false');

//       ref.current.appendChild(erd);

//       erd.addEventListener('save', ((e: CustomEvent) => {
//         const savedData = e.detail;
//         setErdData(savedData);
//         console.log('저장된 ERD 데이터:', savedData);
//         // TODO: erd 저장 API 호출 필요
//       }) as EventListener);
//     }
//   }, []);

//   return (
//     <div className="flex flex-col items-center w-full h-full">
//       <div className="flex justify-end w-[90%] mb-2">
//         <ToggleButton />
//       </div>
//       <div className="w-[90%] h-[500px]">
//         <div ref={ref} className="w-full h-full" />
//       </div>
//     </div>
//   );
// };

// export default DevelopErd;
import { useEffect, useRef } from 'react';
import '@dineug/erd-editor';
import { ErdEditorElement } from '../../types/erd-editor';
import ToggleButton from '../../components/button/ToggleButton';
import axiosInstance from '../../api/axiosInstance';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';

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
  payload: any;
}

const DevelopErd = ({ projectId }: { projectId: number }) => {
  const ref = useRef<HTMLDivElement>(null);
  const editorRef = useRef<ErdEditorElement | null>(null);
  const stompClientRef = useRef<Client | null>(null);
  const saveInterval = useRef<number | null>(null);

  const saveToServer = async (data: any) => {
    try {
      await axiosInstance.post(`/api/erd/${projectId}/save`, data);
      console.log('✅ DB 저장 완료');
    } catch (err) {
      console.error('❌ DB 저장 실패:', err);
    }
  };

  const handleManualSave = () => {
    const editor = editorRef.current;
    if (editor) {
      const data = editor.getData();
      saveToServer(data);
    }
  };

  const initStomp = () => {
    const token = sessionStorage.getItem('accessToken');
    const sock = new SockJS(`${import.meta.env.VITE_API_BASE_URL}/ws/erd`);

    const stompClient = new Client({
      webSocketFactory: () => sock,
      connectHeaders: {
        Authorization: `Bearer ${token || ''}`,
      },
      reconnectDelay: 5000,
      onConnect: () => {
        console.log('✅ STOMP 연결 성공');

        stompClient.subscribe(`/sub/erd/${projectId}`, (message) => {
          const parsed: ErdMessage = JSON.parse(message.body);
          if (parsed.type === 'erd-update' && editorRef.current) {
            editorRef.current.setData(parsed.payload);
          }
        });
      },
      onStompError: (frame) => {
        console.error('❌ STOMP 에러:', frame);
      },
    });

    stompClient.activate();
    stompClientRef.current = stompClient;
  };

  useEffect(() => {
    const initEditor = async () => {
      if (ref.current && !ref.current.querySelector('erd-editor')) {
        const erd = document.createElement('erd-editor') as unknown as ErdEditorElement;
        editorRef.current = erd;

        erd.style.width = '100%';
        erd.style.height = '100%';
        erd.setPresetTheme({
          appearance: 'light',
          grayColor: 'slate',
          accentColor: 'blue',
        });

        erd.setAttribute('enableThemeBuilder', 'true');
        erd.setAttribute('systemDarkMode', 'false');
        ref.current.appendChild(erd);

        // 1. 초기 ERD 데이터 불러오기
        try {
          const res = await axiosInstance.get(`/api/erd/${projectId}`);
          if (res.data) {
            erd.setData(res.data);
          }
        } catch (err) {
          console.error('❌ 초기 데이터 불러오기 실패:', err);
        }

        // 2. 실시간 변경 감지
        erd.subscribe(() => {
          const data = erd.getData();
          stompClientRef.current?.publish({
            destination: `/pub/erd/update/${projectId}`,
            body: JSON.stringify({
              type: 'erd-update',
              payload: data,
            }),
          });
        });

        // 3. 수동 저장 버튼 클릭 시
        erd.addEventListener('save', ((e: CustomEvent) => {
          const data = e.detail;
          saveToServer(data);
        }) as EventListener);
      }
    };

    initEditor();
    initStomp();

    // 4. 주기적 저장 (5초)
    saveInterval.current = setInterval(() => {
      const editor = editorRef.current;
      if (editor) {
        const data = editor.getData();
        saveToServer(data);
      }
    }, 5000);

    return () => {
      stompClientRef.current?.deactivate();
      if (saveInterval.current) clearInterval(saveInterval.current);
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
        <div ref={ref} className="w-full h-full" />
      </div>
    </div>
  );
};

export default DevelopErd;