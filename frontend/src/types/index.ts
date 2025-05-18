/**
 * 프로젝트 데이터 타입 정의
 */

export interface FileData {
  [fileOrFolder: string]: string | FileData;
}

export interface ProjectData {
  [domain: string]: FileData;
}

export interface ApiResponse {
  status: string;
  message: string;
  data: ProjectData;
  rootPackage: string;
}

export interface SelectedFile {
  name: string;
  content: string;
  path: string;
}

export interface ExpandedFolders {
  [folder: string]: boolean;
}

export type ButtonVariant = 'primary' | 'secondary';
export type IconColor = 'blue' | 'yellow';
