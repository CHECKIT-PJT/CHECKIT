import React from 'react';

interface RemoteCursorProps {
  x: number;
  y: number;
  username: string;
  color: string;
}

const RemoteCursor: React.FC<RemoteCursorProps> = ({ x, y, username, color }) => {
  return (
    <div
      className="pointer-events-none absolute z-50"
      style={{
        left: x,
        top: y,
        transform: 'translate(-50%, -50%)',
      }}
    >
      {/* 커서 아이콘 */}
      <svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill={color}
        style={{ transform: 'rotate(-45deg)' }}
      >
        <path d="M0 0L16 6L10 10L6 16L0 0Z" />
      </svg>
      {/* 사용자 이름 */}
      <div
        className="absolute left-4 top-4 px-2 py-1 rounded text-xs text-white whitespace-nowrap"
        style={{ backgroundColor: color }}
      >
        {username}
      </div>
    </div>
  );
};

export default RemoteCursor; 