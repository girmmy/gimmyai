import { createUploadthing, type FileRouter } from "uploadthing/next";

const f = createUploadthing();

export const ourFileRouter = {
  imageUploader: f({ image: { maxFileSize: "4MB" } })
    .middleware(async () => {
      // This code runs on your server before upload
      return { userId: "user" };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      // This code RUNS ON YOUR SERVER after upload
      console.log("Upload complete for", file.url);

      // Return the file URL in the expected format
      return {
        uploadedBy: metadata.userId,
        url: file.url,
        name: file.name,
        size: file.size,
      };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
