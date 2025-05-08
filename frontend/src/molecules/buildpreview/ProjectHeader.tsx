import { IoArrowBack } from "react-icons/io5";
import { useNavigate, useParams } from "react-router-dom";

interface ProjectHeaderProps {
  title?: string;
  subtitle?: string;
}

/**
 * 프로젝트 헤더 컴포넌트
 */
const ProjectHeader: React.FC<ProjectHeaderProps> = ({
  title = "프로젝트 파일 구조 미리보기",
  subtitle = "생성된 프로젝트 구조와 파일 내용을 확인하세요",
}) => {
  const navigate = useNavigate();
  const { projectId } = useParams();
  const onClickBack = () => {
    navigate(`/project/${projectId}`);
  };

  return (
    <header className="bg-blue-600 text-white p-4 flex items-start">
      <button onClick={onClickBack} className="p-1 pr-3">
        <IoArrowBack className="w-5 h-5" />
      </button>
      <div>
        <h1 className="text-xl font-bold">{title}</h1>
        <p className="text-sm opacity-80">{subtitle}</p>
      </div>
    </header>
  );
};

export default ProjectHeader;
