import axiosInstance from './axiosInstance';

export const generateCode = async (projectId: string) => {
  try {
    console.log('Generating code for project:', projectId);
    const response = await axiosInstance.post(
      `/api/generate/build/${projectId}`,
    );
    console.log('Code generation response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Code generation error:', error);
    throw error;
  }
};
