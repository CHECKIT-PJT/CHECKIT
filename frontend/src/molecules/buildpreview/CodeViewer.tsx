import { FaCode } from "react-icons/fa6";
import ThemeToggle from "../../components/buildpreview/ThemeToggle";
import CodeEditor from "../../components/buildpreview/CodeEditor";
import { SelectedFile } from "../../types";

interface CodeViewerProps {
  selectedFile: SelectedFile | null;
  codeDarkMode: boolean;
  setCodeDarkMode: React.Dispatch<React.SetStateAction<boolean>>;
}

/**
 * 코드 뷰어 컴포넌트
 */
const CodeViewer: React.FC<CodeViewerProps> = ({
  selectedFile,
  codeDarkMode,
  setCodeDarkMode,
}) => {
  if (!selectedFile) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-200">
        <div className="text-center text-gray-500">
          <FaCode size={48} className="mx-auto mb-4 opacity-30" />
          <p className="text-lg font-medium">파일을 선택해 주세요</p>
          <p className="text-sm mt-2">
            왼쪽 메뉴에서 파일을 선택하면 내용이 여기에 표시됩니다
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="px-4 py-2 border-b bg-gray-50 border-gray-200 flex items-center justify-between">
        <div className="flex items-center">
          <FaCode size={16} className="text-gray-500 mr-2" />
          <span className="text-sm font-medium">{selectedFile.path}</span>
        </div>
        <ThemeToggle
          isDarkMode={codeDarkMode}
          onToggle={() => setCodeDarkMode(!codeDarkMode)}
        />
      </div>
      <CodeEditor content={selectedFile.content} isDarkMode={codeDarkMode} />
    </>
  );
};

export default CodeViewer;
