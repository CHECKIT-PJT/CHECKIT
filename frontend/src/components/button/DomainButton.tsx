interface DomainButtonProps {
  domains: string[];
  selectedDomain: string;
  onSelect: (domain: string) => void;
}

const DomainButton = ({
  domains,
  selectedDomain,
  onSelect,
}: DomainButtonProps) => (
  <div className="flex gap-2 mb-4">
    <button
      onClick={() => onSelect('ALL')}
      className={`px-4 py-2 rounded font-bold ${
        selectedDomain === 'ALL'
          ? 'bg-slate-200 text-blue-900'
          : 'bg-white text-cyan-900'
      }`}
    >
      ALL
    </button>
    {domains.map(domain => (
      <button
        key={domain}
        onClick={() => onSelect(domain)}
        className={`px-4 py-2 rounded font-bold ${
          selectedDomain === domain
            ? 'bg-slate-200 text-blue-900'
            : 'bg-white text-cyan-900'
        }`}
      >
        {domain}
      </button>
    ))}
  </div>
);

export default DomainButton;
