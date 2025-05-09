import React from "react";
import Button from "../../components/sequence/Button";

interface DiagramPanelProps {
  diagramUrl?: string;
  isLoading: boolean;
  title?: string;
  onDownload?: () => void;
}

const DiagramPanel: React.FC<DiagramPanelProps> = ({
  diagramUrl,
  isLoading,
  title = "시퀀스 다이어그램",
  onDownload,
}) => {
  const handleDownload = () => {
    if (!diagramUrl) return;

    if (!onDownload) {
      window.open(diagramUrl, "_blank");
      return;
    }

    onDownload();
  };

  return (
    <div className="w-1/2 pl-4">
      <div className="h-full p-4 bg-white border rounded-lg overflow-auto shadow-sm flex flex-col">
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-medium text-gray-700">{title}</h3>
        </div>

        <div className="flex justify-center items-center p-4 flex-grow">
          {isLoading ? (
            <div className="text-gray-500">다이어그램 로딩 중...</div>
          ) : diagramUrl ? (
            <img
              src={diagramUrl}
              alt="시퀀스 다이어그램"
              className="max-w-full"
            />
          ) : (
            <div className="text-red-500">다이어그램을 불러올 수 없습니다.</div>
          )}
        </div>

        <div className="mt-4 flex justify-end">
          <Button
            label="이미지 다운로드"
            onClick={handleDownload}
            variant="outline"
            icon={
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                />
              </svg>
            }
            className={!diagramUrl ? "opacity-50 cursor-not-allowed" : ""}
          />
        </div>
      </div>
    </div>
  );
};

export default DiagramPanel;
