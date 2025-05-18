import React from 'react';

const Loading: React.FC = () => {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black bg-opacity-30 backdrop-blur-sm">
      {/* 컵 + 빨대 */}
      <div className="relative w-14 h-36 mb-8">
        {/* 흰색 빨대 */}
        <div className="absolute -top-[28px] left-1/2 -translate-x-1/2 bottom-2 w-[6px] bg-white origin-bottom rotate-[8deg] " />

        {/* 투명 유리컵 느낌 */}
        <div
          className="absolute inset-0 px-[6px] py-[4px] border-2 border-slate-200 rounded-md shadow-md backdrop-blur-md"
          style={{
            background:
              'linear-gradient(#1BB1E7 0 0) bottom no-repeat content-box, rgba(255, 255, 255, 0.01)',
            animation: 'sip 2.5s infinite linear',
            backgroundBlendMode: 'lighten',
          }}
        />
      </div>

      {/* Loading 텍스트 */}
      <div className="flex items-center text-white text-xl tracking-[0.2em] font-light">
        {'Loading'.split('').map((char, i) => (
          <span
            key={i}
            className="animate-jump"
            style={{ animationDelay: `${i * 0.1}s` }}
          >
            {char}
          </span>
        ))}
        {[...Array(3)].map((_, i) => (
          <span
            key={i + 7}
            className="w-[6px] h-[6px] bg-white rounded-full mx-[3px] -mb-[6px] animate-jump"
            style={{ animationDelay: `${(i + 7) * 0.1}s` }}
          />
        ))}
      </div>

      <style>{`
        @keyframes sip {
          0%   { background-size: 100% 100%; }
          100% { background-size: 100% 5%; }
        }

        @keyframes jump {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }

        .animate-jump {
          display: inline-block;
          animation: jump 1s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default Loading;
