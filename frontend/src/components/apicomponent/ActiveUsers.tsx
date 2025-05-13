import { useEffect, useState } from 'react';

interface User {
  id: string;
  name: string;
  color: string;
}

interface ActiveUsersProps {
  users: User[];
  size?: 'small' | 'medium';
}

const ActiveUsers = ({ users, size = 'medium' }: ActiveUsersProps) => {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const avatarSize = size === 'small' ? 'w-6 h-6 text-xs' : 'w-8 h-8 text-sm';
  const maxDisplay = size === 'small' ? 3 : 5;
  const displayUsers = users.slice(0, maxDisplay);
  const remainingCount = users.length - maxDisplay;

  if (users.length === 0) {
    return null;
  }

  return (
    <div className="flex items-center">
      <div className="flex -space-x-2">
        {displayUsers.map((user, index) => (
          <div
            key={user.id}
            className={`${avatarSize} rounded-full bg-white border-2 flex items-center justify-center font-medium transition-transform hover:scale-110 hover:z-10`}
            style={{ 
              backgroundColor: user.color,
              borderColor: 'white',
              color: 'white',
              zIndex: users.length - index 
            }}
            title={user.name}
          >
            {getInitials(user.name)}
          </div>
        ))}
        {remainingCount > 0 && (
          <div
            className={`${avatarSize} rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-gray-600 font-medium`}
            title={`그 외 ${remainingCount}명`}
          >
            +{remainingCount}
          </div>
        )}
      </div>
    </div>
  );
};

export default ActiveUsers; 