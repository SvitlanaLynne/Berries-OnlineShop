import mongoose from "mongoose";

const { Schema, model } = mongoose;

const berrySchema = new Schema({
  name: String,
  availability: Boolean,
  kg: Number,
  price: Number,
  images: Array,
});

const Berry = model("Berry", berrySchema);

export default Berry;
