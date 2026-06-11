const StatsCard = ({ count, label }) => {
  return (
    <div className="transition-transform hover:-translate-y-1 bg-[#FAFAFA] p-10 rounded-md mb-5 w-[90%] sm:w-[48%] md:w-[30%] text-center">
      <span className="text-gray-600 text-5xl">{count}</span>
      <p className="text-[#1E1E1E] mt-5">{label}</p>
    </div>
  );
};

export default StatsCard;