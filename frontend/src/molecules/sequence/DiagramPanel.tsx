import React from "react";
import Button from "../../components/sequence/Button";

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
  title = "시퀀스 다이어그램",
  onDownload,
  onCreate,
}) => {
  const handleDownload = () => {
    if (!diagramUrl) return;

    if (!onDownload) {
      window.open(diagramUrl, "_blank");
      return;
    }

    onDownload();
  };

  const handleCreate = () => {
    if (!onCreate) {
      window.open(diagramUrl, "_blank");
      return;
    }

    onCreate();
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

        <div className="mt-4 flex justify-end gap-2">
          <Button
            label="이미지 생성"
            onClick={handleCreate}
            variant="primary"
          />
          <Button
            label="다운로드"
            onClick={handleDownload}
            variant="outline"
            className={!diagramUrl ? "opacity-50 cursor-not-allowed" : ""}
          />
        </div>
      </div>
    </div>
  );
};

export default DiagramPanel;
