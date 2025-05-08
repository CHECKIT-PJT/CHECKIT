import { useState, useEffect } from "react";
import { Navigate, useParams } from "react-router-dom";
import { FiHelpCircle, FiInfo } from "react-icons/fi";
import { IoArrowBack } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import Badge from "../components/springsetting/Badge";

import ProjectMetadataForm from "../molecules/springsetting/ProjectMetadataForm";

import {
  getSpringSettings,
  createSpringSettings,
  updateSpringSettings,
} from "../api/springsettingAPI";

import SpringBootConfig from "../molecules/springsetting/SpringBootConfig";
import DependencySearch from "../molecules/springsetting/DependencySearch";
import DependencyList from "../molecules/springsetting/DependencyList";
import DependencyRecommendations from "../molecules/springsetting/DependencyRecommendations";
import ActionButtons from "../molecules/springsetting/ActionButtons";
import { AxiosError } from "axios";

interface Dependency {
  id: string;
  name: string;
  description: string;
  selected: boolean;
}

interface SpringBootVersion {
  version: string;
  releaseDate: string;
  springVersion: string;
  javaCompatibility: string;
}

const SpringSettingsPage: React.FC = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState<boolean>(true);
  const [settingsExist, setSettingsExist] = useState<boolean>(false);

  const [springBootVersion, setSpringBootVersion] = useState<string>("3.0.6");
  const [projectType, setProjectType] = useState<string>("Maven Project");
  const [language, setLanguage] = useState<string>("Java");
  const [packaging, setPackaging] = useState<string>("Jar");
  const [javaVersion, setJavaVersion] = useState<string>("17");

  const [groupId, setGroupId] = useState<string>("com.example");
  const [artifactId, setArtifactId] = useState<string>("demo");
  const [description, setDescription] = useState<string>(
    "Spring Boot 기반 백엔드 프로젝트"
  );
  const [projectName, setProjectName] = useState<string>("demo");
  const [packageName, setPackageName] = useState<string>("com.example.demo");

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

  const [searchQuery, setSearchQuery] = useState<string>("");
  const [showDependencyInfo, setShowDependencyInfo] = useState<string | null>(
    null
  );

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

  const resetSettings = () => {
    setSpringBootVersion("3.0.6");
    setProjectType("Maven Project");
    setLanguage("Java");
    setPackaging("Jar");
    setJavaVersion("17");

    setGroupId("");
    setArtifactId("");
    setDescription("");
    setProjectName("");
    setPackageName("");

    setDependencies(
      dependencies.map((dep) => ({
        ...dep,
        selected: false,
      }))
    );

    setSettingsExist(false);
  };

  useEffect(() => {
    const fetchSettings = async () => {
      if (!projectId) {
        setLoading(false);
        return;
      }

      const accessToken = sessionStorage.getItem("accessToken");
      if (!accessToken) {
        console.error("인증 토큰이 없습니다.");
        setLoading(false);
        return;
      }

      try {
        const response = await getSpringSettings(
          Number(projectId),
          accessToken
        );
        if (response && response.result) {
          setSettingsExist(true);
          mapResponseToState(response.result);
        }
      } catch (error) {
        console.error("설정 불러오기 실패:", error);
        if (error instanceof AxiosError && error.response?.status === 404) {
          resetSettings();
        }
        setSettingsExist(false);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, [projectId]);

  const mapResponseToState = (data: any) => {
    const versionMap: Record<number, string> = {
      3: "3.0.6",
      2: "2.7.10",
    };

    const projectTypeMap: Record<string, string> = {
      MAVEN: "Maven Project",
      GRADLE: "Gradle Project",
    };

    const languageMap: Record<string, string> = {
      JAVA: "Java",
      KOTLIN: "Kotlin",
      GROOVY: "Groovy",
    };

    const packagingMap: Record<string, string> = {
      JAR: "Jar",
      WAR: "War",
    };

    setSpringBootVersion(versionMap[data.springVersion] || "3.0.6");
    setProjectType(projectTypeMap[data.springProject] || "Maven Project");
    setLanguage(languageMap[data.springLanguage] || "Java");
    setPackaging(packagingMap[data.springPackaging] || "Jar");
    setJavaVersion(data.springJavaVersion?.toString() || "17");

    setGroupId(data.springGroup || "");
    setArtifactId(data.springArtifact || "");
    setProjectName(data.springName || data.springArtifact || "");
    setPackageName(data.springPackageName || "");
    setDescription(data.springDescription || "");

    if (data.dependencies && Array.isArray(data.dependencies)) {
      const updatedDependencies = dependencies.map((dep) => ({
        ...dep,
        selected: false,
      }));

      data.dependencies.forEach((depId: string) => {
        const depIndex = updatedDependencies.findIndex((d) => d.id === depId);
        if (depIndex !== -1) {
          updatedDependencies[depIndex].selected = true;
        }
      });

      setDependencies(updatedDependencies);
    }
  };

  const toggleDependency = (id: string) => {
    setDependencies(
      dependencies.map((dep) =>
        dep.id === id ? { ...dep, selected: !dep.selected } : dep
      )
    );
  };

  const onClickBack = () => {
    navigate(`/project/${projectId}`);
  };
  const toggleDependencyInfo = (id: string) => {
    setShowDependencyInfo(showDependencyInfo === id ? null : id);
  };

  const clearSearch = () => {
    setSearchQuery("");
  };

  const filteredDependencies = searchQuery
    ? dependencies.filter(
        (dep) =>
          dep.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          dep.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : dependencies;

  // 선택된 의존성 개수
  const selectedCount = dependencies.filter((dep) => dep.selected).length;

  const handleSave = async () => {
    if (!projectId) {
      console.error("프로젝트 ID가 없습니다.");
      return;
    }

    const accessToken = sessionStorage.getItem("accessToken");
    if (!accessToken) {
      console.error("인증 토큰이 없습니다.");
      return;
    }

    try {
      const requestData = {
        springProject: projectType === "Maven Project" ? "MAVEN" : "GRADLE",
        springLanguage:
          language === "Java"
            ? "JAVA"
            : language === "Kotlin"
              ? "KOTLIN"
              : "GROOVY",
        springVersion: parseInt(springBootVersion.split(".")[0]),
        springGroup: groupId,
        springArtifact: artifactId,
        springName: projectName,
        springDescription: description,
        springPackageName: packageName,
        springPackaging: packaging === "Jar" ? "JAR" : "WAR",
        springJavaVersion: parseInt(javaVersion),
        dependencies: dependencies.filter((d) => d.selected).map((d) => d.id),
      };

      try {
        if (settingsExist) {
          console.log("기존 설정이 있어 PUT 요청으로 업데이트합니다.");
          const response = await updateSpringSettings(
            Number(projectId),
            requestData,
            accessToken
          );
          console.log("PUT 응답:", response);
        } else {
          console.log("설정이 없어 POST 요청으로 생성합니다.");
          const response = await createSpringSettings(
            Number(projectId),
            requestData,
            accessToken
          );
          console.log("POST 응답:", response);
        }

        setSettingsExist(true);
        alert("설정이 성공적으로 저장되었습니다.");
      } catch (error) {
        console.error("API 호출 실패:", error);

        alert(
          `저장 실패: ${error instanceof AxiosError ? error.response?.data?.message || "서버 오류가 발생했습니다." : "알 수 없는 오류가 발생했습니다."}`
        );
        throw error;
      }
    } catch (error) {
      console.error(
        "프로젝트 설정 저장 실패:",
        error instanceof AxiosError ? error.response?.data : error
      );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">설정을 불러오는 중...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* 헤더 */}
      <header className="bg-gray-50">
        <div className=" mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <button
              onClick={onClickBack}
              className="p-1 hover:bg-gray-100 rounded-full pr-3"
            >
              <IoArrowBack className="w-5 h-5" />
            </button>
            <h1 className="text-xl font-semibold text-gray-900">
              Spring 프로젝트 설정
            </h1>
            <Badge variant="primary" className="ml-4">
              사용자 인증 서비스
            </Badge>
          </div>
        </div>
      </header>

      <main className="flex-0 w-full px-4 py-1">
        <div className="bg-white shadow-sm rounded-lg p-6">
          {settingsExist && (
            <div className="mb-6 p-3 bg-blue-50 rounded-md flex items-center">
              <div className="flex items-center text-blue-700">
                <FiInfo className="h-5 w-5 mr-2" />
                <p className="text-sm">
                  이 프로젝트의 Spring 설정이 이미 구성되어 있습니다. 설정을
                  변경하고 저장하면 업데이트됩니다.
                </p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-6">
              <SpringBootConfig
                springBootVersion={springBootVersion}
                setSpringBootVersion={setSpringBootVersion}
                projectType={projectType}
                setProjectType={setProjectType}
                language={language}
                setLanguage={setLanguage}
                packaging={packaging}
                setPackaging={setPackaging}
                javaVersion={javaVersion}
                setJavaVersion={setJavaVersion}
                springBootVersions={springBootVersions}
              />

              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-4">
                  프로젝트 메타데이터
                </h2>

                <ProjectMetadataForm
                  groupId={groupId}
                  setGroupId={setGroupId}
                  artifactId={artifactId}
                  setArtifactId={setArtifactId}
                  projectName={projectName}
                  setProjectName={setProjectName}
                  packageName={packageName}
                  setPackageName={setPackageName}
                  description={description}
                  setDescription={setDescription}
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <DependencySearch
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                selectedCount={selectedCount}
              />

              <DependencyList
                filteredDependencies={filteredDependencies}
                toggleDependency={toggleDependency}
                showDependencyInfo={showDependencyInfo}
                toggleDependencyInfo={toggleDependencyInfo}
              />

              <DependencyRecommendations
                dependencies={dependencies}
                toggleDependency={toggleDependency}
              />
            </div>
          </div>

          <ActionButtons
            settingsExist={settingsExist}
            handleSave={handleSave}
          />
        </div>
      </main>
    </div>
  );
};

export default SpringSettingsPage;
