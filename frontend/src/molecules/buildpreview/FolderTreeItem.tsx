import { FaChevronDown, FaChevronRight } from "react-icons/fa6";
import FolderIcon from "../../components/buildpreview/FolderIcon";
import FileTreeItem from "./FileTreeItem";
import { FileData, SelectedFile } from "../../types";

interface FolderTreeItemProps {
  folderName: string;
  files: FileData;
  isExpanded: boolean;
  onToggle: (folder: string) => void;
  selectedFile: SelectedFile | null;
  onSelectFile: (folder: string, fileName: string) => void;
}

/**
 * 폴더 트리 아이템 컴포넌트
 */
const FolderTreeItem: React.FC<FolderTreeItemProps> = ({
  folderName,
  files,
  isExpanded,
  onToggle,
  selectedFile,
  onSelectFile,
}) => {
  return (
    <div className="border-b last:border-b-0 border-gray-200">
      <div
        className="flex items-center p-2 cursor-pointer hover:bg-gray-50"
        onClick={() => onToggle(folderName)}
      >
        {isExpanded ? (
          <FaChevronDown size={16} className="text-gray-500 mr-1" />
        ) : (
          <FaChevronRight size={16} className="text-gray-500 mr-1" />
        )}
        <FolderIcon color="yellow" className="mr-2" />
        <span className="text-sm">{folderName}</span>
      </div>

      {isExpanded && (
        <div className="pl-8 py-1">
          {Object.keys(files).map((fileName) => (
            <FileTreeItem
              key={fileName}
              fileName={fileName}
              isSelected={selectedFile?.name === fileName}
              onClick={() => onSelectFile(folderName, fileName)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default FolderTreeItem;
