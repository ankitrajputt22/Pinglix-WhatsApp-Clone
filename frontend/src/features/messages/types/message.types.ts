export type MessageType = "TEXT";

export type MessageStatus = "SENT" | "DELIVERED" | "READ";

export type MessageSender = {
  id: number;
  email: string;
  displayName: string;
  profileImageUrl: string | null;
};

export type MessageResponse = {
  id: number;
  clientMessageId: string;
  conversationId: number;
  sender: MessageSender;
  messageType: MessageType;
  content: string;
  status: MessageStatus;
  createdAt: string;
  editedAt: string | null;
  deletedAt: string | null;
};

export type SendMessageRequest = {
  clientMessageId: string;
  content: string;
};

export type MessagePageResponse = {
  items: MessageResponse[];
  nextBeforeMessageId: number | null;
  hasMore: boolean;
};

export type GetMessagesParams = {
  beforeMessageId?: number;
  limit?: number;
};

export type MessageStatusUpdateResponse = {
  conversationId: number;
  status: "DELIVERED" | "READ";
  messageIds: number[];
  updatedCount: number;
  updatedAt: string;
};
