import { BsArrowRepeat } from 'react-icons/bs';
import { FaCheck } from 'react-icons/fa6';

export type IconType = 'ongoing' | 'done';

interface StatusFilterProps {
  type: IconType;
  className?: string;
  size?: number;
}

const StatusFilter = ({
  type,
  className = '',
  size = 24,
}: StatusFilterProps) => {
  const getIcon = () => {
    switch (type) {
      case 'ongoing':
        return (
          <div
            className={`flex items-center justify-center w-10 h-10 rounded-full bg-orange-50 ${className}`}
          >
            <BsArrowRepeat size={size} className="text-orange-400" />
          </div>
        );
      case 'done':
        return (
          <div
            className={`flex items-center justify-center w-10 h-10 rounded-full bg-green-50 ${className}`}
          >
            <FaCheck size={size} className="text-green-500" />
          </div>
        );
      default:
        return (
          <div
            className={`flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 ${className}`}
          >
            <BsArrowRepeat size={size} className="text-gray-400" />
          </div>
        );
    }
  };

  return getIcon();
};

export default StatusFilter;
