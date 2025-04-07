import mongoose from "mongoose";

const EmailSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  createdOn: { type: Date, default: Date.now },
});

const Email = mongoose.model("Email", EmailSchema);

export default Email;
