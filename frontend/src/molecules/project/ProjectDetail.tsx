import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import InputSelect from '../develop/InputSelect';
import DocSelect from '../document/DocSelect';
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
    <div className="flex flex-1">
      <div className="w-1/5 py-2 pr-4 border-r border-gray-200 flex flex-col ">
        <div className="flex flex-col gap-4 mb-2 mt-4">
          <h3 className="font-bold text-lg ">팀 관리</h3>
          <JiraButton />
          <MoveGitlabButton />
        </div>

        <div className="flex-1 overflow-y-auto mt-10">
          <ProjectMemberList
            projectId={projectData.projectId}
            projectName={projectData.projectName}
            members={projectData.projectMembers}
            isOwner={isOwner}
          />
        </div>

        <div className=" py-2">
          <LeaveButton role={userRole} onClick={handleLeave} />
        </div>
      </div>

      <div className="w-4/5 pb-4">
        <div className="space-y-8">
          {/* 설계 */}
          <section className="relative pl-6">
            <h3 className="text-xl font-bold mb-4">설계</h3>
            <div className="relative">
              <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-gray-200" />
              <div className="ml-8 py-4 bg-white rounded-lg border border-gray-200 shadow-sm">
                <p className="text-xs text-gray-400 mb-3 ml-6">
                  설계는 좋은 코드의 시작점이며 명확한 방향성을 제시합니다
                </p>
                <InputSelect className="justify-start" />
              </div>
            </div>
          </section>

          {/* 문서 */}
          <section className="relative pl-6">
            <h3 className="text-xl font-bold mb-4">문서 확인하기</h3>
            <div className="relative">
              <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-gray-200" />
              <div className="ml-8 py-4 bg-white rounded-lg border border-gray-200 shadow-sm">
                <p className="text-xs text-gray-400 mb-3 ml-6">
                  AI 학습을 위해서는, 설계를 완료해야 정확한 파일을 확인할 수
                  있습니다.
                </p>
                <DocSelect className="justify-start" />
              </div>
            </div>
          </section>

          {/* 빌드 */}
          <section className="relative pl-6">
            <h3 className="text-xl font-bold mb-4">Build Preview</h3>
            <div className="relative">
              <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-gray-200" />
              <div className="ml-8 py-4 bg-white rounded-lg border border-gray-200 shadow-sm">
                <p className="text-xs text-gray-400 mb-3 ml-6">
                  좋은 설계는 완벽한 파일 제공에 도움이 됩니다.
                </p>
                <BuildSelect className="justify-start" />
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetail;
