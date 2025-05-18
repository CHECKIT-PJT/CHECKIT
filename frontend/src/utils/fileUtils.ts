import { ProjectData, FileData } from '../types';

export const countFiles = (data: ProjectData | null | undefined): number => {
  if (!data) return 0;

  let count = 0;

  const traverse = (node: FileData | string) => {
    if (typeof node === 'string') {
      count++;
      return;
    }

    for (const key in node) {
      traverse(node[key]);
    }
  };

  Object.values(data).forEach((node) => traverse(node));

  return count;
};

export const createFilePath = (
  folderPath: string,
  fileName: string,
): string => {
  return `src/main/java/com/example/project/${folderPath}/${fileName}`;
};
