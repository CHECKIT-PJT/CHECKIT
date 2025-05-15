import UserFilter from './UserFilter';
import { CiStar } from 'react-icons/ci';

interface UserCardProps {
  username: string;
  role: string;
}

const UserCard = ({ username, role }: UserCardProps) => {
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
      <UserFilter type={role === 'OWNER' ? 'owner' : 'member'} size={18} />
      <div className="flex flex-col">
        <span className="font-medium text-gray-800">{username}</span>
        <span
          className={`text-xs px-2 py-0.5 rounded-full flex items-center gap-1 ${
            role === 'OWNER'
              ? 'bg-blue-50 text-blue-600'
              : 'bg-gray-50 text-gray-500'
          }`}
        >
          {role}
          {role === 'OWNER' && <CiStar className="text-yellow-500" />}
        </span>
      </div>
    </div>
  );
};

export default UserCard;
