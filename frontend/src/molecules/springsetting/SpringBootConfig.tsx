import { FiExternalLink, FiInfo, FiX } from "react-icons/fi";
import Select from "../../components/springsetting/Select";
import React from "react";

interface SpringBootVersion {
  version: string;
  releaseDate: string;
  javaCompatibility: string;
}

interface SpringBootConfigProps {
  springBootVersion: string;
  setSpringBootVersion: (version: string) => void;
  projectType: string;
  setProjectType: (type: string) => void;
  language: string;
  setLanguage: (language: string) => void;
  packaging: string;
  setPackaging: (packaging: string) => void;
  javaVersion: string;
  setJavaVersion: (version: string) => void;
  springBootVersions: SpringBootVersion[];
}

const SpringBootConfig: React.FC<SpringBootConfigProps> = ({
  springBootVersion,
  setSpringBootVersion,
  projectType,
  setProjectType,
  language,
  setLanguage,
  packaging,
  setPackaging,
  javaVersion,
  setJavaVersion,
  springBootVersions,
}) => {
  const [showVersionInfo, setShowVersionInfo] = React.useState<boolean>(false);

  // 현재 선택된 Spring Boot 버전
  const currentVersion = springBootVersions.find(
    (v) => v.version === springBootVersion
  );

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
    <div>
      <h2 className="text-lg font-medium text-gray-900 mb-4">프로젝트 설정</h2>

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
                <p>Spring Framework: {currentVersion.springVersion}</p>
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
  );
};

export default SpringBootConfig;
