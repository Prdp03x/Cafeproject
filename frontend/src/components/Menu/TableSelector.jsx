import { useNavigate, useSearchParams } from "react-router";

const TableSelector = ({ tableNumber, setTableNumber }) => {
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const cafeId = params.get("cafe");

  if (tableNumber) {
    return (
      <div className="max-w-7xl mx-auto mt-0">
        <div className="bg-green-100 p-2 rounded text-sm font-medium">
          Table #{tableNumber}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto mt-4">
      <div className="bg-yellow-100 p-4 rounded">
        <p className="mb-2 font-medium">Please select your table number</p>

        <div className="flex flex-wrap gap-2">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
            <button
              key={num}
              onClick={() => {
                const selectedTable = String(num);
                setTableNumber(selectedTable);
                // 🔥 update URL with table
                navigate(`/?cafe=${cafeId}&table=${selectedTable}`);
              }}
              className="px-4 py-2 bg-black text-white rounded"
            >
              {num}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TableSelector;
