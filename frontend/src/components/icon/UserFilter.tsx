import { BsPerson } from 'react-icons/bs';
import { TbChessQueen } from 'react-icons/tb';
import { LuShieldQuestion } from 'react-icons/lu';

export type IconType = 'user' | 'leader';

interface UserFilterProps {
  type: IconType;
  className?: string;
  size?: number;
}

const UserFilter = ({ type, className = '', size = 24 }: UserFilterProps) => {
  const getIcon = () => {
    switch (type) {
      case 'leader':
        return (
          <div
            className={`flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 ${className}`}
          >
            <TbChessQueen size={size} className="text-blue-600" />
          </div>
        );
      case 'user':
        return (
          <div
            className={`flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 ${className}`}
          >
            <BsPerson size={size} className="text-blue-500" />
          </div>
        );
      default:
        return (
          <div
            className={`flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 ${className}`}
          >
            <LuShieldQuestion size={size} className="text-gray-400" />
          </div>
        );
    }
  };

  return getIcon();
};

export default UserFilter;
