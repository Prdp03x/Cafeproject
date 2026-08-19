import FormField from "../../common/FormField";

const BusinessTab = ({ form, onChange }) => (
  <div className="space-y-5">
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
        Business
      </p>
      <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
        Maintain business details
      </h2>
      <p className="mt-2 text-sm leading-6 text-slate-500">
        Keep operational information complete so the dashboard always reflects
        the right business profile.
      </p>
    </div>

    <div className="grid gap-5 md:grid-cols-2">
      <FormField
        label="Owner name" type="text" name="ownerName"
        placeholder="Owner Name" value={form.ownerName} onChange={onChange} required
      />
      <FormField
        label="Mobile" type="text" name="phone"
        placeholder="Phone" value={form.phone} onChange={onChange} required
        hint="Used as the primary billing contact number."
      />
      <FormField
        label="Category" type="text" name="category"
        placeholder="Cafe" value={form.category} onChange={onChange}
      />
      <FormField
        label="Total tables" type="number" name="totalTables"
        placeholder="10" value={form.totalTables} onChange={onChange}
      />
    </div>

    <div className="rounded-[28px] border border-stone-200 bg-stone-50 p-5">
      <h3 className="text-lg font-semibold text-slate-950">Billing profile</h3>
      <p className="mt-1 text-sm leading-6 text-slate-500">
        Keep invoice-ready information complete for tax and payment records.
      </p>

      <div className="mt-5 grid gap-5 md:grid-cols-2">
        <FormField
          label="Legal business name" type="text" name="legalBusinessName"
          placeholder="Registered business name" value={form.legalBusinessName}
          onChange={onChange} required
        />
        <FormField
          label="Billing email" type="email" name="billingEmail"
          placeholder="billing@example.com" value={form.billingEmail}
          onChange={onChange} required
        />
        <FormField
          label="GST number" type="text" name="gstNumber"
          placeholder="22AAAAA0000A1Z5" value={form.gstNumber}
          onChange={onChange} required hint="Use the registered 15-character GSTIN."
        />
        <FormField
          label="FSSAI License Number" type="text" name="fssaiNumber"
          placeholder="e.g. 10012345678901" value={form.fssaiNumber || ""}
          onChange={onChange}
        />
        <FormField
          label="Country" type="text" name="country"
          placeholder="India" value={form.country} onChange={onChange} required
        />
        <div className="md:col-span-2">
          <FormField
            label="Address" textarea name="address"
            placeholder="Street address, area, and landmark"
            value={form.address} onChange={onChange} required
          />
        </div>
        <FormField
          label="City" type="text" name="city"
          placeholder="City" value={form.city} onChange={onChange} required
        />
        <FormField
          label="State" type="text" name="state"
          placeholder="State" value={form.state} onChange={onChange} required
        />
        <FormField
          label="Postal code" type="text" name="postalCode"
          placeholder="Postal code" value={form.postalCode} onChange={onChange} required
        />
      </div>
    </div>
  </div>
);

export default BusinessTab;
