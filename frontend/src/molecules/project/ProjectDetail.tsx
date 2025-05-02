import { IoArrowBack } from 'react-icons/io5';
import LeaveButton from '../../components/button/LeaveButton';
import MoveGitlabButton from '../../components/button/MoveGitlabButton';
import ProjectRoadButton from '../../components/button/ProjectRoadButton';
import { useNavigate } from 'react-router-dom';

const ProjectDetail = () => {
  // TODO : 프로젝트 이름 받아오기
  const projectName = 'S12A501';
  const navigate = useNavigate();

  const onClickBack = () => {
    navigate(-1);
  };

  return (
    <div>
      <div className="flex items-center gap-4 mb-4">
        <button
          onClick={onClickBack}
          className="p-1 hover:bg-gray-100 rounded-full"
        >
          <IoArrowBack className="w-5 h-5" />
        </button>
        <h2>{projectName}</h2>
      </div>
      <ProjectRoadButton />
      <LeaveButton />
      <MoveGitlabButton />
    </div>
  );
};

export default ProjectDetail;
