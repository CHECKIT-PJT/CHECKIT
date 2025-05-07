import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const MoveGitlabButton = () => {
  const navigate = useNavigate();
  const repository = null; // 실제 repository 주소로 대체

  const notifyWarning = () => toast.warning('프로젝트를 먼저 만들어 주세요.');

  const handleMove = () => {
    if (!repository) {
      notifyWarning();
      return;
    }
    navigate('/gitlab');
  };

  return (
    <button
      onClick={handleMove}
      className={`px-4 py-2 bg-white text-base text-primary-600 border border-primary-600 rounded-lg transition-colors duration-200 
        hover:bg-gradient-to-r hover:from-orange-400 hover:to-red-500 hover:text-white w-full`}
    >
      Repository
    </button>
  );
};

export default MoveGitlabButton;
