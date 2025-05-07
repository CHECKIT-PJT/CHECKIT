// 기본 gitignore 템플릿
const defaultGitignore = `# Java
*.class
*.log
*.jar
*.war
*.ear
*.zip
*.tar.gz
*.rar
hs_err_pid*

# Maven
target/
pom.xml.tag
pom.xml.releaseBackup
pom.xml.versionsBackup
pom.xml.next
release.properties
dependency-reduced-pom.xml
buildNumber.properties
.mvn/timing.properties

# Gradle
.gradle
build/
!gradle/wrapper/gradle-wrapper.jar

# IntelliJ
.idea/
*.iws
*.iml
*.ipr
out/
.idea_modules/

# Eclipse
.metadata
bin/
tmp/
*.tmp
*.bak
*.swp
*~.nib
local.properties
.settings/
.loadpath
.recommenders
.classpath
.project

# VS Code
.vscode/
.code-workspace

# Node
node_modules/
npm-debug.log
yarn-error.log
yarn-debug.log
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# OS specific
.DS_Store
Thumbs.db
`;

interface GitIgnoreToolbarProps {
  content: string;
  onSave: (content: string) => Promise<void>;
  onDelete: () => Promise<void>;
  onApplyDefault: (defaultContent: string) => Promise<void>;
  projectId: number;
  hasExistingContent: boolean;
}

const GitIgnoreToolbar = ({
  content,
  onSave,
  onDelete,
  onApplyDefault,
  projectId,
  hasExistingContent,
}: GitIgnoreToolbarProps) => {
  // 현재 내용 저장 (새로 생성 또는 업데이트)
  const handleSave = async () => {
    await onSave(content);
  };

  // 내용 삭제
  const handleDelete = async () => {
    await onDelete();
  };

  // 기본 제안 적용
  const handleApplyDefault = async () => {
    await onApplyDefault(defaultGitignore);
  };

  return (
    <div className="mb-2 flex flex-wrap gap-2">
      {!hasExistingContent ? (
        <>
          <button
            className="bg-blue-700 text-white px-4 py-2 rounded text-sm"
            onClick={handleSave}
          >
            저장
          </button>
          <button
            className="bg-green-800 text-white px-4 py-2 rounded text-sm"
            onClick={handleApplyDefault}
          >
            예시 등록
          </button>
        </>
      ) : (
        <>
          <button
            className="bg-blue-700 text-white px-4 py-2 rounded text-sm   "
            onClick={handleSave}
          >
            저장
          </button>
          <button
            className="bg-red-700 text-white px-4 py-2 rounded text-sm"
            onClick={handleDelete}
          >
            삭제
          </button>
        </>
      )}
    </div>
  );
};

export default GitIgnoreToolbar;
