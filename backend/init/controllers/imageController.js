// imageController.js

const fs = require("fs");
const path = require("path");
const { validationResult } = require("express-validator");
const Image = require("../models/Image"); // Assuming you have a model for Image

// Handle image upload

exports.uploadImage = async (req, res) => {
  try {
    // Check if image file is included in the request
    if (!req.file) {
      return res.status(400).json({ error: "No image file included" });
    }

    // Create a new Image instance
    const image = new Image({
      data: req.file.buffer, // Buffer containing the image data
      contentType: req.file.mimetype, // MIME type of the image
    });

    // Save the image to MongoDB
    await image.save();

    // Return success response
    res.status(201).json({ message: "Image uploaded successfully" });
  } catch (error) {
    console.error("Error uploading image:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
