import { useState, useRef, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { useImageUpload } from "../lib/use-upload-thing";
import { db } from "../firebase/config";
import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
  doc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import OpenAI from "openai";
import { useDropzone } from "react-dropzone";
import InputArea from "./InputArea";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../firebase/config";
import { generateReactHelpers } from "@uploadthing/react/hooks";
import type { OurFileRouter } from "../app/api/uploadthing/core";
import Navbar from "./Navbar";
import { aicontent } from "../aicontent";
import ConfirmationDialog from "./ConfirmationDialog";

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
});

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  imageUrl?: string;
  timestamp?: any;
};

const Sidebar = ({
  showSidebar,
  setCurrentConversationId,
  setShowSidebar,
}: {
  showSidebar: boolean;
  setCurrentConversationId: (id: string | null) => void;
  setShowSidebar: (show: boolean) => void;
}) => (
  <div
    className={`fixed top-16 left-0 bottom-0 w-64 bg-slate-800 transform ${
      showSidebar ? "translate-x-0" : "-translate-x-full"
    } md:translate-x-0 transition-transform duration-200 ease-in-out z-10 border-r border-slate-700`}
  >
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Conversations</h2>
      <button
        onClick={() => {
          setCurrentConversationId(null);
          setShowSidebar(false);
        }}
        className="w-full p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
      >
        New Chat
      </button>
    </div>
  </div>
);

const Message = ({ msg }: { msg: Message }) => (
  <div
    className={`flex ${
      msg.role === "user" ? "justify-end" : "justify-start"
    } items-start gap-2`}
  >
    {msg.role === "assistant" && (
      <img
        src="/logo/gimmyai-transparentbg.png"
        alt="GimmyAI Logo"
        className="w-7 h-8 self-center"
      />
    )}
    <div
      className={`max-w-[80%] rounded-lg p-4 whitespace-pre-wrap ${
        msg.role === "user"
          ? "bg-blue-600 text-white"
          : "bg-slate-800 text-slate-200"
      }`}
    >
      {msg.imageUrl && (
        <div className="mb-2">
          {msg.imageUrl.match(/\.(jpg|jpeg|png|gif)$/i) ? (
            <img
              src={msg.imageUrl}
              alt="Uploaded"
              className="max-w-[200px] max-h-32 object-contain rounded-lg"
            />
          ) : (
            <a
              href={msg.imageUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex w-full max-w-[200px] h-32 bg-slate-600 rounded-lg items-center justify-center hover:bg-slate-500"
            >
              <span className="text-slate-300">
                {msg.imageUrl.includes("pdf")
                  ? "📄 View PDF"
                  : "📝 View Document"}
              </span>
            </a>
          )}
        </div>
      )}
      {msg.content}
    </div>
  </div>
);

const TypingIndicator = () => (
  <div className="flex items-center space-x-2 animate-pulse text-slate-400 px-4">
    <span className="w-2 h-2 bg-slate-400 rounded-full" />
    <span className="w-2 h-2 bg-slate-400 rounded-full" />
    <span className="w-2 h-2 bg-slate-400 rounded-full" />
    <span>GimmyAI is typing...</span>
  </div>
);

// InputArea component unchanged (omitted for brevity)

const { useUploadThing } = generateReactHelpers<OurFileRouter>();

export default function ChatInterface() {
  const [currentConversationId, setCurrentConversationId] = useState<
    string | null
  >(null);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [showSidebar, setShowSidebar] = useState(window.innerWidth >= 768);
  const [messages, setMessages] = useState<Message[]>([]);
  const [showTyping, setShowTyping] = useState(false);
  const [conversations, setConversations] = useState([
    {
      id: "initial",
      title: "How may I help you today?",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]);

  // Confirmation dialog state
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [conversationToDelete, setConversationToDelete] = useState<
    string | null
  >(null);

  const chatContainerRef = useRef<HTMLDivElement>(null);
  const { uploadFile, isUploading: useImageUploadIsUploading } =
    useImageUpload();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      if (file.size > 5 * 1024 * 1024) {
        // 5MB limit
        toast.error("Image size must be less than 5MB");
        return;
      }
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".png", ".jpg", ".jpeg", ".gif"],
    },
    maxSize: 5 * 1024 * 1024, // 5MB
    multiple: false,
  });

  const [imageUploadCount, setImageUploadCount] = useState(0);
  const [lastUploadDate, setLastUploadDate] = useState<string | null>(null);

  // Check and reset daily upload count
  useEffect(() => {
    const today = new Date().toDateString();
    if (lastUploadDate !== today) {
      setImageUploadCount(0);
      setLastUploadDate(today);
    }
  }, [lastUploadDate]);

  useEffect(() => {
    if (!currentConversationId) {
      setMessages([
        {
          id: "initial",
          role: "assistant",
          content: "How may I help you today?",
        },
      ]);
      return;
    }

    const messagesRef = collection(
      db,
      `conversations/${currentConversationId}/messages`
    );
    const q = query(messagesRef, orderBy("timestamp", "asc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newMessages = snapshot.docs.map((doc) => ({
        id: doc.id,
        role: doc.data().role,
        content: doc.data().content,
        imageUrl: doc.data().imageUrl || undefined,
        timestamp: doc.data().timestamp,
      }));

      // Always include the welcome message as the first message
      setMessages([
        {
          id: "initial",
          role: "assistant",
          content: "How may I help you today?",
        },
        ...newMessages,
      ]);
    });

    return () => unsubscribe();
  }, [currentConversationId]);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [messages, showTyping]);

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() && !selectedImage) return;
    if (isLoading || isUploading) return;

    try {
      setIsLoading(true);
      let imageUrl: string | undefined;

      if (selectedImage) {
        setIsUploading(true);
        const url = await uploadFile(selectedImage);
        if (url) {
          imageUrl = url;
          setImagePreview(url);
        } else {
          throw new Error("Failed to get image URL from upload");
        }
        setIsUploading(false);
      }

      let conversationId = currentConversationId;
      if (!conversationId) {
        const newConversationRef = await addDoc(
          collection(db, "conversations"),
          {
            title: "New Chat",
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          }
        );
        conversationId = newConversationRef.id;
        setCurrentConversationId(conversationId);
      }

      const newMessage: Message = {
        id: Date.now().toString(),
        role: "user",
        content: message,
        ...(imageUrl ? { imageUrl } : {}),
      };

      await addDoc(collection(db, `conversations/${conversationId}/messages`), {
        ...newMessage,
        timestamp: serverTimestamp(),
      });

      setMessage("");
      setSelectedImage(null);
      setImagePreview(null);

      setShowTyping(true);
      const response = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: aicontent,
          },
          ...messages.map((msg) => ({ role: msg.role, content: msg.content })),
          { role: "user", content: message },
        ],
      });

      const aiResponse =
        response.choices?.[0]?.message?.content ||
        "Sorry, I couldn't generate a response.";
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: aiResponse,
      };

      await addDoc(collection(db, `conversations/${conversationId}/messages`), {
        ...aiMessage,
        timestamp: serverTimestamp(),
      });

      setShowTyping(false);
    } catch (error) {
      console.error("handleSubmit error:", error);
      toast.error(
        "Error sending message. Check your connection and try again."
      );
      setShowTyping(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void handleSubmit(e);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() && !selectedImage) return;
    if (isLoading || isUploading) return;
    void handleSubmit(e);
  };

  const handleNewChat = async () => {
    try {
      // Check if user has reached the conversation limit
      if (conversations.length >= 8) {
        toast.error(
          "You've reached the maximum limit of 8 conversations. Please delete an existing conversation to create a new one."
        );
        return;
      }

      // Create a new conversation in Firebase
      const newConversationRef = await addDoc(collection(db, "conversations"), {
        title: "New Chat",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      // Set the new conversation as current
      setCurrentConversationId(newConversationRef.id);

      // Reset messages to show welcome message
      setMessages([
        {
          id: "initial",
          role: "assistant",
          content: "How may I help you today?",
        },
      ]);

      // Update conversations list
      setConversations((prev) => [
        {
          id: newConversationRef.id,
          title: "New Chat",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        ...prev,
      ]);

      // Close sidebar on mobile
      if (window.innerWidth < 768) {
        setShowSidebar(false);
      }
    } catch (error) {
      console.error("Error creating new chat:", error);
      toast.error("Failed to create new chat. Please try again.");
    }
  };

  const handleDeleteConversation = async (
    conversationId: string,
    e: React.MouseEvent
  ) => {
    e.stopPropagation(); // Prevent triggering the conversation selection

    // Set the conversation to delete and show the dialog
    setConversationToDelete(conversationId);
    setShowDeleteDialog(true);
  };

  const confirmDeleteConversation = async () => {
    if (!conversationToDelete) return;

    try {
      // Delete the conversation from Firebase
      await deleteDoc(doc(db, "conversations", conversationToDelete));

      // If the deleted conversation was the current one, clear the current conversation
      if (conversationToDelete === currentConversationId) {
        setCurrentConversationId(null);
        setMessages([
          {
            id: "initial",
            role: "assistant",
            content: "How may I help you today?",
          },
        ]);
      }
    } catch (error) {
      console.error("Error deleting conversation:", error);
      toast.error("Failed to delete conversation. Please try again.");
    } finally {
      // Reset dialog state
      setShowDeleteDialog(false);
      setConversationToDelete(null);
    }
  };

  // Load conversations when component mounts
  useEffect(() => {
    const conversationsRef = collection(db, "conversations");
    const q = query(conversationsRef, orderBy("updatedAt", "desc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newConversations = snapshot.docs.map((doc) => ({
        id: doc.id,
        title: doc.data().title || "New Chat",
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date(),
      }));
      setConversations(newConversations);
    });

    return () => unsubscribe();
  }, []);

  // Update conversation title when messages change
  useEffect(() => {
    const updateConversationTitle = async () => {
      if (!currentConversationId || messages.length <= 1) return;

      try {
        const conversationRef = doc(db, "conversations", currentConversationId);
        await updateDoc(conversationRef, {
          title:
            messages[1].content.slice(0, 50) +
            (messages[1].content.length > 50 ? "..." : ""),
          updatedAt: serverTimestamp(),
        });
      } catch (error) {
        console.error("Error updating conversation title:", error);
      }
    };

    updateConversationTitle();
  }, [messages, currentConversationId]);

  // Handle window resize to auto-show sidebar on desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setShowSidebar(true);
      } else {
        setShowSidebar(false);
      }
    };
    window.addEventListener("resize", handleResize);
    // Run once on mount
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="flex-1 flex overflow-hidden relative">
      {/* Navbar with sidebar toggle */}
      <div className="fixed top-0 left-0 right-0 z-40">
        <Navbar onSidebarToggle={() => setShowSidebar((s) => !s)} />
      </div>
      {/* Sidebar */}
      <div
        className={`top-16 left-0 h-[calc(100vh-4rem)] z-50 w-64 bg-slate-800 transform ${
          showSidebar ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 transition-transform duration-200 ease-in-out fixed md:static border-r border-slate-700`}
      >
        <div className="flex flex-col h-full">
          {/* New Chat Button */}
          <div className="p-4 border-b border-slate-700">
            <button
              onClick={handleNewChat}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
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
                  d="M12 4v16m8-8H4"
                />
              </svg>
              New Chat
            </button>
          </div>

          {/* Conversations List */}
          <div className="flex-1 overflow-y-auto">
            {conversations.length === 0 ? (
              <div className="p-4 text-center text-slate-400">
                No conversations yet
              </div>
            ) : (
              conversations.map((conv) => (
                <div
                  key={conv.id}
                  className={`group relative border-b border-slate-700 ${
                    currentConversationId === conv.id ? "bg-slate-700" : ""
                  }`}
                >
                  <button
                    onClick={() => setCurrentConversationId(conv.id)}
                    className="w-full text-left p-4 hover:bg-slate-700 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <svg
                        className="w-4 h-4 text-slate-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                        />
                      </svg>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">{conv.title}</div>
                        <div className="text-sm text-slate-400 truncate">
                          {new Date(conv.updatedAt).toLocaleString(undefined, {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      </div>
                    </div>
                  </button>
                  <button
                    onClick={(e) => handleDeleteConversation(conv.id, e)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Delete conversation"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <div
          ref={chatContainerRef}
          className="flex-1 overflow-y-auto px-4 py-2 space-y-4"
          style={{
            paddingBottom: "5.5rem", // enough space for the fixed input area
          }}
        >
          {messages.map((msg) => (
            <Message key={msg.id} msg={msg} />
          ))}
          {showTyping && (
            <div className="flex items-center space-x-2 text-slate-400 px-4">
              <div className="flex space-x-1">
                <div
                  className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
                  style={{ animationDelay: "0ms" }}
                />
                <div
                  className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
                  style={{ animationDelay: "150ms" }}
                />
                <div
                  className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
                  style={{ animationDelay: "300ms" }}
                />
              </div>
              <span>GimmyAI is thinking...</span>
            </div>
          )}
        </div>

        {/* InputArea fixed at the bottom */}
        <div
          className={`fixed bottom-0 z-30 w-full md:left-64 md:w-[calc(100%-16rem)] bg-slate-900 border-t border-slate-700`}
          style={{
            left: showSidebar && window.innerWidth >= 768 ? "16rem" : 0,
          }}
        >
          <div className="p-4">
            <InputArea
              message={message}
              setMessage={setMessage}
              handleSubmit={handleFormSubmit}
              handleKeyDown={handleKeyDown}
              isInCooldown={false}
              cooldownRemaining={0}
              isLoading={isLoading}
              isUploading={isUploading}
              selectedImage={selectedImage}
              imagePreview={imagePreview}
              removeImage={removeImage}
              getRootProps={getRootProps}
              getInputProps={getInputProps}
            />
          </div>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={showDeleteDialog}
        onClose={() => {
          setShowDeleteDialog(false);
          setConversationToDelete(null);
        }}
        onConfirm={confirmDeleteConversation}
        title="Delete Conversation"
        message="Are you sure you want to delete this conversation? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
      />
    </div>
  );
}
