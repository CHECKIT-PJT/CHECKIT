import axiosInstance from './axiosInstance';

interface Branch {
  branchConventionReg: string | null;
}

export const useGetBranchConventionReg = async (projectId: number) => {
  const response = await axiosInstance.get(
    `/api/git/branch-strategy/${projectId}`
  );
  return response.data.result ?? null;
};

export const useCreateBranchConvention = async (
  projectId: number,
  branchConventionReg: string
) => {
  const response = await axiosInstance.post(
    `/api/git/branch-strategy/${projectId}`,
    { branchConventionReg }
  );
  return response.data.result;
};

export const useUpdateBranchConvention = async (
  projectId: number,
  branchConventionReg: string
) => {
  const response = await axiosInstance.put(
    `/api/git/branch-strategy/${projectId}`,
    { branchConventionReg }
  );
  return response.data.result;
};

export const useDeleteBranchConvention = async (projectId: number) => {
  const response = await axiosInstance.delete(
    `/api/git/branch-strategy/${projectId}`
  );
  return response.data;
};

export const useDownloadBranchConvention = async (projectId: number) => {
  const response = await axiosInstance.get(
    `/api/git/branch-strategy/${projectId}/download`,
    {
      responseType: 'blob',
    }
  );
  return response;
};
