import { FiShield, FiTable } from "react-icons/fi";

const SettingsHeader = ({ form }) => (
  <section className="overflow-hidden rounded-[32px] border border-white/70 bg-white/85 shadow-[0_24px_70px_rgba(15,23,42,0.07)]">
    <div className="grid gap-6 p-6 xl:grid-cols-[minmax(0,1.2fr)_320px]">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
          Workspace settings
        </p>
        <h3 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
          Configure the operational identity of your cafe.
        </h3>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">
          Manage your visual branding, business details, and account security
          from one place without leaving the dashboard.
        </p>
      </div>

      <div className="rounded-[28px] border border-stone-200 bg-stone-50 p-5">
        <div className="flex items-start gap-4">
          <div className="h-16 w-16 overflow-hidden rounded-[22px] bg-white shadow-sm ring-1 ring-black/5">
            {form.logo ? (
              <img src={form.logo} alt="Cafe logo" className="h-full w-full object-cover" />
            ) : (
              <div className="theme-primary flex h-full w-full items-center justify-center text-xl font-semibold text-white">
                {form.name?.charAt(0)?.toUpperCase() || "C"}
              </div>
            )}
          </div>

          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
              Brand preview
            </p>
            <h4 className="mt-2 truncate text-xl font-semibold text-slate-950">
              {form.name || "Cafe Name"}
            </h4>
            <p className="mt-1 text-sm text-slate-500">
              {form.category || "Cafe"} · {form.ownerName || "Owner not added"}
            </p>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <div className="rounded-2xl border border-white/80 bg-white px-3 py-3">
            <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
              <FiTable /> Tables
            </div>
            <p className="mt-2 text-xl font-semibold text-slate-950">
              {form.totalTables || 0}
            </p>
          </div>

          <div className="rounded-2xl border border-white/80 bg-white px-3 py-3">
            <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
              <FiShield /> Theme
            </div>
            <div className="mt-2 flex items-center gap-2">
              <span
                className="h-4 w-4 rounded-full ring-1 ring-black/10"
                style={{ backgroundColor: form.themeColor || "#14532d" }}
              />
              <p className="text-sm font-semibold text-slate-950">
                {form.themeColor || "#14532d"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
);

export default SettingsHeader;
