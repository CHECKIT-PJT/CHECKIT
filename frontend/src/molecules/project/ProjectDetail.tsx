import { IoArrowBack } from 'react-icons/io5';
import InputSelect from '../develop/InputSelect';
import LeaveButton from '../../components/button/LeaveButton';
import MoveGitlabButton from '../../components/button/MoveGitlabButton';
import MemberAddButton from '../../components/button/MemberAddButton';
import { useNavigate, useParams } from 'react-router-dom';
import DocSelect from '../document/DocSelect';
import BuildSelect from '../buildpreview/BuildSelect';
import { useGetProjectById } from '../../api/projectAPI';

const ProjectDetail = () => {
  const navigate = useNavigate();
  const { projectId } = useParams();

  const { data: response } = useGetProjectById(Number(projectId));

  const onClickBack = () => {
    navigate('/project');
  };

  if (!response?.result) {
    return <div>Loading...</div>;
  }

  const projectData = response.result;

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between gap-4 pb-4 border-b border-gray-200 mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={onClickBack}
            className="p-1 hover:bg-gray-100 rounded-full"
          >
            <IoArrowBack className="w-5 h-5" />
          </button>
          <h3 className="font-bold text-gray-800 highlight">
            {projectData.projectName}
          </h3>
        </div>
        <div className="flex gap-4">
          <LeaveButton />
          <MoveGitlabButton />
        </div>
      </div>

      <div className="flex flex-1">
        <div className="w-1/5 p-4 border-r border-gray-200 flex flex-col">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg">팀 멤버</h3>
              <MemberAddButton
                projectId={projectData.projectId}
                projectName={projectData.projectName}
              />
            </div>
            <ul>
              {projectData.projectMembers.map(
                (member: {
                  id: number;
                  nickname: string;
                  userName: string;
                  role: string;
                }) => (
                  <li key={member.id} className="mb-2">
                    <span className="font-medium">{member.nickname}</span>

                    <span className="ml-2 text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-md">
                      {member.role}
                    </span>
                    <div className="text-xs text-gray-400 ml-1">
                      {member.userName}
                    </div>
                  </li>
                )
              )}
            </ul>
          </div>
        </div>
        {/* 설계 */}
        <div className="w-4/5 pb-4">
          <div className="space-y-8">
            <div className="relative">
              <div className="pl-6">
                <h3 className="text-xl font-bold mb-4">설계</h3>
                <div className="relative">
                  <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-gray-200"></div>
                  <div className="ml-8 py-4 bg-white rounded-lg border border-gray-200 shadow-sm">
                    <p className="text-xs text-gray-400 mb-3 ml-6">
                      설계는 좋은 코드의 시작점이며 명확한 방향성을 제시합니다
                    </p>
                    <InputSelect className="justify-start" />
                  </div>
                </div>
              </div>
            </div>

            {/* 문서 확인 */}
            <div className="relative">
              <div className="pl-6">
                <h3 className="text-xl font-bold mb-4">문서 확인하기</h3>
                <div className="relative">
                  <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-gray-200"></div>
                  <div className="ml-8 py-4 bg-white rounded-lg border border-gray-200 shadow-sm">
                    <p className="text-xs text-gray-400 mb-3 ml-6">
                      AI 학습을 위해서는, 설계를 완료해야 정확한 파일을 확인할
                      수 있습니다.
                    </p>
                    <DocSelect className="justify-start" />
                  </div>
                </div>
              </div>
            </div>

            {/* Build Preview */}
            <div className="relative">
              <div className="pl-6">
                <h3 className="text-xl font-bold mb-4">Build Preview</h3>
                <div className="relative">
                  <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-gray-200"></div>
                  <div className="ml-8 py-4 bg-white rounded-lg border border-gray-200 shadow-sm">
                    <p className="text-xs text-gray-400 mb-3 ml-6">
                      좋은 설계는 완벽한 파일 제공에 도움이 됩니다.
                    </p>
                    <BuildSelect className="justify-start" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetail;
