import { FaCheck } from 'react-icons/fa';
import { GoAlert } from 'react-icons/go';

interface DialogProps {
  isOpen: boolean;
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  success?: boolean;
}

const Dialog = ({
  isOpen,
  title,
  message,
  confirmText,
  cancelText,
  onConfirm,
  onCancel,
  success,
}: DialogProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg px-14 py-8  mx-4 shadow-xl text-center">
        <div
          className={`w-16 h-16 ${success ? 'bg-blue-100' : 'bg-red-100'} rounded-full flex items-center justify-center mx-auto mb-4`}
        >
          {success ? (
            <FaCheck className="w-8 h-8 text-blue-700" />
          ) : (
            <GoAlert className="w-8 h-8 text-red-700" />
          )}
        </div>
        <h2
          className={`text-xl font-semibold mb-2 ${success ? 'text-blue-800' : 'text-red-800'}`}
        >
          {title}
        </h2>
        <p className="text-gray-700 whitespace-pre-line mb-10">{message}</p>

        <div className="flex justify-center gap-4 w-full">
          <button
            onClick={onCancel}
            className="w-full px-6 py-2 bg-gray-200 hover:bg-gray-300 rounded-md text-sm transition text-slate-700"
          >
            <b>{cancelText}</b>
          </button>
          <button
            onClick={onConfirm}
            className={`w-full px-6 py-2 ${success ? 'bg-blue-700 hover:bg-blue-800' : 'bg-red-700 hover:bg-red-800'} text-white rounded-md text-sm transition`}
          >
            <b>{confirmText}</b>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dialog;
