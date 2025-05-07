interface ProjectSearchProps {
  search: string;
  onSearchChange: (value: string) => void;
}

const ProjectSearch = ({ search, onSearchChange }: ProjectSearchProps) => {
  return (
    <input
      type="text"
      value={search}
      onChange={e => onSearchChange(e.target.value)}
      placeholder="프로젝트 명 검색하기"
      className="border  px-3 py-1 rounded w-full sm:w-[300px] md:w-[400px]"
    />
  );
};

export default ProjectSearch;
