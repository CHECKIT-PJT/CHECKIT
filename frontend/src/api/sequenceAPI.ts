import axiosInstance from "./axiosInstance";

/**
 * API 요청을 처리하는 서비스
 */
class sequenceAPI {
  /**
   * UML 코드 가져오기
   * @param categoryId - 카테고리 ID
   * @returns UML 코드
   */
  public async fetchUmlCode(categoryId: string): Promise<string> {
    try {
      const response = await axiosInstance.get(
        `/api/diagrams/${categoryId}/code`
      );
      return response.data.code;
    } catch (error) {
      console.error("UML 코드 가져오기 실패:", error);
      throw error;
    }
  }

  /**
   * 다이어그램 이미지 URL 가져오기
   * @param categoryId - 카테고리 ID
   * @returns 다이어그램 이미지 URL
   */
  public async fetchDiagramUrl(categoryId: string): Promise<string> {
    try {
      const response = await axiosInstance.get(
        `/api/diagrams/${categoryId}/image`
      );
      return response.data.imageUrl;
    } catch (error) {
      console.error("다이어그램 이미지 URL 가져오기 실패:", error);
      throw error;
    }
  }

  /**
   * 카테고리 목록 가져오기
   * @returns 카테고리 목록
   */
  public async fetchCategories(): Promise<Array<{ id: string; name: string }>> {
    try {
      const response = await axiosInstance.get(`/api/diagrams/categories`);
      return response.data.categories;
    } catch (error) {
      console.error("카테고리 목록 가져오기 실패:", error);
      throw error;
    }
  }
}

// 싱글톤 인스턴스 생성
export default new sequenceAPI();
