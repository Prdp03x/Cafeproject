export const CANCEL_REASONS = [
  { value: "entry_error",           label: "Entry error",           desc: "Wrong items were added to the order" },
  { value: "customer_changed_mind", label: "Customer changed mind", desc: "Customer decided not to order" },
  { value: "item_unavailable",      label: "Item unavailable",      desc: "One or more items are out of stock" },
  { value: "other",                 label: "Other",                 desc: "Add a note below to explain" },
];

export const CANCEL_REASON_LABELS = Object.fromEntries(
  CANCEL_REASONS.map((r) => [r.value, r.label])
);