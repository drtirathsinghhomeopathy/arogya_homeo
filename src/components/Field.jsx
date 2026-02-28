export default function Field({
  label,
  name,
  value,
  onChange,
  disabled,
  type = "text",
  as = "input",
  options = [],
  rows = 3,
}) {
  const baseClass = `w-full rounded-lg border px-3 py-2.5 sm:py-2 text-base min-h-[44px] ${
    disabled
      ? "bg-gray-100 text-gray-500"
      : "border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent"
  }`;

  const renderField = () => {
    switch (as) {
      case "select":
        return (
          <select
            name={name}
            value={value}
            onChange={onChange}
            disabled={disabled}
            className={baseClass}
          >
            <option value="">Select {label}</option>
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        );

      case "textarea":
        return (
          <textarea
            name={name}
            rows={rows}
            value={value}
            onChange={onChange}
            disabled={disabled}
            className={baseClass.replace("min-h-[44px]", "min-h-[80px]")}
          />
        );

      case "input":
      default:
        return (
          <input
            type={type}
            name={name}
            value={value}
            onChange={onChange}
            disabled={disabled}
            className={baseClass}
          />
        );
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      {renderField()}
    </div>
  );
}