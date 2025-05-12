import React from "react";
import CodePanel from "./CodePanel";
import DiagramPanel from "./DiagramPanel";

interface ContentSectionProps {
  diagramCode: string;
  diagramUrl?: string;
  isLoading: boolean;
  onSaveCode?: () => void;
  onDownloadImage?: () => void;
}

const ContentSection: React.FC<ContentSectionProps> = ({
  diagramCode,
  diagramUrl,
  isLoading,
  onSaveCode,
  onDownloadImage,
}) => {
  const handleSaveCode = () => {
    if (onSaveCode) {
      onSaveCode();
    } else {
      navigator.clipboard
        .writeText(diagramCode)
        .then(() => alert("코드가 클립보드에 복사되었습니다."))
        .catch((err) => console.error("클립보드 복사 실패:", err));
    }
  };

  const handleDownloadImage = () => {
    if (onDownloadImage) {
      onDownloadImage();
    } else if (diagramUrl) {
      const link = document.createElement("a");
      link.href = diagramUrl;
      link.download = `sequence-diagram-${new Date().getTime()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="flex flex-1 p-4 overflow-hidden bg-white">
      <CodePanel code={diagramCode} onSave={handleSaveCode} />
      <DiagramPanel
        diagramUrl={diagramUrl}
        isLoading={isLoading}
        onDownload={handleDownloadImage}
      />
    </div>
  );
};

export default ContentSection;
