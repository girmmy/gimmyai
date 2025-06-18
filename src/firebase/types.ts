export interface User {
  uid: string;
  name: string;
  email: string;
  createdAt: Date;
}

export interface Conversation {
  id: string;
  title: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Message {
  id: string;
  conversationId: string;
  role: "user" | "assistant";
  content: string;
  imageUrl?: string;
  timestamp: Date;
}

export interface UsageInfo {
  userId: string;
  remainingUploads: number;
  lastReset: Date;
}
