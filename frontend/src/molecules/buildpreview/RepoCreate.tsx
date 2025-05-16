import { MdOutlineCreateNewFolder } from 'react-icons/md';

interface RepoCreateProps {
  onCreate: () => void;
}

const RepoCreate = ({ onCreate }: RepoCreateProps) => {
  return (
    <div className="p-3 border-gray-200">
      <button
        onClick={onCreate}
        className="flex items-center gap-2 px-4 py-2 rounded-md text-sm transition bg-amber-500 hover:bg-amber-600 text-white"
      >
        <MdOutlineCreateNewFolder className="h-5 w-5" />
        프로젝트 저장소 생성
      </button>
    </div>
  );
};

export default RepoCreate;
