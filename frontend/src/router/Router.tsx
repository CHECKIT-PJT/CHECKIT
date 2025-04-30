import { Route, Routes, Navigate } from 'react-router-dom';
import Layout from '../pages/Layout';
import Testpage from '../pages/Testpage';
import ChapterPage from '../pages/ChapterPage';
import ChapterSelectFirst from '../molecules/chapter/ChapterSelectFirst';
import BuildSelect from '../molecules/chapter/BuildSelect';
import DevelopSelect from '../molecules/chapter/DevelopSelect';
import DevelopErd from '../molecules/develop/DevelopErd';
import DevelopApi from '../molecules/develop/DevelopApi';
import DevelopFunction from '../molecules/develop/DevelopFunction';
import InputSelect from '../molecules/develop/InputSelect';
import BuildPreviewPage from '../pages/BuildPreview/BuildPreviewPage';
import LandingPage from '../pages/LandingPage';
import ProjectPage from '../pages/ProjectPage';
import ProjectList from '../molecules/project/ProjectList';
import ProjectDetail from '../molecules/project/ProjectDetail';
import ProjectCreatePage from '../pages/ProjectCreatePage';

const Router = () => {
  // 로그인 체크
  //   const ProtectedRoute = ({ element }) => {
  //     const token = sessionStorage.getItem("token");
  //     return token ? element : <Navigate to="/" replace />;
  //   };
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route element={<Layout />}>
        <Route path="/" element={<Testpage />} />
        <Route path="/chapter/:projectId" element={<ChapterPage />}>
          <Route index element={<ChapterSelectFirst />} />
          <Route path="build" element={<BuildSelect />} />
          <Route path="develop" element={<DevelopSelect />}>
            <Route index element={<InputSelect />} />
            <Route path="erd" element={<DevelopErd />} />
            <Route path="api" element={<DevelopApi />} />
            <Route path="function" element={<DevelopFunction />} />
          </Route>
          <Route path="buildpreview" element={<BuildPreviewPage />} />
        </Route>
        <Route path="/project" element={<ProjectPage />}>
          <Route index element={<ProjectList />} />
          <Route path=":projectId" element={<ProjectDetail />} />
        </Route>
        <Route path="/create" element={<ProjectCreatePage />} />
      </Route>
    </Routes>
  );
};

export default Router;
