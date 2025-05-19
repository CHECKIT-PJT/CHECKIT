import { FileNode } from '../api/buildpreview';

export const countFiles = (data: { files: FileNode[] }): number => {
  return data.files.filter((file) => file.type === 'file').length;
};

export const createFilePath = (
  folderPath: string,
  fileName: string,
): string => {
  return `src/main/java/com/example/project/${folderPath}/${fileName}`;
};
