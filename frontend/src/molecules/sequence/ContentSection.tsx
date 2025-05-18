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

  return (
    <div className="flex flex-1 p-4 overflow-hidden bg-white">
      <CodePanel
        code={diagramCode}
        onSave={handleSaveCode}
        onCreate={onCreateCode}
      />
      <DiagramPanel
        diagramUrl={diagramUrl}
        isLoading={isLoading}
        onDownload={onDownloadImage}
      />
    </div>
  );
};

export default ContentSection;
