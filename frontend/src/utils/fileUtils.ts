import { ProjectData, FileData } from "../types";

export const countFiles = (data: ProjectData | null | undefined): number => {
  if (!data) return 0;

  let count = 0;

  const traverse = (node: FileData) => {
    for (const key in node) {
      const value = node[key];
      if (typeof value === "string") {
        count += 1;
      } else {
        traverse(value);
      }
    }
  };

  Object.values(data).forEach((domainNode) => traverse(domainNode));

  return count;
};

export const createFilePath = (
  folderPath: string,
  fileName: string
): string => {
  return `src/main/java/com/example/project/${folderPath}/${fileName}`;
};
