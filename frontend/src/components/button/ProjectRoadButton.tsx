import { useNavigate, useParams } from 'react-router-dom';

const ProjectRoadButton = () => {
  const { projectId } = useParams();

  const navigate = useNavigate();

  const projectRoad = () => {
    navigate(`/chapter/${projectId}`);
  };
  return (
    <button
      className="px-4 py-2 bg-cyan-800 text-white rounded font-bold shadow transition"
      onClick={projectRoad}
    >
      프로젝트 시작하기
    </button>
  );
};

export default ProjectRoadButton;
