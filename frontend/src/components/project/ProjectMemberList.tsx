import { toast } from 'react-toastify';
import MemberAddButton from '../button/MemberAddButton';
import { useApproveMember } from '../../api/projectAPI';
import { CiStar } from 'react-icons/ci';

interface ProjectMember {
  id: number;
  userName: string;
  nickname: string;
  role: 'OWNER' | 'MEMBER';
  isApproved: boolean;
}

interface ProjectMemberListProps {
  projectId: number;
  projectName: string;
  members: ProjectMember[];
  isOwner: boolean;
}

const ProjectMemberList = ({
  projectId,
  projectName,
  members,
  isOwner,
}: ProjectMemberListProps) => {
  const { mutate: approveMember } = useApproveMember();

  const handleApprove = (memberId: number) => {
    approveMember(
      { projectId, memberId },
      {
        onSuccess: () => {
          toast.success('멤버 승인이 완료되었습니다.');
        },
      }
    );
  };

  return (
    <div className="flex-1">
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-bold text-lg">팀 멤버</h3>
        <MemberAddButton projectId={projectId} projectName={projectName} />
      </div>
      <ul>
        {members
          .filter(member => isOwner || member.isApproved)
          .sort((a, b) => {
            if (a.role === 'OWNER' && b.role !== 'OWNER') return -1;
            if (a.role !== 'OWNER' && b.role === 'OWNER') return 1;
            return a.nickname.localeCompare(b.nickname);
          })
          .map(member => (
            <li key={member.id} className="mb-2">
              <div className=" flex items-center justify-between border-b border-gray-200 pb-2">
                <div>
                  <span className="font-medium">{member.nickname}</span>
                  <span className="ml-4 mb-1 text-xs text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded-md inline-flex items-center gap-0.5">
                    {member.role}
                    {member.role === 'OWNER' && (
                      <CiStar className="text-yellow-500" />
                    )}
                  </span>
                  <div className="text-xs text-gray-400 mt-1">
                    @ {member.userName}
                  </div>
                </div>
                {isOwner && !member.isApproved && member.role !== 'OWNER' && (
                  <button
                    onClick={() => handleApprove(member.id)}
                    className="text-xs bg-blue-500 text-white px-1.5 py-1 rounded-lg hover:bg-blue-600"
                  >
                    수락
                  </button>
                )}
              </div>
            </li>
          ))}
      </ul>
    </div>
  );
};

export default ProjectMemberList;
