const AWS = require("aws-sdk");

const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const app = express();
const port = process.env.PORT || 5000;
const jsonParser = bodyParser.json();
require("dotenv").config();

AWS.config.update({
  accessKeyId: process.env.REACT_APP_AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.REACT_APP_AWS_SECRET_ACCESS_KEY,
  region: process.env.REACT_APP_AWS_REGION,
});
// Serve static files from the React app's build folder
// const __dirname = path.dirname("");
const buildPath = path.join(__dirname, "dist");
app.use(express.static(buildPath));

// For any routes not covered, send back the index.html from the build folder
app.get("/*", (req, res) => {
  res.sendFile(path.join(__dirname, "dist/index.html"), function (err) {
    if (err) {
      res.status(500).send(err);
    }
  });
});
const s3 = new AWS.S3();

// New API route to upload quiz response to S3
app.post("/uploadQuizResponse", jsonParser, async (req, res) => {
  const quizResponse = req.body;

  const params = {
    Bucket: "quiz-bucket532", // Replace with your S3 bucket name
    Key: `quiz-responses/${quizResponse.topicId}_${Date.now()}.json`, // Unique file name in S3
    Body: JSON.stringify(quizResponse), // The quiz response JSON
    ContentType: "application/json", // Specify content type
    ACL: "public-read", // Optional: Allows public read access
  };

  try {
    const data = await s3.upload(params).promise();
    console.log("Quiz response uploaded successfully:", data);

    // Respond with the uploaded file URL
    res.json({
      message: "Quiz response uploaded successfully",
      url: data.Location,
    });
  } catch (error) {
    console.error("Error uploading quiz response:", error);
    res.status(500).json({ error: "Failed to upload quiz response" });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
