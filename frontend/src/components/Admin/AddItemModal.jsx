import { useState } from "react";
import API from "../../api/api";
import { toast } from "react-toastify";
import { FiEdit3, FiImage, FiPlus, FiTrash2, FiX } from "react-icons/fi";

const inputClass =
  "w-full rounded-[18px] border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:bg-white focus:ring-4 focus:ring-slate-900/5";

const sectionTitleClass = "text-sm font-semibold text-slate-900";
const sectionHintClass = "mt-1 text-xs text-slate-500";

const getErrorMessage = (error, fallbackMessage) =>
  error?.response?.data?.error || error?.message || fallbackMessage;

const AddItemModal = ({ onClose, refresh, editItem }) => {
  const [options, setOptions] = useState(() => editItem?.options || []);
  const [form, setForm] = useState(() => ({
    name: editItem?.name || "",
    price: editItem?.price || "",
    category: editItem?.category || "",
    image: editItem?.image || "",
    description: editItem?.description || "",
  }));
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const setField = (key, value) => {
    setForm((prevForm) => ({
      ...prevForm,
      [key]: value,
    }));
  };

  const addOptionGroup = () => {
    setOptions((prevOptions) => [
      ...prevOptions,
      {
        title: "",
        type: "single",
        choices: [],
      },
    ]);
  };

  const updateOptionGroup = (groupIndex, key, value) => {
    setOptions((prevOptions) =>
      prevOptions.map((group, index) =>
        index === groupIndex ? { ...group, [key]: value } : group,
      ),
    );
  };

  const removeOptionGroup = (groupIndex) => {
    setOptions((prevOptions) =>
      prevOptions.filter((_, index) => index !== groupIndex),
    );
  };

  const addChoice = (groupIndex) => {
    setOptions((prevOptions) =>
      prevOptions.map((group, index) =>
        index === groupIndex
          ? {
              ...group,
              choices: [...group.choices, { name: "", price: 0 }],
            }
          : group,
      ),
    );
  };

  const updateChoice = (groupIndex, choiceIndex, key, value) => {
    setOptions((prevOptions) =>
      prevOptions.map((group, index) =>
        index === groupIndex
          ? {
              ...group,
              choices: group.choices.map((choice, innerIndex) =>
                innerIndex === choiceIndex ? { ...choice, [key]: value } : choice,
              ),
            }
          : group,
      ),
    );
  };

  const removeChoice = (groupIndex, choiceIndex) => {
    setOptions((prevOptions) =>
      prevOptions.map((group, index) =>
        index === groupIndex
          ? {
              ...group,
              choices: group.choices.filter((_, innerIndex) => innerIndex !== choiceIndex),
            }
          : group,
      ),
    );
  };

  const handleSave = async () => {
    try {
      setLoading(true);

      const payload = {
        ...form,
        price: Number(form.price),
        options,
      };

      if (editItem) {
        await API.put(`/dashboard/menu/${editItem._id}`, payload);
        toast.success("Changes saved successfully");
      } else {
        await API.post("/dashboard/menu", payload);
        toast.success("Item added successfully");
      }

      refresh();
      onClose();
    } catch (err) {
      console.error(err);
      toast.error(getErrorMessage(err, "Failed to save item"));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!editItem?._id) return;

    const confirmed = window.confirm(
      `Delete "${editItem.name}" from the menu? This cannot be undone.`,
    );

    if (!confirmed) return;

    try {
      setDeleting(true);
      await API.delete(`/dashboard/menu/${editItem._id}`);
      toast.success("Item deleted successfully");
      refresh();
      onClose();
    } catch (err) {
      console.error(err);
      toast.error(getErrorMessage(err, "Failed to delete item"));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-[32px] border border-white/70 bg-[#f7f2ea] shadow-[0_32px_100px_rgba(15,23,42,0.22)]"
      >
        <div className="border-b border-black/5 bg-white/75 px-5 py-4 backdrop-blur md:px-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900 text-white">
                {editItem ? <FiEdit3 size={18} /> : <FiPlus size={18} />}
              </div>

              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
                  Menu Editor
                </p>
                <h2 className="mt-1 text-lg font-semibold text-slate-950 md:text-xl">
                  {editItem ? "Edit item" : "Add new item"}
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Build clear item details, pricing, and option groups without leaving the
                  dashboard.
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-stone-200 bg-white text-slate-500 transition hover:border-stone-300 hover:text-slate-900"
            >
              <FiX size={18} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-5 md:px-6">
          <div className="grid gap-5 xl:grid-cols-[260px_minmax(0,1fr)]">
            <aside className="space-y-4 xl:sticky xl:top-0">
              <div className="overflow-hidden rounded-[28px] border border-stone-200 bg-white shadow-sm">
                <div className="flex aspect-[4/3] items-center justify-center bg-gradient-to-br from-stone-100 via-white to-stone-200">
                  {form.image ? (
                    <img
                      src={form.image}
                      alt="Preview"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex max-w-[170px] flex-col items-center px-6 text-center">
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-slate-500 shadow-sm">
                        <FiImage size={24} />
                      </div>
                      <h3 className="mt-4 text-sm font-semibold text-slate-900">
                        Product preview
                      </h3>
                      <p className="mt-1 text-xs leading-5 text-slate-500">
                        Paste an image URL to give this item a cleaner presence in the menu.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="rounded-[28px] border border-stone-200 bg-white p-4 shadow-sm">
                <h3 className={sectionTitleClass}>Publishing notes</h3>
                <p className={sectionHintClass}>
                  Short names, one clear category, and simple option groups work best.
                </p>

                <div className="mt-4 space-y-2 text-xs text-slate-600">
                  <div className="rounded-2xl bg-stone-50 px-3 py-2.5">
                    Name and price should be immediately readable.
                  </div>
                  <div className="rounded-2xl bg-stone-50 px-3 py-2.5">
                    Keep descriptions to one or two short lines.
                  </div>
                  <div className="rounded-2xl bg-stone-50 px-3 py-2.5">
                    Use options only when they affect ordering.
                  </div>
                </div>
              </div>
            </aside>

            <div className="space-y-5">
              <section className="rounded-[28px] border border-stone-200 bg-white p-4 shadow-sm md:p-5">
                <div className="mb-4">
                  <h3 className={sectionTitleClass}>Basic details</h3>
                  <p className={sectionHintClass}>The primary information customers see first.</p>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="md:col-span-2">
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      Product name
                    </label>
                    <input
                      value={form.name}
                      placeholder="Cold Coffee"
                      onChange={(e) => setField("name", e.target.value)}
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      Category
                    </label>
                    <input
                      value={form.category}
                      placeholder="Beverages"
                      onChange={(e) => setField("category", e.target.value)}
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      Price
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-slate-400">
                        Rs
                      </span>
                      <input
                        type="number"
                        value={form.price}
                        placeholder="199"
                        onChange={(e) => setField("price", e.target.value)}
                        className={`${inputClass} pl-10`}
                      />
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      Image URL
                    </label>
                    <input
                      value={form.image}
                      placeholder="https://..."
                      onChange={(e) => setField("image", e.target.value)}
                      className={inputClass}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      Description
                    </label>
                    <textarea
                      value={form.description}
                      placeholder="Short description about the item"
                      onChange={(e) => setField("description", e.target.value)}
                      className={`${inputClass} min-h-[110px] resize-none`}
                    />
                  </div>
                </div>
              </section>

              <section className="rounded-[28px] border border-stone-200 bg-white p-4 shadow-sm md:p-5">
                <div className="mb-4 flex items-start justify-between gap-3">
                  <div>
                    <h3 className={sectionTitleClass}>Extra options</h3>
                    <p className={sectionHintClass}>
                      Add sizes, toppings, or paid customizations only when needed.
                    </p>
                  </div>

                  <button
                    onClick={addOptionGroup}
                    className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
                  >
                    <FiPlus size={16} />
                    Add group
                  </button>
                </div>

                {options.length === 0 ? (
                  <div className="rounded-[24px] border border-dashed border-stone-200 bg-stone-50 px-4 py-8 text-center">
                    <p className="text-sm font-medium text-slate-700">No option groups yet</p>
                    <p className="mt-1 text-xs text-slate-500">
                      Add one if this item needs choices like size or extra toppings.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {options.map((group, groupIndex) => (
                      <div
                        key={groupIndex}
                        className="rounded-[24px] border border-stone-200 bg-stone-50/75 p-4"
                      >
                        <div className="mb-4 flex items-start justify-between gap-3">
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                              Group {groupIndex + 1}
                            </p>
                          </div>

                          <button
                            onClick={() => removeOptionGroup(groupIndex)}
                            className="rounded-full p-2 text-slate-400 transition hover:bg-white hover:text-red-500"
                          >
                            <FiX size={16} />
                          </button>
                        </div>

                        <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_180px]">
                          <div>
                            <label className="mb-2 block text-sm font-medium text-slate-700">
                              Group name
                            </label>
                            <input
                              value={group.title}
                              placeholder="Size"
                              onChange={(e) =>
                                updateOptionGroup(groupIndex, "title", e.target.value)
                              }
                              className={inputClass}
                            />
                          </div>

                          <div>
                            <label className="mb-2 block text-sm font-medium text-slate-700">
                              Selection
                            </label>
                            <select
                              value={group.type}
                              onChange={(e) =>
                                updateOptionGroup(groupIndex, "type", e.target.value)
                              }
                              className={inputClass}
                            >
                              <option value="single">Single choice</option>
                              <option value="multiple">Multiple choice</option>
                            </select>
                          </div>
                        </div>

                        <div className="mt-4 space-y-2.5">
                          {group.choices.map((choice, choiceIndex) => (
                            <div
                              key={choiceIndex}
                              className="grid gap-2 md:grid-cols-[minmax(0,1fr)_120px_42px]"
                            >
                              <input
                                value={choice.name}
                                placeholder="Choice name"
                                onChange={(e) =>
                                  updateChoice(groupIndex, choiceIndex, "name", e.target.value)
                                }
                                className={inputClass}
                              />

                              <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-slate-400">
                                  Rs
                                </span>
                                <input
                                  type="number"
                                  value={choice.price}
                                  placeholder="0"
                                  onChange={(e) =>
                                    updateChoice(
                                      groupIndex,
                                      choiceIndex,
                                      "price",
                                      Number(e.target.value),
                                    )
                                  }
                                  className={`${inputClass} pl-10`}
                                />
                              </div>

                              <button
                                onClick={() => removeChoice(groupIndex, choiceIndex)}
                                className="flex h-[42px] w-[42px] items-center justify-center rounded-xl border border-stone-200 bg-white text-slate-400 transition hover:border-red-200 hover:text-red-500"
                              >
                                <FiX size={15} />
                              </button>
                            </div>
                          ))}
                        </div>

                        <button
                          onClick={() => addChoice(groupIndex)}
                          className="mt-4 inline-flex items-center gap-2 rounded-full border border-stone-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 transition hover:border-stone-300 hover:text-slate-900"
                        >
                          <FiPlus size={15} />
                          Add choice
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </div>
          </div>
        </div>

        <div className="flex flex-col-reverse gap-3 border-t border-black/5 bg-white/90 px-5 py-4 backdrop-blur sm:flex-row sm:items-center sm:justify-between md:px-6">
          <div className="flex w-full justify-start sm:w-auto">
            {editItem ? (
              <button
                onClick={handleDelete}
                disabled={loading || deleting}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <FiTrash2 size={15} />
                {deleting ? "Deleting..." : "Delete item"}
              </button>
            ) : null}
          </div>

          <div className="flex flex-col-reverse gap-3 sm:flex-row">
            <button
              onClick={onClose}
              disabled={loading || deleting}
              className="rounded-2xl border border-stone-200 bg-white px-5 py-3 text-sm font-medium text-slate-700 transition hover:bg-stone-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Cancel
            </button>

            <button
              onClick={handleSave}
              disabled={loading || deleting}
              className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Saving..." : editItem ? "Update item" : "Add item"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddItemModal;
