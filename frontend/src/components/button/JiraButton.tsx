import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDeleteProject } from '../../api/projectAPI';
import {
  getJiraProjectList,
  linkJiraProject,
  getJiraProjectInfo,
} from '../../api/jiraAPI';
import { toast } from 'react-toastify';
import jiraLogo from '../../assets/jira-1.svg';

interface JiraButtonProps {
  onClick?: () => void;
}

interface JiraProject {
  id: string;
  key: string;
  name: string;
  projectTypeKey: string;
}

interface JiraProjectInfo {
  jiraProjectId: number;
  jiraProjectKey: string;
  jiraProjectName: string;
  projectTypeKey: string;
  jiraBoardId: number;
}

const JiraButton = ({ onClick }: JiraButtonProps) => {
  const [showModal, setShowModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [jiraProjects, setJiraProjects] = useState<JiraProject[]>([]);
  const [jiraProjectInfo, setJiraProjectInfo] =
    useState<JiraProjectInfo | null>(null);
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { mutate: deleteProject } = useDeleteProject();

  useEffect(() => {
    const fetchJiraProjectInfo = async () => {
      if (projectId) {
        try {
          const info = await getJiraProjectInfo(Number(projectId));
          setJiraProjectInfo(info);
        } catch (error) {
          console.error('Jira 프로젝트 정보를 가져오는데 실패했습니다:', error);
        }
      }
    };
    fetchJiraProjectInfo();
  }, [projectId]);

  const fetchJiraProjects = async () => {
    try {
      const projects = await getJiraProjectList();
      setJiraProjects(projects);
    } catch (error) {
      console.error('Jira 프로젝트 목록을 가져오는데 실패했습니다:', error);
      toast.error('Jira 프로젝트 목록을 가져오는데 실패했습니다.');
    }
  };

  const handleOpenModal = async () => {
    await fetchJiraProjects();
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProject || !projectId) return;

    const selectedJiraProject = jiraProjects.find(
      project => project.key === selectedProject
    );

    if (selectedJiraProject) {
      try {
        await linkJiraProject(
          projectId,
          selectedJiraProject.key,
          selectedJiraProject.name,
          selectedJiraProject.projectTypeKey
        );
        toast.success('Jira 프로젝트 등록을 성공하였습니다!');
        setShowModal(false);
        if (onClick) onClick();
      } catch (error) {
        console.error('Jira 프로젝트 연동에 실패했습니다:', error);
        toast.error('Jira 프로젝트 연동에 실패했습니다.');
      }
    }
  };

  return (
    <>
      <button
        onClick={handleOpenModal}
        className={`flex justify-center items-center gap-2 px-4 py-2 text-base text-primary-600 border border-transparent rounded-lg hover:bg-white hover:border-blue-500 transition-colors`}
      >
        <img src={jiraLogo} className="w-4 h-4" />
        연동하기
      </button>
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white px-14 py-6 rounded-lg shadow-lg text-center w-[40%]">
            <p className="mb-6 mt-4 text-xl font-bold">
              연동할 Jira 프로젝트를 선택해주세요
            </p>
            <p className="mb-8  text-gray-500">
              {jiraProjectInfo
                ? `현재 연동된 Jira 프로젝트: ${jiraProjectInfo.jiraProjectName}`
                : '팀의 Jira 프로젝트가 있어야 연동이 가능합니다.'}
            </p>
            <select
              value={selectedProject}
              onChange={e => setSelectedProject(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-6 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              required
            >
              <option value="" disabled hidden>
                프로젝트를 선택하세요
              </option>
              {jiraProjects.map(project => (
                <option key={project.id} value={project.key}>
                  {project.name}
                </option>
              ))}
            </select>
            <div className="flex justify-between gap-4 mb-2">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 transition-colors"
              >
                뒤로가기
              </button>
              <button
                onClick={handleSubmit}
                className="px-4 py-2 bg-blue-700 text-white rounded mr-2 hover:bg-blue-900 transition-colors"
              >
                연동하기
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default JiraButton;
