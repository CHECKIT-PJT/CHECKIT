import { useState, useEffect } from 'react';
import type { FuncDetail } from '../../types/FuncDoc';
import { FaRegSave, FaRegTrashAlt } from 'react-icons/fa';
import useProjectStore from '../../stores/projectStore';
import {
  FaAnglesUp,
  FaAngleUp,
  FaEquals,
  FaAngleDown,
  FaAnglesDown,
} from 'react-icons/fa6';
import ActiveUsers from '../apicomponent/ActiveUsers';
import RemoteCursor from '../cursor/RemoteCursor';
import type { RemoteCursorData } from '../../types/cursor';

interface User {
  id: string;
  name: string;
  color: string;
}

interface FuncDetailModalProps {
  func: FuncDetail | null;
  onClose: () => void;
  onSave: (func: FuncDetail) => void;
  onDelete?: () => void;
  activeUsers: User[];
  onMouseMove?: (e: React.MouseEvent<HTMLDivElement>) => void;
  remoteCursors: { [key: string]: RemoteCursorData };
  sendFuncSocketMessage: (action: 'UPDATE', funcSpec: FuncDetail) => void;
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
  userName: '',
};

const priorityIcons = {
  HIGHEST: <FaAnglesUp className="inline mr-2 text-red-500" />,
  HIGH: <FaAngleUp className="inline mr-2 text-rose-500" />,
  MEDIUM: <FaEquals className="inline mr-2 text-amber-500" />,
  LOW: <FaAngleDown className="inline mr-2 text-emerald-500" />,
  LOWEST: <FaAnglesDown className="inline mr-2 text-teal-500" />,
};

const FuncDetailModal = ({
  func,
  onClose,
  onSave,
  onDelete,
  activeUsers,
  onMouseMove,
  remoteCursors,
  sendFuncSocketMessage,
}: FuncDetailModalProps) => {
  const { currentProject } = useProjectStore();
  const members = currentProject?.projectMembers || [];
  const [form, setForm] = useState<FuncDetail>(func ?? blankFuncDetail);
  const [showPriorityDropdown, setShowPriorityDropdown] = useState(false);
  const [funcName, setFuncName] = useState();


  useEffect(() => {
  if (!func) {
    setForm(blankFuncDetail);
  } else if (JSON.stringify(func) !== JSON.stringify(form)) {
    setForm(func);
  }
}, []);

  const handleChange = (updated: FuncDetail) => {
    console.log('update',updated)
    setForm(updated);
    sendFuncSocketMessage('UPDATE', updated);
  };

  const handleSave = () => {
    onSave(form);
  };

  if (!form) return null;

  const priorityOptions = ['HIGHEST', 'HIGH', 'MEDIUM', 'LOW', 'LOWEST'];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm">
      <div
        className="bg-white rounded-2xl w-3/4 max-w-6xl flex flex-col shadow-2xl max-h-[80vh] overflow-hidden relative"
        onMouseMove={onMouseMove}
      >
        <div className="fixed pointer-events-none inset-0 overflow-hidden">
          {Object.values(remoteCursors).map(cursor => (
            <RemoteCursor
              key={cursor.userId}
              x={cursor.x}
              y={cursor.y}
              username={cursor.username}
              color={cursor.color}
            />
          ))}
        </div>

        <div className="flex justify-between items-center p-6 border-b">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-bold text-blue-700">
              {func ? '기능 명세서 정보 수정' : '새 기능 추가'}
            </h2>
            <ActiveUsers users={activeUsers} size="small" />
          </div>
          <div className="flex gap-3">
            <button
              className="px-5 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-100 transition"
              onClick={onClose}
            >
              Cancel
            </button>

            {func && (
              <button
                className="px-5 py-2 bg-red-600 text-white rounded-lg font-medium shadow hover:bg-red-700 transition flex items-center gap-2"
                onClick={onDelete}
              >
                <FaRegTrashAlt className="w-4 h-4" />
                Delete
              </button>
            )}

            <button
              className="px-5 py-2 bg-blue-600 text-white rounded-lg font-medium shadow hover:bg-blue-700 transition flex items-center gap-2"
              onClick={handleSave}
            >
              <FaRegSave className="w-4 h-4" />
              Save
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto">
          <input
            className="w-full border-b-2 border-blue-200 text-xl font-semibold mb-3 px-2 py-2 focus:outline-none focus:border-blue-500 transition-colors"
            value={form.funcName}
            onChange={e =>
              handleChange({ ...form, funcName: e.target.value })
            }
            placeholder="기능 이름"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 p-4 bg-gray-50 rounded-xl">
            <div className="flex items-center">
              <span className="font-semibold text-gray-700 mr-2">
                Category :
              </span>
              <input
                className="bg-white text-gray-700 px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:border-blue-300"
                value={form.category}
                onChange={e => {
                  const value = e.target.value.replace(/[^a-zA-Z]/g, '').toLowerCase();
                  handleChange({ ...form, category: value });
                }}
                placeholder="category"
              />
            </div>

            <div className="flex items-center">
              <span className="font-semibold text-gray-700 mr-2">담당자 :</span>
              <select
                className="bg-white text-gray-700 px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:border-blue-300 text-sm"
                value={form.assignee}
                onChange={e =>
                  handleChange({ ...form, assignee: e.target.value })
                }
              >
                <option value="">담당자 선택</option>
                {members
                  .filter(member => member.isApproved)
                  .map(member => (
                    <option key={member.id} value={member.id.toString()}>
                      {member.nickname} (@ {member.userName})
                    </option>
                  ))}
              </select>
            </div>

            <div className="flex items-center">
              <span className="font-semibold text-gray-700 mr-2">
                Story Point:
              </span>
              <input
                type="number"
                min="0"
                className="bg-white text-gray-700 px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:border-blue-300 w-24"
                value={form.storyPoints}
                onChange={e =>
                  handleChange({ ...form, storyPoints: Number(e.target.value) })
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
                  className="px-4 py-2 rounded-lg text-gray-700 font-bold bg-white cursor-pointer flex items-center justify-between min-w-[120px]"
                  onClick={() => setShowPriorityDropdown(!showPriorityDropdown)}
                >
                  <span className="flex items-center">
                    {priorityIcons[form.priority as keyof typeof priorityIcons]}
                    {form.priority}
                  </span>
                </span>
                {showPriorityDropdown && (
                  <div className="absolute mt-1 bg-white shadow-lg rounded-lg z-10 border border-gray-200 py-1 min-w-[100px]">
                    {Object.keys(priorityIcons).map(priority => (
                      <div
                        key={priority}
                        className={`px-4 py-2 cursor-pointer hover:bg-gray-100 flex items-center ${
                          priority === form.priority ? 'font-bold bg-gray-50' : ''
                        }`}
                        onClick={() => {
                          handleChange({ ...form, priority });
                          setShowPriorityDropdown(false);
                        }}
                      >
                        {priorityIcons[priority as keyof typeof priorityIcons]}
                        {priority}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border rounded-lg bg-white p-4 shadow-sm">
              <div className="px-6 py-2 font-medium bg-blue-600 text-white rounded-t-lg text-center">
                설명
              </div>
              <textarea
                className="w-full p-3 border-x border-b rounded-b-lg bg-white focus:outline-none focus:border-blue-300 resize-none"
                style={{ height: '350px' }}
                value={form.description}
                onChange={e =>
                  handleChange({ ...form, description: e.target.value })
                }
                placeholder="기능에 대한 상세 설명을 입력하세요"
              />
            </div>

            <div className="flex flex-col gap-6">
              <div className="border rounded-lg bg-white p-4 shadow-sm">
                <div className="px-6 py-2 font-medium bg-green-800 text-white rounded-t-lg text-center">
                  성공 케이스
                </div>
                <textarea
                  className="w-full p-3 border-x border-b rounded-b-lg bg-green-50 focus:outline-none focus:border-green-700 resize-none"
                  style={{ height: '128px' }}
                  value={form.successCase}
                  onChange={e =>
                    handleChange({ ...form, successCase: e.target.value })
                  }
                  placeholder="성공 케이스를 입력하세요"
                />
              </div>

              <div className="border rounded-lg bg-white p-4 shadow-sm">
                <div className="px-6 py-2 font-medium bg-rose-700 text-white rounded-t-lg text-center">
                  실패 케이스
                </div>
                <textarea
                  className="w-full p-3 border-x border-b rounded-b-lg bg-rose-50 focus:outline-none focus:border-rose-500 resize-none"
                  style={{ height: '128px' }}
                  value={form.failCase}
                  onChange={e =>
                    handleChange({ ...form, failCase: e.target.value })
                  }
                  placeholder="실패 케이스를 입력하세요"
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
function state(arg0: string): { (initialState: string | (() => string)): [string, import("react").Dispatch<import("react").SetStateAction<string>>]; (): [string | undefined, import("react").Dispatch<import("react").SetStateAction<string | undefined>>]; } {
  throw new Error('Function not implemented.');
}

