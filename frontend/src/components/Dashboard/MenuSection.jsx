import { useEffect, useState } from "react";
import API from "../../api/api";
import AddItemModal from "../Admin/AddItemModal";
import { toast } from "react-toastify";

const formatCurrency = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value || 0);

const MenuSection = () => {
  const [menu, setMenu] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const fetchMenu = async () => {
    try {
      const res = await API.get("/dashboard/menu");
      setMenu(Array.isArray(res.data) ? res.data : []);
    } catch {
      toast.error("Failed to fetch menu");
    }
  };

  useEffect(() => {
    let isMounted = true;

    const loadMenu = async () => {
      try {
        const res = await API.get("/dashboard/menu");

        if (!isMounted) return;

        setMenu(Array.isArray(res.data) ? res.data : []);
      } catch {
        if (!isMounted) return;
        toast.error("Failed to fetch menu");
      }
    };

    void loadMenu();

    return () => {
      isMounted = false;
    };
  }, []);

  const groupedMenu = menu.reduce((groups, item) => {
    const category = item.category || "Uncategorized";

    if (!groups[category]) {
      groups[category] = [];
    }

    groups[category].push(item);
    return groups;
  }, {});

  const categories = Object.entries(groupedMenu).sort(([firstCategory], [secondCategory]) =>
    firstCategory.localeCompare(secondCategory),
  );
  const averagePrice = menu.length
    ? Math.round(menu.reduce((sum, item) => sum + (item.price || 0), 0) / menu.length)
    : 0;
  const configurableItems = menu.filter((item) => item.options?.length).length;

  return (
    <div className="space-y-6">
      <section className="rounded-[32px] border border-white/70 bg-white/85 p-6 shadow-[0_24px_70px_rgba(15,23,42,0.07)]">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
              Menu workspace
            </p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
              Keep the menu clean, balanced, and easy to scan.
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">
              Organize items by category, maintain pricing clarity, and edit any product
              from a single management surface.
            </p>
          </div>

          <button
            onClick={() => {
              setEditingItem(null);
              setShowModal(true);
            }}
            className="inline-flex items-center justify-center rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Add new item
          </button>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
          <div className="rounded-[24px] border border-stone-200 bg-stone-50 px-4 py-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
              Total items
            </p>
            <p className="mt-2 text-3xl font-semibold text-slate-950">{menu.length}</p>
          </div>

          <div className="rounded-[24px] border border-stone-200 bg-stone-50 px-4 py-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
              Categories
            </p>
            <p className="mt-2 text-3xl font-semibold text-slate-950">
              {categories.length}
            </p>
          </div>

          <div className="rounded-[24px] border border-stone-200 bg-stone-50 px-4 py-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
              Average price
            </p>
            <p className="mt-2 text-3xl font-semibold text-slate-950">
              {formatCurrency(averagePrice)}
            </p>
          </div>

          <div className="rounded-[24px] border border-stone-200 bg-stone-50 px-4 py-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
              Configurable
            </p>
            <p className="mt-2 text-3xl font-semibold text-slate-950">
              {configurableItems}
            </p>
          </div>
        </div>
      </section>

      {menu.length === 0 ? (
        <section className="rounded-[32px] border border-dashed border-stone-300 bg-white/75 px-6 py-20 text-center shadow-[0_18px_60px_rgba(15,23,42,0.05)]">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-stone-100 text-xl font-semibold text-slate-700">
            M
          </div>
          <h3 className="mt-5 text-xl font-semibold text-slate-900">
            Your menu is still empty
          </h3>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
            Add your first item to start building a structured menu with categories,
            pricing, and optional customizations.
          </p>
        </section>
      ) : (
        categories.map(([category, items]) => (
          <section
            key={category}
            className="rounded-[32px] border border-white/70 bg-white/85 p-5 shadow-[0_24px_70px_rgba(15,23,42,0.07)] md:p-6"
          >
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
                  Category
                </p>
                <h3 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
                  {category}
                </h3>
              </div>

              <span className="w-fit rounded-full border border-stone-200 bg-stone-50 px-3 py-1.5 text-xs font-medium text-slate-600">
                {items.length} item{items.length === 1 ? "" : "s"}
              </span>
            </div>

            <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
              {items.map((item) => (
                <button
                  key={item._id}
                  type="button"
                  onClick={() => {
                    setEditingItem(item);
                    setShowModal(true);
                  }}
                  className="group overflow-hidden rounded-[22px] border border-stone-200 bg-stone-50 text-left transition hover:-translate-y-0.5 hover:border-stone-300 hover:shadow-[0_18px_44px_rgba(15,23,42,0.07)]"
                >
                  <div className="relative aspect-[16/10] overflow-hidden bg-stone-100">
                    <img
                      src={item.image || "https://via.placeholder.com/300"}
                      alt={item.name}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />

                    <div className="absolute right-2.5 top-2.5 rounded-full bg-white/92 px-2.5 py-1 text-xs font-semibold text-slate-900 shadow-sm">
                      {formatCurrency(item.price)}
                    </div>
                  </div>

                  <div className="space-y-3 p-3.5">
                    <div>
                      <h4 className="line-clamp-2 text-base font-semibold text-slate-950">
                        {item.name}
                      </h4>

                      <p className="mt-1.5 line-clamp-2 text-xs leading-5 text-slate-500">
                        {item.description || "No description added yet."}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <span className="rounded-full border border-stone-200 bg-white px-2 py-1 text-[11px] font-medium text-slate-600">
                        {item.category || "Uncategorized"}
                      </span>
                      <span className="rounded-full border border-stone-200 bg-white px-2 py-1 text-[11px] font-medium text-slate-600">
                        {item.options?.length || 0} option group
                        {item.options?.length === 1 ? "" : "s"}
                      </span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </section>
        ))
      )}

      {showModal && (
        <AddItemModal
          onClose={() => {
            setShowModal(false);
            setEditingItem(null);
          }}
          refresh={fetchMenu}
          editItem={editingItem}
        />
      )}
    </div>
  );
};

export default MenuSection;
