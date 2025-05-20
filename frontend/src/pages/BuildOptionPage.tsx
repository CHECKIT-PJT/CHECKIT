import { Outlet, useLocation, useNavigate, useParams } from 'react-router-dom';
import ConventionSelect from '../molecules/convention/ConventionSelect';
import { IoArrowBack } from 'react-icons/io5';
import useProjectStore from '../stores/projectStore';
import { useEffect } from 'react';

const BuildOptionPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const params = useParams();
  const projectId = params.projectId || '1';
  const { currentProject } = useProjectStore();
  const projectName = currentProject?.projectName || '';
  const currentPath = location.pathname.split('/').pop() || 'branch';

  // 페이지가 변경될 때마다 스크롤을 최상단으로 이동
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  const onClickBack = () => {
    navigate(`/project/${projectId}`);
  };

  return (
    <div className="flex flex-col">
      <div className="px-4 py-2">
        <div className="flex items-center gap-4 mb-4">
          <button
            onClick={onClickBack}
            className="p-1 hover:bg-gray-100 rounded-full"
          >
            <IoArrowBack className="w-5 h-5" />
          </button>
          <h3>
            {projectName} <span className="text-slate-400"> / SETTING</span>
          </h3>
        </div>
      </div>

      <div className="flex">
        <ConventionSelect activePath={currentPath} />

        <div className="flex-1 p-4">
          <div className="bg-white shadow-sm p-4 rounded-lg">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
};

export default BuildOptionPage;
