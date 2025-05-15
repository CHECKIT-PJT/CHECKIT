import { FaChevronDown, FaChevronRight } from 'react-icons/fa6';
import FolderIcon from '../../components/buildpreview/FolderIcon';
import FileTreeItem from './FileTreeItem';
import { FileData, SelectedFile, ExpandedFolders } from '../../types';

interface FolderTreeItemProps {
  folderPath: string;
  displayName: string;
  files: FileData | null;
  isExpanded: boolean;
  expandedFolders: ExpandedFolders;
  onToggle: (folderPath: string) => void;
  selectedFile: SelectedFile | null;
  onSelectFile: (folderPath: string, fileName: string) => void;
}

const FolderTreeItem: React.FC<FolderTreeItemProps> = ({
  folderPath,
  displayName,
  files,
  isExpanded,
  expandedFolders,
  onToggle,
  selectedFile,
  onSelectFile,
}) => {
  const handleToggle = () => {
    onToggle(folderPath);
  };

  return (
    <div className="border-b last:border-b-0 border-gray-200">
      <div
        className="flex items-center p-2 cursor-pointer hover:bg-gray-50"
        onClick={handleToggle}
      >
        {isExpanded ? (
          <FaChevronDown size={16} className="text-gray-500 mr-1" />
        ) : (
          <FaChevronRight size={16} className="text-gray-500 mr-1" />
        )}
        <FolderIcon color="yellow" className="mr-2" />
        <span className="text-sm">{displayName}</span>
      </div>

      {isExpanded && files && (
        <div className="pl-6 py-1">
          {Object.entries(files).map(([name, content]) => {
            const childPath = `${folderPath}/${name}`;

            if (typeof content === 'object' && content !== null) {
              return (
                <FolderTreeItem
                  key={childPath}
                  folderPath={childPath}
                  displayName={name}
                  files={content}
                  isExpanded={expandedFolders[childPath] || false}
                  expandedFolders={expandedFolders}
                  onToggle={onToggle}
                  selectedFile={selectedFile}
                  onSelectFile={onSelectFile}
                />
              );
            }

            return (
              <FileTreeItem
                key={name}
                fileName={name}
                isSelected={
                  selectedFile?.name === name &&
                  selectedFile?.path === `${folderPath}/${name}`
                }
                onClick={() => onSelectFile(folderPath, name)}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};

export default FolderTreeItem;
