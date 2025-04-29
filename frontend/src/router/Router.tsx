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

const Router = () => {
  // 로그인 체크
  //   const ProtectedRoute = ({ element }) => {
  //     const token = sessionStorage.getItem("token");
  //     return token ? element : <Navigate to="/" replace />;
  //   };
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Testpage />} />
        <Route path="/chapter" element={<ChapterPage />}>
          <Route index element={<Navigate to="first" replace />} />
          <Route path="first" element={<ChapterSelectFirst />} />
          <Route path="build" element={<BuildSelect />} />
          <Route path="develop" element={<DevelopSelect />}>
            <Route index element={<InputSelect />} />
            <Route path="erd" element={<DevelopErd />} />
            <Route path="api" element={<DevelopApi />} />
            <Route path="function" element={<DevelopFunction />} />
          </Route>
        </Route>
      </Route>
    </Routes>
  );
};

export default Router;
