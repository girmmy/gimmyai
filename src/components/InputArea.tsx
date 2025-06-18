import React from "react";
import { DropzoneRootProps, DropzoneInputProps } from "react-dropzone";

type InputAreaProps = {
  message: string;
  setMessage: (message: string) => void;
  handleSubmit: (e: React.FormEvent) => void;
  handleKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  isInCooldown: boolean;
  cooldownRemaining: number;
  isLoading: boolean;
  isUploading: boolean;
  selectedImage: File | null;
  imagePreview: string | null;
  removeImage: () => void;
  getRootProps: (props?: DropzoneRootProps) => DropzoneRootProps;
  getInputProps: (props?: DropzoneInputProps) => DropzoneInputProps;
};

const InputArea: React.FC<InputAreaProps> = ({
  message,
  setMessage,
  handleSubmit,
  handleKeyDown,
  isInCooldown,
  cooldownRemaining,
  isLoading,
  isUploading,
  selectedImage,
  imagePreview,
  removeImage,
  getRootProps,
  getInputProps,
}) => {
  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      {imagePreview && (
        <div className="relative w-fit">
          <img
            src={imagePreview}
            alt="Preview"
            className="w-32 h-32 object-contain border rounded-lg"
          />
          <button
            type="button"
            onClick={removeImage}
            className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 hover:bg-red-700"
          >
            &times;
          </button>
        </div>
      )}

      <div className="flex items-center gap-2">
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type your message..."
          rows={1}
          className="flex-1 resize-none rounded-md p-2 bg-slate-800 text-white border border-slate-600 focus:outline-none focus:border-blue-500"
        />

        {/* Image Upload Button */}
        <div className="relative group">
          <button
            type="button"
            className="p-2 rounded-lg transition-colors bg-slate-700 text-slate-400 cursor-not-allowed"
            disabled={true}
            title="Unavailable for right now"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </button>
          {/* Tooltip */}
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-slate-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
            Unavailable for right now
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-slate-800"></div>
          </div>
        </div>

        {/* Send Button */}
        <button
          type="submit"
          disabled={
            isLoading || isUploading || (!message.trim() && !selectedImage)
          }
          className={`p-2 rounded-lg transition-colors ${
            isLoading || isUploading || (!message.trim() && !selectedImage)
              ? "bg-slate-700 text-slate-400 cursor-not-allowed"
              : "bg-blue-600 text-white hover:bg-blue-700"
          }`}
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
            />
          </svg>
        </button>
      </div>
    </form>
  );
};

export default InputArea;
