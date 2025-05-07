import axiosInstance from './axiosInstance';

interface Gitignore {
  content: string | null;
}

// .gitignore 조회
export const useGetGitignore = async (projectId: number) => {
  try {
    const response = await axiosInstance.get(`/api/git/gitignore/${projectId}`);
    console.log(response.data);

    // 응답 구조에 맞게 데이터 추출
    if (response.data && response.data.result && response.data.result.content) {
      return response.data.result.content;
    }

    return null;
  } catch (error) {
    throw error;
  }
};

// .gitignore 생성
export const useCreateGitignore = async (
  projectId: number,
  content: string
) => {
  try {
    const response = await axiosInstance.post(
      `/api/git/gitignore/${projectId}`,
      {
        content,
      }
    );
    return response.data.message;
  } catch (error) {
    throw error;
  }
};

// .gitignore 수정
export const useUpdateGitignore = async (
  projectId: number,
  content: string
) => {
  try {
    const response = await axiosInstance.put(
      `/api/git/gitignore/${projectId}`,
      {
        content,
      }
    );
    return response.data.message;
  } catch (error) {
    throw error;
  }
};

// .gitignore 삭제
export const useDeleteGitignore = async (projectId: number) => {
  try {
    const response = await axiosInstance.delete(
      `/api/git/gitignore/${projectId}`
    );
    return response.data.message;
  } catch (error) {
    throw error;
  }
};
