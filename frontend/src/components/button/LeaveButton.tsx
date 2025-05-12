import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDeleteProject } from '../../api/projectAPI';

interface LeaveButtonProps {
  onClick?: () => void;
}

const LeaveButton = ({ onClick }: LeaveButtonProps) => {
  const [showModal, setShowModal] = useState(false);
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { mutate: deleteProject } = useDeleteProject();

  const handleLeave = () => {
    if (projectId) {
      deleteProject(Number(projectId), {
        onSuccess: () => {
          setShowModal(false);
          navigate('/project');
          if (onClick) onClick();
        },
      });
    }
  };

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className={`px-4 py-2 text-base text-primary-600 border border-primary-600 rounded-lg bg-white hover:bg-primary-50 transition-colors`}
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
