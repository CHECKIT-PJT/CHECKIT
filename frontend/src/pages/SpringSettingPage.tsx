// 생략된 import 유지
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiInfo } from 'react-icons/fi';
import { IoArrowBack } from 'react-icons/io5';
import { AxiosError } from 'axios';

import ProjectMetadataForm from '../molecules/springsetting/ProjectMetadataForm';
import SpringBootConfig from '../molecules/springsetting/SpringBootConfig';
import DependencySearch from '../molecules/springsetting/DependencySearch';
import DependencyList from '../molecules/springsetting/DependencyList';
import DependencyRecommendations from '../molecules/springsetting/DependencyRecommendations';
import ActionButtons from '../molecules/springsetting/ActionButtons';

import {
  getSpringSettings,
  createSpringSettings,
  updateSpringSettings,
  getAvailableDependencies,
} from '../api/springsettingAPI';

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
  const [loading, setLoading] = useState(true);
  const [settingsExist, setSettingsExist] = useState(false);

  const [springBootVersion, setSpringBootVersion] = useState('3.0.6');
  const [projectType, setProjectType] = useState('Maven Project');
  const [language, setLanguage] = useState('Java');
  const [packaging, setPackaging] = useState('Jar');
  const [javaVersion, setJavaVersion] = useState('17');

  const [groupId, setGroupId] = useState('com.example');
  const [artifactId, setArtifactId] = useState('demo');
  const [description, setDescription] = useState(
    'Spring Boot 기반 백엔드 프로젝트',
  );
  const [projectName, setProjectName] = useState('demo');
  const [packageName, setPackageName] = useState('com.example.demo');

  const [dependencies, setDependencies] = useState<Dependency[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const springBootVersions: SpringBootVersion[] = [
    {
      version: '3.0.6',
      releaseDate: '2023-04-20',
      springVersion: '6.0.9',
      javaCompatibility: '17+',
    },
    {
      version: '3.0.5',
      releaseDate: '2023-03-23',
      springVersion: '6.0.8',
      javaCompatibility: '17+',
    },
    {
      version: '2.7.10',
      releaseDate: '2023-03-23',
      springVersion: '5.3.26',
      javaCompatibility: '8+',
    },
    {
      version: '2.7.9',
      releaseDate: '2023-02-23',
      springVersion: '5.3.25',
      javaCompatibility: '8+',
    },
    {
      version: '2.6.14',
      releaseDate: '2023-02-23',
      springVersion: '5.3.25',
      javaCompatibility: '8+',
    },
  ];

  const resetSettings = () => {
    setSpringBootVersion('3.0.6');
    setProjectType('Maven Project');
    setLanguage('Java');
    setPackaging('Jar');
    setJavaVersion('17');

    setGroupId('');
    setArtifactId('');
    setDescription('');
    setProjectName('');
    setPackageName('');

    setDependencies((prev) => prev.map((d) => ({ ...d, selected: false })));
    setSettingsExist(false);
  };

  useEffect(() => {
    const loadData = async () => {
      if (!projectId) {
        setLoading(false);
        return;
      }

      const accessToken = sessionStorage.getItem('accessToken');
      if (!accessToken) {
        console.error('인증 토큰이 없습니다.');
        setLoading(false);
        return;
      }

      try {
        // 병렬 요청
        const [depsResponse, settingsResponse] = await Promise.all([
          getAvailableDependencies(),
          getSpringSettings(Number(projectId), accessToken),
        ]);

        const availableDeps: string[] =
          depsResponse?.data?.result?.dependencies || [];

        const selectedDeps: string[] =
          settingsResponse?.result?.dependencies || [];

        // dependencies 상태 구성
        const deps: Dependency[] = availableDeps.map((name: string) => ({
          id: name,
          name,
          description: '',
          selected: selectedDeps.includes(name),
        }));
        setDependencies(deps);

        // 나머지 설정 반영
        setSettingsExist(true);
        mapResponseToState(settingsResponse.result);
      } catch (error) {
        if (error instanceof AxiosError && error.response?.status === 404) {
          resetSettings();
        }
        setSettingsExist(false);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [projectId]);

  const mapResponseToState = (data: any) => {
    const formatSpringVersion = (num: number): string => {
      const str = num.toString();
      if (str.length === 3) {
        return `${str[0]}.0.${str[1]}${str[2]}`;
      } else if (str.length === 4) {
        return `${str[0]}.${str[1]}.${str[2]}${str[3]}`;
      } else {
        return '3.0.6';
      }
    };

    const projectTypeMap = { MAVEN: 'Maven Project', GRADLE: 'Gradle Project' };
    const languageMap = { JAVA: 'Java', KOTLIN: 'Kotlin', GROOVY: 'Groovy' };
    const packagingMap = { JAR: 'Jar', WAR: 'War' };

    setSpringBootVersion(formatSpringVersion(data.springVersion));
    setProjectType(projectTypeMap[data.springProject] || 'Maven Project');
    setLanguage(languageMap[data.springLanguage] || 'Java');
    setPackaging(packagingMap[data.springPackaging] || 'Jar');
    setJavaVersion(data.springJavaVersion?.toString() || '17');

    setGroupId(data.springGroup || '');
    setArtifactId(data.springArtifact || '');
    setProjectName(data.springName || data.springArtifact || '');
    setPackageName(data.springPackageName || '');
    setDescription(data.springDescription || '');
  };

  const toggleDependency = (id: string) => {
    setDependencies(
      dependencies.map((dep) =>
        dep.id === id ? { ...dep, selected: !dep.selected } : dep,
      ),
    );
  };

  const onClickBack = () => {
    navigate(`/project/${projectId}`);
  };

  const filteredDependencies = searchQuery
    ? dependencies.filter(
        (dep) =>
          dep.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          dep.description.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : dependencies;

  const selectedCount = dependencies.filter((dep) => dep.selected).length;

  const handleSave = async () => {
    if (!projectId) return;

    const accessToken = sessionStorage.getItem('accessToken');
    if (!accessToken) return;

    const requestData = {
      springSettings: {
        springProject: projectType === 'Maven Project' ? 'MAVEN' : 'GRADLE',
        springLanguage:
          language === 'Java'
            ? 'JAVA'
            : language === 'Kotlin'
              ? 'KOTLIN'
              : 'GROOVY',
        springVersion: parseInt(springBootVersion.split('.').join('')),
        springGroup: groupId,
        springArtifact: artifactId,
        springName: projectName,
        springDescription: description,
        springPackageName: packageName,
        springPackaging: packaging === 'Jar' ? 'JAR' : 'WAR',
        springJavaVersion: parseInt(javaVersion),
      },
      selectedDependencies: dependencies
        .filter((d) => d.selected)
        .map((d) => d.id),
    };

    try {
      if (settingsExist) {
        await updateSpringSettings(Number(projectId), requestData, accessToken);
      } else {
        await createSpringSettings(Number(projectId), requestData, accessToken);
      }
      setSettingsExist(true);
      alert('설정이 성공적으로 저장되었습니다.');
    } catch (error) {
      console.error('저장 실패:', error);
      alert('설정 저장 중 오류가 발생했습니다.');
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
      <header className="bg-gray-50">
        <div className="mx-auto px-4 py-4 flex items-center justify-between">
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
                  이 프로젝트의 Spring 설정이 이미 구성되어 있습니다.
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
