import { Navigate, Route, Routes } from 'react-router-dom';
import Layout from '../pages/Layout';
import DevelopErd from '../molecules/develop/DevelopErd';
import DevelopApi from '../molecules/develop/DevelopApi';
import DevelopFunction from '../molecules/develop/DevelopFunction';
import InputSelect from '../molecules/develop/InputSelect';
import BuildPreviewPage from '../pages/BuildPreviewPage';
import BuildOptionPage from '../pages/BuildOptionPage';
import LandingPage from '../pages/LandingPage';
import ProjectPage from '../pages/ProjectPage';
import ProjectList from '../molecules/project/ProjectList';
import ProjectDetail from '../molecules/project/ProjectDetail';
import ProjectCreatePage from '../pages/ProjectCreatePage';
import OAuthCallback from '../pages/OAuthCallBack';
import DevelopPage from '../pages/DevelopPage';
import BuildSelect from '../molecules/buildpreview/BuildSelect';
import BranchConvention from '../molecules/convention/BranchConvention';
import CommitConvention from '../molecules/convention/CommitConvetntion';
import SpringSettingPage from '../pages/SpringSettingPage';
import GitignoreConvention from '../molecules/convention/GitignoreConvention';
import InvitePage from '../pages/InvitePage';
import SequenceDiagramPage from '../pages/SequenceDiagramPage';
import MarkdownEditorPage from '../pages/MarkdownEditorPage';
import JiraAuthCallback from '../pages/JiraAuthCallBack';
import NotFoundPage from '../pages/NotFoundPage';

const Router = () => {
  // 로그인 체크
  const ProtectedRoute = ({ element }: { element: React.ReactNode }) => {
    const token = sessionStorage.getItem('accessToken');
    return token ? element : <Navigate to="/" replace />;
  };

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/gitlab/callback" element={<OAuthCallback />} />
      <Route path="/jira/callback" element={<JiraAuthCallback />} />
      <Route path="/invite" element={<InvitePage />} />
      <Route path="*" element={<NotFoundPage />} />

      {/* 로그인 페이지 */}
      <Route element={<ProtectedRoute element={<Layout />} />}>
        <Route path="/project" element={<ProjectPage />}>
          <Route index element={<ProjectList />} />
          <Route path=":projectId" element={<ProjectDetail />}>
            <Route index element={<InputSelect />} />
          </Route>
        </Route>
        <Route path="/project/:projectId/develop" element={<DevelopPage />}>
          <Route index element={<InputSelect />} />
          <Route path="erd" element={<DevelopErd />} />
          <Route path="api" element={<DevelopApi />} />
          <Route path="function" element={<DevelopFunction />} />
        </Route>
        <Route path="/create" element={<ProjectCreatePage />} />
        <Route path="/project/:projectId/build" element={<BuildSelect />} />
        <Route
          path="/project/:projectId/spring"
          element={<SpringSettingPage />}
        />
        <Route
          path="/project/:projectId/doc/sequence"
          element={<SequenceDiagramPage />}
        />
        <Route
          path="/project/:projectId/doc/readme"
          element={<MarkdownEditorPage />}
        />
        <Route
          path="/project/:projectId/buildpreview"
          element={<BuildPreviewPage />}
        />

        <Route
          path="/project/:projectId/build/option"
          element={<BuildOptionPage />}
        >
          <Route index element={<BranchConvention />} />
          <Route path="branch" element={<BranchConvention />} />
          <Route path="commit" element={<CommitConvention />} />
          <Route path="gitignore" element={<GitignoreConvention />} />
        </Route>
      </Route>
    </Routes>
  );
};

export default Router;
