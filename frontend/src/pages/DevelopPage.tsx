import { Outlet, useNavigate, useLocation, useParams } from 'react-router-dom';
import { IoArrowBack } from 'react-icons/io5';
import { FaFolder, FaFolderOpen } from 'react-icons/fa';
import useProjectStore from '../stores/projectStore';

function DevelopPage() {
  const params = useParams();
  const projectId = params.projectId || '1';
  const { currentProject } = useProjectStore();

  const projectName = currentProject?.projectName || '';
  const location = useLocation();
  const currentPath = location.pathname;

  const url = `/project/${projectId}`;

  const tabs = [
    { id: 'erd', label: 'erd', path: `${url}/develop/erd` },
    { id: 'api', label: 'api', path: `${url}/develop/api` },
    { id: 'function', label: 'function', path: `${url}/develop/function` },
  ];

  const navigate = useNavigate();

  const onClickBack = () => {
    // 프로젝트 상세 페이지로 이동
    navigate(`/project/${projectId}`);
  };

  const handleTabClick = (path: string) => {
    navigate(path);
  };

  return (
    <div className="flex flex-col px-4 py-2">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-4 ">
          <button
            onClick={onClickBack}
            className="p-1 hover:bg-gray-100 rounded-full"
          >
            <IoArrowBack className="w-5 h-5" />
          </button>
          <h3>
            {projectName} <span className="text-slate-400"> / DEVELOP</span>
          </h3>
        </div>

        {/* 탭을 오른쪽으로 이동 */}
        <div className="flex ">
          {tabs.map(tab => {
            const isActive = currentPath.includes(tab.id);
            return (
              <div
                key={tab.id}
                onClick={() => handleTabClick(tab.path)}
                className={` flex items-center px-8 py-2 cursor-pointer border-x border-t rounded-t-md ${
                  isActive
                    ? 'bg-gray-50 text-blue-600 border-gray-700'
                    : 'bg-gray-200 text-gray-600 border-gray-200 border-b border-b-gray-700'
                }`}
              >
                {isActive ? (
                  <FaFolderOpen className="mr-2 text-blue-600" />
                ) : (
                  <FaFolder className="mr-2" />
                )}
                <span>{tab.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex-1 h-screen overflow-hidden">
        <Outlet />
      </div>
    </div>
  );
}

export default DevelopPage;
