import axiosInstance from './axiosInstance';
import { AxiosError } from 'axios';
import { ApiResponse } from '../types';
import { FileNode } from './buildpreview';

/**
 * API 응답을 파싱하여 프로젝트 데이터 형식으로 변환
 */
const parseApiResponse = (response: string): ApiResponse => {
  const files: FileNode[] = [];
  let rootPackage = '';

  // 1. docker-compose.yml 분리
  const lines = response.split('\n');
  const composeStartIdx = lines.findIndex((line) =>
    line.trim().startsWith('services:'),
  );
  let dockerCompose = null;
  let codePart = response;

  if (composeStartIdx !== -1) {
    // docker-compose는 일반적으로 'services:' 위에 'volumes:' 등 있을 수 있으니, 보통 'services:' 바로 위 한 줄도 포함
    const composeStart =
      composeStartIdx > 0 ? composeStartIdx - 1 : composeStartIdx;
    dockerCompose = lines.slice(composeStart).join('\n');
    codePart = lines.slice(0, composeStart).join('\n');
  }

  // 2. 기존 코드 파싱 로직 (codePart 사용)
  const packageSections = codePart
    .split('package ')
    .filter((section) => section.trim())
    .map((section) => 'package ' + section);

  // src, src/main, src/main/java 폴더 추가
  files.push({ path: 'src', type: 'folder', content: null });
  files.push({ path: 'src/main', type: 'folder', content: null });
  files.push({ path: 'src/main/java', type: 'folder', content: null });

  packageSections.forEach((fullContent, index) => {
    const lines = fullContent.split('\n');
    const packageLine = lines.find((line) => line.startsWith('package '));
    if (!packageLine) return;

    const packagePath = packageLine
      .replace('package ', '')
      .replace(';', '')
      .trim();
    const packageParts = packagePath.split('.');

    if (index === 0 && packageParts.length >= 2) {
      rootPackage = packageParts.slice(0, packageParts.length - 2).join('.');
    }

    const classMatch = fullContent.match(
      /(public\s+)?(class|interface)\s+(\w+)/,
    );
    const className =
      classMatch?.[3] || `Unknown${Math.random().toString(36).substring(2, 6)}`;

    // 패키지 폴더 추가
    const packageFolderPath = `src/main/java/${packagePath.replace(/\./g, '/')}`;
    const packageFolderParts = packageFolderPath.split('/');

    for (let i = 0; i < packageFolderParts.length; i++) {
      const currentPath = packageFolderParts.slice(0, i + 1).join('/');
      if (!files.some((f) => f.path === currentPath)) {
        files.push({
          path: currentPath,
          type: 'folder',
          content: null,
        });
      }
    }

    // 파일 추가
    files.push({
      path: `${packageFolderPath}/${className}.java`,
      type: 'file',
      content: fullContent.trim(),
    });
  });

  // 3. docker-compose.yml 파일 추가
  if (dockerCompose) {
    files.push({
      path: 'docker-compose.yml',
      type: 'file',
      content: dockerCompose,
    });
  }

  return {
    status: '200',
    message: '코드 생성이 완료되었습니다.',
    data: {
      files,
    },
  };
};

/**
 * 코드 생성 요청 및 파싱 처리
 */
export const generateCode = async (projectId: string): Promise<ApiResponse> => {
  try {
    const response = await axiosInstance.post(
      `/api/generate/build/${projectId}`,
    );
    console.log(response.data);
    return parseApiResponse(response.data);
  } catch (error) {
    const axiosError = error as AxiosError<{ code: number; message: string }>;

    const status = axiosError.response?.status;
    const data = axiosError.response?.data;

    const code = data?.code;
    const message =
      data?.message || '코드 생성 중 알 수 없는 오류가 발생했습니다.';
    throw {
      status,
      code,
      message,
    };
  }
};
