import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ProjectTable from '../../components/project/ProjectTable';
import ProjectSearch from '../../components/project/ProjectSearch';
import ProjectAddButton from '../../components/project/ProjectAddButton';

// 프로젝트 타입 정의
interface Project {
  projectId: number;
  projectName: string;
  createdAt: string;
}

const ProjectList = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const navigate = useNavigate();

  // 사용자 정보
  const username = '사용자';

  // 프로젝트 데이터 로드 (실제로는 API 호출로 대체)
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        // 실제 구현에서는 API로 데이터를 가져옵니다
        // const response = await fetch('/api/projects');
        // const data = await response.json();

        // 임시 데이터
        const data = [
          {
            projectId: 1,
            projectName: 'ExampleProject',
            createdAt: '2025-04-26T12:00:00Z',
          },
          {
            projectId: 2,
            projectName: 'CodeGenAI',
            createdAt: '2025-03-15T08:30:00Z',
          },
        ];

        setProjects(data);
        setIsLoading(false);
      } catch (error) {
        console.error(
          '프로젝트 데이터를 불러오는 중 오류가 발생했습니다:',
          error
        );
        setIsLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const filteredProjects = projects.filter(project =>
    project.projectName.toLowerCase().includes(search.toLowerCase())
  );

  const handleProjectClick = (projectId: number) => {
    navigate(`/project/${projectId}`);
  };

  const handleAddProject = () => {
    setIsAdding(true);
  };

  const handleSaveProject = () => {
    if (newProjectName.trim()) {
      const newProject: Project = {
        projectId: projects.length + 1, // 임시 ID 생성
        projectName: newProjectName,
        createdAt: new Date().toISOString(),
      };
      setProjects([newProject, ...projects]);
      setNewProjectName('');
      setIsAdding(false);
    }
  };

  const handleCancelAdd = () => {
    setNewProjectName('');
    setIsAdding(false);
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">
          <span className="text-blue-600">{username}</span> 님의 프로젝트
        </h1>
        <p className="text-gray-500 mt-2">
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

      {filteredProjects.length > 0 ? (
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
