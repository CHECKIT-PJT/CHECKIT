// ChatRoom.jsx
import { useState, useEffect, useRef } from 'react';
import { LuSendHorizontal } from 'react-icons/lu';

const ChatRoom = () => {
  const [messages, setMessages] = useState([
    { text: '안녕하세요! 무엇을 도와드릴까요?', isUser: false },
  ]);
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 채팅이 추가될 때마다 스크롤을 맨 아래로 이동
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (inputText.trim()) {
      const newMessages = [...messages, { text: inputText, isUser: true }];
      setMessages(newMessages);
      setInputText('');

      // AI 응답 시뮬레이션 (실제로는 API 호출 등으로 대체)
      setTimeout(() => {
        setMessages([
          ...newMessages,
          {
            text: '네, 도와드리겠습니다. 더 궁금한 점이 있으신가요?',
            isUser: false,
          },
        ]);
      }, 1000);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 p-3 overflow-y-auto">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`text-sm mb-3 w-fit max-w-[80%] ${
              message.isUser ? 'ml-auto text-right' : 'mr-auto text-left'
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
