import { useMutation, useQueryClient } from "@tanstack/react-query";

import { CURRENT_USER_QUERY_KEY } from "../../auth/hooks/useCurrentUser";
import { updateProfile, type UpdateProfilePayload } from "../api/users-api";
import { CURRENT_USER_PROFILE_QUERY_KEY } from "./useCurrentUserProfile";

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateProfilePayload) => updateProfile(payload),
    onSuccess: (profile) => {
      queryClient.setQueryData(CURRENT_USER_PROFILE_QUERY_KEY, profile);
      queryClient.setQueryData(CURRENT_USER_QUERY_KEY, (current: {
        id: number;
        email: string;
        displayName: string;
        profileImageUrl: string | null;
        accountStatus: string;
        createdAt: string;
      } | null | undefined) => current
        ? {
            ...current,
            displayName: profile.displayName,
            profileImageUrl: profile.profileImageUrl
          }
        : current);
    }
  });
}
