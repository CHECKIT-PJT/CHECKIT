import FileIcon from "../../components/buildpreview/FileIcon";

interface FileTreeItemProps {
  fileName: string;
  isSelected: boolean;
  onClick: () => void;
}

/**
 * 파일 트리 아이템 컴포넌트
 */
const FileTreeItem: React.FC<FileTreeItemProps> = ({
  fileName,
  isSelected,
  onClick,
}) => {
  return (
    <div
      className={`flex items-center p-1 rounded cursor-pointer text-sm
        ${isSelected ? "bg-blue-100 text-blue-700" : "hover:bg-gray-100"}`}
      onClick={onClick}
    >
      <FileIcon className="mr-2" />
      {fileName}
    </div>
  );
};

export default FileTreeItem;
