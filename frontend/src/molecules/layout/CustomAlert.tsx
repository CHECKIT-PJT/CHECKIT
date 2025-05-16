import { FaCheck } from 'react-icons/fa';

interface CustomAlertProps {
  isOpen: boolean;
  title?: string;
  message: string;
  confirmText?: string;
  onConfirm: () => void;
}

const CustomAlert = ({
  isOpen,
  title,
  message,
  confirmText,
  onConfirm,
}: CustomAlertProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg px-14 py-8 max-w-sm mx-4 shadow-xl text-center">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <FaCheck className="w-8 h-8 text-blue-700" />
        </div>
        <h2 className="text-xl font-semibold mb-2 text-blue-800">{title}</h2>
        <p className="text-gray-700 whitespace-pre-line mb-10">{message}</p>

        <button
          onClick={onConfirm}
          className="w-full px-6 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-md text-sm transition"
        >
          <b>{confirmText}</b>
        </button>
      </div>
    </div>
  );
};

export default CustomAlert;
