const mongoose = require("mongoose");

const categories = [
  'Furniture',
  'Modular Kitchen',
  'Wardrobes',
  'Interior Design',
  'Doors & Windows',
  'Wall Panels',
  'TV Units',
  'Wooden Flooring',
  'Office Furniture',
  'Custom Work'
];

const photoSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    category: {
      type: String,
      enum: categories,
      required: true
    },
    description: { type: String },
    imageUrl: { type: String, required: true },
    public_id: { type: String },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const Photo = mongoose.model("Photo", photoSchema);

module.exports = Photo;
module.exports.categories = categories;
