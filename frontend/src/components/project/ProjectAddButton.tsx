import { useState } from 'react';
import { FiFolderPlus } from 'react-icons/fi';
import ProjectAddModal from './ProjectAddModal';

const ProjectAddButton = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleSaveProject = (project: { projectName: string }) => {
    console.log('새 프로젝트 생성:', project);
    // TODO 프로젝트 저장 로직직
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
