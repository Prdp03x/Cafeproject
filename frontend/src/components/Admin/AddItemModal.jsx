import { useState } from "react";
import API from "../../api/api";

const AddItemModal = ({ onClose, refresh, editItem }) => {
  const [options, setOptions] = useState(() => editItem?.options || []);
  const [form, setForm] = useState(() => ({
    name: editItem?.name || "",
    price: editItem?.price || "",
    category: editItem?.category || "",
    image: editItem?.image || "",
  }));


  // 🔥 Add new option group
  const addOptionGroup = () => {
    setOptions([...options, { title: "", type: "single", choices: [] }]);
  };


  // 🔥 Add choice inside option
  const addChoice = (index) => {
    const updated = [...options];
    updated[index].choices.push({ name: "", price: 0 });
    setOptions(updated);
  };



  const handleSave = async () => {
  const cafe = JSON.parse(localStorage.getItem("cafe"));

  try {
    if (editItem) {
      // 🔥 UPDATE
      await API.put(`/menu/${editItem._id}`, {
        ...form,
        price: Number(form.price),
        options,
        cafeId: cafe.id,
      });
    } else {
      // 🔥 CREATE
      await API.post("/menu", {
        ...form,
        price: Number(form.price),
        options,
        cafeId: cafe.id,
      });
    }

    refresh();
    onClose();
  } catch (err) {
    console.error("Save failed", err);
  }
};

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center" onClick={onClose}>
      <div className="relative bg-white p-5 rounded-xl w-[400px] max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-gray-500 hover:text-black text-xl font-bold transition"
        >
          ✕
        </button>

        <h2 className="text-xl font-bold mb-4">{editItem ? "Edit Item" : "Add Item"}</h2>

        {/* Basic Fields */}
        <input
          placeholder="Name"
          value={form.name}
          className="w-full border p-2 mb-2"
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />

        <input
          value={form.price}
          placeholder="Price"
          className="w-full border p-2 mb-2"
          onChange={(e) => setForm({ ...form, price: e.target.value })}
        />

        <input
          value={form.category}
          placeholder="Category"
          className="w-full border p-2 mb-2"
          onChange={(e) => setForm({ ...form, category: e.target.value })}
        />

        <input
          value={form.image}
          placeholder="Image URL"
          className="w-full border p-2 mb-4"
          onChange={(e) => setForm({ ...form, image: e.target.value })}
        />

        {/* 🔥 OPTIONS SECTION */}
        <div className="mb-4">
          <h3 className="font-semibold mb-2">Options</h3>

          {options.map((opt, i) => (
            <div key={i} className="border p-3 mb-3 rounded">
              <input
                value={opt.title}
                placeholder="Option Title (e.g. Size)"
                className="w-full border p-1 mb-2"
                onChange={(e) => {
                  const updated = [...options];
                  updated[i].title = e.target.value;
                  setOptions(updated);
                }}
              />

              <select
                value={opt.type}
                className="w-full border p-1 mb-2"
                onChange={(e) => {
                  const updated = [...options];
                  updated[i].type = e.target.value;
                  setOptions(updated);
                }}
              >
                <option value="single">Single</option>
                <option value="multiple">Multiple</option>
              </select>

              {/* Choices */}
              {opt.choices.map((choice, j) => (
                <div key={j} className="flex gap-2 mb-2">
                  <input
                    value={choice.name}
                    placeholder="Choice name"
                    className="border p-1 w-full"
                    onChange={(e) => {
                      const updated = [...options];
                      updated[i].choices[j].name = e.target.value;
                      setOptions(updated);
                    }}
                  />

                  <input
                    value={choice.price}
                    placeholder="Price"
                    type="number"
                    className="border p-1 w-20"
                    onChange={(e) => {
                      const updated = [...options];
                      updated[i].choices[j].price = Number(e.target.value);
                      setOptions(updated);
                    }}
                  />
                </div>
              ))}

              <button
                onClick={() => addChoice(i)}
                className="text-sm text-green-700"
              >
                + Add Choice
              </button>
            </div>
          ))}

          <button
            onClick={addOptionGroup}
            className="bg-gray-200 px-3 py-1 rounded"
          >
            + Add Option Group
          </button>
        </div>

        {/* Save */}
        <button
          onClick={handleSave}
          className="bg-green-800 text-white w-full py-2 rounded"
        >
          Save Item
        </button>
      </div>
    </div>
  );
};

export default AddItemModal;
