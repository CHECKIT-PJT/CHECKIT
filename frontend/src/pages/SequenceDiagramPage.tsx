import { useState, useEffect } from "react";
import Header from "../components/sequence/Header";
import TabNavigation from "../molecules/sequence/TapNavigation";
import ContentSection from "../molecules/sequence/ContentSection";
// 더미 데이터 임포트
import {
  dummyCategories,
  dummyDiagramCodes,
  dummyDiagramUrls,
} from "../hooks/SequenceData";

/**
 * 시퀀스 다이어그램 페이지
 */
const SequenceDiagramPage: React.FC = () => {
  // 상태 관리
  const [categories] = useState(dummyCategories);
  const [activeCategory, setActiveCategory] = useState<string>(
    dummyCategories[0].id
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [currentDiagramCode, setCurrentDiagramCode] = useState<string>(
    dummyDiagramCodes[dummyCategories[0].id]
  );

  // 현재 선택된 카테고리 변경 시 다이어그램 코드 업데이트
  useEffect(() => {
    // 더미 데이터에서 다이어그램 코드 가져오기
    setCurrentDiagramCode(dummyDiagramCodes[activeCategory]);
  }, [activeCategory]);

  // 카테고리 변경 핸들러
  const handleCategoryChange = (categoryId: string) => {
    // 로딩 상태를 짧게 표시 (더미 데이터이지만 실제 API 호출처럼 보이도록)
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
