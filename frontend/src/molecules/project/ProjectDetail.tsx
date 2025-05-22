import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import InputSelect from '../develop/InputSelect';
// import DocSelect from '../document/DocSelect';
import BuildSelect from '../buildpreview/BuildSelect';
import { useGetProjectById } from '../../api/projectAPI';
import JiraButton from '../../components/button/JiraButton';
import MoveGitlabButton from '../../components/button/MoveGitlabButton';
import LeaveButton from '../../components/button/LeaveButton';
import ProjectMemberList from '../../components/project/ProjectMemberList';
import { getToken } from '../../api/authAPI';
import useProjectStore from '../../stores/projectStore';

interface ProjectMember {
  id: number;
  userName: string;
  nickname: string;
  userEmail: string;
  role: string;
  isApproved: boolean;
}

const getUserIdFromToken = (): string | null => {
  const token = getToken();
  if (!token) return null;
  try {
    const payload = token.split('.')[1];
    const decoded = JSON.parse(atob(payload));
    return decoded.userName;
  } catch {
    return null;
  }
};

const ProjectDetail = () => {
  const { projectId } = useParams();
  const { data: response } = useGetProjectById(Number(projectId));
  const currentUserId = getUserIdFromToken();
  const { setCurrentProject } = useProjectStore();

  useEffect(() => {
    if (response?.result) {
      setCurrentProject(response.result);
    }
  }, [response, setCurrentProject]);

  if (!response?.result) {
    return <div>Loading...</div>;
  }

  const projectData = response.result;
  const isOwner = projectData.projectMembers.some(
    (member: ProjectMember) =>
      member.userName === currentUserId &&
      member.role === 'OWNER' &&
      member.isApproved
  );
  const userRole = isOwner ? 'OWNER' : 'MEMBER';

  const handleLeave = () => {
    // 나가기 처리 로직
  };

  return (
    <div className="flex flex-1 bg-gray-50">
      <div className="w-1/5 rounded-r-lg py-2 flex flex-col mr-4">
        <div className="h-full bg-white shadow-md rounded-r-lg p-4 flex flex-col">
          <div className="flex flex-col gap-4 mb-6 border-b border-gray-200 pb-4">
            <h3 className="font-bold text-xl text-gray-800">팀 관리</h3>
            <JiraButton />
            <MoveGitlabButton repositoryUrl={projectData.repositoryUrl} />
          </div>

          <div className="flex-1 overflow-y-auto mb-4">
            <ProjectMemberList
              projectId={projectData.projectId}
              projectName={projectData.projectName}
              members={projectData.projectMembers}
              isOwner={isOwner}
            />
          </div>

          <div className="mt-auto pt-4 border-t border-gray-200">
            <LeaveButton role={userRole} onClick={handleLeave} />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="w-4/5 p-2 overflow-y-auto">
        <div className="space-y-6">
          <section className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="bg-blue-900 px-6 py-3">
              <h3 className="text-xl font-bold text-white">설계 문서 작업</h3>
            </div>
            <div className="p-4 ">
              <InputSelect className="justify-start" />
            </div>
          </section>

          <section className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="bg-green-900 px-6 py-3">
              <h3 className="text-xl font-bold text-white">
                초기 설정 진행하기
              </h3>
            </div>
            <div className="p-4 ">
              <BuildSelect className="justify-start" />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetail;
