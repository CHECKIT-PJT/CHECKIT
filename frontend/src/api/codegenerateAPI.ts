import axiosInstance from './axiosInstance';
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

  // 파일 내용을 분리 (package 선언을 기준으로)
  const fileContents = response
    .split('package ')
    .filter((content) => content.trim());

  fileContents.forEach((content) => {
    if (!content) return;

    // package 선언 추가
    const fullContent = 'package ' + content;
    const lines = fullContent.split('\n');

    // package 경로 추출
    const packageLine = lines[0];
    const packagePath = packageLine.replace('package ', '').replace(';', '');

    // 파일 이름 추출 (클래스/인터페이스 선언에서)
    const classLine = lines.find(
      (line) => line.includes('class ') || line.includes('interface '),
    );

    if (classLine) {
      const fileName =
        classLine.split('class ')[1]?.split(' ')[0] ||
        classLine.split('interface ')[1]?.split(' ')[0];

      if (fileName) {
        // 폴더 타입 결정
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
          // 파일 내용 정리 (중복 import 제거 등)
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

  console.log('Parsed files:', files);

  return {
    status: 'success',
    message: '코드 생성이 완료되었습니다.',
    data: files,
  };
};

export const generateCode = async (projectId: string): Promise<ApiResponse> => {
  try {
    console.log('Generating code for project:', projectId);
    const response = await axiosInstance.post(
      `/api/generate/build/${projectId}`,
    );
    console.log('Code generation response:', response.data);

    // API 응답을 파싱하여 변환
    return parseApiResponse(response.data);
  } catch (error) {
    console.error('Code generation error:', error);
    throw error;
  }
};
