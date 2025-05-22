import { useState } from 'react';
import { FiTrash, FiPlus } from 'react-icons/fi';

const ImprovedTabDesign = () => {
  const [tab, setTab] = useState('RESOURCE');
  const [form, setForm] = useState({
    pathVariables: [],
    header: '',
  });
  const [showAddPathVar, setShowAddPathVar] = useState(false);
  const [showAddHeader, setShowAddHeader] = useState(false);
  const [newPathVar, setNewPathVar] = useState({
    pathVariable: '',
    pathVariableDataType: 'String',
  });
  const [newHeader, setNewHeader] = useState({
    key: '',
    value: '',
  });

  const dataTypes = ['String', 'Integer', 'Boolean', 'Float'];

  const handleAddPathVar = () => {
    if (newPathVar.pathVariable.trim()) {
      setForm({
        ...form,
        pathVariables: [...form.pathVariables, newPathVar],
      });
      setNewPathVar({
        pathVariable: '',
        pathVariableDataType: 'String',
      });
      setShowAddPathVar(false);
    }
  };

  const removePathVar = index => {
    const updatedVars = [...form.pathVariables];
    updatedVars.splice(index, 1);
    setForm({ ...form, pathVariables: updatedVars });
  };

  const handleAddHeader = () => {
    if (newHeader.key.trim() && newHeader.value.trim()) {
      const headerLine = `${newHeader.key}: ${newHeader.value}`;
      const updatedHeader = form.header
        ? `${form.header}\n${headerLine}`
        : headerLine;
      setForm({ ...form, header: updatedHeader });
      setNewHeader({ key: '', value: '' });
      setShowAddHeader(false);
    }
  };

  const removeHeader = index => {
    const headers = form.header.split('\n');
    headers.splice(index, 1);
    setForm({ ...form, header: headers.join('\n') });
  };

  return (
    <div className="mb-4">
      {/* Compact tabs that take less space */}
      <div className="flex border-b border-gray-200">
        <button
          className={`text-sm px-4 py-2 font-medium transition focus:outline-none ${
            tab === 'RESOURCE'
              ? 'border-b-2 border-blue-500 text-blue-600'
              : 'text-gray-600 hover:text-gray-800'
          }`}
          onClick={() => setTab('RESOURCE')}
        >
          RESOURCE
        </button>

        <button
          className={`text-sm px-4 py-2 font-medium transition focus:outline-none ${
            tab === 'HEADER'
              ? 'border-b-2 border-blue-500 text-blue-600'
              : 'text-gray-600 hover:text-gray-800'
          }`}
          onClick={() => setTab('HEADER')}
        >
          HEADER
        </button>
      </div>

      {/* Content area */}
      <div className="bg-white p-3 shadow-sm">
        {tab === 'RESOURCE' ? (
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="font-medium text-gray-700 text-sm">
                KEY Parameters
              </span>
              {!showAddPathVar && (
                <button
                  className="text-xs text-blue-600 hover:text-blue-800 transition flex items-center gap-1"
                  onClick={() => setShowAddPathVar(true)}
                >
                  <FiPlus className="w-3 h-3" /> Add
                </button>
              )}
            </div>

            {form.pathVariables.length > 0 ? (
              <div className="space-y-1 mb-2">
                {form.pathVariables.map((pathVar, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center p-1.5 bg-gray-50 rounded text-xs"
                  >
                    <div className="flex gap-2 items-center">
                      <span className="font-mono text-blue-600">
                        {pathVar.pathVariable}
                      </span>
                      <span className="bg-gray-200 px-1.5 py-0.5 rounded">
                        {pathVar.pathVariableDataType}
                      </span>
                    </div>
                    <button
                      className="text-gray-400 hover:text-red-500 p-0.5"
                      onClick={() => removePathVar(index)}
                    >
                      <FiTrash className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-gray-400 text-xs italic mb-2">
                No parameters added
              </div>
            )}

            {showAddPathVar && (
              <div className="p-2 border border-blue-100 rounded bg-blue-50 mb-2 text-xs">
                <div className="flex gap-2 mb-2">
                  <input
                    className="p-1.5 border rounded flex-1 text-xs"
                    placeholder="Name"
                    value={newPathVar.pathVariable}
                    onChange={e =>
                      setNewPathVar({
                        ...newPathVar,
                        pathVariable: e.target.value,
                      })
                    }
                  />
                  <select
                    className="p-1.5 border rounded text-xs"
                    value={newPathVar.pathVariableDataType}
                    onChange={e =>
                      setNewPathVar({
                        ...newPathVar,
                        pathVariableDataType: e.target.value,
                      })
                    }
                  >
                    {dataTypes.map(type => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    className="px-2 py-1 bg-gray-200 text-gray-700 rounded text-xs"
                    onClick={() => setShowAddPathVar(false)}
                  >
                    Cancel
                  </button>
                  <button
                    className="px-2 py-1 bg-blue-500 text-white rounded text-xs"
                    onClick={handleAddPathVar}
                  >
                    Add
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="font-medium text-gray-700 text-sm">Headers</span>
              {!showAddHeader && (
                <button
                  className="text-xs text-blue-600 hover:text-blue-800 transition flex items-center gap-1"
                  onClick={() => setShowAddHeader(true)}
                >
                  <FiPlus className="w-3 h-3" /> Add
                </button>
              )}
            </div>

            {form.header && form.header.length > 0 ? (
              <div className="space-y-1 mb-2">
                {form.header.split('\n').map((header, index) => {
                  const [key, value] = header.split(': ');
                  return (
                    <div
                      key={index}
                      className="flex justify-between items-center p-1.5 bg-gray-50 rounded text-xs"
                    >
                      <div className="flex gap-1 items-center overflow-hidden">
                        <span className="font-mono text-purple-600 truncate">
                          {key}
                        </span>
                        <span className="text-gray-600">:</span>
                        <span className="text-gray-700 truncate">{value}</span>
                      </div>
                      <button
                        className="text-gray-400 hover:text-red-500 p-0.5 flex-shrink-0"
                        onClick={() => removeHeader(index)}
                      >
                        <FiTrash className="w-3 h-3" />
                      </button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-gray-400 text-xs italic mb-2">
                No headers added
              </div>
            )}

            {showAddHeader && (
              <div className="p-2 border border-blue-100 rounded bg-blue-50 mb-2 text-xs">
                <div className="flex gap-2 mb-2">
                  <input
                    className="p-1.5 border rounded flex-1 text-xs"
                    placeholder="Header Key"
                    value={newHeader.key}
                    onChange={e =>
                      setNewHeader({
                        ...newHeader,
                        key: e.target.value,
                      })
                    }
                  />
                  <input
                    className="p-1.5 border rounded flex-1 text-xs"
                    placeholder="Header Value"
                    value={newHeader.value}
                    onChange={e =>
                      setNewHeader({
                        ...newHeader,
                        value: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    className="px-2 py-1 bg-gray-200 text-gray-700 rounded text-xs"
                    onClick={() => setShowAddHeader(false)}
                  >
                    Cancel
                  </button>
                  <button
                    className="px-2 py-1 bg-blue-500 text-white rounded text-xs"
                    onClick={handleAddHeader}
                  >
                    Add
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ImprovedTabDesign;
