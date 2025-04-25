interface ViewButtonProps {
  onClick?: () => void;
  className?: string;
}

const ViewButton = ({ onClick, className = '' }: ViewButtonProps) => {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 text-sm text-primary-600 border border-primary-600 rounded-lg hover:bg-primary-50 transition-colors ${className}`}
    >
      View Details
    </button>
  );
};

export default ViewButton;
