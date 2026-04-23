const StatCard = ({ title, value, color = "gray" }) => {
  const colors = {
    gray: "bg-gray-50 text-gray-800",
    yellow: "bg-yellow-50 text-yellow-800",
    green: "bg-green-50 text-green-800",
    red: "bg-red-50 text-red-800",
  };

  return (
    <div className={`rounded-xl border p-4 ${colors[color]}`}>
      <p className="text-sm opacity-70">{title}</p>
      <h3 className="text-2xl font-semibold mt-1">{value}</h3>
    </div>
  );
};

export default StatCard;