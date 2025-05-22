import { FaDatabase, FaCode, FaFileAlt } from 'react-icons/fa';
import { IoArrowBack } from 'react-icons/io5';
import { useNavigate, useLocation, useParams } from 'react-router-dom';

interface SidebarMenuProps {
  activePath: string;
}

const ConventionSelect = ({ activePath }: SidebarMenuProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  const params = useParams();
  const projectId = params.projectId || '1';

  const onClickBack = () => {
    // 프로젝트 상세 페이지로 이동
    navigate(`/project/${projectId}`);
  };

  const menuOptions = [
    {
      id: 'branch',
      title: '브랜치 전략',
      icon: <FaDatabase size={16} />,
      color: 'bg-gray-700',
      emoji: '🌿',
    },
    {
      id: 'commit',
      title: '커밋 컨벤션',
      icon: <FaFileAlt size={16} />,
      color: 'bg-green-200',
      emoji: '💬',
    },
    {
      id: 'gitignore',
      title: '.gitignore 설계',
      icon: <FaCode size={16} />,
      color: 'bg-blue-200',
      emoji: '📋',
    },
  ];

  const handleMenuClick = (optionId: string) => {
    const currentPath = location.pathname.split('/').pop();

    if (currentPath !== optionId) {
      const basePath = location.pathname.split('/');
      basePath.pop();
      const newPath = [...basePath, optionId].join('/');

      navigate(newPath, { replace: true });
    }
  };

  return (
    <div className="w-64  bg-gray-50 border-r border-gray-200">
      <div className="p-4">
        <nav className="space-y-3">
          {menuOptions.map(option => (
            <div
              key={option.id}
              className={`rounded-md  ${
                activePath === option.id
                  ? 'bg-white border border-gray-200 shadow-sm'
                  : 'hover:bg-gray-200/60'
              }`}
              onClick={() => handleMenuClick(option.id)}
            >
              <div className="flex items-center px-3 py-4">
                <div
                  className={`mr-3 flex items-center justify-center w-7 h-7 rounded-lg ${
                    activePath === option.id ? option.color : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`${activePath === option.id ? 'opacity-100' : 'opacity-60'}`}
                  >
                    {option.emoji}
                  </span>
                </div>
                <div className="flex-1">
                  <div
                    className={`text-sm font-medium ${
                      activePath === option.id
                        ? 'text-gray-900'
                        : 'text-gray-700'
                    }`}
                  >
                    {option.title}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </nav>
      </div>
    </div>
  );
};

export default ConventionSelect;
