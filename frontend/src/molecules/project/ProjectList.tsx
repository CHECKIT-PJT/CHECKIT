import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ProjectTable from '../../components/project/ProjectTable';
import ProjectSearch from '../../components/project/ProjectSearch';
import ProjectAddButton from '../../components/project/ProjectAddButton';
import { useGetProjects } from '../../api/projectAPI';
import { getToken } from '../../api/authAPI';

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
  const navigate = useNavigate();
  const { data: projects = [], isLoading } = useGetProjects();

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
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">
          <span className="text-blue-600">{username}</span> 님의 프로젝트
        </h1>
        <p className="text-gray-500 mt-2 text-sm">
          프로젝트의 시작은 <b>CHEKIT</b>과 함께 진행하세요.
        </p>
      </div>

      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-semibold">프로젝트 목록</h2>
          {filteredProjects.length > 0 && (
            <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm">
              총 {filteredProjects.length}개
            </span>
          )}
        </div>

        <div className="flex items-center gap-4">
          <ProjectSearch search={search} onSearchChange={setSearch} />
          <ProjectAddButton />
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <p className="text-gray-500">로딩 중...</p>
        </div>
      ) : filteredProjects.length > 0 ? (
        <ProjectTable
          projects={filteredProjects}
          onDetail={handleProjectClick}
        />
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500">
            {search ? '검색 결과가 없습니다.' : '아직 프로젝트가 없습니다.'}
          </p>
          {search && (
            <button
              onClick={() => setSearch('')}
              className="mt-4 text-blue-600 hover:underline"
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
