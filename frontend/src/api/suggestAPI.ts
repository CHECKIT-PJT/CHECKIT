
import axiosInstance from '../api/axiosInstance';

interface SuggestionRequest {
  code: string;
  cursorLine: number;
  cursorColumn: number;
}

interface SuggestionResponse {
  suggestion: string;
}

export const fetchCodeSuggestion = async (
  projectId: number,
  request: SuggestionRequest,
): Promise<SuggestionResponse> => {
  const response = await axiosInstance.post<SuggestionResponse>(
    `/api/suggest/${projectId}/code`,
    request,
  );
  return response.data;
};
