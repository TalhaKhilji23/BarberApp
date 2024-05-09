const express = require("express");
const router = express.Router();
const Image = require("../models/Image");
const request = require("request");
const util = require("util");
const sharp = require("sharp");

router.use(express.json());

router.post("/upload", async (req, res) => {
  try {
    const { image, hairstyleType } = req.body;
    console.log("Image type:", hairstyleType);

    if (!image || image.trim() === "") {
      console.log("Image data is missing or empty in the request body");
      return res.status(400).json({
        error: "Image data is missing or empty in the request body.",
      });
    }

    const imageBuffer = Buffer.from(image, "base64");

    if (!imageBuffer || imageBuffer.length === 0) {
      console.log("Image buffer is empty or invalid");
      return res.status(400).json({
        error: "Image buffer is empty or invalid.",
      });
    }

    let format;
    try {
      const metadata = await sharp(imageBuffer).metadata();
      format = metadata.format;
    } catch (error) {
      console.error("Error extracting image format:", error.message);
      return res.status(400).json({
        error:
          "Error extracting image format. Please ensure the image data is valid.",
      });
    }

    if (!["jpeg", "jpg", "png", "bmp"].includes(format)) {
      console.log("Unsupported image format:", format);
      return res.status(400).json({
        error: `Unsupported image format: ${format}. Only JPG, JPEG, PNG, BMP are supported.`,
      });
    }

    const contentType = `image/${format}`;

    const baseUrl = "https://www.ailabapi.com";
    const apiKey =
      "kg6HXiVYqYSqM45wLKraDPIkIml2wBPNOFsW8KcJMTyXn7rDjduAUGyvtzpmE0GN"; 
    const hairstyleType2 = hairstyleType; 
    const options = {
      method: "POST",
      url: `${baseUrl}/api/portrait/effects/hairstyle-editor-pro`,
      headers: {
        "ailabapi-api-key": apiKey,
      },
      formData: {
        task_type: "async",
        auto: "1",
        image: {
          value: imageBuffer,
          options: {
            filename: `image.${format}`,
            contentType: contentType,
          },
        },
        hair_style: hairstyleType2,
      },
    };

    request(options, async function (error, response, body) {
      if (error) {
        console.error("AI Lab API Error:", error);
        res.status(500).json({ error: "Internal Server Error" });
      } else {
        const responseData = JSON.parse(body);
        console.log("AI Lab API Response:", responseData);

        if (!responseData || !responseData.task_id) {
          console.log("Invalid response data from AI Lab API");
          return res
            .status(500)
            .json({ error: "Invalid response data from AI Lab API" });
        }

        const { log_id, request_id, task_id, task_type } = responseData;

        const newImage = new Image({
          data: image, 
          contentType: contentType,
          log_id : log_id,
          request_id : request_id,
          task_id : task_id,
          task_type: task_type,
        });

        await newImage.save();

        const imageResponse = `data:${contentType};base64,${image}`;

        res.status(201).json({
          image: imageResponse,
          imageUrl: image,
          aiResponse: responseData,
          imageId: newImage._id,
          task: newImage.task_id,
        });
      }
    });
  } catch (error) {
    console.error("Error uploading image:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/check-task-status/:taskId", (req, res) => {
  const { taskId } = req.params;
  const baseUrl = "https://www.ailabapi.com";
  const apiKey =
    "kg6HXiVYqYSqM45wLKraDPIkIml2wBPNOFsW8KcJMTyXn7rDjduAUGyvtzpmE0GN"; 
  const options = {
    method: "GET",
    url: `${baseUrl}/api/common/query-async-task-result?task_id=1714743372764.fb8fd68b-7f0e-1485-d003-32ee0f854a92`,
    headers: {
      "ailabapi-api-key": apiKey,
    },
  };

  console.log(">>>>>>>>>>>>>>>", options.url);

  request(options, function (error, response, body) {
    if (error) {
      console.error("AI Lab API Error:", error);
      res.status(500).json({ error: "Internal Server Error" });
    } else {
      console.log("AI Lab API Response gettttttttt:", body);
      const parsedBody = JSON.parse(body);
      const imageUrl = options.url; 
      res.status(200).json({ imageUrl,parsedBody }); 
    }
  });
});


module.exports = router;
