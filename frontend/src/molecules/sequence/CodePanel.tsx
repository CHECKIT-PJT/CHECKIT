import React, { useState, useEffect } from "react";
import Button from "../../components/sequence/Button";

interface CodePanelProps {
  code: string;
  title?: string;
  onSave?: (code: string) => void;
  onCreate?: () => void;
  onChange?: (code: string) => void;
}

const CodePanel: React.FC<CodePanelProps> = ({
  code: initialCode,
  title = "시퀀스 다이어그램 코드",
  onSave = (code) => {
    navigator.clipboard
      .writeText(code)
      .then(() => alert("코드가 클립보드에 복사되었습니다."))
      .catch((err) => console.error("클립보드 복사 실패:", err));
  },
  onCreate = () => {
    console.log("생성");
  },
  onChange,
}) => {
  const [code, setCode] = useState(initialCode);
  const [isEditing, setIsEditing] = useState(false);

  // 초기 코드가 변경되었을 때 내부 상태도 업데이트
  useEffect(() => {
    setCode(initialCode);
  }, [initialCode]);

  // 코드 변경 핸들러
  const handleCodeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newCode = e.target.value;
    setCode(newCode);
    if (onChange) {
      onChange(newCode);
    }
  };

  // 저장 핸들러
  const handleSave = () => {
    onSave(code);
    setIsEditing(false);
  };

  // 편집 모드 토글
  const toggleEditMode = () => {
    setIsEditing(!isEditing);
  };

  return (
    <div className="w-1/2 pr-4">
      <div className="h-full p-4 bg-gray-50 border rounded-lg overflow-auto shadow-sm flex flex-col">
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-medium text-gray-700">{title}</h3>
          <Button
            label={isEditing ? "취소" : "편집"}
            onClick={toggleEditMode}
            variant="secondary"
          />
        </div>
        {isEditing ? (
          <textarea
            className="p-4 bg-gray-800 text-gray-100 rounded-md overflow-auto flex-grow font-mono resize-none"
            value={code}
            onChange={handleCodeChange}
            spellCheck={false}
            autoFocus
          />
        ) : (
          <pre className="p-4 bg-gray-800 text-gray-100 rounded-md overflow-auto flex-grow">
            {code}
          </pre>
        )}
        <div className="mt-4 flex justify-end gap-2">
          <Button label="코드 생성" onClick={onCreate} variant="primary" />
          {isEditing ? (
            <Button label="저장" onClick={handleSave} variant="outline" />
          ) : (
            <Button
              label="복사"
              onClick={() => onSave(code)}
              variant="outline"
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default CodePanel;
