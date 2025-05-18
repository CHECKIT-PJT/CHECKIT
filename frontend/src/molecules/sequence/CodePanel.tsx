import React, { useState, useEffect } from 'react';
import Button from '../../components/sequence/Button';

interface CodePanelProps {
  code: string;
  title?: string;
  onSave?: (code: string) => void;
  onCreate?: () => void;
  onChange?: (code: string) => void;
}

const CodePanel: React.FC<CodePanelProps> = ({
  code: initialCode,
  title = '시퀀스 다이어그램 코드',
  onSave = (code) => {
    navigator.clipboard
      .writeText(code)
      .then(() => alert('코드가 클립보드에 복사되었습니다.'))
      .catch((err) => console.error('클립보드 복사 실패:', err));
  },
  onChange,
}) => {
  const [code, setCode] = useState(initialCode);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    setCode(initialCode);
  }, [initialCode]);

  const handleCodeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newCode = e.target.value;
    setCode(newCode);
    if (onChange) {
      onChange(newCode);
    }
  };

  const handleSave = () => {
    if (onSave) {
      onSave(code);
    }
    setIsEditing(false);
  };

  const toggleEditMode = () => {
    setIsEditing(!isEditing);
  };

  // 아이콘 SVG 요소들
  const editIcon = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-4 w-4"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
      />
    </svg>
  );

  const saveIcon = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-4 w-4"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"
      />
    </svg>
  );

  const cancelIcon = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-4 w-4"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M6 18L18 6M6 6l12 12"
      />
    </svg>
  );

  return (
    <div className="w-full lg:w-1/2 pr-0 lg:pr-2 mb-4 lg:mb-0">
      <div className="h-full bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm flex flex-col">
        {/* 헤더 영역 */}
        <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex justify-between items-center">
          <h3 className="font-medium text-gray-700">{title}</h3>
          <Button
            label={isEditing ? '취소' : '편집'}
            onClick={toggleEditMode}
            variant={isEditing ? 'secondary' : 'outline'}
            size="sm"
            icon={isEditing ? cancelIcon : editIcon}
          />
        </div>

        {/* 코드 영역 */}
        <div className="flex-grow flex flex-col">
          {isEditing ? (
            <textarea
              className="p-4 bg-gray-800 text-gray-100 rounded-0 overflow-auto flex-grow font-mono resize-none border-0 focus:ring-0 focus:outline-none"
              value={code}
              onChange={handleCodeChange}
              spellCheck={false}
              autoFocus
            />
          ) : (
            <pre className="p-4 bg-gray-800 text-gray-100 rounded-0 overflow-auto flex-grow">
              {code}
            </pre>
          )}
        </div>

        {/* 버튼 액션 영역 */}
        <div className="bg-gray-50 px-4 py-3 border-t border-gray-200 flex justify-between items-center">
          <div className="text-xs text-gray-500">
            {isEditing ? '편집 모드' : '읽기 모드'}
          </div>
          <div className="flex gap-2">
            <Button
              label="저장"
              onClick={handleSave}
              variant="save"
              size="md"
              icon={saveIcon}
              disabled={!code.trim()}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CodePanel;
