const express = require("express");
const {
  createUploadthing,
  createRouteHandler,
} = require("uploadthing/express");
const cors = require("cors");
require("dotenv").config();

const app = express();

// Enable CORS for your Vite app
app.use(
  cors({
    origin: "http://localhost:5173", // Your Vite app's URL
    credentials: true,
  })
);

app.use(express.json());

const f = createUploadthing();

// Define the file router
const uploadRouter = {
  imageUploader: f({ image: { maxFileSize: "4MB" } })
    .middleware(async () => {
      // This code runs on your server before upload
      return { userId: "user" };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      // This code RUNS ON YOUR SERVER after upload
      console.log("Upload complete for userId:", metadata.userId);
      console.log("File URL:", file.url);

      // Return the file URL in the expected format
      return { url: file.url };
    }),
};

// Create the uploadthing route handler
const uploadthingHandler = createRouteHandler({
  router: uploadRouter,
  config: {
    uploadthingId: process.env.UPLOADTHING_APP_ID,
    uploadthingSecret: process.env.UPLOADTHING_TOKEN,
  },
});

// Mount the uploadthing handler
app.use("/api/uploadthing", uploadthingHandler);

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`UploadThing endpoint: http://localhost:${PORT}/api/uploadthing`);
});
