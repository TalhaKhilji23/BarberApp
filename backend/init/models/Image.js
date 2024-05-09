const mongoose = require("mongoose");

const imageSchema = new mongoose.Schema({
  data: {
    type: String, // Store the image data as a base64 string
    required: true,
  },
  contentType: {
    type: String,
    required: true,
  },
  log_id: {
    type: String,
    required: true,
  },
  request_id: {
    type: String,
    required: true,
  },
  task_id: {
    type: String,
    required: true,
  },
  task_type: {
    type: String,
    required: true,
  },
  uploadedAt: {
    type: Date,
    default: Date.now,
  },
});

const Image = mongoose.model("Image", imageSchema);

module.exports = Image;
