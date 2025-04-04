const mongoose = require("mongoose");

const EmailTemplate = new mongoose.Schema({
    html: { type: String, required: true },
    design: { type: Object, required: true }, // Store the full Unlayer design JSON
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("EmailTemplate", EmailTemplate);
