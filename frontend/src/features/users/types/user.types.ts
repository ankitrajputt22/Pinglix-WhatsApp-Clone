export type UserProfile = {
  id: number;
  email: string;
  displayName: string;
  profileImageUrl: string | null;
  about: string | null;
  accountStatus?: string;
  createdAt?: string;
};

export type UserSearchResult = {
  id: number;
  email: string;
  displayName: string;
  profileImageUrl: string | null;
  about: string | null;
};
