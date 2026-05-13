const Menu = require("../../models/Menu");
const mongoose = require("mongoose");

exports.getMenu = async (req, res) => {
  try {

    const menu = await Menu.find({
      cafeId: req.cafeId,
    });

    res.json(menu);

  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: "Internal server error",
    });
  }
};

exports.createMenuItem = async (req, res) => {
  try {

    const item = await Menu.create({
      ...req.body,
      cafeId: req.cafeId,
    });

    res.status(201).json(item);

  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: "Internal server error",
    });
  }
};

exports.updateMenuItem = async (req, res) => {
  try {

    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        error: "Invalid item ID",
      });
    }

    const updatedItem =
      await Menu.findOneAndUpdate(
        {
          _id: id,
          cafeId: req.cafeId,
        },
        req.body,
        { new: true }
      );

    if (!updatedItem) {
      return res.status(404).json({
        error: "Item not found",
      });
    }

    res.json(updatedItem);

  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: "Internal server error",
    });
  }
};

exports.deleteMenuItem = async (req, res) => {
  try {

    const { id } = req.params;

    const deleted =
      await Menu.findOneAndDelete({
        _id: id,
        cafeId: req.cafeId,
      });

    if (!deleted) {
      return res.status(404).json({
        error: "Item not found",
      });
    }

    res.json({
      message: "Item deleted",
    });

  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: "Internal server error",
    });
  }
};