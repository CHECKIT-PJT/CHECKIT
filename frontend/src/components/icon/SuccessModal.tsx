import { FaCheck } from 'react-icons/fa';

// components/common/SuccessModal.tsx
interface SuccessModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  description: string;
  link?: string;
}

const SuccessModal = ({
  visible,
  onClose,
  title,
  description,
  link,
}: SuccessModalProps) => {
  if (!visible) return null;

  const handleGoToLink = () => {
    if (link) {
      window.open(link, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg px-14 py-8 max-w-sm mx-4 shadow-xl text-center">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <FaCheck className="w-8 h-8 text-blue-700" />
        </div>
        <h2 className="text-xl font-semibold mb-2 text-blue-800">{title}</h2>
        <p className="text-gray-700 whitespace-pre-line mb-10">{description}</p>

        <div className="flex justify-center gap-11">
          <button
            onClick={onClose}
            className="w-full py-2 bg-gray-200 hover:bg-gray-300 rounded-md text-sm transition text-slate-700"
          >
            <b>닫기</b>
          </button>
          {link && (
            <button
              onClick={handleGoToLink}
              className="w-full py-2 bg-blue-700 hover:bg-blue-700 text-white rounded-md text-sm text-bold transition"
            >
              <b>Jira 가기</b>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default SuccessModal;
