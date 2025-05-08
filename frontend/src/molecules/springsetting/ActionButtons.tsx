import React from "react";
import { FiCheckCircle, FiDownload } from "react-icons/fi";
import Button from "../../components/springsetting/Button";

interface ActionButtonsProps {
  settingsExist: boolean;
  handleSave: () => void;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({
  settingsExist,
  handleSave,
}) => {
  return (
    <div className="mt-8 pt-5 border-t border-gray-200 flex justify-between">
      <div className="flex items-center text-sm text-gray-500">
        <FiCheckCircle className="h-4 w-4 text-green-500 mr-1" />
        <span>
          설정 저장 시 ERD와 API 명세서를 기반으로 Spring 프로젝트 코드가
          생성됩니다.
        </span>
      </div>
      <div className="flex space-x-3">
        <Button variant="primary" icon={FiDownload} onClick={handleSave}>
          {settingsExist ? "Spring 설정 수정" : "Spring 설정 저장"}
        </Button>
      </div>
    </div>
  );
};

export default ActionButtons;
