import React, { useRef, useEffect } from "react";

type InputAreaProps = {
  message: string;
  setMessage: (message: string) => void;
  handleSubmit: (e: React.FormEvent) => void;
  handleKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  isInCooldown: boolean;
  cooldownRemaining: number;
  isLoading: boolean;
};

const InputArea: React.FC<InputAreaProps> = ({
  message,
  setMessage,
  handleSubmit,
  handleKeyDown,
  isInCooldown,
  cooldownRemaining,
  isLoading,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height =
        textareaRef.current.scrollHeight + "px";
    }
  }, [message]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height =
        textareaRef.current.scrollHeight + "px";
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <textarea
          ref={textareaRef}
          value={message}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="Type your message..."
          rows={1}
          className="flex-1 resize-none rounded-md p-2 bg-slate-800 text-white border border-slate-600 focus:outline-none focus:border-blue-500 max-h-40 min-h-[2.5rem]"
          style={{ overflow: "auto" }}
        />

        {/* Send Button */}
        <button
          type="submit"
          disabled={isLoading || !message.trim()}
          className={`p-2 rounded-lg transition-colors ${
            isLoading || !message.trim()
              ? "bg-slate-700 text-slate-400 cursor-not-allowed"
              : "bg-blue-600 text-white hover:bg-blue-700"
          }`}
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-slate-400 border-t-white rounded-full animate-spin" />
          ) : (
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
          )}
        </button>
      </div>
    </form>
  );
};

export default InputArea;
