import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ChapterSelect = () => {
  const navigate = useNavigate();
  const [selectedChapter, setSelectedChapter] = useState<string | null>(null);

  const handleSelect = (chapter: string) => {
    setSelectedChapter(chapter);
    navigate(`/chapter/${chapter}`);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-16">
      <h2 className="text-3xl font-bold">원하는 단계를 선택해주세요</h2>
      <div className="flex gap-8">
        <button
          onClick={() => handleSelect('develop')}
          className={
            'shadow-md px-12 py-6 rounded-xl text-2xl font-semibold transition-all duration-300 bg-white hover:bg-blue-800 hover:text-white hover:shadow-xl hover:scale-105 border border-gray-200'
          }
        >
          설계 계속하러 가기
        </button>
        <button
          onClick={() => handleSelect('build')}
          className={
            'shadow-md px-12 py-6 rounded-xl text-2xl font-semibold transition-all duration-300 bg-white hover:bg-blue-800 hover:text-white hover:shadow-xl hover:scale-105 border border-gray-200'
          }
        >
          설계 완료 후 Build
        </button>
      </div>
    </div>
  );
};

export default ChapterSelect;
