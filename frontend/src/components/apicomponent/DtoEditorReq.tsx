import { useState } from 'react';
import type { DtoItem } from '../../types/apiDocs';
import { FiTrash } from 'react-icons/fi';

interface DtoEditorProps {
  title: string;
  dtoName: string;
  dtoItems?: DtoItem[];
  onDtoNameChange: (name: string) => void;
  onDtoItemsChange: (items: DtoItem[]) => void;
  dtoType: 'REQUEST' | 'RESPONSE' | '';
  onDtoTypeChange: (type: 'REQUEST' | 'RESPONSE') => void;
  isRequestBody?: boolean;
  onUseDtoChange?: (useDto: boolean) => void;
}

const dataTypes = [
  'Integer',
  'Long',
  'Short',
  'Byte',
  'Float',
  'Double',
  'Character',
  'Boolean',
  'String',
  'LocalDate',
  'LocalDateTime',
  'enum',
  'BigDecimal',
  'BigInteger',
  'UUID',
];

const DtoEditorReq = ({
  title,
  dtoName,
  dtoItems = [],
  onDtoNameChange,
  onDtoItemsChange,
  dtoType,
  onDtoTypeChange,
  isRequestBody = false,
  onUseDtoChange,
}: DtoEditorProps) => {
  const [showAddDto, setShowAddDto] = useState(false);
  const [newDtoItem, setNewDtoItem] = useState<DtoItem>({
    id: 0,
    dtoItemName: '',
    dataType: 'String',
    isList: false,
  });
  const [useDto, setUseDto] = useState(dtoItems.length > 0 || Boolean(dtoName));

  const handleAddDtoItem = () => {
    if (newDtoItem.dtoItemName.trim() === '') return;
    onDtoItemsChange([...dtoItems, { ...newDtoItem }]);
    setNewDtoItem({
      id: 0,
      dtoItemName: '',
      dataType: 'String',
      isList: false,
    });
    setShowAddDto(false);
  };

  const removeDtoItem = (index: number) => {
    const newItems = [...dtoItems];
    newItems.splice(index, 1);
    onDtoItemsChange(newItems);
  };

  const handleDtoTypeChange = (type: 'REQUEST' | 'RESPONSE') => {
    onDtoTypeChange(type);
  };

  const handleUseDtoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUseDto(e.target.checked);
    if (!e.target.checked) {
      onDtoItemsChange([]);
      onDtoNameChange('');
    }
    if (onUseDtoChange) {
      onUseDtoChange(e.target.checked);
    }
  };
  return (
    <div className="border rounded-xl p-4 bg-white shadow-sm">
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-gray-700">{title}</span>

          <label className="flex items-center text-xs text-gray-600 bg-gray-100 rounded-lg px-2 py-1">
            <input
              type="checkbox"
              className="mr-1"
              checked={useDto}
              onChange={handleUseDtoChange}
            />
            Use DTO
          </label>

          {useDto && isRequestBody && (
            <div className="ml-2 flex text-xs">
              <button
                className={`px-3 py-1 rounded-lg ${
                  dtoType === 'REQUEST'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-700'
                }`}
                onClick={() => handleDtoTypeChange('REQUEST')}
              >
                REQUEST
              </button>
            </div>
          )}
        </div>

        {useDto && (
          <button
            className="text-xs bg-blue-50 text-blue-600 px-3 py-1 rounded-lg hover:bg-blue-100 transition flex items-center gap-1"
            onClick={() => setShowAddDto(!showAddDto)}
          >
            + Add Field
          </button>
        )}
      </div>

      {useDto && (
        <>
          <div className="mb-4">
            <input
              className="w-full border-b-2 border-blue-100 text-base px-2 py-2 text-gray-700 focus:outline-none focus:border-blue-300 transition-colors"
              value={dtoName}
              onChange={e => onDtoNameChange(e.target.value)}
              placeholder="DTO Name"
            />
          </div>

          {dtoItems.length > 0 ? (
            <div className="space-y-2 mb-3">
              {dtoItems.map((item, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center p-2 bg-gray-50 rounded"
                >
                  <div className="flex gap-4 items-center justify-between">
                    <span className="text-blue-600">{item.dtoItemName}</span>
                    <span className="text-xs bg-gray-200 px-2 py-1 rounded">
                      {item.dataType}
                      {item.isList ? '[ ]' : ''}
                    </span>
                  </div>
                  <button
                    className="text-gray-500 hover:text-red-500"
                    onClick={() => removeDtoItem(index)}
                  >
                    <FiTrash className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-500 text-sm" />
          )}

          {showAddDto && (
            <div className="p-3 border border-blue-100 rounded-lg bg-blue-50 mb-2">
              <div className="grid grid-cols-12 gap-2 mb-2">
                <input
                  className="p-2 border rounded col-span-5"
                  placeholder="Field Name"
                  value={newDtoItem.dtoItemName}
                  onChange={e =>
                    setNewDtoItem({
                      ...newDtoItem,
                      dtoItemName: e.target.value,
                    })
                  }
                />
                <select
                  className="p-2 border rounded col-span-4"
                  value={newDtoItem.dataType}
                  onChange={e =>
                    setNewDtoItem({
                      ...newDtoItem,
                      dataType: e.target.value,
                    })
                  }
                >
                  {dataTypes.map(type => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
                <label className="flex items-center gap-1 px-1 col-span-2">
                  <input
                    type="checkbox"
                    checked={newDtoItem.isList}
                    onChange={e =>
                      setNewDtoItem({
                        ...newDtoItem,
                        isList: e.target.checked,
                      })
                    }
                    className="w-3 h-3"
                  />
                  <span className="text-xs">Is List</span>
                </label>
              </div>
              <div className="flex justify-between content-between items-center mt-2">
                <button
                  className="px-3 py-1 bg-gray-200 text-gray-700 rounded text-xs"
                  onClick={() => setShowAddDto(false)}
                >
                  Cancel
                </button>
                <button
                  className="px-3 py-1 bg-blue-500 text-white rounded text-xs"
                  onClick={handleAddDtoItem}
                >
                  Add
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default DtoEditorReq;
