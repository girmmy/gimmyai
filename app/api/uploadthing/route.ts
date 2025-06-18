import { createNextRouteHandler } from "uploadthing/next";
import { ourFileRouter } from "./core";

// Export routes for Next.js App Router
export const { GET, POST } = createNextRouteHandler({
  router: ourFileRouter,
  config: {
    uploadthingId: process.env.UPLOADTHING_APP_ID,
    uploadthingSecret: process.env.UPLOADTHING_TOKEN,
  },
});
