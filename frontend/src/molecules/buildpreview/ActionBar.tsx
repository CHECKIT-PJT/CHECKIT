import { MdOutlineDownloading } from 'react-icons/md';

interface ActionBarProps {
  onDownload: () => void;
}

/**
 * 액션 버튼 모음 컴포넌트
 */
const ActionBar = ({ onDownload }: ActionBarProps) => {
  return (
    <div className="p-3 border-gray-200">
      <button
        onClick={onDownload}
        className={
          'flex items-center gap-2 px-4 py-2 rounded-md text-sm transition bg-teal-800 hover:bg-teal-700 text-white'
        }
      >
        <MdOutlineDownloading className="h-5 w-5" />
        전체 프로젝트 다운로드
      </button>
    </div>
  );
};

export default ActionBar;
