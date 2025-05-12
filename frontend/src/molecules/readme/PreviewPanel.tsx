import React from "react";

export interface PreviewPanelProps {
  html: string;
}

export const PreviewPanel: React.FC<PreviewPanelProps> = ({ html }) => {
  return (
    <div className="w-1/2 flex flex-col bg-white rounded-lg shadow overflow-hidden">
      {/* 헤더 */}
      <div className="p-3 border-b border-gray-200 bg-gray-200">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-medium text-gray-900">
            시퀀스 다이어그램
          </h2>
        </div>
      </div>

      {/* 콘텐츠 영역 */}
      <div
        className="flex-1 p-6 overflow-auto"
        dangerouslySetInnerHTML={{ __html: html }}
      >
        {/* html 내용이 여기 렌더링됩니다 */}
      </div>

      {/* 푸터 */}
      <div className="bg-gray-50 px-4 py-3 border-t border-gray-200">
        <div className="text-right">
          <button
            type="button"
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none"
          >
            이미지 다운로드
          </button>
        </div>
      </div>
    </div>
  );
};

export default PreviewPanel;
