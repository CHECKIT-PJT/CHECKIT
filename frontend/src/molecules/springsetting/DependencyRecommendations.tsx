import InfoBox from "../../components/springsetting/InfoBox";

// 의존성 타입 정의
interface Dependency {
  id: string;
  name: string;
  description: string;
  selected: boolean;
}

interface DependencyRecommendationsProps {
  dependencies: Dependency[];
  toggleDependency: (id: string) => void;
}

const DependencyRecommendations: React.FC<DependencyRecommendationsProps> = ({
  dependencies,
  toggleDependency,
}) => {
  const securitySelected =
    dependencies.find((d) => d.id === "security")?.selected || false;
  const oauth2Selected =
    dependencies.find((d) => d.id === "oauth2")?.selected || false;
  const actuatorSelected =
    dependencies.find((d) => d.id === "actuator")?.selected || false;

  return (
    <div className="mt-4 space-y-3">
      {/* 정보 및 경고 박스 */}
      <InfoBox variant="info">
        <p className="text-sm">
          선택한 의존성은 <code>pom.xml</code> 또는 <code>build.gradle</code>{" "}
          파일에 자동으로 추가됩니다.
        </p>
        <p className="text-xs mt-1">
          작업 후에도 필요한 경우 의존성을 수동으로 추가/제거할 수 있습니다.
        </p>
      </InfoBox>

      {/* 보안 의존성 체크 */}
      {securitySelected && !oauth2Selected && (
        <InfoBox variant="warning">
          <p className="text-sm">
            Spring Security를 선택했습니다. OAuth2 인증이 필요하신가요?
          </p>
          <button
            onClick={() => toggleDependency("oauth2")}
            className="text-xs text-yellow-700 underline mt-1"
          >
            OAuth2 Client 추가하기
          </button>
        </InfoBox>
      )}

      {/* 모니터링 의존성 체크 */}
      {!actuatorSelected && (
        <InfoBox variant="default">
          <p className="text-sm">
            프로덕션 환경 모니터링을 위해 Actuator 추가를 권장합니다.
          </p>
          <button
            onClick={() => toggleDependency("actuator")}
            className="text-xs text-indigo-600 underline mt-1"
          >
            Spring Boot Actuator 추가하기
          </button>
        </InfoBox>
      )}
    </div>
  );
};

export default DependencyRecommendations;
