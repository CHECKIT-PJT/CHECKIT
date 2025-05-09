import { IoArrowBack } from "react-icons/io5";
import { useNavigate, useParams } from "react-router-dom";

interface HeaderProps {
  title?: string;
  subtitle?: string;
}

/**
 * 헤더 컴포넌트
 */
const Header: React.FC<HeaderProps> = ({
  title = "시퀀스 다이어그램",
  subtitle = "시퀀스 다이어그램을 확인하세요",
}) => {
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
          <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
          <p className="text-sm opacity-80 text-gray-600">{subtitle}</p>
        </div>
      </div>
    </header>
  );
};

export default Header;
