import axiosInstance from './axiosInstance';
import { AxiosError } from 'axios';
import { ApiResponse } from '../types';

const parseApiResponse = (response: string): ApiResponse => {
  const files: Record<string, Record<string, Record<string, string>>> = {};

  const packageSections = response
    .split('package ')
    .filter((section) => section.trim())
    .map((section) => 'package ' + section);

  packageSections.forEach((fullContent) => {
    const lines = fullContent.split('\n');
    const packageLine = lines.find((line) => line.startsWith('package '));
    if (!packageLine) return;

    const packagePath = packageLine
      .replace('package ', '')
      .replace(';', '')
      .trim();
    const packageParts = packagePath.split('.');

    // ✅ 정확한 위치에서 도메인과 폴더 추출
    const domain = packageParts[3] || 'common';
    const folder = packageParts[4] || 'etc';

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
