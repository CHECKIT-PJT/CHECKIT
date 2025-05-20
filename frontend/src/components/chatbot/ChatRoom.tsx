import { useState, useEffect, useRef } from 'react';
import { LuSendHorizontal } from 'react-icons/lu';
import SockJS from 'sockjs-client';
import { CompatClient, Stomp } from '@stomp/stompjs';
import { useLocation } from 'react-router-dom';

const ChatRoom = () => {
  const [isTyping, setIsTyping] = useState(false);
  const stompClientRef = useRef<CompatClient | null>(null);
  const [messages, setMessages] = useState([
    { text: '안녕하세요! 무엇을 도와드릴까요?', isUser: false },
  ]);
  const [streamingText, setStreamingText] = useState('');
  const streamingBufferRef = useRef('');
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  const getCategory = () => {
    const path = location.pathname;
    if (path.includes('/develop/function')) return 'feat';
    if (path.includes('/develop/api')) return 'api';
    if (path.includes('/develop/erd')) return 'erd';
    return null;
  };

  const category = getCategory();

  useEffect(() => {
    const token = sessionStorage.getItem('accessToken');
    const socket = new SockJS(
      `${import.meta.env.VITE_API_BASE_URL}/ws/chat?token=${token}`
    );
    const client = Stomp.over(socket);

    client.connect(
      { Authorization: `Bearer ${token}` },
      () => {
        console.log('✅ STOMP 연결 성공');
        // ✅ 메시지 수신 시 실시간 텍스트를 화면에 보여주지 않도록 수정
        client.subscribe('/user/sub/chat/stream', message => {
          const tokenChunk = message.body;
          console.log('수신한 토큰:', tokenChunk);

          if (tokenChunk === '[DONE]') {
            const finalMessage = streamingBufferRef.current.trim();
            streamingBufferRef.current = '';
            playTypingAnimation(finalMessage);
          } else {
            streamingBufferRef.current += tokenChunk;
            // ✅ setStreamingText는 제거 (중간 텍스트 UI에 안 띄움)
          }
        });
      },
      (err: unknown) => {
        console.error('❌ STOMP 연결 실패:', err);
      }
    );

    stompClientRef.current = client;

    return () => {
      client.disconnect(() => {
        console.log('📡 WebSocket 연결 종료');
      });
    };
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingText]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    await new Promise(res => setTimeout(res, 200));

    const trimmed = inputText.trim();
    if (trimmed && stompClientRef.current?.connected) {
      setMessages(prev => [...prev, { text: trimmed, isUser: true }]);

      stompClientRef.current.send(
        '/pub/chat/stream',
        {},
        JSON.stringify({
          message: trimmed,
          category,
          llm_type: 'gemma',
        })
      );

      setInputText('');
      streamingBufferRef.current = '';
      setStreamingText('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const playTypingAnimation = async (text: string) => {
    let index = 0;
    const typingSpeed = 30;
    const thinkingDelay = 300;

    setIsTyping(true);
    setStreamingText(''); // 시작 전에 초기화

    await new Promise(res => setTimeout(res, thinkingDelay));

    const temp: string[] = [];

    const intervalId = setInterval(() => {
      if (index >= text.length) {
        clearInterval(intervalId);
        setIsTyping(false);
        setStreamingText(''); // 이건 UI에서 제거
        setMessages(prev => [...prev, { text: text, isUser: false }]);
        return;
      }
      temp.push(text[index]);
      index++;
      setStreamingText(temp.join('')); // 기존 값을 계속 덮어씀
    }, typingSpeed);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 p-3 overflow-y-auto">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`text-sm mb-3 w-fit max-w-[80%] ${
              message.isUser ? 'ml-auto text-left' : 'mr-auto text-left'
            }`}
          >
            <div
              className={`rounded-lg p-2 inline-block break-words break-all ${
                message.isUser
                  ? 'bg-blue-500 text-white rounded-br-none'
                  : 'bg-gray-200 text-gray-800 rounded-bl-none'
              }`}
            >
              {message.text}
            </div>
          </div>
        ))}

        {isTyping && streamingText ? (
          <div className="text-sm mb-3 w-fit max-w-[80%] mr-auto text-left">
            <div className="rounded-lg p-2 inline-block break-words break-all bg-gray-200 text-gray-800 rounded-bl-none">
              {streamingText}
              <span className="animate-blink">|</span>
            </div>
          </div>
        ) : isTyping ? (
          <div className="text-sm mb-3 w-fit max-w-[80%] mr-auto text-left">
            <div className="rounded-lg p-2 inline-block break-words bg-gray-100 text-gray-500 italic animate-pulse">
              챗봇이 응답 중입니다...
            </div>
          </div>
        ) : null}

        <div ref={messagesEndRef} />
      </div>

      <div className="border-t p-3 bg-gray-50 text-sm">
        <div className="flex">
          <textarea
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="메시지를 입력하세요."
            className="text-xs flex-1 border rounded-l-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 resize-none min-h-[40px] max-h-[120px] overflow-y-auto"
            rows={1}
          />
          <button
            onClick={handleSendMessage}
            className="bg-blue-200 text-white px-4 py-2 rounded-r-lg hover:bg-blue-400 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
          >
            <LuSendHorizontal />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatRoom;
