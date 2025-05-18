import React from 'react';
import Button from '../../components/sequence/Button';

interface DiagramPanelProps {
  diagramUrl?: string;
  isLoading: boolean;
  title?: string;
  onDownload?: () => void;
  onCreate?: () => void;
}

const DiagramPanel: React.FC<DiagramPanelProps> = ({
  diagramUrl,
  isLoading,
  title = '시퀀스 다이어그램',
  onDownload,
}) => {
  const handleDownload = () => {
    if (!diagramUrl) return;

    if (!onDownload) {
      window.open(diagramUrl, '_blank');
      return;
    }

    onDownload();
  };

  const downloadIcon = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-4 w-4"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
      />
    </svg>
  );

  return (
    <div className="w-full lg:w-1/2 pl-0 lg:pl-2">
      <div className="h-full bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm flex flex-col">
        {/* 헤더 영역 */}
        <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex justify-between items-center">
          <h3 className="font-medium text-gray-700">{title}</h3>
          <div className="text-xs text-gray-500"></div>
        </div>

        {/* 다이어그램 표시 영역 */}
        <div className="flex-grow p-4 flex justify-center items-center bg-gray-50 overflow-auto">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center text-gray-500">
              <svg
                className="animate-spin h-8 w-8 text-blue-500 mb-2"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              <span>다이어그램 로딩 중...</span>
            </div>
          ) : diagramUrl ? (
            <img
              src={diagramUrl}
              alt="시퀀스 다이어그램"
              className="max-w-full max-h-full object-contain"
            />
          ) : (
            <div className="flex flex-col items-center justify-center text-gray-500">
              <svg
                className="h-16 w-16 text-gray-300 mb-2"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2"
                />
              </svg>
              <span>다이어그램을 생성해주세요</span>
            </div>
          )}
        </div>

        {/* 버튼 액션 영역 */}
        <div className="bg-gray-50 px-4 py-3 border-t border-gray-200 flex justify-between items-center">
          <div className="text-xs text-gray-500">
            {diagramUrl ? '다이어그램 생성됨' : '다이어그램 생성 필요'}
          </div>
          <div className="flex gap-2">
            <Button
              label="다운로드"
              onClick={handleDownload}
              variant="download"
              size="md"
              icon={downloadIcon}
              disabled={!diagramUrl}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DiagramPanel;
