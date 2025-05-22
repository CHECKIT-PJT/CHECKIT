import { ChangeEvent } from "react";
import { FaCopy, FaTrash } from "react-icons/fa";
import { Button } from "../../components/readme/Button";

// EditorPanel 컴포넌트의 props 타입 정의
export interface EditorPanelProps {
  markdown: string;
  onMarkdownChange: (e: ChangeEvent<HTMLTextAreaElement>) => void;
  onCopyToClipboard: () => void;
  onClearEditor: () => void;
}

export const EditorPanel: React.FC<EditorPanelProps> = ({
  markdown,
  onMarkdownChange,
  onCopyToClipboard,
  onClearEditor,
}) => {
  return (
    <div className="w-1/2 flex flex-col bg-gray-200 rounded-lg shadow overflow-hidden">
      {/* 헤더 */}
      <div className="p-3 border-b border-gray-100">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-medium text-gray-900">
            시퀀스 다이어그램 코드
          </h2>
          <div className="flex space-x-2">
            <Button onClick={onCopyToClipboard} variant="icon" title="복사">
              <FaCopy size={16} />
            </Button>
            <Button onClick={onClearEditor} variant="icon" title="내용 지우기">
              <FaTrash size={16} />
            </Button>
          </div>
        </div>
      </div>

      {/* 컨텐츠 영역 */}
      <div className="flex-1">
        <textarea
          className="w-full h-full p-4 font-mono resize-none focus:outline-none bg-white text-gray-900"
          value={markdown}
          onChange={onMarkdownChange}
          placeholder="마크다운을 입력하세요..."
        />
      </div>

      <div className="bg-gray-50 px-4 py-3 border-t border-gray-200">
        <div className="text-right">
          <button
            type="button"
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none"
          >
            저장
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditorPanel;
