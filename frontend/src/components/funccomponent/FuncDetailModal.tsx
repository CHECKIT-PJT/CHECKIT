import { useState, useEffect } from 'react';
import type { FuncDetail } from '../../types/FuncDoc';

interface FuncDetailModalProps {
  func: FuncDetail | null;
  onClose: () => void;
  onSave: (func: FuncDetail) => void;
  onDelete?: () => void;
}

const blankFuncDetail: FuncDetail = {
  funcName: '',
  category: '',
  assignee: '',
  storyPoints: 0,
  priority: 'MEDIUM',
  description: '',
  successCase: '',
  failCase: '',
};

const FuncDetailModal = ({
  func,
  onClose,
  onSave,
  onDelete,
}: FuncDetailModalProps) => {
  const [form, setForm] = useState<FuncDetail>(func ?? blankFuncDetail);
  const [showPriorityDropdown, setShowPriorityDropdown] = useState(false);

  useEffect(() => {
    if (func) {
      setForm(func);
    } else {
      setForm(blankFuncDetail);
    }
  }, [func]);

  if (!form) return null;

  const priorityColors = {
    HIGH: 'bg-rose-500',
    MEDIUM: 'bg-amber-500',
    LOW: 'bg-emerald-500',
  };

  const priorityOptions = ['HIGH', 'MEDIUM', 'LOW'];
  const priorityColor =
    priorityColors[form.priority as keyof typeof priorityColors] ||
    'bg-slate-500';

  const handleSave = () => {
    onSave(form);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-4/5 max-w-6xl flex flex-col shadow-2xl max-h-[90vh] overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-bold text-blue-700">
            {func ? '기능 명세서 정보 수정' : '새 기능 추가'}
          </h2>
          <div className="flex gap-3">
            <button
              className="px-5 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-100 transition"
              onClick={onClose}
            >
              Cancel
            </button>

            <button
              className="px-5 py-2 bg-red-600 text-white rounded-lg font-medium shadow hover:bg-red-700 transition flex items-center gap-2"
              onClick={onDelete}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M3 6h18"></path>
                <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"></path>
              </svg>
              Delete
            </button>

            <button
              className="px-5 py-2 bg-blue-600 text-white rounded-lg font-medium shadow hover:bg-blue-700 transition flex items-center gap-2"
              onClick={handleSave}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                <polyline points="17 21 17 13 7 13 7 21"></polyline>
                <polyline points="7 3 7 8 15 8"></polyline>
              </svg>
              Save
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto">
          <div className="mb-4">
            <input
              className="w-full border-b-2 border-blue-200 text-xl font-semibold mb-3 px-2 py-2 focus:outline-none focus:border-blue-500 transition-colors"
              value={form.funcName}
              onChange={e => setForm({ ...form, funcName: e.target.value })}
              placeholder="기능 이름"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 p-4 bg-gray-50 rounded-xl">
            <div className="flex items-center">
              <span className="font-semibold text-gray-700 mr-2">
                Category :
              </span>
              <input
                className="bg-white text-gray-700 px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:border-blue-300"
                value={form.category}
                onChange={e =>
                  setForm({ ...form, category: e.target.value.toUpperCase() })
                }
                placeholder="카테고리"
              />
            </div>

            <div className="flex items-center">
              <span className="font-semibold text-gray-700 mr-2">
                담당자 :{' '}
              </span>
              <input
                className="bg-white text-gray-700 px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:border-blue-300"
                value={form.assignee}
                onChange={e => setForm({ ...form, assignee: e.target.value })}
                placeholder="담당자"
              />
            </div>

            <div className="flex items-center">
              <span className="font-semibold text-gray-700 mr-2">
                Stoty Point:
              </span>
              <input
                type="number"
                min="0"
                className="bg-white text-gray-700 px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:border-blue-300 w-24"
                value={form.storyPoints}
                onChange={e =>
                  setForm({ ...form, storyPoints: Number(e.target.value) })
                }
                placeholder="0"
              />
            </div>

            <div className="flex items-center relative">
              <span className="font-semibold text-gray-700 mr-2">
                우선 순위 :
              </span>
              <div className="dropdown relative">
                <span
                  className={`px-4 py-2 rounded-lg text-white font-bold ${priorityColor} cursor-pointer`}
                  onClick={() => setShowPriorityDropdown(!showPriorityDropdown)}
                >
                  {form.priority}
                </span>
                {showPriorityDropdown && (
                  <div className="absolute mt-1 bg-white shadow-lg rounded-lg z-10 border border-gray-200 py-1 min-w-[100px]">
                    {priorityOptions.map(priority => (
                      <div
                        key={priority}
                        className={`px-4 py-2 cursor-pointer hover:bg-gray-100 ${
                          priority === form.priority
                            ? 'font-bold bg-gray-50'
                            : ''
                        }`}
                        onClick={() => {
                          setForm({ ...form, priority });
                          setShowPriorityDropdown(false);
                        }}
                      >
                        {priority}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 설명과 성공/실패 케이스를 좌우로 나누는 새로운 레이아웃 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 왼쪽: 설명 부분 */}
            <div className="border rounded-lg bg-white p-4 shadow-sm">
              <div className="mb-4">
                <div className="px-6 py-2 font-medium bg-blue-600 text-white rounded-t-lg text-center">
                  설명
                </div>
              </div>
              <textarea
                className="w-full p-3 border rounded-lg bg-white focus:outline-none focus:border-blue-300 overflow-y-auto resize-none"
                style={{ height: '350px' }}
                value={form.description}
                onChange={e =>
                  setForm({ ...form, description: e.target.value })
                }
                placeholder="기능에 대한 상세 설명을 입력하세요"
              />
            </div>

            {/* 오른쪽: 성공 케이스와 실패 케이스 (상하로 배치) */}
            <div className="flex flex-col gap-6">
              {/* 성공 케이스 */}
              <div className="border rounded-lg bg-white p-4 shadow-sm">
                <div className="mb-2">
                  <div className="px-6 py-2 font-medium bg-green-600 text-white rounded-t-lg text-center">
                    성공 케이스
                  </div>
                </div>
                <textarea
                  className="w-full p-3 border rounded-lg bg-green-50 focus:outline-none focus:border-green-300 overflow-y-auto resize-none"
                  style={{ height: '128px' }}
                  placeholder="성공 케이스를 입력하세요"
                  value={form.successCase}
                  onChange={e =>
                    setForm({ ...form, successCase: e.target.value })
                  }
                />
              </div>

              {/* 실패 케이스 */}
              <div className="border rounded-lg bg-white p-4 shadow-sm">
                <div className="mb-2">
                  <div className="px-6 py-2 font-medium bg-rose-600 text-white rounded-t-lg text-center">
                    실패 케이스
                  </div>
                </div>
                <textarea
                  className="w-full p-3 border rounded-lg bg-rose-50 focus:outline-none focus:border-rose-300 overflow-y-auto resize-none"
                  style={{ height: '128px' }}
                  placeholder="실패 케이스를 입력하세요"
                  value={form.failCase}
                  onChange={e => setForm({ ...form, failCase: e.target.value })}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FuncDetailModal;
