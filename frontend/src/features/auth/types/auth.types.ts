export type AccountStatus = "ACTIVE" | "LOCKED" | "DISABLED" | "DELETED";

export type AuthUser = {
  id: number;
  email: string;
  displayName: string;
  profileImageUrl: string | null;
  accountStatus: AccountStatus;
  createdAt: string;
};

export type LoginPayload = {
  email: string;
  password: string;
};

export type RegisterPayload = {
  email: string;
  displayName: string;
  password: string;
};

export type MessageResponse = {
  message: string;
};
