import Button from "../../components/buildpreview/Button";

interface ActionBarProps {
  onDownload: () => void;
}

/**
 * 액션 버튼 모음 컴포넌트
 */
const ActionBar: React.FC<ActionBarProps> = ({ onDownload }) => {
  return (
    <div className="border-t p-3 bg-gray-50 border-gray-200">
      <Button variant="primary" onClick={onDownload} className="mr-2">
        전체 프로젝트 다운로드
      </Button>
    </div>
  );
};

export default ActionBar;
