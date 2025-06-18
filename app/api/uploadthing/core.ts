import { createUploadthing, type FileRouter } from "uploadthing/react";

interface UploadMetadata {
  userId: string;
}

interface UploadFile {
  url: string;
  name: string;
  size: number;
}

const f = createUploadthing();

// FileRouter for your app, can contain multiple FileRoutes
export const ourFileRouter = {
  // Define as many FileRoutes as you like, each with a unique routeSlug
  imageUploader: f({ image: { maxFileSize: "4MB" } })
    .middleware(async () => {
      // This code runs on your server before upload
      return { userId: "user" };
    })
    .onUploadComplete(
      async ({
        metadata,
        file,
      }: {
        metadata: UploadMetadata;
        file: UploadFile;
      }) => {
        // This code RUNS ON YOUR SERVER after upload
        console.log("Upload complete for userId:", metadata.userId);
        console.log("File URL:", file.url);

        // Return the file URL in the expected format
        return {
          uploadedBy: metadata.userId,
          url: file.url,
          name: file.name,
          size: file.size,
        };
      }
    ),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
