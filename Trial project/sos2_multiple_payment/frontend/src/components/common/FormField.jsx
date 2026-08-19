const FormField = ({
  label,
  textarea = false,
  hint = "",
  className = "",
  ...props
}) => {
  const baseFieldClass = `
    w-full rounded-[20px] border border-stone-200 bg-stone-50 px-4 py-3.5
    text-sm text-slate-800 outline-none transition placeholder:text-slate-400
    focus:border-slate-400 focus:bg-white focus:ring-4 focus:ring-slate-900/5
    disabled:cursor-not-allowed disabled:opacity-60
  `;

  return (
    <div className="flex flex-col space-y-2.5">
      <label className="text-sm font-medium text-slate-700">{label}</label>

      {textarea ? (
        <textarea
          {...props}
          className={`
            ${baseFieldClass}
            min-h-[132px] resize-none
            ${className}
          `}
        />
      ) : (
        <input
          {...props}
          className={`
            ${baseFieldClass}
            ${className}
          `}
        />
      )}

      {hint ? <p className="text-xs leading-5 text-slate-500">{hint}</p> : null}
    </div>
  );
};

export default FormField;
