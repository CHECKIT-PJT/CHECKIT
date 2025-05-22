import { IoArrowBack } from 'react-icons/io5';
import { useNavigate, useParams } from 'react-router-dom';
import ActionBar from './ActionBar';
import RepoCreate from './RepoCreate';
import useProjectStore from '../../stores/projectStore';

interface ProjectHeaderProps {
  onDownload?: () => void;
  onCreate?: () => void;
}

/**
 * 프로젝트 헤더 컴포넌트
 */
const ProjectHeader = ({
  onDownload = () => {},
  onCreate = () => {},
}: ProjectHeaderProps) => {
  const navigate = useNavigate();
  const { projectId } = useParams();
  const { currentProject } = useProjectStore();
  const projectName = currentProject?.projectName || '';

  const onClickBack = () => {
    navigate(`/project/${projectId}`);
  };

  return (
    <header className=" pl-4 pt-2 pb-6 border-b">
      <div className="flex items-start justify-between">
        <div className="flex items-start">
          <button onClick={onClickBack} className="p-1 pr-3">
            <IoArrowBack className="w-5 h-5 mt-2" />
          </button>
          <div>
            <p className="text-xl font-bold mt-2">
              프로젝트 파일 구조 미리보기
            </p>
          </div>
        </div>
        <div className="flex gap-4 ">
          <ActionBar onDownload={onDownload} />
          <RepoCreate onCreate={onCreate} />
        </div>
      </div>
    </header>
  );
};

export default ProjectHeader;
