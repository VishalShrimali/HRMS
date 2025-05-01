import mongoose from "mongoose";

const EmailSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  createdOn: { type: Date, default: Date.now },
});

const Email = mongoose.model("Email", EmailSchema);

export default Email;
