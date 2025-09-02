export default function Card({ title, value, icon, className = '' }) {
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl shadow p-6 flex items-center gap-4 ${className}`}>
      <div className="text-3xl">{icon}</div>
      <div>
        <div className="text-gray-500 dark:text-gray-400">{title}</div>
        <div className="text-2xl font-bold text-gray-900 dark:text-white">{value}</div>
      </div>
    </div>
  );
}