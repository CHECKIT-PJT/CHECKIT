import { useState } from 'react';
import { FiFolderPlus } from 'react-icons/fi';
import ProjectAddModal from './ProjectAddModal';
import { useCreateProject } from '../../api/projectAPI';

const ProjectAddButton = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { mutate: createProject } = useCreateProject();

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleSaveProject = (project: { projectName: string }) => {
    createProject(project);
    closeModal();
  };

  return (
    <>
      <button
        className="bg-cyan-800 text-white p-2 rounded-full"
        onClick={openModal}
      >
        <FiFolderPlus />
      </button>

      <ProjectAddModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onSave={handleSaveProject}
      />
    </>
  );
};

export default ProjectAddButton;
