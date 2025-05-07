import axiosInstance from './axiosInstance';

interface Commit {
  commitConventionReg: string | null;
}

export const useGetCommitConventionReg = async (projectId: number) => {
  const response = await axiosInstance.get(
    `/api/git/commit-convention/${projectId}`
  );
  return response.data.result ?? null;
};

export const useCreateCommitConvention = async (
  projectId: number,
  commitConventionReg: string
) => {
  const response = await axiosInstance.post(
    `/api/git/commit-convention/${projectId}`,
    { commitConventionReg }
  );
  return response.data.result;
};

export const useUpdateCommitConvention = async (
  projectId: number,
  commitConventionReg: string
) => {
  const response = await axiosInstance.put(
    `/api/git/commit-convention/${projectId}`,
    { commitConventionReg }
  );
  return response.data.result;
};

export const useDeleteCommitConvention = async (projectId: number) => {
  const response = await axiosInstance.delete(
    `/api/git/commit-convention/${projectId}`
  );
  return response.data;
};

export const useDownloadCommitConvention = async (projectId: number) => {
  const response = await axiosInstance.get(
    `/api/git/commit-convention/${projectId}/download`
  );
  console.log(response.data);
  return response.data;
};
