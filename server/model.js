import mongoose from "mongoose";

const { Schema, model } = mongoose;

const berrySchema = new Schema({
  picture: String,
  name: String,
  availability: Boolean,
  kg: Number,
  price: Number,
});

const Berry = model("Berry", berrySchema);

export default Berry;
