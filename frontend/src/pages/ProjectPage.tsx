import { Outlet } from 'react-router-dom';

const ProjectPage = () => {
  return (
    <div className="p-4">
      <Outlet />
    </div>
  );
};

export default ProjectPage;
