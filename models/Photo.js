const mongoose = require("mongoose");

const photoSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    category: { type: String },
    description: { type: String },
    imageUrl: { type: String, required: true },
    public_id: { type: String }, // optional
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Photo", photoSchema);
