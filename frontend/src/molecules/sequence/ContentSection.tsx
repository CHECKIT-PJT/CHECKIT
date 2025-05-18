import React, { useState } from 'react';
import CodePanel from './CodePanel';
import DiagramPanel from './DiagramPanel';

interface ContentSectionProps {
  diagramCode: string;
  diagramUrl?: string;
  isLoading: boolean;
  onSaveCode?: (code: string) => void;
  onDownloadImage?: () => void;
  onCreateCode?: () => void;
}

const ContentSection: React.FC<ContentSectionProps> = ({
  diagramCode,
  diagramUrl,
  isLoading,
  onSaveCode,
  onDownloadImage,
  onCreateCode,
}) => {
  const [currentCode, setCurrentCode] = useState(diagramCode);

  // 코드 변경 시 상태 업데이트
  const handleCodeChange = (newCode: string) => {
    setCurrentCode(newCode);
  };

  // 코드 저장 핸들러
  const handleSaveCode = (code: string) => {
    if (onSaveCode) {
      onSaveCode(code);
    } else {
      navigator.clipboard
        .writeText(code)
        .then(() => alert('코드가 클립보드에 복사되었습니다.'))
        .catch((err) => console.error('클립보드 복사 실패:', err));
    }
  };

  // 다이어그램 생성 핸들러
  const handleCreateCode = () => {
    if (onCreateCode) {
      onCreateCode();
    }
  };

  // 다이어그램 다운로드 핸들러
  const handleDownloadImage = () => {
    if (onDownloadImage) {
      onDownloadImage();
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* 주요 액션 버튼 영역 - 화면 상단에 배치 */}
      <div className="flex items-center justify-end gap-3 px-4 py-3 bg-gray-50 border-b border-gray-200">
        <button
          onClick={handleCreateCode}
          disabled={isLoading}
          className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          다이어그램 생성
        </button>
      </div>

      {/* 패널 콘텐츠 영역 */}
      <div className="flex flex-1 p-4 overflow-hidden bg-white">
        <CodePanel
          code={diagramCode}
          onSave={handleSaveCode}
          onCreate={handleCreateCode}
          onChange={handleCodeChange}
        />
        <DiagramPanel
          diagramUrl={diagramUrl}
          isLoading={isLoading}
          onDownload={handleDownloadImage}
          onCreate={handleCreateCode}
        />
      </div>
    </div>
  );
};

export default ContentSection;
