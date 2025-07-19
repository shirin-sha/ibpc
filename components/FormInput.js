export default function FormInput({ label, name, value, onChange, disabled = false }) {
  return (
    <div className="mb-4">
      <label className="block mb-1">{label}</label>
      <input
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className="w-full p-2 border rounded dark:bg-gray-700 disabled:opacity-50"
      />
    </div>
  );
}