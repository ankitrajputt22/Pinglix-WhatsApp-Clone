export type ConversationType = "PRIVATE";

export type ConversationParticipant = {
  id: number;
  email: string;
  displayName: string;
  profileImageUrl: string | null;
  about: string | null;
  lastSeenAt?: string | null;
};

export type ConversationResponse = {
  id: number;
  conversationType: ConversationType;
  title: string | null;
  imageUrl: string | null;
  otherParticipant: ConversationParticipant;
  lastMessageAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CreatePrivateConversationRequest = {
  targetUserId: number;
};
