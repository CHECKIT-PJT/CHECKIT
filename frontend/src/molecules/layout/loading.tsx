const Loading = () => {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black bg-opacity-30 backdrop-blur-sm">
      {/* 컵 + 빨대 */}
      <div className="relative w-20 h-52 mb-8">
        {/* 흰색 빨대 */}
        <div className="absolute -top-[28px] left-1/2 -translate-x-1/2 bottom-2 w-[6px] bg-white origin-bottom rotate-[8deg]" />

        {/* SSAFY 세로 글씨 (컵 안 중앙) */}
        <div
          className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none"
          style={{
            zIndex: 3,
          }}
        >
          <span className="flex flex-col items-center text-[#0056C2] font-bold text-2xl tracking-widest h-full justify-center font-tmoney select-none">
            {/* 세로 글씨로 각 글자 한 줄씩 */}
            {Array.from('SSAFY').map((char, i) => (
              <span key={i}>{char}</span>
            ))}
          </span>
        </div>

        {/* 파란 컵 내용물 (비워지면서 SSAFY가 드러남) */}
        <div
          className="absolute inset-0 px-[6px] py-[4px] border-2 border-slate-200 rounded-md shadow-md backdrop-blur-md overflow-hidden"
          style={{
            zIndex: 3,
            // 파란 컵 내용물이 줄어들며 SSAFY가 보이도록
          }}
        >
          {/* 파란색 내용물에 애니메이션 적용 */}
          <div
            className="absolute left-0 bottom-0 w-full"
            style={{
              height: '100%',
              background: 'linear-gradient(#1BB1E7 0 0) bottom no-repeat',
              animation: 'sip-fill 2.5s infinite linear',
            }}
          />
        </div>
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
        @keyframes sip-fill {
          0%   { height: 100%; }
          100% { height: 5%; }
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
