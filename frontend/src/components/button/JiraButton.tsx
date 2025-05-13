import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDeleteProject } from '../../api/projectAPI';
import { getJiraProjectList, linkJiraProject } from '../../api/jiraAPI';
import { toast } from 'react-toastify';

interface JiraButtonProps {
  onClick?: () => void;
}

interface JiraProject {
  id: string;
  key: string;
  name: string;
  projectTypeKey: string;
}

const JiraButton = ({ onClick }: JiraButtonProps) => {
  const [showModal, setShowModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [jiraProjects, setJiraProjects] = useState<JiraProject[]>([]);
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { mutate: deleteProject } = useDeleteProject();

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
        className={`px-4 py-2 text-base text-primary-600 border border-primary-600 rounded-lg bg-white hover:bg-gradient-to-r hover:from-blue-400 hover:to-blue-600 hover:text-white transition-colors`}
      >
        Jira 프로젝트 선택
      </button>
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white px-14 py-6 rounded-lg shadow-lg text-center w-[40%]">
            <p className="mb-2 mt-4 text-lg font-bold">
              연동할 Jira 프로젝트를 선택해주세요
            </p>
            <p className="mb-8 text-sm text-gray-500">
              팀의 Jira 프로젝트가 있어야 연동이 가능합니다.
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
                취소
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
