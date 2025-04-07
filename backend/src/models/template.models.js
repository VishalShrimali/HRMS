import mongoose from "mongoose";

const templateSchema = new mongoose.Schema({
  title: String,
  html: String,
  design: Object,
  emailId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Email",
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Template = mongoose.model("Template", templateSchema);
export default Template;
