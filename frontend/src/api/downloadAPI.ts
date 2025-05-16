import axios from "axios";

export const downloadBuildZip = async (
  projectId: number,
  accessToken: string
) => {
  try {
    const response = await axios.get(`/api/build/${projectId}/download`, {
      responseType: "blob",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    // 파일명 추출
    const contentDisposition = response.headers["content-disposition"];
    const fileNameMatch = contentDisposition?.match(/filename="(.+)"/);
    const fileName = fileNameMatch?.[1] || `project-${projectId}.zip`;

    // 파일 다운로드 실행
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    console.info("[ZIP] 다운로드 완료:", fileName);
  } catch (err: any) {
    if (err.response?.status === 401) {
      alert("인증이 필요합니다. 다시 로그인해주세요.");
    } else {
      alert("코드 압축 중 오류가 발생했습니다. 다시 시도해주세요.");
    }
    console.error("[ZIP] 다운로드 실패:", err);
  }
};
