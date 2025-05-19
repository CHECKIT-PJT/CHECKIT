import { useState } from 'react';
import { FaSun, FaMoon } from 'react-icons/fa';
import { FileNode } from '../../../api/buildpreview';

interface CodeViewerProps {
  selectedFile: FileNode | null;
  codeDarkMode: boolean;
  setCodeDarkMode: (darkMode: boolean) => void;
}

/**
 * 코드 뷰어 컴포넌트
 */
const CodeViewer: React.FC<CodeViewerProps> = ({
  selectedFile,
  codeDarkMode,
  setCodeDarkMode,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (selectedFile?.content) {
      navigator.clipboard.writeText(selectedFile.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center p-2 bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {selectedFile ? selectedFile.path : '파일을 선택해주세요'}
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setCodeDarkMode(!codeDarkMode)}
            className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
          >
            {codeDarkMode ? (
              <FaSun className="text-yellow-500" />
            ) : (
              <FaMoon className="text-gray-600" />
            )}
          </button>
          {selectedFile && (
            <button
              onClick={handleCopy}
              className="px-2 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              {copied ? '복사됨!' : '복사'}
            </button>
          )}
        </div>
      </div>
      <div className="flex-1 overflow-auto p-4">
        {selectedFile ? (
          <pre
            className={`text-sm font-mono ${
              codeDarkMode ? 'text-gray-300' : 'text-gray-800'
            }`}
          >
            {selectedFile.content}
          </pre>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            파일을 선택하여 내용을 확인하세요
          </div>
        )}
      </div>
    </div>
  );
};

export default CodeViewer;
