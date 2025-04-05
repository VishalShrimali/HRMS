import mongoose from "mongoose";

const EmailTemplateSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  createdOn: { type: Date, default: Date.now },
});

const EmailTemplate = mongoose.model("EmailTemplate", EmailTemplateSchema);

export default EmailTemplate;
