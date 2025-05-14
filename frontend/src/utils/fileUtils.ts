import { ProjectData } from '../types';

/**
 * 파일 개수 계산 함수
 * @param {ProjectData} data - 프로젝트 데이터
 * @returns {number} 전체 파일 개수
 */
export const countFiles = (data: ProjectData | null | undefined): number => {
  if (!data) return 0;

  return Object.values(data).reduce(
    (acc, folder) => acc + Object.keys(folder).length,
    0,
  );
};

/**
 * 파일 경로 생성 함수
 * @param {string} folder - 폴더 이름
 * @param {string} fileName - 파일 이름
 * @returns {string} 파일 경로
 */
export const createFilePath = (folder: string, fileName: string): string => {
  return `src/main/java/com/example/project/${folder}/${fileName}`;
};
