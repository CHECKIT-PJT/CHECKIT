import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import GitLabIcon from '../../assets/gitlab.png';
import { IoArrowForward } from 'react-icons/io5';

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
      className={` flex justify-left items-center  gap-2 px-4 py-2 text-base text-primary-600 border-2 shadow border-gray-50 border-transparent rounded-lg transition-colors duration-200 
        hover:bg-gradient-to-r  hover:border-orange-500 hover:bg-white`}
    >
      <IoArrowForward className="mr-4" />
      <img src={GitLabIcon} alt="GitLab" className="w-5 h-5" />
      저장소 가기
    </button>
  );
};

export default MoveGitlabButton;
