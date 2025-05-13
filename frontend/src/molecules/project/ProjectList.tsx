import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ProjectTable from '../../components/project/ProjectTable';
import ProjectSearch from '../../components/project/ProjectSearch';
import ProjectAddButton from '../../components/project/ProjectAddButton';
import { useGetProjects } from '../../api/projectAPI';
import { getToken } from '../../api/authAPI';
import JiraAccessButton from '../../components/button/JiraAccessButton';
import { checkJiraLinked } from '../../api/jiraAPI';

interface Project {
  projectId: number;
  projectName: string;
  createdAt: string;
}

const getUserNameFromToken = (): string => {
  const token = getToken();
  if (!token) return '';
  try {
    const payload = token.split('.')[1];
    const decodedPayload = decodeURIComponent(
      atob(payload)
        .split('')
        .map(function (c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join('')
    );
    const decoded = JSON.parse(decodedPayload);
    return decoded.nickname || '';
  } catch (err) {
    return '사용자';
  }
};

const ProjectList = () => {
  const [search, setSearch] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [isJiraLinked, setIsJiraLinked] = useState(false);
  const navigate = useNavigate();
  const { data: projects = [], isLoading } = useGetProjects();

  useEffect(() => {
    const checkJiraStatus = async () => {
      try {
        const linked = await checkJiraLinked();
        setIsJiraLinked(linked);
      } catch (error) {
        console.error('Failed to check Jira status:', error);
        setIsJiraLinked(false);
      }
    };
    checkJiraStatus();
  }, []);

  const username = getUserNameFromToken();

  const filteredProjects = Array.isArray(projects)
    ? projects.filter((project: Project) =>
        project.projectName.toLowerCase().includes(search.toLowerCase())
      )
    : [];

  const handleProjectClick = (projectId: number) => {
    navigate(`/project/${projectId}`);
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h2 className=" font-bold text-gray-800">
            <span className="text-blue-600">{username}</span> 님의 프로젝트
          </h2>
          <p className="text-gray-500 mt-2 text-sm">
            프로젝트의 시작은 <b>CHEKIT</b>과 함께 진행하세요.
          </p>
        </div>
        <JiraAccessButton isLinked={isJiraLinked} />
      </div>

      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold text-gray-800">프로젝트 목록</h2>
          {filteredProjects.length > 0 && (
            <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
              총 {filteredProjects.length}개
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          <ProjectSearch search={search} onSearchChange={setSearch} />
          <ProjectAddButton />
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-16 bg-gray-50 rounded-lg shadow-sm">
          <p className="text-gray-500 font-medium">로딩 중...</p>
        </div>
      ) : filteredProjects.length > 0 ? (
        <ProjectTable
          projects={filteredProjects}
          onDetail={handleProjectClick}
        />
      ) : (
        <div className="text-center py-16 bg-gray-50 rounded-lg border border-gray-100 shadow-sm">
          <p className="text-gray-600">
            {search ? '검색 결과가 없습니다.' : '아직 프로젝트가 없습니다.'}
          </p>
          {search && (
            <button
              onClick={() => setSearch('')}
              className="mt-4 text-blue-600 hover:text-blue-800 hover:underline font-medium"
            >
              전체 프로젝트 보기
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default ProjectList;
