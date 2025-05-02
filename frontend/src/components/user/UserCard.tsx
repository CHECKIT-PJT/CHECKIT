import UserFilter, { IconType } from '../icon/UserFilter';

interface UserCardProps {
  name: string;
  role: IconType; // 'owner' | 'member'
}

const UserCard = ({ name = '조승근', role = 'owner' }: UserCardProps) => {
  return (
    <div className="flex items-center gap-3">
      {/* 이미지 주소 등록 필요 */}
      <span className="font-bold text-lg">{name}</span>
      <span>
        <UserFilter type={role} size={20} />
      </span>
    </div>
  );
};

export default UserCard;
