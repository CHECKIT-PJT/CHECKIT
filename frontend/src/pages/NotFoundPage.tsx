import React, { useEffect, useState } from 'react';

interface NotFoundPageProps {
  homeUrl?: string;
  message?: string;
}

const NotFoundPage: React.FC<NotFoundPageProps> = ({
  homeUrl = '/',
  message = '요청하신 리소스를 찾을 수 없습니다.',
}) => {
  const [terminalText, setTerminalText] = useState<string[]>([]);
  const [currentLine, setCurrentLine] = useState<string>('');
  const [showCursor, setShowCursor] = useState<boolean>(true);
  const [isTyping, setIsTyping] = useState<boolean>(true);

  // 터미널 텍스트 내용
  const terminalLines = [
    '> npm start',
    'Starting development server...',
    'Compiling...',
    'Error: Unable to locate requested route.',
    'ENOTFOUND: Server responded with 404',
    'Error Code: 0x00000194',
    'Attempting to resolve...',
    'Resolution failed: Path not found.',
    '> status --verbose',
    `HTTP 404: ${message}`,
    '> suggest --fix',
    'Suggestion: Navigate back to base directory',
    '> _',
  ];

  // 터미널 텍스트 타이핑 효과
  useEffect(() => {
    if (terminalText.length >= terminalLines.length) {
      setIsTyping(false);
      return;
    }

    let currentLineIndex = terminalText.length;
    let currentCharIndex = 0;
    const targetLine = terminalLines[currentLineIndex];

    const typingInterval = setInterval(
      () => {
        if (currentCharIndex <= targetLine.length) {
          setCurrentLine(targetLine.substring(0, currentCharIndex));
          currentCharIndex++;
        } else {
          clearInterval(typingInterval);
          setTerminalText(prev => [...prev, targetLine]);
          setCurrentLine('');
          currentCharIndex = 0;
        }
      },
      Math.random() * 30 + 20
    ); // 타이핑 속도를 약간 랜덤하게 설정

    return () => clearInterval(typingInterval);
  }, [terminalText]);

  // 커서 깜빡임 효과
  useEffect(() => {
    const cursorInterval = setInterval(() => {
      setShowCursor(prev => !prev);
    }, 500);

    return () => clearInterval(cursorInterval);
  }, []);

  // 디버그 모드 스타일
  const matrixEffect = () => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    document.body.appendChild(canvas);
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.zIndex = '-1';
    canvas.style.opacity = '0.05';

    const columns = Math.floor(canvas.width / 20);
    const drops: number[] = [];

    for (let i = 0; i < columns; i++) {
      drops[i] = 1;
    }

    const draw = () => {
      if (!ctx) return;
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#0F0';
      ctx.font = '15px monospace';

      for (let i = 0; i < drops.length; i++) {
        const text = String.fromCharCode(Math.floor(Math.random() * 128));
        ctx.fillText(text, i * 20, drops[i] * 20);

        if (drops[i] * 20 > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }

        drops[i]++;
      }
    };

    const matrixInterval = setInterval(draw, 50);
    return () => {
      clearInterval(matrixInterval);
      document.body.removeChild(canvas);
    };
  };

  useEffect(() => {
    const cleanup = matrixEffect();
    return cleanup;
  }, []);

  return (
    <div
      style={{
        fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
        backgroundColor: '#1e1e1e',
        color: '#d4d4d4',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '20px',
        boxSizing: 'border-box',
      }}
    >
      <div
        style={{
          width: '80%',
          maxWidth: '800px',
          backgroundColor: '#252526',
          borderRadius: '6px',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
          overflow: 'hidden',
        }}
      >
        {/* 터미널 헤더 */}
        <div
          style={{
            backgroundColor: '#333333',
            padding: '8px 16px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: '1px solid #1e1e1e',
          }}
        >
          <div
            style={{
              display: 'flex',
              gap: '8px',
            }}
          >
            <div
              style={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                backgroundColor: '#ff5f56',
              }}
            ></div>
            <div
              style={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                backgroundColor: '#ffbd2e',
              }}
            ></div>
            <div
              style={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                backgroundColor: '#27c93f',
              }}
            ></div>
          </div>
          <div
            style={{
              fontSize: '12px',
              color: '#999',
            }}
          >
            404-not-found.tsx
          </div>
          <div style={{ width: '60px' }}></div>
        </div>

        {/* 줄 번호와 터미널 내용 */}
        <div
          style={{
            display: 'flex',
            backgroundColor: '#1e1e1e',
          }}
        >
          {/* 줄 번호 영역 */}
          <div
            style={{
              backgroundColor: '#252526',
              color: '#858585',
              padding: '15px 10px',
              textAlign: 'right',
              userSelect: 'none',
              fontSize: '14px',
              fontFamily: 'monospace',
              borderRight: '1px solid #333',
            }}
          >
            {terminalText.map((_, index) => (
              <div key={index} style={{ height: '20px' }}>
                {index + 1}
              </div>
            ))}
            {currentLine && (
              <div style={{ height: '20px' }}>{terminalText.length + 1}</div>
            )}
          </div>

          {/* 터미널 콘텐츠 영역 */}
          <div
            style={{
              flex: 1,
              padding: '15px 20px',
              fontSize: '14px',
              fontFamily: 'monospace',
              lineHeight: '20px',
              overflow: 'auto',
              color: '#d4d4d4',
            }}
          >
            {terminalText.map((line, index) => (
              <div
                key={index}
                style={{
                  color: line.startsWith('Error')
                    ? '#f14c4c'
                    : line.startsWith('>')
                      ? '#569cd6'
                      : line.includes('404')
                        ? '#ce9178'
                        : line.includes('Suggestion')
                          ? '#6a9955'
                          : '#d4d4d4',
                }}
              >
                {line}
              </div>
            ))}
            <div
              style={{
                color: currentLine.startsWith('Error')
                  ? '#f14c4c'
                  : currentLine.startsWith('>')
                    ? '#569cd6'
                    : currentLine.includes('404')
                      ? '#ce9178'
                      : currentLine.includes('Suggestion')
                        ? '#6a9955'
                        : '#d4d4d4',
              }}
            >
              {currentLine}
              {!isTyping || (isTyping && showCursor) ? (
                <span style={{ color: '#fff' }}>▎</span>
              ) : null}
            </div>
          </div>
        </div>

        {/* 상태 바 */}
        <div
          style={{
            backgroundColor: '#007acc',
            color: 'white',
            fontSize: '12px',
            padding: '4px 10px',
            display: 'flex',
            justifyContent: 'space-between',
          }}
        >
          <div>HTTP 404</div>
          <div>Error: 0x00000194</div>
        </div>
      </div>

      {!isTyping && (
        <div
          style={{
            marginTop: '30px',
            textAlign: 'center',
          }}
        >
          <a
            href={homeUrl}
            style={{
              display: 'inline-block',
              padding: '10px 20px',
              backgroundColor: '#0E639C',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '4px',
              fontFamily: 'monospace',
              fontSize: '14px',
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 2px 5px rgba(0, 0, 0, 0.3)',
              transition: 'all 0.2s ease',
            }}
            onMouseOver={e => {
              e.currentTarget.style.backgroundColor = '#1177bb';
            }}
            onMouseOut={e => {
              e.currentTarget.style.backgroundColor = '#0E639C';
            }}
          >
            $ cd /home
          </a>

          <div
            style={{
              marginTop: '20px',
              fontSize: '12px',
              color: '#6a9955',
              fontFamily: 'monospace',
            }}
          >
            /* 페이지를 새로고침하면 디버그 모드가 재시작됩니다 */
          </div>
        </div>
      )}
    </div>
  );
};

export default NotFoundPage;

// 사용 예시:
// import NotFoundPage from './404NotFound';
//
// function App() {
//   return (
//     <NotFoundPage
//       homeUrl="/"
//       message="요청하신 페이지를 찾을 수 없습니다."
//     />
//   );
// }
