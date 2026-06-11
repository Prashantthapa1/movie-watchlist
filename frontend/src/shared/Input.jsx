import { useState } from 'react';

const Input = ({ id, name, type, placeholder, label, required, value, onChange, error, autoComplete, showToggle }) => {
  const [visible, setVisible] = useState(false);
  const isPassword = type === 'password';
  const displayType = isPassword && visible ? 'text' : type;
  const base = "rounded-md p-2 focus:outline-none focus:ring-2 transition-colors w-full pr-10";
  const borderColor = error ? "border-red-500 focus:ring-red-400" : "border-gray-300 focus:ring-blue-500";
  return (
    <div className="flex flex-col">
      {label && <label htmlFor={id} className="text-gray-700 text-sm font-medium mb-1">{label}</label>}
      <div className="relative">
        <input
          id={id}
          name={name}
          type={displayType}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          autoComplete={autoComplete}
          className={`border ${borderColor} ${base}`}
          required={required}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
        />
        {isPassword && showToggle && (
          <button
            type="button"
            onClick={() => setVisible(v => !v)}
            className="absolute inset-y-0 right-0 px-3 flex items-center text-xs text-gray-600 hover:text-gray-800 focus:outline-none"
            aria-label={visible ? 'Hide password' : 'Show password'}
          >
            {visible ? 'Hide' : 'Show'}
          </button>
        )}
      </div>
      {error && <p id={`${id}-error`} className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
};

export default Input;