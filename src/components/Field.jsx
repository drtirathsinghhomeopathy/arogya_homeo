export default function Field({
  label,
  name,
  type = "text",
  value,
  disabled,
  onChange,
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <input
        type={type}
        name={name}
        value={value}
        disabled={disabled}
        onChange={onChange}
        className={`w-full rounded-md border px-3 py-2 text-sm ${
          disabled ? "bg-gray-100 cursor-not-allowed" : "border-gray-300"
        }`}
      />
    </div>
  );
}
