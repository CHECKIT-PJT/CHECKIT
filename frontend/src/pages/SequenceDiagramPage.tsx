import { useState, useEffect } from "react";
import Header from "../components/sequence/Header";
import TabNavigation from "../molecules/sequence/TapNavigation";
import ContentSection from "../molecules/sequence/ContentSection";
import {
  dummyCategories,
  dummyDiagramCodes,
  dummyDiagramUrls,
} from "../hooks/SequenceData";

const SequenceDiagramPage: React.FC = () => {
  const [categories] = useState(dummyCategories);
  const [activeCategory, setActiveCategory] = useState<string>(
    dummyCategories[0].id
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [currentDiagramCode, setCurrentDiagramCode] = useState<string>(
    dummyDiagramCodes[dummyCategories[0].id]
  );

  useEffect(() => {
    setCurrentDiagramCode(dummyDiagramCodes[activeCategory]);
  }, [activeCategory]);

  const handleCategoryChange = (categoryId: string) => {
    setIsLoading(true);

    setTimeout(() => {
      setActiveCategory(categoryId);
      setIsLoading(false);
    }, 300);
  };

  return (
    <div className="flex flex-col h-full bg-white">
      <Header
        title="시퀀스 다이어그램"
        subtitle="카테고리별 시퀀스 다이어그램을 확인하세요"
      />

      <TabNavigation
        categories={categories}
        activeCategory={activeCategory}
        onCategoryChange={handleCategoryChange}
      />

      <ContentSection
        diagramCode={currentDiagramCode}
        diagramUrl={dummyDiagramUrls[activeCategory]}
        isLoading={isLoading}
      />
    </div>
  );
};

export default SequenceDiagramPage;
