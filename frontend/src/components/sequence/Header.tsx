import { IoArrowBack } from 'react-icons/io5';
import { useNavigate, useParams } from 'react-router-dom';

interface HeaderProps {
  projectName: string;
  title?: string;
}

/**
 * 헤더 컴포넌트
 */
const Header: React.FC<HeaderProps> = ({ projectName, title = 'SEQUENCE' }) => {
  const navigate = useNavigate();
  const { projectId } = useParams();
  const onClickBack = () => {
    navigate(`/project/${projectId}`);
  };

  return (
    <header className="bg-gray-50">
      <div className="mx-auto px-4 py-4 flex items-center">
        <button
          onClick={onClickBack}
          className="p-1 hover:bg-gray-100 rounded-full pr-3"
        >
          <IoArrowBack className="w-5 h-5" />
        </button>
        <div>
          <h3 className="text-gray-900 flex items-start">
            {projectName} <p className="ml-2 text-gray-500"> / {title}</p>
          </h3>
        </div>
      </div>
    </header>
  );
};

export default Header;
