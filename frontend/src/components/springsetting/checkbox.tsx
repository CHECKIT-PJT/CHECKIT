import { FiCheck } from "react-icons/fi";

interface CheckboxProps {
  checked: boolean;
  onChange: () => void;
  label?: string;
  disabled?: boolean;
  className?: string;
}

const Checkbox: React.FC<CheckboxProps> = ({
  checked,
  onChange,
  label,
  disabled = false,
  className = "",
}) => {
  return (
    <div className={`flex items-center ${className}`}>
      <button
        type="button"
        onClick={onChange}
        disabled={disabled}
        className={`h-5 w-5 rounded border flex items-center justify-center transition-colors ${
          checked
            ? "bg-indigo-600 border-indigo-600 text-white"
            : "border-gray-300 text-transparent"
        } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
        aria-checked={checked}
        role="checkbox"
      >
        {checked && <FiCheck className="h-3 w-3" />}
      </button>
      {label && (
        <label
          className={`ml-2 text-sm ${disabled ? "text-gray-400" : "text-gray-700"}`}
        >
          {label}
        </label>
      )}
    </div>
  );
};

export default Checkbox;
