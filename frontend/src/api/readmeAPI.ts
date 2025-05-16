import axiosInstance from "./axiosInstance";

const getAuthHeader = () => ({
  Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
});

export const generateReadme = async (projectId: number): Promise<string> => {
  const response = await axiosInstance.post(
    `/api/project/${projectId}/readme/generate`,
    {},
    { headers: getAuthHeader() }
  );
  return response.data.data?.readme ?? "";
};

export const saveReadme = async (projectId: number, content: string) => {
  await axiosInstance.post(
    `/api/project/${projectId}/readme`,
    { content },
    { headers: getAuthHeader() }
  );
};

export const getReadme = async (projectId: number): Promise<string> => {
  const response = await axiosInstance.get(`/api/project/${projectId}/readme`, {
    headers: getAuthHeader(),
  });
  return response.data.data?.readme ?? "";
};

export const updateReadme = async (projectId: number, content: string) => {
  await axiosInstance.put(
    `/api/project/${projectId}/readme`,
    { content },
    { headers: getAuthHeader() }
  );
};

export const deleteReadme = async (projectId: number) => {
  await axiosInstance.delete(`/api/project/${projectId}/readme`, {
    headers: getAuthHeader(),
  });
};

export const downloadReadme = async (projectId: number) => {
  const response = await axiosInstance.get(
    `/api/project/${projectId}/readme/download`,
    {
      headers: getAuthHeader(),
      responseType: "blob",
    }
  );

  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", "README.md");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
