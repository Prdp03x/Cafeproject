import FormField from "../../common/FormField";

const BrandingTab = ({ form, onChange }) => (
  <div className="space-y-5">
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
        Branding
      </p>
      <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
        Manage your public-facing brand
      </h2>
      <p className="mt-2 text-sm leading-6 text-slate-500">
        Update the identity customers and staff recognize across the dashboard.
      </p>
    </div>

    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_240px]">
      <div className="space-y-5">
        <FormField
          label="Logo URL"
          type="text"
          name="logo"
          placeholder="https://your-logo-url"
          value={form.logo}
          onChange={onChange}
        />
        <FormField
          label="Brand name"
          type="text"
          name="name"
          placeholder="Cafe Name"
          value={form.name}
          onChange={onChange}
        />
        <FormField
          label="Description"
          textarea
          name="description"
          placeholder="Short description for your cafe"
          value={form.description}
          onChange={onChange}
        />
      </div>

      <div className="rounded-[28px] border border-stone-200 bg-stone-50 p-4">
        <p className="text-sm font-semibold text-slate-900">Theme accent</p>
        <p className="mt-1 text-xs leading-5 text-slate-500">
          Store a primary color for future branding and dashboard extensions.
        </p>

        <div className="mt-4 overflow-hidden rounded-[24px] border border-stone-200 bg-white p-4">
          <div
            className="h-24 rounded-[18px]"
            style={{ backgroundColor: form.themeColor || "#14532d" }}
          />
          <div className="mt-4">
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Theme color
            </label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                name="themeColor"
                value={form.themeColor}
                onChange={onChange}
                className="h-11 w-14 cursor-pointer rounded-xl border border-stone-200 bg-white p-1"
              />
              <input
                type="text"
                name="themeColor"
                value={form.themeColor}
                onChange={onChange}
                className="w-full rounded-[20px] border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:bg-white focus:ring-4 focus:ring-slate-900/5"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default BrandingTab;
