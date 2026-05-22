import { withGST } from "../../utils/gst";

const OptionSelector = ({
  itemId,
  opt,
  selectedOptions,
  handleOptionChange,
}) => {
  return (
    <div className="mb-3">
      <p className="text-sm font-medium">{opt.title}</p>

      {opt.choices.map((choice) => (
        <label
          key={choice.name}
          className="flex items-center gap-2 text-sm"
        >
          <input
            type={opt.type === "single" ? "radio" : "checkbox"}
            name={`${itemId}-${opt.title}`}
            checked={
              selectedOptions[itemId]?.[opt.title]?.some(
                (c) => c.name === choice.name
              ) || false
            }
            onChange={() =>
              handleOptionChange(itemId, opt.title, choice, opt.type)
            }
          />
          {choice.name} (+₹{withGST(choice.price)})
        </label>
      ))}
    </div>
  );
};

export default OptionSelector;