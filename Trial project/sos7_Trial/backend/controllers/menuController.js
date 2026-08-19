const Menu = require("../models/MenuItem");
const mongoose = require("mongoose");

// ── Helpers ───────────────────────────────────────────────────────────────────

const VALID_IMAGE_RE = /^https?:\/\/.+/i;

// Validates and picks allowed fields from req.body for create/update.
// Returns { error } if validation fails, or { data } if all good.
const pickAndValidateMenuFields = (body, isUpdate = false) => {
  const { name, price, category, description, image, isAvailable, options } = body;

  // On create, name/price/category are required
  if (!isUpdate) {
    if (!name || typeof name !== "string" || !name.trim()) {
      return { error: "Item name is required" };
    }
    if (price === undefined || price === null) {
      return { error: "Price is required" };
    }
    if (!category || typeof category !== "string" || !category.trim()) {
      return { error: "Category is required" };
    }
  }

  // Validate price if provided
  if (price !== undefined) {
    const parsedPrice = Number(price);
    if (isNaN(parsedPrice) || parsedPrice < 0) {
      return { error: "Price must be a non-negative number" };
    }
    if (parsedPrice > 100000) {
      return { error: "Price exceeds maximum allowed value" };
    }
  }

  // Validate image if provided
  if (image !== undefined && image !== null && image !== "") {
    if (typeof image !== "string" || !VALID_IMAGE_RE.test(image.trim())) {
      return { error: "Image must be a valid http/https URL" };
    }
  }

  // Validate options if provided
  if (options !== undefined) {
    if (!Array.isArray(options)) {
      return { error: "Options must be an array" };
    }

    for (const opt of options) {
      if (!opt.title || typeof opt.title !== "string") {
        return { error: "Each option must have a title" };
      }

      if (!Array.isArray(opt.choices)) {
        return { error: "Each option must have a choices array" };
      }

      for (const choice of opt.choices) {
        if (!choice.name || typeof choice.name !== "string") {
          return { error: "Each choice must have a name" };
        }

        if (choice.price !== undefined) {
          const choicePrice = Number(choice.price);
          if (isNaN(choicePrice) || choicePrice < 0) {
            return { error: `Choice "${choice.name}" has an invalid price` };
          }
          if (choicePrice > 100000) {
            return { error: `Choice "${choice.name}" price exceeds maximum allowed value` };
          }
        }
      }
    }
  }

  // Build the safe payload — only explicitly allowed fields
  const data = {};

  if (name       !== undefined) data.name        = String(name).trim();
  if (price      !== undefined) data.price        = Number(price);
  if (category   !== undefined) data.category     = String(category).trim();
  if (description!== undefined) data.description  = String(description).trim();
  if (isAvailable!== undefined) data.isAvailable  = Boolean(isAvailable);

  if (image !== undefined) {
    data.image = (image === null || image === "") ? "" : String(image).trim();
  }

  if (options !== undefined) {
    data.options = options.map((opt) => ({
      title:    String(opt.title).trim(),
      required: Boolean(opt.required),
      choices:  opt.choices.map((c) => ({
        name:  String(c.name).trim(),
        price: Number(c.price) || 0,
      })),
    }));
  }

  return { data };
};

// ── Controllers ───────────────────────────────────────────────────────────────

exports.getMenu = async (req, res) => {
  try {
    const menu = await Menu.find({ cafeId: req.cafeId });
    res.json(menu);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.createMenuItem = async (req, res) => {
  try {
    const { error, data } = pickAndValidateMenuFields(req.body, false);

    if (error) {
      return res.status(400).json({ error });
    }

    const item = await Menu.create({
      ...data,
      cafeId: req.cafeId,   // always from JWT, never from client
    });

    res.status(201).json(item);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.updateMenuItem = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid item ID" });
    }

    const { error, data } = pickAndValidateMenuFields(req.body, true);

    if (error) {
      return res.status(400).json({ error });
    }

    if (Object.keys(data).length === 0) {
      return res.status(400).json({ error: "No valid fields provided for update" });
    }

    const updatedItem = await Menu.findOneAndUpdate(
      { _id: id, cafeId: req.cafeId },  // ownership always checked
      { $set: data },                    // explicit $set — never trust raw body as update operator
      { returnDocument: "after", runValidators: true }
    );

    if (!updatedItem) {
      return res.status(404).json({ error: "Item not found" });
    }

    res.json(updatedItem);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.deleteMenuItem = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid item ID" });
    }

    const deleted = await Menu.findOneAndDelete({
      _id: id,
      cafeId: req.cafeId,
    });

    if (!deleted) {
      return res.status(404).json({ error: "Item not found" });
    }

    res.json({ message: "Item deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
};