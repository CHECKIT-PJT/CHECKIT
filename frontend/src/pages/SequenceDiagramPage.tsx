import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Header from '../components/sequence/Header';
import TabNavigation from '../molecules/sequence/TapNavigation';
import ContentSection from '../molecules/sequence/ContentSection';
import { useGetApiCategories } from '../api/apiAPI';
import {
  generateSequenceDiagram,
  saveSequenceDiagram,
  getSequenceDiagram,
  updateSequenceDiagram,
} from '../api/sequenceAPI';
import Loading from '../molecules/layout/loading';

const SequenceDiagramPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const parsedProjectId = Number(projectId);

  const [activeCategory, setActiveCategory] = useState<string>('');
  const [diagramCode, setDiagramCode] = useState<string>('');
  const [diagramUrl, setDiagramUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const { data: categories = [], isLoading: isCategoryLoading } =
    useGetApiCategories(parsedProjectId);

  useEffect(() => {
    if (categories.length > 0 && !activeCategory) {
      setActiveCategory(categories[0]);
    }
  }, [categories]);

  useEffect(() => {
    if (activeCategory && parsedProjectId) {
      handleLoadDiagram();
    }
  }, [activeCategory, parsedProjectId]);
  const handleCategoryChange = (categoryId: string) => {
    setActiveCategory(categoryId);
  };

  const handleLoadDiagram = async () => {
    try {
      const response = await getSequenceDiagram(
        parsedProjectId,
        activeCategory,
      );
      const existing = response.data.result;

      if (existing && existing.plantuml_code) {
        setDiagramCode(existing.plantuml_code);
        setDiagramUrl(existing.diagram_url);
      } else {
        setDiagramCode('');
        setDiagramUrl('');
      }
    } catch (error: any) {
      if (error.response?.status === 404) {
        setDiagramCode('');
        setDiagramUrl('');
      } else {
        console.error('다이어그램 불러오기 실패', error);
      }
    }
  };

  const handleGenerateCode = async () => {
    if (!parsedProjectId || !activeCategory) return;

    setIsLoading(true);
    try {
      const response = await generateSequenceDiagram(
        parsedProjectId,
        activeCategory,
      );
      const result = response.data.result;
      setDiagramCode(result.plantuml_code);
      setDiagramUrl(result.diagram_url);
    } catch (error) {
      console.error('시퀀스 다이어그램 생성 실패', error);
      setDiagramCode('');
      setDiagramUrl('');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveDiagram = async (code: string) => {
    if (!parsedProjectId) return;

    try {
      const response = await getSequenceDiagram(
        parsedProjectId,
        activeCategory,
      );
      const existing = response.data.result;

      if (existing && existing.plantuml_code) {
        // 이미 존재 → 수정
        await updateSequenceDiagram(parsedProjectId, {
          content: code,
          diagramUrl,
          category: activeCategory,
        });
        alert('시퀀스 다이어그램이 수정되었습니다!');
      } else {
        // 존재하지 않음 → 저장
        await saveSequenceDiagram(parsedProjectId, {
          content: code,
          diagramUrl,
          category: activeCategory,
        });
        alert('시퀀스 다이어그램이 저장되었습니다!');
      }
    } catch (error: any) {
      if (error.response?.status === 404) {
        // 404 → 새로 저장
        try {
          await saveSequenceDiagram(parsedProjectId, {
            content: code,
            diagramUrl,
            category: activeCategory,
          });
          alert('시퀀스 다이어그램이 저장되었습니다!');
        } catch (e) {
          console.error('저장 실패', e);
          alert('저장 중 오류가 발생했습니다.');
        }
      } else {
        console.error('저장 실패', error);
        alert('저장 중 오류가 발생했습니다.');
      }
    }
  };

  const handleDownloadImage = () => {
    if (!diagramUrl) return;

    const link = document.createElement('a');
    link.href = diagramUrl;
    link.download = `sequence-diagram-${new Date().getTime()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="relative">
      {(isLoading || isCategoryLoading) && <Loading />}

      <div
        className={`${isLoading ? 'blur-sm pointer-events-none select-none' : ''} flex flex-col h-full bg-white`}
      >
        <Header title="시퀀스 다이어그램" />

        <TabNavigation
          categories={categories.map((c) => ({ id: c, name: c }))}
          activeCategory={activeCategory}
          onCategoryChange={handleCategoryChange}
        />

        <ContentSection
          diagramCode={diagramCode}
          diagramUrl={diagramUrl}
          isLoading={isLoading || isCategoryLoading}
          onSaveCode={handleSaveDiagram}
          onDownloadImage={handleDownloadImage}
          onCreateCode={handleGenerateCode}
        />
      </div>
    </div>
  );
};

export default SequenceDiagramPage;
