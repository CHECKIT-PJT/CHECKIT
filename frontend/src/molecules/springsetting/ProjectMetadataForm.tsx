import Input from "../../components/springsetting/Input";
import TextArea from "../../components/springsetting/TextArea";

interface ProjectMetadataFormProps {
  groupId: string;
  setGroupId: (value: string) => void;
  artifactId: string;
  setArtifactId: (value: string) => void;
  description: string;
  setDescription: (value: string) => void;
  className?: string;
}

const ProjectMetadataForm: React.FC<ProjectMetadataFormProps> = ({
  groupId,
  setGroupId,
  artifactId,
  setArtifactId,
  description,
  setDescription,
  className = "",
}) => {
  return (
    <div className={`space-y-4 ${className}`}>
      <Input
        label="Group"
        value={groupId}
        onChange={setGroupId}
        placeholder="com.example"
        required
      />
      <Input
        label="Artifact"
        value={artifactId}
        onChange={setArtifactId}
        placeholder="demo"
        required
      />
      <TextArea
        label="설명"
        value={description}
        onChange={setDescription}
        placeholder="프로젝트에 대한 간단한 설명을 입력하세요."
        rows={3}
      />
    </div>
  );
};

export default ProjectMetadataForm;
