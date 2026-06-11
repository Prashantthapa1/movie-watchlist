
const Button = ({ children, type, className, disabled, onClick, ...props }) => {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`bg-blue-500 text-white font-semibold rounded-md p-3 hover:bg-blue-600 transition duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;