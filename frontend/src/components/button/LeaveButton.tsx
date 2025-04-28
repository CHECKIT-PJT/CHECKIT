import { useState } from 'react';

interface LeaveButtonProps {
  onClick?: () => void;
  className?: string;
}

const LeaveButton = ({ onClick, className = '' }: LeaveButtonProps) => {
  const [showModal, setShowModal] = useState(false);

  const handleLeave = () => {
    setShowModal(false);
    if (onClick) onClick();
  };

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className={`px-4 py-2 text-base text-primary-600 border border-primary-600 rounded-lg hover:bg-primary-50 transition-colors ${className}`}
      >
        떠나기
      </button>
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white px-14 py-6 rounded-lg shadow-lg text-center animate-fadeIn">
            <p className="mb-8 mt-4 text-lg font-bold">
              정말 팀을 떠나시겠습니까?
            </p>

            <div className="flex justify-between gap-4 mb-2">
              <button
                onClick={handleLeave}
                className="px-4 py-2 bg-red-500 text-white rounded mr-2 hover:bg-red-600 transition-colors"
              >
                벗어나기
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 transition-colors"
              >
                머무르기
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default LeaveButton;
