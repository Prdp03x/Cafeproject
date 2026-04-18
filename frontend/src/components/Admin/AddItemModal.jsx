import { useState } from "react";
import API from "../../api/api";

const AddItemModal = ({ onClose, refresh }) => {
  const [form, setForm] = useState({
    name: "",
    price: "",
    category: "",
    image: "",
  });

  const [options, setOptions] = useState([]);

  // 🔥 Add new option group
  const addOptionGroup = () => {
    setOptions([
      ...options,
      { title: "", type: "single", choices: [] }
    ]);
  };

  // 🔥 Add choice inside option
  const addChoice = (index) => {
    const updated = [...options];
    updated[index].choices.push({ name: "", price: 0 });
    setOptions(updated);
  };

  const handleSave = async () => {
    const cafe = JSON.parse(localStorage.getItem("cafe"));

    await API.post("/menu", {
      ...form,
      price: Number(form.price),
      options,
      cafeId: cafe.id,
    });

    refresh();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center">
      <div className="bg-white p-5 rounded-xl w-[400px] max-h-[90vh] overflow-y-auto">

        <h2 className="text-xl font-bold mb-4">Add Item</h2>

        {/* Basic Fields */}
        <input
          placeholder="Name"
          className="w-full border p-2 mb-2"
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />

        <input
          placeholder="Price"
          className="w-full border p-2 mb-2"
          onChange={(e) => setForm({ ...form, price: e.target.value })}
        />

        <input
          placeholder="Category"
          className="w-full border p-2 mb-2"
          onChange={(e) => setForm({ ...form, category: e.target.value })}
        />

        <input
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
                placeholder="Option Title (e.g. Size)"
                className="w-full border p-1 mb-2"
                onChange={(e) => {
                  const updated = [...options];
                  updated[i].title = e.target.value;
                  setOptions(updated);
                }}
              />

              <select
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
                    placeholder="Choice name"
                    className="border p-1 w-full"
                    onChange={(e) => {
                      const updated = [...options];
                      updated[i].choices[j].name = e.target.value;
                      setOptions(updated);
                    }}
                  />

                  <input
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