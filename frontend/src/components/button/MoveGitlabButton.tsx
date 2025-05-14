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
      className={`px-4 py-2 text-base text-primary-600 border border-transparent rounded-lg transition-colors duration-200 
        hover:bg-gradient-to-r  hover:border-orange-500 `}
    >
      저장소 가기
    </button>
  );
};

export default MoveGitlabButton;
