import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDeleteProject, useLeaveProject } from '../../api/projectAPI';
import { toast } from 'react-toastify';
import { RiDeleteBin6Line } from 'react-icons/ri';
import { ImExit } from 'react-icons/im';

interface LeaveButtonProps {
  onClick?: () => void;
  role: 'OWNER' | 'MEMBER';
}

const LeaveButton = ({ onClick, role }: LeaveButtonProps) => {
  const [showModal, setShowModal] = useState(false);
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { mutate: deleteProject } = useDeleteProject();
  const { mutate: leaveProject } = useLeaveProject();

  const handleAction = () => {
    if (!projectId) return;

    if (role === 'OWNER') {
      deleteProject(Number(projectId), {
        onSuccess: () => {
          setShowModal(false);
          navigate('/project');
          if (onClick) onClick();
        },
        onError: (error: any) => {
          setShowModal(false);
          if (error.response?.status === 400) {
            toast.error('다른 멤버가 있어 삭제할 수 없습니다.');
          } else {
            toast.error('프로젝트 삭제 중 오류가 발생했습니다.');
          }
        },
      });
    } else {
      leaveProject(Number(projectId), {
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
        className={`px-2 py-2 text-base text-red-800 text-primary-600 rounded-lg border border-transparent hover:bg-white hover:border-gray-200 transition-all flex items-center gap-2`}
      >
        <ImExit className="w-4 h-4 " />
        {role === 'OWNER' ? '프로젝트 삭제' : '떠나기'}
      </button>
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg px-6 py-6 max-w-md mx-4 shadow-xl">
            <div className="flex justify-center mb-4">
              <RiDeleteBin6Line className="h-9 w-9 bg-red-500 opacity-40 text-white rounded-full p-2" />
            </div>
            <p className="text-gray-700 mb-6 text-center whitespace-pre-line mx-4 text-sm">
              {role === 'OWNER'
                ? '프로젝트를 정말 삭제하시겠습니까?\n 작업은 되돌릴 수 없습니다'
                : '팀을 정말 떠나시겠습니까?\n 작업은 되돌릴 수 없습니다'}
            </p>

            <div className="flex gap-3 justify-between">
              <button
                onClick={() => setShowModal(false)}
                className="w-1/2 py-2 bg-gray-200 hover:bg-gray-300 rounded-md transition text-sm"
              >
                취소
              </button>
              <button
                onClick={handleAction}
                className="w-1/2 py-2 bg-red-500 hover:bg-red-600 text-white rounded-md transition text-sm"
              >
                {role === 'OWNER' ? '삭제' : '떠나기'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default LeaveButton;
