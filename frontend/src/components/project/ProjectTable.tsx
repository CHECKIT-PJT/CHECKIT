interface Project {
  projectId: number;
  projectName: string;
  createdAt: string;
}

interface ProjectTableProps {
  projects: Project[];
  onDetail: (projectId: number) => void;
}

const ProjectTable = ({ projects, onDetail }: ProjectTableProps) => {
  return (
    <div className="flex justify-center">
      <table className="w-full table-auto border-collapse">
        <thead>
          <tr className="text-left border-b">
            <th className="p-2 text-center ">프로젝트 명</th>
            <th className="p-2 text-center">등록 일자</th>
            <th className="p-2 text-center">상세 보기</th>
          </tr>
        </thead>
        <tbody>
          {projects.map(project => (
            <tr key={project.projectId} className="border-b">
              <td className="p-2 text-left">{project.projectName}</td>
              <td className="p-2 text-center">
                {new Date(project.createdAt).toISOString().split('T')[0]}
              </td>
              <td className="p-2 text-center">
                <button
                  className="bg-sky-700 text-white px-2 py-1 text-sm rounded"
                  onClick={() => onDetail(project.projectId)}
                >
                  보러 가기
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ProjectTable;
