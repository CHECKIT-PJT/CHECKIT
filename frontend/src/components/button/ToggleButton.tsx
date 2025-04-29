import { useState } from 'react';
import { TbCloudQuestion } from 'react-icons/tb';

const ToggleButton = () => {
  const [showShortcuts, setShowShortcuts] = useState(false);

  const shortcuts = [
    { action: '편집', keys: 'Enter' },
    { action: '정지', keys: 'ESC' },
    { action: '검색', keys: 'Ctrl + K' },
    { action: '실행 취소', keys: 'Ctrl + Z' },
    { action: '다시 실행', keys: 'Ctrl + Shift + Z' },
    { action: '테이블 추가', keys: 'Alt + N' },
    { action: '컬럼 추가', keys: 'Alt + Enter' },
    { action: '메모 추가', keys: 'Alt + M' },
    { action: '테이블/메모 삭제', keys: 'Ctrl + ⌫ / Ctrl + Delete' },
    { action: '컬럼 삭제', keys: 'Alt + ⌫ / Alt + Delete' },
    { action: '기본 키', keys: 'Alt + K' },
    { action: '모든 테이블/메모 선택', keys: 'Ctrl + Alt + A' },
    { action: '모든 컬럼 선택', keys: 'Alt + A' },
    { action: '관계 Zero One', keys: 'Ctrl + Alt + 1' },
    { action: '관계 Zero N', keys: 'Ctrl + Alt + 2' },
    { action: '관계 One Only', keys: 'Ctrl + Alt + 3' },
    { action: '관계 One N', keys: 'Ctrl + Alt + 4' },
    { action: '테이블 속성', keys: 'Alt + Space' },
    { action: '확대', keys: 'Ctrl + Plus' },
    { action: '축소', keys: 'Ctrl + Minus' },
  ];

  const toggleShortcuts = () => {
    setShowShortcuts(!showShortcuts);
  };

  return (
    <div className="flex flex-col items-center">
      <button
        onClick={toggleShortcuts}
        className="flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg shadow-md transition-all duration-200"
      >
        <TbCloudQuestion className="mr-2" size={20} />
      </button>

      {showShortcuts && (
        <div className="mt-4 bg-white border border-gray-200 rounded-lg shadow-lg p-4 max-w-md w-full">
          <h3 className="text-lg font-bold mb-3 text-gray-800">
            키보드 단축키
          </h3>
          <div className="max-h-96 overflow-y-auto">
            <table className="w-full">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">
                    기능
                  </th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">
                    단축키
                  </th>
                </tr>
              </thead>
              <tbody>
                {shortcuts.map((shortcut, index) => (
                  <tr
                    key={index}
                    className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}
                  >
                    <td className="px-4 py-2 text-sm text-gray-700">
                      {shortcut.action}
                    </td>
                    <td className="px-4 py-2 text-sm font-mono bg-gray-100 rounded mx-1">
                      {shortcut.keys}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 flex justify-end">
            <button
              onClick={toggleShortcuts}
              className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded text-sm"
            >
              닫기
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ToggleButton;
