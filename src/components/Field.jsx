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
  const baseClass = `w-full rounded border px-3 py-2 ${
    disabled
      ? "bg-gray-100"
      : "border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
            className={baseClass}
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
      <label className="block text-sm font-medium mb-1">{label}</label>
      {renderField()}
    </div>
  );
}