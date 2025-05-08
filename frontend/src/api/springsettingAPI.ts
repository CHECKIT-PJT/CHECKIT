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

// Spring 설정 수정
export const updateSpringSettings = async (
  projectId: number,
  requestData: any
) => {
  try {
    const response = await axiosInstance.put(
      `/api/config/${projectId}`,
      requestData
    );

    return response.data;
  } catch (error) {
    if (error instanceof AxiosError && error.response) {
      throw error;
    }
    throw error;
  }
};
