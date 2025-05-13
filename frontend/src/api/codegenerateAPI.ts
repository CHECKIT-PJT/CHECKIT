import axiosInstance from './axiosInstance';
import { AxiosError } from 'axios';
import { ApiResponse } from '../types';

/**
 * API 응답을 파싱하여 프로젝트 데이터 형식으로 변환
 */
const parseApiResponse = (response: string): ApiResponse => {
  const files: { [key: string]: { [key: string]: string } } = {
    entity: {},
    dto: {},
    controller: {},
    service: {},
    repository: {},
  };

  const fileContents = response
    .split('package ')
    .filter((content) => content.trim());

  fileContents.forEach((content) => {
    const fullContent = 'package ' + content;
    const lines = fullContent.split('\n');
    const packageLine = lines[0];
    const packagePath = packageLine.replace('package ', '').replace(';', '');

    const classLine = lines.find(
      (line) => line.includes('class ') || line.includes('interface '),
    );

    if (classLine) {
      const fileName =
        classLine.split('class ')[1]?.split(' ')[0] ||
        classLine.split('interface ')[1]?.split(' ')[0];

      if (fileName) {
        const folder = packagePath.includes('.entity')
          ? 'entity'
          : packagePath.includes('.dto')
            ? 'dto'
            : packagePath.includes('.controller')
              ? 'controller'
              : packagePath.includes('.service')
                ? 'service'
                : packagePath.includes('.repository')
                  ? 'repository'
                  : '';

        if (folder) {
          const cleanedContent = fullContent
            .replace(
              /import jakarta\.persistence\.\*;.*?import jakarta\.persistence\.\*;/s,
              'import jakarta.persistence.*;',
            )
            .replace(
              /import lombok\.\*;.*?import lombok\.\*;/s,
              'import lombok.*;',
            )
            .trim();

          files[folder][`${fileName}.java`] = cleanedContent;
        }
      }
    }
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
    return parseApiResponse(response.data);
  } catch (error) {
    const axiosError = error as AxiosError;

    const status = axiosError.response?.status;
    const data = axiosError.response?.data;

    const code = data?.code;
    const message =
      data?.message || '코드 생성 중 알 수 없는 오류가 발생했습니다.';

    // 서버에서 내려준 에러코드 문자열이 있으면 그대로 전달
    throw {
      status,
      code,
      message,
    };
  }
};
