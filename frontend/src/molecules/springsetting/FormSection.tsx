interface FormSectionProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

const FormSection: React.FC<FormSectionProps> = ({
  title,
  description,
  children,
  className = "",
}) => {
  return (
    <div className={`space-y-6 ${className}`}>
      <div className="space-y-1">
        <h2 className="text-lg font-medium text-gray-900">{title}</h2>
        {description && <p className="text-sm text-gray-500">{description}</p>}
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  );
};

export default FormSection;
