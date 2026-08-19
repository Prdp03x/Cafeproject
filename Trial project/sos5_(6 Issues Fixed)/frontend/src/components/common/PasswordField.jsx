import {
  HiOutlineEye,
  HiOutlineEyeOff,
} from "react-icons/hi";

const PasswordField = ({
  label,
  placeholder,
  value,
  onChange,
  show,
  onToggle,
  className = "",
}) => {
  return (
    <div className={className}>
      {label && (
        <label className="mb-2 block text-sm font-medium text-slate-700">
          {label}
        </label>
      )}

      <div className="flex items-center rounded-2xl border border-stone-200 bg-white px-4 py-3.5 transition focus-within:border-slate-400 focus-within:ring-4 focus-within:ring-slate-900/5">
        <input
          type={show ? "text" : "password"}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className="w-full bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400"
        />

        <button
          type="button"
          onClick={onToggle}
          className="ml-2 text-slate-400 transition hover:text-slate-700"
        >
          {show ? (
            <HiOutlineEyeOff size={18} />
          ) : (
            <HiOutlineEye size={18} />
          )}
        </button>
      </div>
    </div>
  );
};

export default PasswordField;