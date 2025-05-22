import { ApiResponse } from '../types';
import axiosInstance from './axiosInstance';

export interface FileNode {
  path: string;
  type: 'file' | 'folder';
  content: string | null;
}

/**
 * API 서비스 - 샘플 데이터 및 API 통신 관련 로직
 */

// 샘플 API 응답 데이터 (docker-compose 관련 부분 삭제)
export const sampleApiResponse: ApiResponse = {
  status: '200',
  message: 'Code generation successful.',
  data: {
    files: [
      {
        path: 'src',
        type: 'folder',
        content: null,
      },
      {
        path: 'src/main',
        type: 'folder',
        content: null,
      },
      {
        path: 'src/main/java',
        type: 'folder',
        content: null,
      },
      {
        path: 'src/main/java/com/example',
        type: 'folder',
        content: null,
      },
      {
        path: 'src/main/java/com/example/entity',
        type: 'folder',
        content: null,
      },
      {
        path: 'src/main/java/com/example/entity/User.java',
        type: 'file',
        content: 'public class User { ... }',
      },
      {
        path: 'src/main/java/com/example/entity/Post.java',
        type: 'file',
        content: 'public class Post { ... }',
      },
      {
        path: 'src/main/java/com/example/dto',
        type: 'folder',
        content: null,
      },
      {
        path: 'src/main/java/com/example/dto/UserRequestDto.java',
        type: 'file',
        content: 'public class UserRequestDto { ... }',
      },
      {
        path: 'src/main/java/com/example/dto/UserResponseDto.java',
        type: 'file',
        content: 'public class UserResponseDto { ... }',
      },
    ],
  },
};

/**
 * 프로젝트 다운로드 함수
 * @returns {Promise<boolean>} 다운로드 성공 여부
 */
export const downloadProject = async (): Promise<boolean> => {
  // 실제 API 연동 시 구현
  console.log('프로젝트 다운로드');
  return true;
};

/**
 * 새 프로젝트 생성 함수
 * @returns {Promise<boolean>} 생성 성공 여부
 */
export const createNewProject = async (): Promise<boolean> => {
  // 실제 API 연동 시 구현
  console.log('새 프로젝트 생성');
  return true;
};
