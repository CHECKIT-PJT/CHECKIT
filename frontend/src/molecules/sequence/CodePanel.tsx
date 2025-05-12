import React from "react";
import Button from "../../components/sequence/Button";

interface CodePanelProps {
  code: string;
  title?: string;
  onSave?: () => void;
}

const CodePanel: React.FC<CodePanelProps> = ({
  code,
  title = "시퀀스 다이어그램 코드",
  onSave = () => {
    navigator.clipboard
      .writeText(code)
      .then(() => alert("코드가 클립보드에 복사되었습니다."))
      .catch((err) => console.error("클립보드 복사 실패:", err));
  },
  onCreate = () => {
    console.log("생성");
  },
}) => {
  return (
    <div className="w-1/2 pr-4">
      <div className="h-full p-4 bg-gray-50 border rounded-lg overflow-auto shadow-sm flex flex-col">
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-medium text-gray-700">{title}</h3>
        </div>

        <pre className="p-4 bg-gray-800 text-gray-100 rounded-md overflow-auto flex-grow">
          {code}
        </pre>

        <div className="mt-4 flex justify-end gap-2">
          <Button label="생성" onClick={onCreate} variant="primary" />
          <Button label="저장" onClick={onSave} variant="outline" />
        </div>
      </div>
    </div>
  );
};

export default CodePanel;
