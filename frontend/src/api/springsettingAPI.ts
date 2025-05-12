import { AxiosError } from "axios";
import axiosInstance from "./axiosInstance";

// Spring 설정 생성
export const createSpringSettings = async (
  projectId: number,
  requestData: any,
  token: string
) => {
  try {
    const response = await axiosInstance.post(
      `/api/config/${projectId}`,
      requestData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("Spring 설정 생성 실패:", error);
    throw error;
  }
};

// Spring 설정 조회
export const getSpringSettings = async (projectId: number, token: string) => {
  const response = await axiosInstance.get(`/api/config/${projectId}`);
  return response.data;
};

// 스프링 설정 수정
export const updateSpringSettings = async (
  projectId: number,
  requestData: any,
  token: string
) => {
  try {
    const response = await axiosInstance.put(
      `/api/config/${projectId}`,
      requestData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    return response.data;
  } catch (error) {
    if (error instanceof AxiosError && error.response) {
      throw error;
    }
    throw error;
  }
};

// 의존성 전체 조회
export const getAvailableDependencies = async () => {
  try {
    return await axiosInstance.get("/api/config/dependencies");
  } catch (error) {
    console.error("의존성 목록 조회 실패:", error);
    throw error;
  }
};
