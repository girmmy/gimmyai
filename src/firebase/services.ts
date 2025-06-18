import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  updateDoc,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "./config";
import type { Conversation, Message, UsageInfo } from "./types";

// Conversation operations
export const createConversation = async (
  userId: string,
  title: string,
  firstMessage: string,
  imageUrl?: string
): Promise<string> => {
  const conversationRef = await addDoc(collection(db, "conversations"), {
    userId,
    title,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  await addDoc(collection(db, "messages"), {
    conversationId: conversationRef.id,
    role: "user",
    content: firstMessage,
    imageUrl,
    timestamp: serverTimestamp(),
  });

  return conversationRef.id;
};

export const getUserConversations = async (
  userId: string
): Promise<Conversation[]> => {
  const q = query(
    collection(db, "conversations"),
    where("userId", "==", userId),
    orderBy("updatedAt", "desc")
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
    createdAt: (doc.data().createdAt as Timestamp).toDate(),
    updatedAt: (doc.data().updatedAt as Timestamp).toDate(),
  })) as Conversation[];
};

export const getConversation = async (
  conversationId: string
): Promise<Conversation & { messages: Message[] }> => {
  const conversationDoc = await getDoc(
    doc(db, "conversations", conversationId)
  );
  if (!conversationDoc.exists()) {
    throw new Error("Conversation not found");
  }

  const messagesQuery = query(
    collection(db, "messages"),
    where("conversationId", "==", conversationId),
    orderBy("timestamp", "asc")
  );

  const messagesSnapshot = await getDocs(messagesQuery);
  const messages = messagesSnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
    timestamp: (doc.data().timestamp as Timestamp).toDate(),
  })) as Message[];

  return {
    id: conversationDoc.id,
    title: conversationDoc.data().title,
    userId: conversationDoc.data().userId,
    createdAt: (conversationDoc.data().createdAt as Timestamp).toDate(),
    updatedAt: (conversationDoc.data().updatedAt as Timestamp).toDate(),
    messages,
  };
};

export const addMessage = async (
  conversationId: string,
  role: "user" | "assistant",
  content: string,
  imageUrl?: string
): Promise<void> => {
  await addDoc(collection(db, "messages"), {
    conversationId,
    role,
    content,
    imageUrl,
    timestamp: serverTimestamp(),
  });

  await updateDoc(doc(db, "conversations", conversationId), {
    updatedAt: serverTimestamp(),
  });
};

// Image upload operations
export const uploadImage = async (file: File): Promise<string> => {
  const storageRef = ref(storage, `images/${Date.now()}_${file.name}`);
  await uploadBytes(storageRef, file);
  return await getDownloadURL(storageRef);
};

// Usage tracking operations
export const getUsageInfo = async (userId: string): Promise<UsageInfo> => {
  const usageDoc = await getDoc(doc(db, "usage", userId));
  if (!usageDoc.exists()) {
    return {
      userId,
      remainingUploads: 5,
      lastReset: new Date(),
    };
  }

  const data = usageDoc.data();
  const lastReset = (data.lastReset as Timestamp).toDate();

  // Reset counter if it's a new day
  if (lastReset.toDateString() !== new Date().toDateString()) {
    await updateDoc(doc(db, "usage", userId), {
      remainingUploads: 5,
      lastReset: serverTimestamp(),
    });
    return {
      userId,
      remainingUploads: 5,
      lastReset: new Date(),
    };
  }

  return {
    userId,
    remainingUploads: data.remainingUploads,
    lastReset,
  };
};

export const decrementUploadCount = async (userId: string): Promise<void> => {
  const usageRef = doc(db, "usage", userId);
  const usageDoc = await getDoc(usageRef);

  if (!usageDoc.exists()) {
    await addDoc(collection(db, "usage"), {
      userId,
      remainingUploads: 4,
      lastReset: serverTimestamp(),
    });
    return;
  }

  const currentCount = usageDoc.data().remainingUploads;
  if (currentCount > 0) {
    await updateDoc(usageRef, {
      remainingUploads: currentCount - 1,
    });
  }
};
