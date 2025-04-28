import { BsPerson } from 'react-icons/bs';
import { TbChessQueen } from 'react-icons/tb';
import { LuShieldQuestion } from 'react-icons/lu';

export type IconType = 'owner' | 'member';

interface UserFilterProps {
  type: IconType;
  className?: string;
  size?: number;
}

const UserFilter = ({ type, className, size }: UserFilterProps) => {
  const getIcon = () => {
    switch (type) {
      case 'owner':
        return (
          <div
            className={`flex items-center justify-center w-9 h-9 rounded-full bg-blue-100 ${className}`}
          >
            <TbChessQueen size={size} className="text-blue-600" />
          </div>
        );
      case 'member':
        return (
          <div
            className={`flex items-center justify-center w-9 h-9 rounded-full bg-blue-100 ${className}`}
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
