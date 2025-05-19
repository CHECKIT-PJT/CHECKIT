import axiosInstance from './axiosInstance';
import { AxiosError } from 'axios';
import { ApiResponse } from '../types';

/**
 * API 응답을 파싱하여 프로젝트 데이터 형식으로 변환
 */
const parseApiResponse = (response: string): ApiResponse => {
  const files: Record<string, Record<string, Record<string, string>>> = {};
  let rootPackage = '';

  const packageSections = response
    .split('package ')
    .filter((section) => section.trim())
    .map((section) => 'package ' + section);

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

    const domain = packageParts[packageParts.length - 2] || 'common';
    const folder = packageParts[packageParts.length - 1] || 'etc';

    const classMatch = fullContent.match(
      /(public\s+)?(class|interface)\s+(\w+)/,
    );
    const className =
      classMatch?.[3] || `Unknown${Math.random().toString(36).substring(2, 6)}`;

    if (!files[domain]) files[domain] = {};
    if (!files[domain][folder]) files[domain][folder] = {};

    files[domain][folder][`${className}.java`] = fullContent.trim();
  });

  return {
    status: 'success',
    message: '코드 생성이 완료되었습니다.',
    data: files,
    rootPackage,
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
    const axiosError = error as AxiosError;

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

export const getDockerCompose = async (
  projectId: string,
): Promise<{ content: string }> => {
  const response = await axiosInstance.get(
    `/api/project/${projectId}/docker-compose`,
  );
  return response.data;
};
