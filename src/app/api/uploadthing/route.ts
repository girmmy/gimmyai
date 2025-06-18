import { createUploadthing, type FileRouter } from "uploadthing/next";
import { createNextRouteHandler } from "uploadthing/next";

const f = createUploadthing();

// Define your file router
export const ourFileRouter = {
  imageUploader: f({ image: { maxFileSize: "4MB" } })
    .middleware(async () => {
      return { userId: "user" as const };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Upload complete for", file.url);
      console.log("Upload details:", {
        uploadedBy: metadata.userId,
        url: file.url,
        name: file.name,
        size: file.size,
      });
      // Don't return anything (implicitly returns void)
    }),
} satisfies FileRouter;

// Create the route handler for Next.js API routes
export const { GET, POST } = createNextRouteHandler({
  router: ourFileRouter,
});

// Export the type for usage in client components
export type OurFileRouter = typeof ourFileRouter;
