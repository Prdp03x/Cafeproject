const SettingsSidebar = ({ tabConfig, activeTab, onTabChange }) => (
  <aside className="space-y-4">
    <div className="rounded-[32px] border border-white/70 bg-white/85 p-4 shadow-[0_24px_70px_rgba(15,23,42,0.07)]">
      <h3 className="px-2 pb-3 pt-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
        Preferences
      </h3>

      <div className="space-y-2">
        {Object.entries(tabConfig).map(([key, item]) => {
          const Icon = item.icon;
          const isActive = activeTab === key;

          return (
            <button
              key={key}
              onClick={() => onTabChange(key)}
              className={`flex w-full items-start gap-3 rounded-[24px] px-4 py-4 text-left transition ${
                isActive
                  ? "theme-primary theme-primary-elevated theme-primary-hover text-white"
                  : "hover:bg-stone-100"
              }`}
            >
              <div
                className={`mt-0.5 flex h-11 w-11 items-center justify-center rounded-2xl ${
                  isActive ? "bg-white/12 text-white" : "bg-white text-slate-700 shadow-sm"
                }`}
              >
                <Icon size={16} />
              </div>

              <div>
                <p className="text-sm font-semibold">{item.label}</p>
                <p className={`mt-1 text-xs leading-5 ${isActive ? "text-white/70" : "text-slate-500"}`}>
                  {item.description}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>

    <div className="rounded-[32px] border border-white/70 bg-white/85 p-5 shadow-[0_24px_70px_rgba(15,23,42,0.07)]">
      <h3 className="text-sm font-semibold text-slate-950">Admin notes</h3>
      <p className="mt-2 text-sm leading-6 text-slate-500">
        Keep names concise, make descriptions useful, and avoid storing
        temporary operational details in branding fields.
      </p>
    </div>
  </aside>
);

export default SettingsSidebar;
