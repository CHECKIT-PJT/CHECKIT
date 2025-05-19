import { ApiResponse } from '../types';
import axiosInstance from './axiosInstance';
/**
 * API 서비스 - 샘플 데이터 및 API 통신 관련 로직
 */

// 샘플 API 응답 데이터
export const sampleApiResponse: ApiResponse = {
  status: 200,
  message: 'Code generation successful.',
  data: {
    entity: {
      'User.java': 'public class User { ... }',
      'Post.java': 'public class Post { ... }',
    },
    dto: {
      'UserRequestDto.java': 'public class UserRequestDto { ... }',
      'UserResponseDto.java': 'public class UserResponseDto { ... }',
    },
    controller: {
      'UserController.java': 'public class UserController { ... }',
    },
    service: {
      'UserService.java': 'public interface UserService { ... }',
    },
    repository: {
      'UserRepository.java':
        'public interface UserRepository extends JpaRepository<User, Long> { ... }',
    },
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

export const getDockerCompose = async (
  projectId: string,
): Promise<{ content: string }> => {
  const response = await axiosInstance.get(
    `/api/project/${projectId}/docker-compose`,
  );
  return response.data;
};
