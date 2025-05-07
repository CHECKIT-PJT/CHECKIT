import { useState } from "react";
import {
  FiX,
  FiDownload,
  FiHelpCircle,
  FiInfo,
  FiAlertCircle,
  FiCheckCircle,
  FiCode,
  FiDatabase,
  FiFileText,
  FiLayers,
  FiExternalLink,
  FiSearch,
} from "react-icons/fi";
import { BiGitBranch, BiPlus } from "react-icons/bi";

// 내부 컴포넌트 임포트
import Input from "../components/springsetting/Input";
import TextArea from "../components/springsetting/TextArea";
import Select from "../components/springsetting/Select";
import Button from "../components/springsetting/Button";
import Badge from "../components/springsetting/Badge";
import Checkbox from "../components/springsetting/checkbox";
import InfoBox from "../components/springsetting/InfoBox";

// 프로젝트 메타데이터 폼
import ProjectMetadataForm from "../molecules/springsetting/ProjectMetadataForm";

// 의존성 타입 정의
interface Dependency {
  id: string;
  name: string;
  description: string;
  selected: boolean;
}

// Spring Boot 버전 타입 정의
interface SpringBootVersion {
  version: string;
  releaseDate: string;
  springVersion: string;
  javaCompatibility: string;
}

const SpringSettingsPage: React.FC = () => {
  // Spring Boot 설정 상태
  const [springBootVersion, setSpringBootVersion] = useState<string>("3.0.6");
  const [projectType, setProjectType] = useState<string>("Maven Project");
  const [language, setLanguage] = useState<string>("Java");
  const [packaging, setPackaging] = useState<string>("Jar");
  const [javaVersion, setJavaVersion] = useState<string>("17");

  // 프로젝트 메타데이터 상태
  const [groupId, setGroupId] = useState<string>("com.example");
  const [artifactId, setArtifactId] = useState<string>("demo");
  const [description, setDescription] = useState<string>(
    "Spring Boot 기반 백엔드 프로젝트"
  );

  // 의존성 상태
  const [dependencies, setDependencies] = useState<Dependency[]>([
    {
      id: "web",
      name: "Spring Web",
      selected: true,
      description:
        "RESTful 애플리케이션 및 웹 애플리케이션을 구축하기 위한 Spring MVC 기능 제공",
    },
    {
      id: "jpa",
      name: "Spring Data JPA",
      selected: true,
      description:
        "Java Persistence API를 사용하여 데이터베이스 액세스를 단순화",
    },
    {
      id: "h2",
      name: "H2 Database",
      selected: true,
      description: "개발 및 테스트 환경을 위한 인메모리 데이터베이스",
    },
    {
      id: "mysql",
      name: "MySQL Driver",
      selected: false,
      description: "MySQL 데이터베이스 연결을 위한 JDBC 드라이버",
    },
    {
      id: "postgresql",
      name: "PostgreSQL Driver",
      selected: false,
      description: "PostgreSQL 데이터베이스 연결을 위한 JDBC 드라이버",
    },
    {
      id: "lombok",
      name: "Lombok",
      selected: true,
      description: "반복적인 코드를 줄이기 위한 Java 어노테이션 라이브러리",
    },
    {
      id: "security",
      name: "Spring Security",
      selected: false,
      description: "인증 및 권한 부여를 위한 강력한 보안 프레임워크",
    },
    {
      id: "validation",
      name: "Validation",
      selected: false,
      description: "Bean Validation API 구현을 위한 라이브러리",
    },
    {
      id: "actuator",
      name: "Spring Boot Actuator",
      selected: false,
      description: "운영 환경에서 애플리케이션 모니터링 및 관리를 위한 도구",
    },
    {
      id: "oauth2",
      name: "OAuth2 Client",
      selected: false,
      description: "OAuth2 인증 클라이언트 기능 제공",
    },
  ]);

  // UI 상태
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [showDependencyInfo, setShowDependencyInfo] = useState<string | null>(
    null
  );
  const [showVersionInfo, setShowVersionInfo] = useState<boolean>(false);

  // Spring Boot 버전 목록
  const springBootVersions: SpringBootVersion[] = [
    {
      version: "3.0.6",
      releaseDate: "2023-04-20",
      springVersion: "6.0.9",
      javaCompatibility: "17+",
    },
    {
      version: "3.0.5",
      releaseDate: "2023-03-23",
      springVersion: "6.0.8",
      javaCompatibility: "17+",
    },
    {
      version: "2.7.10",
      releaseDate: "2023-03-23",
      springVersion: "5.3.26",
      javaCompatibility: "8+",
    },
    {
      version: "2.7.9",
      releaseDate: "2023-02-23",
      springVersion: "5.3.25",
      javaCompatibility: "8+",
    },
    {
      version: "2.6.14",
      releaseDate: "2023-02-23",
      springVersion: "5.3.25",
      javaCompatibility: "8+",
    },
  ];

  // 현재 선택된 Spring Boot 버전
  const currentVersion = springBootVersions.find(
    (v) => v.version === springBootVersion
  );

  // 의존성 토글 함수
  const toggleDependency = (id: string) => {
    setDependencies(
      dependencies.map((dep) =>
        dep.id === id ? { ...dep, selected: !dep.selected } : dep
      )
    );
  };

  // 의존성 정보 토글 함수
  const toggleDependencyInfo = (id: string) => {
    setShowDependencyInfo(showDependencyInfo === id ? null : id);
  };

  // 검색어 초기화 함수
  const clearSearch = () => {
    setSearchQuery("");
  };

  // 검색된 의존성
  const filteredDependencies = searchQuery
    ? dependencies.filter(
        (dep) =>
          dep.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          dep.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : dependencies;

  // 선택된 의존성 개수
  const selectedCount = dependencies.filter((dep) => dep.selected).length;

  // 취소 핸들러
  const handleCancel = () => {
    window.history.back();
  };

  // 저장 핸들러
  const handleSave = () => {
    // 프로젝트 생성 로직 구현
    console.log("프로젝트 생성", {
      springBootVersion,
      projectType,
      language,
      packaging,
      javaVersion,
      groupId,
      artifactId,
      description,
      dependencies: dependencies.filter((d) => d.selected).map((d) => d.id),
    });
  };

  // Spring Boot 버전 옵션
  const springBootVersionOptions = springBootVersions.map((v) => ({
    value: v.version,
    label: `${v.version} (${v.releaseDate})`,
  }));

  // 프로젝트 유형 옵션
  const projectTypeOptions = [
    { value: "Maven Project", label: "Maven Project" },
    { value: "Gradle Project", label: "Gradle Project" },
  ];

  // 언어 옵션
  const languageOptions = [
    { value: "Java", label: "Java" },
    { value: "Kotlin", label: "Kotlin" },
    { value: "Groovy", label: "Groovy" },
  ];

  // 패키징 옵션
  const packagingOptions = [
    { value: "Jar", label: "Jar" },
    { value: "War", label: "War" },
  ];

  // Java 버전 옵션
  const javaVersionOptions = [
    { value: "8", label: "Java 8" },
    { value: "11", label: "Java 11" },
    { value: "17", label: "Java 17" },
    { value: "21", label: "Java 21" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* 헤더 */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <h1 className="text-xl font-semibold text-gray-900">
              Spring 프로젝트 설정
            </h1>
            <Badge variant="primary" className="ml-4">
              사용자 인증 서비스
            </Badge>
          </div>

          <div className="flex items-center space-x-4">
            <button className="text-gray-500 hover:text-gray-700">
              <FiHelpCircle className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-6">
        <div className="bg-white shadow-sm rounded-lg p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* 왼쪽 컬럼: 프로젝트 메타데이터 */}
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-4">
                  프로젝트 설정
                </h2>

                <div className="space-y-4">
                  {/* Spring Boot 버전 */}
                  <div>
                    <div className="flex items-center">
                      <label className="block text-sm font-medium text-gray-700">
                        Spring Boot 버전
                      </label>
                      <button
                        onClick={() => setShowVersionInfo(!showVersionInfo)}
                        className="ml-1 text-gray-400 hover:text-indigo-600"
                      >
                        <FiInfo className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="mt-1">
                      <Select
                        options={springBootVersionOptions}
                        value={springBootVersion}
                        onChange={setSpringBootVersion}
                      />
                    </div>

                    {showVersionInfo && currentVersion && (
                      <div className="mt-2 p-3 bg-gray-50 rounded-md text-sm">
                        <div className="flex justify-between items-start">
                          <h4 className="font-medium">
                            Spring Boot {currentVersion.version}
                          </h4>
                          <button
                            onClick={() => setShowVersionInfo(false)}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            <FiX className="h-4 w-4" />
                          </button>
                        </div>
                        <div className="mt-2 space-y-1 text-gray-600">
                          <p>릴리스 일자: {currentVersion.releaseDate}</p>
                          <p>
                            Spring Framework: {currentVersion.springVersion}
                          </p>
                          <p>Java 호환성: {currentVersion.javaCompatibility}</p>
                          <a
                            href="https://github.com/spring-projects/spring-boot/releases"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-indigo-600 hover:text-indigo-800 inline-flex items-center mt-1"
                          >
                            <span>릴리스 노트</span>
                            <FiExternalLink className="h-3 w-3 ml-1" />
                          </a>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 프로젝트 유형 */}
                  <Select
                    label="프로젝트 유형"
                    options={projectTypeOptions}
                    value={projectType}
                    onChange={setProjectType}
                  />

                  {/* 언어 */}
                  <Select
                    label="언어"
                    options={languageOptions}
                    value={language}
                    onChange={setLanguage}
                  />

                  {/* 패키징 */}
                  <Select
                    label="패키징"
                    options={packagingOptions}
                    value={packaging}
                    onChange={setPackaging}
                  />

                  {/* Java 버전 */}
                  <Select
                    label="Java 버전"
                    options={javaVersionOptions}
                    value={javaVersion}
                    onChange={setJavaVersion}
                  />
                </div>
              </div>

              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-4">
                  프로젝트 메타데이터
                </h2>

                <ProjectMetadataForm
                  groupId={groupId}
                  setGroupId={setGroupId}
                  artifactId={artifactId}
                  setArtifactId={setArtifactId}
                  description={description}
                  setDescription={setDescription}
                />
              </div>
            </div>

            {/* 오른쪽 컬럼: 의존성 */}
            <div className="md:col-span-2">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-medium text-gray-900">
                  의존성 추가
                </h2>
                <Badge variant="primary">{selectedCount}개 선택됨</Badge>
              </div>

              {/* 검색 필드 */}
              <div className="relative mb-4">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiSearch className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="의존성 검색..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              {/* 의존성 목록 */}
              <div className="border border-gray-200 rounded-md overflow-hidden">
                <ul className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
                  {filteredDependencies.map((dependency) => (
                    <li
                      key={dependency.id}
                      className="px-4 py-3 hover:bg-gray-50"
                    >
                      <div className="flex items-start">
                        <div className="flex-shrink-0 pt-0.5">
                          <Checkbox
                            checked={dependency.selected}
                            onChange={() => toggleDependency(dependency.id)}
                          />
                        </div>
                        <div className="ml-3 flex-1">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium text-gray-900">
                              {dependency.name}
                            </span>
                            <button
                              onClick={() =>
                                toggleDependencyInfo(dependency.id)
                              }
                              className="text-gray-400 hover:text-indigo-600"
                            >
                              <FiInfo className="h-4 w-4" />
                            </button>
                          </div>
                          {showDependencyInfo === dependency.id && (
                            <div className="mt-2 text-xs text-gray-600">
                              {dependency.description}
                            </div>
                          )}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              {filteredDependencies.length === 0 && (
                <div className="mt-4 flex items-center justify-center py-8 text-center bg-gray-50 rounded-md">
                  <div>
                    <FiAlertCircle className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500 text-sm">
                      검색 결과가 없습니다.
                    </p>
                    <p className="text-gray-400 text-xs mt-1">
                      다른 키워드로 검색해보세요.
                    </p>
                  </div>
                </div>
              )}

              {/* 정보 및 경고 */}
              <InfoBox variant="info" className="mt-4">
                <p className="text-sm">
                  선택한 의존성은 <code>pom.xml</code> 또는{" "}
                  <code>build.gradle</code> 파일에 자동으로 추가됩니다.
                </p>
                <p className="text-xs mt-1">
                  작업 후에도 필요한 경우 의존성을 수동으로 추가/제거할 수
                  있습니다.
                </p>
              </InfoBox>

              {/* 보안 의존성 체크 */}
              {dependencies.find((d) => d.id === "security")?.selected &&
                !dependencies.find((d) => d.id === "oauth2")?.selected && (
                  <InfoBox variant="warning" className="mt-3">
                    <p className="text-sm">
                      Spring Security를 선택했습니다. OAuth2 인증이
                      필요하신가요?
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
              {!dependencies.find((d) => d.id === "actuator")?.selected && (
                <InfoBox variant="default" className="mt-3">
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
          </div>

          {/* 하단 버튼 */}
          <div className="mt-8 pt-5 border-t border-gray-200 flex justify-between">
            <div className="flex items-center text-sm text-gray-500">
              <FiCheckCircle className="h-4 w-4 text-green-500 mr-1" />
              <span>
                설정 저장 시 ERD와 API 명세서를 기반으로 Spring 프로젝트 코드가
                생성됩니다.
              </span>
            </div>
            <div className="flex space-x-3">
              <Button variant="outline" onClick={handleCancel}>
                취소
              </Button>
              <Button variant="primary" icon={FiDownload} onClick={handleSave}>
                설정 저장 및 생성
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SpringSettingsPage;
