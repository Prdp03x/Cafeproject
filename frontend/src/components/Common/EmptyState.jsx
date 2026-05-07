const EmptyState = ({ title, subtitle }) => {
  return (
    <div className="w-full h-full border-0 mt-50 flex flex-col items-center justify-center text-center py-16">

      {/* Icon */}
      <i className="ri-service-bell-line text-[100px] text-gray-400 mb-4"></i>

      <h2 className="text-xl font-semibold text-gray-700">
        {title}
      </h2>

      <p className="text-gray-500 mt-2">
        {subtitle}
      </p>
    </div>
  );
};

export default EmptyState;