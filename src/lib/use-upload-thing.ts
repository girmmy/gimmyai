import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";
import { generateReactHelpers } from "@uploadthing/react/hooks";
import type { OurFileRouter } from "../app/api/uploadthing/core";

const { useUploadThing } = generateReactHelpers<OurFileRouter>();

interface UseUploadThingReturn {
  isUploading: boolean;
  getRootProps: () => any;
  getInputProps: () => any;
  isDragActive: boolean;
  uploadFile: (file: File) => Promise<string | null>;
}

export const useImageUpload = (): UseUploadThingReturn => {
  const { startUpload, isUploading } = useUploadThing("imageUploader", {
    onClientUploadComplete: (res) => {
      if (res?.[0]) {
        console.log("Upload completed:", res[0]);
        toast.success("Upload completed!");
      }
    },
    onUploadError: (error: Error) => {
      console.error("Upload error:", error);
      toast.error(`Error uploading: ${error.message}`);
    },
  });

  const uploadFile = useCallback(
    async (file: File): Promise<string | null> => {
      if (file.size > 4 * 1024 * 1024) {
        toast.error("File must be smaller than 4MB");
        return null;
      }

      try {
        console.log("Starting upload...");
        const res = await startUpload([file]);
        console.log("Upload response:", res);

        if (!res || res.length === 0) {
          toast.error("Upload failed - no response");
          return null;
        }

        const url = res[0]?.url;
        if (!url) {
          toast.error("Upload failed - no URL in response");
          return null;
        }

        return url;
      } catch (error) {
        console.error("Upload error:", error);
        toast.error("Failed to upload file");
        return null;
      }
    },
    [startUpload]
  );

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return;
      void uploadFile(acceptedFiles[0]);
    },
    [uploadFile]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".png", ".jpg", ".jpeg", ".gif"],
    },
    maxFiles: 1,
    multiple: false,
  });

  return {
    isUploading,
    getRootProps,
    getInputProps,
    isDragActive,
    uploadFile,
  };
};
