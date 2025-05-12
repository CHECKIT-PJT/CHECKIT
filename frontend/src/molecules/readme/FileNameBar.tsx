import { ChangeEvent } from "react";
import { FaFile } from "react-icons/fa";

export interface FileNameBarProps {
  fileName: string;
  onFileNameChange: (e: ChangeEvent<HTMLInputElement>) => void;
}

export const FileNameBar: React.FC<FileNameBarProps> = ({
  fileName,
  onFileNameChange,
}) => {
  return (
    <div
      className={` ${"border-gray-200 bg-white"} px-4 py-2 flex items-center`}
    >
      <FaFile className="mr-2" size={16} />
      <input
        type="text"
        value={fileName}
        onChange={onFileNameChange}
        className={`bg-transparent py-1 px-2 focus:outline-none text-sm w-60 ${"text-gray-700"}`}
        placeholder="파일명.md"
      />
    </div>
  );
};

export default FileNameBar;
