import { Outlet, useLocation } from 'react-router-dom';
import ConventionSelect from '../molecules/convention/ConventionSelect';

const BuildOptionPage = () => {
  const location = useLocation();
  const currentPath = location.pathname.split('/').pop() || 'branch';

  return (
    <div className="flex">
      <ConventionSelect activePath={currentPath} />

      <div className="flex-1 p-4">
        <div className="bg-white shadow-sm p-4 rounded-lg">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default BuildOptionPage;
