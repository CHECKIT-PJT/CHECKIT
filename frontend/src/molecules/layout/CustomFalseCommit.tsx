import { GoAlert } from 'react-icons/go';

interface CustomFalseAlertProps {
  isOpen: boolean;
  title?: string;
  message: string;
  regex?: string; // 정규식
  example?: string; // 예시
  confirmText?: string;
  onConfirm: () => void;
}

const CustomFalseCommit = ({
  isOpen,
  title,
  message,
  regex,
  example,
  confirmText,
  onConfirm,
}: CustomFalseAlertProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg px-14 py-8 mx-4 shadow-xl text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <GoAlert className="w-8 h-8 text-red-700" />
        </div>
        <h2 className="text-xl font-semibold mb-2 text-red-800">{title}</h2>
        <p className="text-gray-700 whitespace-pre-line mb-6">{message}</p>
        {regex && (
          <div className="mb-4">
            <div className="text-sm text-gray-500 mb-1">현재 설정된 정규식</div>
            <pre className="bg-gray-100 rounded px-2 py-2 text-xs font-mono text-left whitespace-pre-wrap break-words">
              {regex}
            </pre>
          </div>
        )}
        {example && (
          <div className="mb-6">
            <div className="text-sm text-gray-500 mb-1">예시</div>
            <pre className="bg-gray-100 rounded px-2 py-2 text-xs font-mono text-left whitespace-pre-wrap break-words">
              {example}
            </pre>
          </div>
        )}
        <button
          onClick={onConfirm}
          className="w-full px-6 py-2 bg-red-700 hover:bg-red-800 text-white rounded-md text-sm transition"
        >
          <b>{confirmText}</b>
        </button>
      </div>
    </div>
  );
};

export default CustomFalseCommit;
