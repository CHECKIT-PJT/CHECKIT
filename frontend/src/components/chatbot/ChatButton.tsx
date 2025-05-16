import { useState } from 'react';
import chatbot from '../../assets/chatbot.png';
import ChatRoom from './ChatRoom';

const ChatButton = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="fixed bottom-4 left-4 z-50">
      <button
        className="w-10 h-10 border-2 border-white rounded-full bg-white shadow-lg"
        onClick={toggleChat}
      >
        <img src={chatbot} className="w-full h-full" />
      </button>
      {isOpen && (
        <div className="absolute bottom-16 left-0 w-80 h-[500px] bg-white rounded-lg shadow-xl">
          <div className="flex justify-between items-center p-3 border-b">
            <p className="text-lg font-semibold ml-2 pt-1"> AI 챗봇</p>
            <button
              className="text-gray-500 hover:text-gray-700"
              onClick={toggleChat}
            >
              ×
            </button>
          </div>
          <div className="h-[calc(100%-48px)]">
            <ChatRoom />
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatButton;
