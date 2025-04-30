/**
 * 프로젝트 데이터 타입 정의
 */

export interface FileData {
  [fileName: string]: string;
}

export interface ProjectData {
  entity: FileData;
  dto: FileData;
  controller: FileData;
  service: FileData;
  repository: FileData;
  [key: string]: FileData;
}

export interface ApiResponse {
  status: number;
  message: string;
  data: ProjectData;
}

export interface SelectedFile {
  name: string;
  content: string;
  path: string;
}

export interface ExpandedFolders {
  [folder: string]: boolean;
}

export type ButtonVariant = "primary" | "secondary";
export type IconColor = "blue" | "yellow";
